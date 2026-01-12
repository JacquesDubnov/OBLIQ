import Anthropic from '@anthropic-ai/sdk';

// Lazy initialization to ensure env vars are loaded
let _anthropic: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

// Language display names for prompts
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
};

// Fallback translations for demo purposes when API key is not available
const FALLBACK_TRANSLATIONS: Record<string, Record<string, string>> = {
  // English to Japanese
  'en-ja': {
    'hello': 'こんにちは',
    'how are you': 'お元気ですか',
    'thank you': 'ありがとうございます',
    'good morning': 'おはようございます',
    'goodbye': 'さようなら',
  },
  // Japanese to English
  'ja-en': {
    'こんにちは': 'Hello',
    'お元気ですか': 'How are you?',
    'ありがとうございます': 'Thank you',
    'おはようございます': 'Good morning',
    'さようなら': 'Goodbye',
  },
  // English to French
  'en-fr': {
    'hello': 'Bonjour',
    'how are you': 'Comment allez-vous',
    'thank you': 'Merci',
    'good morning': 'Bonjour',
    'goodbye': 'Au revoir',
  },
  // French to English
  'fr-en': {
    'bonjour': 'Hello',
    'comment allez-vous': 'How are you?',
    'merci': 'Thank you',
    'au revoir': 'Goodbye',
    'bonsoir': 'Good evening',
  },
};

// Generate a simple fallback translation for demo
function generateFallbackTranslation(text: string, sourceLang: string, targetLang: string): string {
  const key = `${sourceLang}-${targetLang}`;
  const translations = FALLBACK_TRANSLATIONS[key] || {};

  const lowerText = text.toLowerCase().trim();

  // Check for exact match
  if (translations[lowerText]) {
    return translations[lowerText];
  }

  // Check for partial matches
  for (const [phrase, translation] of Object.entries(translations)) {
    if (lowerText.includes(phrase)) {
      return translation;
    }
  }

  // If no match found, return a placeholder indicating translation
  const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;
  return `[${targetLangName} translation of: "${text}"]`;
}

export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const { text, sourceLang, targetLang } = request;

  // If source and target are the same, return original
  if (sourceLang === targetLang) {
    return {
      originalText: text,
      translatedText: text,
      sourceLang,
      targetLang,
    };
  }

  // Check if API key is available
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    console.log('No API key configured, using fallback translation');
    return {
      originalText: text,
      translatedText: generateFallbackTranslation(text, sourceLang, targetLang),
      sourceLang,
      targetLang,
    };
  }

  try {
    const sourceLangName = LANGUAGE_NAMES[sourceLang] || sourceLang;
    const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: `You are a professional translator. Translate text accurately while preserving tone, formality level, and any cultural nuances. Return ONLY the translated text, nothing else - no explanations, no quotes, no formatting.`,
      messages: [
        {
          role: 'user',
          content: `Translate the following ${sourceLangName} text to ${targetLangName}:\n\n${text}`,
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text');
    const translatedText = textContent?.type === 'text' ? textContent.text.trim() : generateFallbackTranslation(text, sourceLang, targetLang);

    return {
      originalText: text,
      translatedText,
      sourceLang,
      targetLang,
    };
  } catch (error) {
    console.error('Translation error:', error);
    // Return fallback translation on error
    return {
      originalText: text,
      translatedText: generateFallbackTranslation(text, sourceLang, targetLang),
      sourceLang,
      targetLang,
    };
  }
}

// Auto-detect language (simplified version)
export function detectLanguage(text: string): string {
  // Check for Japanese characters (Hiragana, Katakana, Kanji)
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
    return 'ja';
  }

  // Check for common French patterns
  const frenchPatterns = /\b(je|tu|nous|vous|ils|elles|est|sont|avoir|être|le|la|les|un|une|des|que|qui|où|à|avec|pour|sur|dans|bonjour|merci|oui|non)\b/i;
  if (frenchPatterns.test(text)) {
    return 'fr';
  }

  // Default to English
  return 'en';
}
