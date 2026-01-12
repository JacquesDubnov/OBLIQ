import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database.js';
import { generateAIResponse, selectGroupResponder } from '../services/aiService.js';

const router = Router();

// GET /api/chats/:chatId/messages - Get messages with pagination
router.get('/:chatId/messages', (req, res) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string | undefined;

    const messages = db.getMessages(chatId, limit, before);

    // Return in chronological order (oldest first)
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/chats/:chatId/messages - Send a new message
router.post('/:chatId/messages', (req, res) => {
  try {
    const { chatId } = req.params;
    const {
      content,
      message_type = 'text',
      media_url,
      media_caption,
      reply_to,
      call_type,
      call_duration,
    } = req.body;

    // Call messages don't require content
    if (message_type !== 'call' && !content && !media_url) {
      return res.status(400).json({ error: 'Message content or media is required' });
    }

    const message = db.createMessage({
      id: uuidv4(),
      chat_id: chatId,
      sender_id: null, // null = "me" (the user)
      content: content || null,
      message_type,
      media_url: media_url || null,
      media_caption: media_caption || null,
      call_duration: call_duration || null,
      call_type: call_type || null,
      status: 'sent',
      reply_to: reply_to || null,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PATCH /api/messages/:id/status - Update message status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'sent', 'delivered', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.updateMessageStatus(req.params.id, status);
    const message = db.getMessage(req.params.id);
    res.json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// DELETE /api/messages/:id - Soft delete a message
router.delete('/:id', (req, res) => {
  try {
    db.deleteMessage(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// GET /api/chats/:chatId/select-responder - Select who will respond in a group chat
router.get('/:chatId/select-responder', (req, res) => {
  try {
    const { chatId } = req.params;

    // Check if it's a group chat
    const contact = db.getContact(chatId);
    if (!contact) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (contact.is_group !== 1) {
      // For non-group chats, return the contact itself
      return res.json({
        responderId: chatId,
        responderName: contact.name,
      });
    }

    // Select a random group member
    const responderId = selectGroupResponder(chatId);
    if (!responderId) {
      return res.status(404).json({ error: 'No group members found' });
    }

    const responder = db.getContact(responderId);
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }

    res.json({
      responderId: responderId,
      responderName: responder.name,
    });
  } catch (error) {
    console.error('Error selecting responder:', error);
    res.status(500).json({ error: 'Failed to select responder' });
  }
});

// POST /api/chats/:chatId/ai-response - Generate and save AI response
router.post('/:chatId/ai-response', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userMessage, senderId } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse({
      chatId,
      userMessage,
      senderId,
    });

    // Save the AI response as a message
    const message = db.createMessage({
      id: uuidv4(),
      chat_id: chatId,
      sender_id: aiResponse.senderId,
      content: aiResponse.content,
      message_type: 'text',
      media_url: null,
      media_caption: null,
      call_duration: null,
      call_type: null,
      status: 'delivered',
      reply_to: null,
    });

    // Increment unread count for the chat
    db.incrementUnreadCount(chatId);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

export default router;
