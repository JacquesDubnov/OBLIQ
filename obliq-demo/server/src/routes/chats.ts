import { Router } from 'express';
import { db } from '../services/database.js';

const router = Router();

// GET /api/chats - List all chats with last message
router.get('/', (req, res) => {
  try {
    const chats = db.getAllChats();
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// GET /api/chats/:id - Get single chat details
router.get('/:id', (req, res) => {
  try {
    const chat = db.getChat(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// PATCH /api/chats/:id - Update chat (pin, mute, archive, clear unread)
router.patch('/:id', (req, res) => {
  try {
    const { is_pinned, is_muted, is_archived, unread_count } = req.body;
    const updates: Record<string, number> = {};

    if (is_pinned !== undefined) updates.is_pinned = is_pinned ? 1 : 0;
    if (is_muted !== undefined) updates.is_muted = is_muted ? 1 : 0;
    if (is_archived !== undefined) updates.is_archived = is_archived ? 1 : 0;
    if (unread_count !== undefined) updates.unread_count = unread_count;

    db.updateChat(req.params.id, updates);
    const chat = db.getChat(req.params.id);
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

// POST /api/chats/:id/read - Mark chat as read (clear unread count)
router.post('/:id/read', (req, res) => {
  try {
    db.clearUnreadCount(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({ error: 'Failed to mark chat as read' });
  }
});

export default router;
