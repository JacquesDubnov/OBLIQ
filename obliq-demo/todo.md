# OBLIQ Demo - Development Todo

## Stage 2: Advanced Features

### Completed Features

#### ✅ Live Translation (P0)
**Completed: January 2026**

Real-time translation for Japanese and French chats.

**Implementation Summary:**
- **Backend:** Translation service using Claude API (`server/src/services/translationService.ts`)
- **API Route:** `POST /api/translate` for text translation
- **State Management:** Translation state in chatStore with auto-disable on chat switch
- **Command:** `/translate` CLI command activates live translation mode
- **UI Components:**
  - `LiveTranslateIndicator` - Neon green pulsing indicator in chat header
  - `TypewriterEffect` - Word-by-word reveal animation for translations
  - Updated `MessageBubble` - Displays original + translated content with separator
  - Enhanced toast notification with distinct styling for translation activation

**Features:**
- ✅ Trigger with `/translate` command in message input
- ✅ Neon green "Live Translate" indicator appears in header (left of video icon)
- ✅ User messages: English on top, translation below with typewriter effect
- ✅ AI responses: Original language on top, English translation below with typewriter effect
- ✅ Auto-disable when leaving chat
- ✅ Per-chat translation state
- ✅ Distinctive toast notification for activation

**Supported Languages:**
- English ↔ Japanese (Yuki Tanaka)
- English ↔ French (Pierre Dubois)

---

### 🚧 Tri-Lingual Translation for Work Project Alpha (P0)
**Status:** Planning Complete - Ready for Implementation
**Est. Time:** 1-2 days

Enable tri-lingual translations (English, Japanese, French) in the "Work Project Alpha" group chat. Every message displays all three languages, with the original language on top and two translations below.

#### Feature Requirements:
- When `/translate` is activated in Work Project Alpha group chat:
  - All messages show 3 languages: English, Japanese, French
  - Original language appears first (unchanged)
  - Two translations appear below, separated by lines
  - Applies to both Yuki Tanaka (Japanese) and Pierre Dubois (French) responses

#### Implementation Plan:

**1. Update Message Type (`client/src/types/chat.ts`)**
- Add `secondTranslatedContent?: string` field
- Add `secondTargetLanguage?: string` field
- Support storing two translations per message

**2. Update Translation State (`client/src/store/chatStore.ts`)**
- Modify `TranslationInfo` interface:
  ```typescript
  interface TranslationInfo {
    enabled: boolean;
    targetLanguage: string;      // Primary target (e.g., 'ja')
    sourceLanguage: string;      // User's language ('en')
    isTriLingual?: boolean;      // Enable 3-language mode
    triLingualLanguages?: string[]; // e.g., ['en', 'ja', 'fr']
  }
  ```
- Add `enableTriLingualTranslation(chatId, languages)` action

**3. Update Command Handler (`client/src/components/chat/MessageInput.tsx`)**
- Detect if current chat is Work Project Alpha group
- When `/translate` is used in group:
  - Call `enableTriLingualTranslation(chatId, ['en', 'ja', 'fr'])`
  - Show toast: "Tri-Lingual Translation activated — English ↔ Japanese ↔ French"

**4. Update User Message Translation (`client/src/hooks/useSendMessage.ts`)**
- When tri-lingual enabled:
  - User sends English message
  - Translate to Japanese → `translatedContent`
  - Translate to French → `secondTranslatedContent`
- Update message with both translations

**5. Update AI Response Translation (`client/src/hooks/useAIResponse.ts`)**
- When tri-lingual enabled and AI responds:
  - Detect original language from responder
  - If Yuki (Japanese): translate to English AND French
  - If Pierre (French): translate to English AND Japanese
- Set appropriate language fields

**6. Update Message Display (`client/src/components/chat/MessageBubble.tsx`)**
- Add `SecondTranslationSeparator` and `SecondTranslatedContent` styled components
- When `secondTranslatedContent` exists, render:
  ```
  [Original Message]
  ─────────────────
  [First Translation]
  ─────────────────
  [Second Translation]
  ```
- Add small language labels (EN, JP, FR) next to each section

**7. Update Live Translate Indicator (`client/src/components/chat/LiveTranslateIndicator.tsx`)**
- Add variant for tri-lingual mode showing all three flags/languages
- Text: "Live Translate (3 langs)"

**8. Backend: Batch Translation (`server/src/routes/translate.ts`)**
- Add `POST /api/translate/batch` endpoint
- Accept: `{ text, targetLanguages: ['ja', 'fr'] }`
- Return: `{ translations: [{ lang: 'ja', text: '...' }, { lang: 'fr', text: '...' }] }`
- More efficient than multiple single-translation calls

---

### Pending Features

#### 🔲 Dynamic Views - AI-Aggregated Smart Chats (P0)
**Status:** Not Started
**Est. Time:** 3-4 days

Create live, automatically-updated views that aggregate related messages across multiple chats.

#### 🔲 CLI Interface (P0)
**Status:** Partial (only /reset and /translate implemented)
**Est. Time:** 2-3 days

Full command system with autocomplete, help, and more commands.

#### 🔲 WhatsApp Migration Animation (P1)
**Status:** Not Started
**Est. Time:** 1-2 days

Dramatic animation showing messages flowing from WhatsApp to OBLIQ.

#### 🔲 In-Chat Calendar - Timezone Coordination (P1)
**Status:** Not Started
**Est. Time:** 2 days

Shared calendar widget for scheduling across timezones.

#### 🔲 Encryption Indicators (P1)
**Status:** Not Started
**Est. Time:** 1 day

Visual security level indicators (Shield icon with level 5).

#### 🔲 In-Chat Purchases (P2)
**Status:** Not Started
**Est. Time:** 2 days

Complete purchase flow without leaving chat.

#### 🔲 Subgroups/Lanes (P2)
**Status:** Not Started
**Est. Time:** 2 days

Slack-style channels within group chats.

---

## Review Log

### 2026-01-12 - Live Translation Feature Complete
- Implemented full live translation system
- Backend translation service with Claude API integration
- Frontend state management with auto-disable on chat switch
- UI components: LiveTranslateIndicator, TypewriterEffect, enhanced MessageBubble
- Toast notification styling for translation activation
- All TypeScript compilation successful
- Build passes without errors
