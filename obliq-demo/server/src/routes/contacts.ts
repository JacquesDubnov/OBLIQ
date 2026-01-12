import { Router } from 'express';
import { db } from '../services/database.js';

const router = Router();

// GET /api/contacts - List all contacts
router.get('/', (req, res) => {
  try {
    const contacts = db.getAllContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET /api/contacts/:id - Get single contact
router.get('/:id', (req, res) => {
  try {
    const contact = db.getContact(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// GET /api/contacts/:id/members - Get group members (for group chats)
router.get('/:id/members', (req, res) => {
  try {
    const contact = db.getContact(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    if (!contact.is_group) {
      return res.status(400).json({ error: 'Contact is not a group' });
    }

    const members = db.getGroupMembers(req.params.id);
    res.json(members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

// PATCH /api/contacts/:id - Update contact
router.patch('/:id', (req, res) => {
  try {
    const updates = req.body;
    const contact = db.updateContact(req.params.id, updates);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

export default router;
