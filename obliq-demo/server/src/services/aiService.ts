import Anthropic from '@anthropic-ai/sdk';
import { db, type Contact, type Message } from './database.js';

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

// Context-aware response patterns for fallback mode
interface ResponsePattern {
  keywords: string[];
  responses: string[];
}

const CONTEXTUAL_PATTERNS: Record<string, ResponsePattern[]> = {
  en: [
    { keywords: ['hello', 'hi', 'hey', 'morning', 'afternoon', 'evening'], responses: ['Hey! How are you?', 'Hi there! What\'s up?', 'Hey! Good to hear from you', 'Hello! How\'s it going?'] },
    { keywords: ['how are you', 'how\'s it going', 'what\'s up', 'how have you been'], responses: ['I\'m doing great, thanks for asking! How about you?', 'Pretty good! Just been busy with work. You?', 'All good here! What\'s new with you?'] },
    { keywords: ['thanks', 'thank you', 'appreciate'], responses: ['No problem!', 'You\'re welcome!', 'Anytime! 😊', 'Happy to help!'] },
    { keywords: ['bye', 'goodbye', 'see you', 'later', 'gotta go', 'talk later'], responses: ['Talk to you later!', 'Bye! Take care!', 'See you! 👋', 'Catch you later!'] },
    { keywords: ['sorry', 'apologize', 'my bad'], responses: ['No worries at all!', 'It\'s totally fine!', 'Don\'t worry about it!', 'All good!'] },
    { keywords: ['love', 'miss you', 'thinking of you'], responses: ['Aww that\'s sweet! 💕', 'Miss you too!', 'That means a lot to me!'] },
    { keywords: ['busy', 'work', 'working'], responses: ['Hope work isn\'t too stressful!', 'Don\'t overwork yourself!', 'Take breaks when you can!'] },
    { keywords: ['tired', 'exhausted', 'sleepy'], responses: ['Get some rest!', 'You should take a break', 'Hope you can relax soon!'] },
    { keywords: ['excited', 'happy', 'great news', 'awesome'], responses: ['That\'s amazing!', 'So happy for you! 🎉', 'That\'s great to hear!'] },
    { keywords: ['sad', 'upset', 'frustrated', 'angry'], responses: ['I\'m here if you want to talk', 'That sounds tough. What happened?', 'Hope things get better soon!'] },
    { keywords: ['food', 'eat', 'lunch', 'dinner', 'hungry'], responses: ['What are you having?', 'Ooh nice! I\'m getting hungry too', 'Sounds delicious!'] },
    { keywords: ['movie', 'watch', 'netflix', 'show'], responses: ['What are you watching?', 'Any good recommendations?', 'Is it good?'] },
    { keywords: ['weekend', 'plans', 'tomorrow'], responses: ['Any fun plans?', 'What are you up to?', 'Sounds like a good time!'] },
    { keywords: ['?'], responses: ['Hmm let me think about that', 'Good question!', 'That\'s interesting to think about'] },
    { keywords: ['lol', 'haha', 'funny', '😂'], responses: ['😄', 'Haha right?', '😂😂'] },
    { keywords: ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok'], responses: ['Great!', 'Perfect!', 'Sounds good!', 'Awesome!'] },
    { keywords: ['no', 'nope', 'not really'], responses: ['Ah okay', 'No worries', 'That\'s fair'] },
  ],
  ja: [
    { keywords: ['こんにちは', 'おはよう', 'こんばんは', 'やあ'], responses: ['こんにちは！元気？', 'やあ！調子どう？', 'おはよう！😊'] },
    { keywords: ['元気', '調子'], responses: ['元気だよ！あなたは？', '最近忙しいけど元気！', 'いい感じ！そっちは？'] },
    { keywords: ['ありがとう', '感謝'], responses: ['どういたしまして！', 'いえいえ！', '気にしないで！😊'] },
    { keywords: ['バイバイ', 'またね', 'じゃあね'], responses: ['またね！👋', 'じゃあね！', 'また連絡するね！'] },
    { keywords: ['ごめん', 'すみません'], responses: ['大丈夫だよ！', '気にしないで！', '全然問題ない！'] },
    { keywords: ['疲れた', '眠い'], responses: ['ゆっくり休んでね！', '無理しないでね', 'お疲れ様！'] },
    { keywords: ['嬉しい', '楽しい', 'やった'], responses: ['よかったね！🎉', 'それは嬉しい！', '素敵！'] },
    { keywords: ['？', 'かな'], responses: ['うーん、どうだろう', 'いい質問だね', '考えてみる！'] },
  ],
  fr: [
    { keywords: ['bonjour', 'salut', 'coucou', 'bonsoir'], responses: ['Salut ! Ça va ?', 'Coucou ! Comment tu vas ?', 'Hey ! Quoi de neuf ?'] },
    { keywords: ['ça va', 'comment vas'], responses: ['Ça va bien, merci ! Et toi ?', 'Super ! Et toi ?', 'Pas mal ! Toi ?'] },
    { keywords: ['merci', 'remercie'], responses: ['De rien !', 'Pas de quoi !', 'Avec plaisir !'] },
    { keywords: ['bisous', 'à bientôt', 'salut', 'ciao'], responses: ['À plus ! 👋', 'Bisous !', 'À bientôt !'] },
    { keywords: ['désolé', 'pardon'], responses: ['T\'inquiète !', 'Pas de souci !', 'C\'est rien !'] },
    { keywords: ['fatigué', 'crevé'], responses: ['Repose-toi bien !', 'Courage !', 'Prends soin de toi !'] },
    { keywords: ['content', 'super', 'génial'], responses: ['Trop bien ! 🎉', 'Je suis content pour toi !', 'C\'est génial !'] },
    { keywords: ['?'], responses: ['Bonne question !', 'Hmm, laisse-moi réfléchir', 'Intéressant !'] },
  ],
};

// Default fallback responses when no pattern matches
const DEFAULT_RESPONSES: Record<string, string[]> = {
  en: ['That\'s interesting!', 'I see!', 'Tell me more!', 'Oh really?', 'Nice!', 'Hmm, I see what you mean', 'That makes sense!'],
  ja: ['なるほど！', 'そうなんだ！', 'いいね！', 'へー！', 'わかる！'],
  fr: ['Intéressant !', 'Je vois !', 'Ah bon ?', 'D\'accord !', 'Super !'],
  es: ['¡Interesante!', '¡Ya veo!', '¿En serio?', '¡Qué bien!', '¡Genial!'],
  de: ['Interessant!', 'Verstehe!', 'Ach so!', 'Okay!', 'Super!'],
};

function generateContextualResponse(userMessage: string, language: string): string {
  const patterns = CONTEXTUAL_PATTERNS[language] || CONTEXTUAL_PATTERNS.en;
  const defaults = DEFAULT_RESPONSES[language] || DEFAULT_RESPONSES.en;

  const lowerMessage = userMessage.toLowerCase();

  // Find matching patterns
  for (const pattern of patterns) {
    for (const keyword of pattern.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        const responses = pattern.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  // No pattern matched, use default
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// Build system prompt for persona
function buildSystemPrompt(contact: Contact, isGroup: boolean): string {
  const languageInstructions: Record<string, string> = {
    en: 'Respond in English.',
    ja: 'Respond in Japanese (日本語で返信してください).',
    fr: 'Respond in French (Répondez en français).',
    es: 'Respond in Spanish (Responde en español).',
    de: 'Respond in German (Antworten Sie auf Deutsch).',
  };

  const basePrompt = `You are simulating a WhatsApp conversation as ${contact.name}.
This is a demo application, and you should respond naturally as this person would in a casual messaging context.

Character details:
- Name: ${contact.name}
${contact.about ? `- About/Bio: ${contact.about}` : ''}
${contact.persona_prompt ? `- Personality: ${contact.persona_prompt}` : ''}

${languageInstructions[contact.language] || languageInstructions.en}

Guidelines:
- Keep responses SHORT and casual, like real WhatsApp messages (usually 1-3 sentences)
- Use natural, conversational language appropriate for messaging
- Occasionally use common chat abbreviations or emoji if it fits the character
- Stay in character based on the persona described above
- Don't use formal greetings unless it fits the persona
- Don't mention that you're an AI or simulation
- Match the energy and tone of the incoming message
${isGroup ? '- You are in a group chat, so keep that context in mind' : ''}`;

  return basePrompt;
}

// Format message history for context
function formatMessageHistory(messages: Message[], contactName: string): string {
  const recentMessages = messages.slice(-10); // Last 10 messages for context

  return recentMessages.map(msg => {
    const sender = msg.sender_id === null ? 'User' : contactName;
    return `${sender}: ${msg.content}`;
  }).join('\n');
}

export interface AIResponseParams {
  chatId: string;
  userMessage: string;
  senderId?: string; // For group chats, which member should respond
}

export interface AIResponse {
  content: string;
  senderId: string;
}

export async function generateAIResponse(params: AIResponseParams): Promise<AIResponse> {
  const { chatId, userMessage, senderId } = params;

  // Get contact/chat info
  const contact = db.getContact(chatId);
  if (!contact) {
    throw new Error('Contact not found');
  }

  const isGroup = contact.is_group === 1;
  let respondingContact = contact;
  let responderId = chatId;

  // For group chats, determine who should respond
  if (isGroup && senderId) {
    const memberContact = db.getContact(senderId);
    if (memberContact) {
      respondingContact = memberContact;
      responderId = senderId;
    }
  } else if (isGroup) {
    // Randomly select a group member to respond
    const members = db.getGroupMembers(chatId);
    if (members.length > 0) {
      const randomMember = members[Math.floor(Math.random() * members.length)];
      const memberContact = db.getContact(randomMember.member_id);
      if (memberContact) {
        respondingContact = memberContact;
        responderId = randomMember.member_id;
      }
    }
  }

  // Check if API key is available
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    console.log('No API key configured, using contextual fallback response');
    return {
      content: generateContextualResponse(userMessage, respondingContact.language),
      senderId: responderId,
    };
  }

  try {
    // Get recent message history for context
    const messages = db.getMessages(chatId, 10);
    const history = formatMessageHistory(messages, respondingContact.name);

    const systemPrompt = buildSystemPrompt(respondingContact, isGroup);

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: history ? `Recent conversation:\n${history}\n\nLatest message from user: ${userMessage}` : userMessage,
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : generateContextualResponse(userMessage, respondingContact.language);

    return {
      content: responseText,
      senderId: responderId,
    };
  } catch (error) {
    console.error('AI generation error:', error);
    // Return contextual fallback response on error
    return {
      content: generateContextualResponse(userMessage, respondingContact.language),
      senderId: responderId,
    };
  }
}

// Select a random group member to respond
export function selectGroupResponder(chatId: string): string | null {
  const members = db.getGroupMembers(chatId);
  if (members.length === 0) return null;

  const randomMember = members[Math.floor(Math.random() * members.length)];
  return randomMember.member_id;
}
