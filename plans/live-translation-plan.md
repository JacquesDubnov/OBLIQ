# Live Translation Feature - Implementation Plan

## Feature Overview

A real-time translation feature that activates via `/translate` CLI command, showing bilingual message bubbles with typewriter animation effects.

---

## Technical Architecture

### 1. State Management (Zustand Store)

**New state in `chatStore.ts`:**
```typescript
interface TranslationState {
  translationEnabled: Record<string, boolean>;  // chatId -> enabled
  activeTranslationChat: string | null;         // Currently active chat with translation
}

// Actions
enableTranslation: (chatId: string) => void;
disableTranslation: (chatId: string) => void;
isTranslationEnabled: (chatId: string) => boolean;
```

**Auto-disable logic:**
- When `selectChat(chatId)` is called, if `activeTranslationChat` !== newChatId, disable translation for previous chat

---

### 2. Command Handler

**File: `client/src/components/chat/MessageInput.tsx`**

Add `/translate` command detection:
```typescript
if (trimmedMessage === '/translate') {
  // 1. Clear input
  // 2. Get current chat's contact language
  // 3. Enable translation mode for this chat
  // 4. Show toast notification
  // 5. Return (don't send as message)
}
```

---

### 3. Translation Service

**File: `server/src/services/translationService.ts`**

```typescript
interface TranslationRequest {
  text: string;
  sourceLang: 'en' | 'ja' | 'fr';
  targetLang: 'en' | 'ja' | 'fr';
}

interface TranslationResponse {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

async function translateText(request: TranslationRequest): Promise<TranslationResponse>
```

**Claude API Prompt:**
```
Translate the following ${sourceLang} text to ${targetLang}.
Preserve the tone, formality, and any nuances.
Return ONLY the translated text, nothing else.

Text: "${text}"
```

---

### 4. API Endpoints

**File: `server/src/routes/translate.ts`**

```
POST /api/translate
Body: { text: string, sourceLang: string, targetLang: string }
Response: { originalText, translatedText, sourceLang, targetLang }
```

---

### 5. UI Components

#### 5.1 Live Translate Indicator

**File: `client/src/components/chat/LiveTranslateIndicator.tsx`**

**Styling:**
- Position: Left of video call icon in ChatHeader
- Color: Neon green (#39FF14 or similar)
- Animation: CSS keyframes for slow breathing pulse (2-3 second cycle)
- Text: "Live Translate"
- Visibility: Only when translation enabled for current chat

```tsx
const LiveTranslateIndicator = styled.div`
  color: #39FF14;
  text-shadow: 0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14;
  animation: neonPulse 2.5s ease-in-out infinite;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;

  @keyframes neonPulse {
    0%, 100% { opacity: 0.7; text-shadow: 0 0 5px #39FF14, 0 0 10px #39FF14; }
    50% { opacity: 1; text-shadow: 0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14; }
  }
`;
```

#### 5.2 Translated Message Bubble

**File: `client/src/components/chat/TranslatedMessageBubble.tsx`**

**Structure:**
```tsx
<MessageBubble>
  <OriginalText>{message.content}</OriginalText>
  <Separator />  {/* Thin line matching bubble theme */}
  <TranslatedText bold>
    <TypewriterEffect
      text={translation}
      duration={1500-2000}
      wordByWord={true}
    />
  </TranslatedText>
  <MessageMeta>
    <Timestamp />
    <StatusIndicator />
  </MessageMeta>
</MessageBubble>
```

#### 5.3 Typewriter Effect Component

**File: `client/src/components/common/TypewriterEffect.tsx`**

**Props:**
```typescript
interface TypewriterEffectProps {
  text: string;
  duration: number;        // Total animation duration (1500-2000ms)
  wordByWord?: boolean;    // true = word by word, false = character by character
  onComplete?: () => void;
}
```

**Implementation:**
- Split text into words
- Calculate delay per word based on total duration
- Use `useState` + `useEffect` with `setInterval`
- Progressive reveal: "Hello" → "Hello world" → "Hello world how" → etc.

#### 5.4 Toast Notification (Translation Activated)

**Enhanced toast styling to differentiate from messages:**
- Background: Gradient or distinct color (not white/green like messages)
- Icon: 🌐 or translation icon
- Border: Subtle border to distinguish
- Position: Top-center or bottom-center (not inline with messages)
- Text: "Live Translation activated - English ↔ Japanese"

---

### 6. Message Flow

#### 6.1 Sending a Message (User → Contact)

```
1. User types English message, hits Enter
2. MessageInput detects translation mode is ON
3. Call POST /api/translate { text, sourceLang: 'en', targetLang: 'ja' }
4. Create message with both original and translation
5. Send to backend: POST /api/chats/{chatId}/messages
   - content: original English
   - translatedContent: Japanese translation
6. Display bubble with:
   - English on top (immediate)
   - Separator line
   - Japanese below (typewriter effect, 1.5-2s)
```

#### 6.2 Receiving a Message (Contact → User)

```
1. AI generates response in native language (Japanese/French)
2. Backend automatically translates to English
3. Response includes both original and translation
4. Display bubble with:
   - Japanese/French on top (immediate)
   - Separator line
   - English below (typewriter effect, 1.5-2s)
```

---

### 7. Database Schema Changes

**Modify messages table or add translation cache:**

Option A: Add columns to messages table
```sql
ALTER TABLE messages ADD COLUMN translated_content TEXT;
ALTER TABLE messages ADD COLUMN source_language TEXT;
ALTER TABLE messages ADD COLUMN target_language TEXT;
```

Option B: Separate translations table (for caching)
```sql
CREATE TABLE message_translations (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id)
);
```

**Recommendation:** Option A for simplicity in this demo.

---

### 8. Contact Language Mapping

**Already exists in database:**
- Yuki Tanaka: language = 'ja'
- Pierre Dubois: language = 'fr'

**Usage:**
```typescript
function getTranslationLanguages(contactLanguage: string): { userLang: string, contactLang: string } {
  return {
    userLang: 'en',  // User always types in English
    contactLang: contactLanguage  // 'ja' or 'fr'
  };
}
```

---

## File Changes Summary

### New Files
1. `client/src/components/chat/LiveTranslateIndicator.tsx`
2. `client/src/components/chat/TranslatedMessageBubble.tsx`
3. `client/src/components/common/TypewriterEffect.tsx`
4. `server/src/routes/translate.ts`
5. `server/src/services/translationService.ts`

### Modified Files
1. `client/src/components/chat/MessageInput.tsx` - Add /translate command
2. `client/src/components/chat/ChatHeader.tsx` - Add LiveTranslateIndicator
3. `client/src/components/chat/MessageBubble.tsx` - Support translated content
4. `client/src/store/chatStore.ts` - Add translation state
5. `server/src/index.ts` - Register translate routes
6. `server/src/routes/messages.ts` - Include translation in AI responses
7. `server/src/services/aiService.ts` - Auto-translate AI responses when needed

---

## Implementation Order

### Step 1: Backend Translation Service (30 min)
- Create `translationService.ts` with Claude API integration
- Create `translate.ts` route
- Register route in `index.ts`

### Step 2: State Management (20 min)
- Add translation state to `chatStore.ts`
- Add auto-disable on chat switch

### Step 3: Command Handler (15 min)
- Add `/translate` detection in `MessageInput.tsx`
- Show toast notification

### Step 4: Live Translate Indicator (30 min)
- Create `LiveTranslateIndicator.tsx` with neon green glow
- Add to `ChatHeader.tsx`
- Implement breathing pulse animation

### Step 5: Typewriter Effect (30 min)
- Create `TypewriterEffect.tsx`
- Word-by-word reveal with configurable duration

### Step 6: Translated Message Bubble (45 min)
- Create/modify message bubble component
- Support dual-language display
- Integrate typewriter effect for translation
- Style separator line

### Step 7: Message Send Flow (30 min)
- Modify send flow to translate before sending
- Store both versions

### Step 8: AI Response Integration (30 min)
- Modify AI response to include translation
- Ensure typewriter effect on incoming translations

### Step 9: Toast Notification Styling (15 min)
- Distinct visual style for translation toast
- Include language pair info

### Step 10: Testing & Polish (30 min)
- Test with Yuki (Japanese)
- Test with Pierre (French)
- Verify auto-disable on chat switch
- Polish animations

---

## Visual Mockup

### Chat Header with Live Translate Active
```
┌─────────────────────────────────────────────────────────────┐
│ [Avatar] Yuki Tanaka          [Live Translate✨] [📞] [📹] [⋮] │
│          Online                    ↑                         │
│                            Neon green, pulsing               │
└─────────────────────────────────────────────────────────────┘
```

### User Message (English → Japanese)
```
┌─────────────────────────────────────┐
│ Hello! How is the project going?    │  ← Original (English)
│ ─────────────────────────────────── │  ← Thin separator
│ こんにちは！プロジェクトの進捗は       │  ← Translation (bold, typewriter)
│ どうですか？                         │
│                          10:30 AM ✓✓│
└─────────────────────────────────────┘
```

### AI Response (Japanese → English)
```
┌─────────────────────────────────────┐
│ 順調に進んでいます！来週には完成      │  ← Original (Japanese)
│ する予定です。                       │
│ ─────────────────────────────────── │  ← Thin separator
│ It's going well! We expect to       │  ← Translation (bold, typewriter)
│ finish it by next week.             │
│ 10:32 AM                            │
└─────────────────────────────────────┘
```

### Toast Notification
```
┌────────────────────────────────────────────┐
│  🌐 Live Translation activated             │
│     English ↔ Japanese                     │
└────────────────────────────────────────────┘
```

---

## Estimated Time: 4-5 hours

## Dependencies
- Anthropic Claude API (already integrated)
- styled-components (already in project)
- Framer Motion (already in project, optional for animations)
