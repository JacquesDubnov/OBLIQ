import { Router } from 'express';
import { db } from '../services/database.js';

const router = Router();

// POST /api/reset - Reset database to initial state
router.post('/', (req, res) => {
  try {
    const success = db.resetToInitialState();
    if (!success) {
      return res.status(400).json({
        error: 'No initial state found. Run seed script first.'
      });
    }
    res.json({
      success: true,
      message: 'Database reset to initial state'
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// POST /api/reset/save - Save current state as initial state
router.post('/save', (req, res) => {
  try {
    db.saveInitialState();
    res.json({
      success: true,
      message: 'Current state saved as initial state'
    });
  } catch (error) {
    console.error('Error saving initial state:', error);
    res.status(500).json({ error: 'Failed to save initial state' });
  }
});

export default router;
