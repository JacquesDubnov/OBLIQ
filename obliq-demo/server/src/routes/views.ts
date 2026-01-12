import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database.js';
import { analyzeMessagesForView, checkMessageRelevance, type MessageWithContext } from '../services/viewAnalyzer.js';

const router = Router();

// GET /api/views/stats - Get stats about messages (for progress bar)
router.get('/stats', (req, res) => {
  try {
    const allMessages = db.getAllMessagesWithContext();
    res.json({ totalMessages: allMessages.length });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/views - List all dynamic views
router.get('/', (req, res) => {
  try {
    const views = db.getAllDynamicViews();

    // Add message count to each view
    const viewsWithCounts = views.map(view => ({
      ...view,
      messageCount: db.getViewMessageCount(view.id),
      keywords: view.keywords ? JSON.parse(view.keywords) : [],
      entities: view.entities ? JSON.parse(view.entities) : [],
    }));

    res.json(viewsWithCounts);
  } catch (error) {
    console.error('Error fetching views:', error);
    res.status(500).json({ error: 'Failed to fetch views' });
  }
});

// GET /api/views/:id - Get single view with messages
router.get('/:id', (req, res) => {
  try {
    const view = db.getDynamicView(req.params.id);
    if (!view) {
      return res.status(404).json({ error: 'View not found' });
    }

    const messages = db.getViewMessages(req.params.id);

    res.json({
      ...view,
      keywords: view.keywords ? JSON.parse(view.keywords) : [],
      entities: view.entities ? JSON.parse(view.entities) : [],
      messageCount: messages.length,
      messages,
    });
  } catch (error) {
    console.error('Error fetching view:', error);
    res.status(500).json({ error: 'Failed to fetch view' });
  }
});

// POST /api/views - Create new dynamic view (triggers AI analysis)
router.post('/', async (req, res) => {
  try {
    const { criteria } = req.body;

    if (!criteria || typeof criteria !== 'string') {
      return res.status(400).json({ error: 'Criteria is required' });
    }

    // Perform AI analysis to find relevant messages
    const analysis = await analyzeMessagesForView(criteria);

    // Create the view
    const viewId = uuidv4();
    const view = db.createDynamicView({
      id: viewId,
      name: analysis.viewName,
      criteria,
      ai_context: analysis.aiContext,
      keywords: JSON.stringify(analysis.keywords),
      entities: JSON.stringify(analysis.entities),
      is_live: 1,
    });

    // Add the relevant messages to the view
    if (analysis.relevantMessages.length > 0) {
      // Get message details for each relevant message
      const allMessages = db.getAllMessagesWithContext();
      const messageMap = new Map(allMessages.map(m => [m.id, m]));

      const viewMessages = analysis.relevantMessages
        .filter(rm => messageMap.has(rm.messageId))
        .map(rm => {
          const msg = messageMap.get(rm.messageId)!;
          return {
            id: uuidv4(),
            view_id: viewId,
            original_message_id: rm.messageId,
            source_chat_id: msg.chat_id,
            source_contact_name: msg.contact_name,
            source_chat_name: msg.is_group ? msg.chat_name : null,
            is_from_group: msg.is_group,
            relevance_score: rm.score,
          };
        });

      if (viewMessages.length > 0) {
        db.batchAddViewMessages(viewMessages);
      }
    }

    // Return the created view with message count
    res.status(201).json({
      ...view,
      keywords: analysis.keywords,
      entities: analysis.entities,
      messageCount: analysis.relevantMessages.length,
    });
  } catch (error) {
    console.error('Error creating view:', error);
    res.status(500).json({ error: 'Failed to create view' });
  }
});

// DELETE /api/views - Delete all dynamic views (for reset)
router.delete('/', (req, res) => {
  try {
    db.deleteAllDynamicViews();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting all views:', error);
    res.status(500).json({ error: 'Failed to delete views' });
  }
});

// DELETE /api/views/:id - Delete a dynamic view
router.delete('/:id', (req, res) => {
  try {
    const view = db.getDynamicView(req.params.id);
    if (!view) {
      return res.status(404).json({ error: 'View not found' });
    }

    db.deleteDynamicView(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting view:', error);
    res.status(500).json({ error: 'Failed to delete view' });
  }
});

// POST /api/views/check - Check if a new message matches any live view
router.post('/check', async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ error: 'messageId is required' });
    }

    // Get the message
    const message = db.getMessage(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Get message context
    const allMessages = db.getAllMessagesWithContext();
    const messageWithContext = allMessages.find(m => m.id === messageId);

    if (!messageWithContext) {
      return res.status(404).json({ error: 'Message context not found' });
    }

    // Get all live views
    const liveViews = db.getLiveDynamicViews();

    interface MatchedView {
      viewId: string;
      viewName: string;
      score: number;
      viewMessage: {
        id: string;
        view_id: string;
        original_message_id: string;
        source_chat_id: string;
        source_contact_name: string;
        source_chat_name: string | null;
        is_from_group: number;
        relevance_score: number;
        added_at: string;
        message: typeof message;
      };
    }

    const matchedViews: MatchedView[] = [];

    // Check message against each live view
    for (const view of liveViews) {
      // Skip if message already in this view
      if (db.isMessageInView(view.id, messageId)) {
        continue;
      }

      const keywords = view.keywords ? JSON.parse(view.keywords) : [];

      const result = await checkMessageRelevance(
        view.criteria,
        keywords,
        messageWithContext
      );

      if (result.isRelevant && result.score >= 0.5) {
        // Add message to view
        const viewMessageId = uuidv4();
        const addedAt = new Date().toISOString();

        db.addViewMessage({
          id: viewMessageId,
          view_id: view.id,
          original_message_id: messageId,
          source_chat_id: messageWithContext.chat_id,
          source_contact_name: messageWithContext.contact_name,
          source_chat_name: messageWithContext.is_group ? messageWithContext.chat_name : null,
          is_from_group: messageWithContext.is_group,
          relevance_score: result.score,
        });

        // Return the full view message data for live updates
        matchedViews.push({
          viewId: view.id,
          viewName: view.name,
          score: result.score,
          viewMessage: {
            id: viewMessageId,
            view_id: view.id,
            original_message_id: messageId,
            source_chat_id: messageWithContext.chat_id,
            source_contact_name: messageWithContext.contact_name,
            source_chat_name: messageWithContext.is_group ? messageWithContext.chat_name : null,
            is_from_group: messageWithContext.is_group ? 1 : 0,
            relevance_score: result.score,
            added_at: addedAt,
            message,
          },
        });
      }
    }

    res.json({
      checked: true,
      matchedViews,
    });
  } catch (error) {
    console.error('Error checking message:', error);
    res.status(500).json({ error: 'Failed to check message' });
  }
});

// PATCH /api/views/:id - Update view settings (e.g., toggle is_live)
router.patch('/:id', (req, res) => {
  try {
    const { is_live, name } = req.body;
    const updates: Record<string, number | string> = {};

    if (is_live !== undefined) updates.is_live = is_live ? 1 : 0;
    if (name !== undefined) updates.name = name;

    const view = db.updateDynamicView(req.params.id, updates);
    if (!view) {
      return res.status(404).json({ error: 'View not found' });
    }

    res.json({
      ...view,
      keywords: view.keywords ? JSON.parse(view.keywords) : [],
      entities: view.entities ? JSON.parse(view.entities) : [],
      messageCount: db.getViewMessageCount(view.id),
    });
  } catch (error) {
    console.error('Error updating view:', error);
    res.status(500).json({ error: 'Failed to update view' });
  }
});

export default router;
