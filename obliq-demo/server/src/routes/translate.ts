import { Router } from 'express';
import { translateText, detectLanguage } from '../services/translationService.js';

const router = Router();

// POST /api/translate - Translate text
router.post('/', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!targetLang) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    // Auto-detect source language if not provided
    const detectedSourceLang = sourceLang || detectLanguage(text);

    const result = await translateText({
      text,
      sourceLang: detectedSourceLang,
      targetLang,
    });

    res.json(result);
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

// POST /api/translate/detect - Detect language of text
router.post('/detect', (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const language = detectLanguage(text);
    res.json({ language });
  } catch (error) {
    console.error('Error detecting language:', error);
    res.status(500).json({ error: 'Failed to detect language' });
  }
});

export default router;
