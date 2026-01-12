# OBLIQ Demo Simulator - Development Plan

## Project Overview

A WhatsApp Web clone simulator for demonstrating OBLIQ's advanced messaging features. This is a **local demonstration tool**, not a production application.

### Core Purpose
1. **Stage 1 (This Document)**: Replicate WhatsApp Web interface with 20 mock chats, AI-powered conversation responses, and realistic messaging behavior
2. **Stage 2 (Future)**: Showcase OBLIQ's differentiating features (CLI, migration, encryption indicators, dynamic views, etc.)

---

## Technical Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Styled-Components (for theming support, matching WhatsApp's light/dark modes)
- **State Management**: Zustand (lightweight, simple for local app)
- **UI Icons**: Lucide React (comprehensive icon set)
- **Date Handling**: date-fns
- **Animation**: Framer Motion (for typing indicators, message animations)

### Backend/Local Services
- **Database**: SQLite via better-sqlite3 (Node.js, synchronous, perfect for local demo)
- **API Server**: Express.js (lightweight local server)
- **AI Responses**: Claude API via @anthropic-ai/sdk
- **Image Generation**: Stable Diffusion via Python diffusers library (pre-generate images during setup)

### Build Tools
- **Bundler**: Vite (fast HMR, TypeScript support)
- **Package Manager**: npm

---

## Project Structure

```
obliq-demo/
├── client/                          # React frontend
│   ├── public/
│   │   └── assets/
│   │       ├── images/             # Generated profile pics & media
│   │       ├── sounds/             # Notification sounds
│   │       └── icons/              # App icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Shared UI components
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   └── MessageStatus.tsx
│   │   │   ├── sidebar/            # Left panel
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── ChatList.tsx
│   │   │   │   ├── ChatListItem.tsx
│   │   │   │   └── SidebarHeader.tsx
│   │   │   ├── chat/               # Right panel - chat view
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   ├── MediaMessage.tsx
│   │   │   │   └── CallIndicator.tsx
│   │   │   ├── call/               # Mock call interface
│   │   │   │   ├── CallModal.tsx
│   │   │   │   ├── VoiceCall.tsx
│   │   │   │   └── VideoCall.tsx
│   │   │   └── modals/
│   │   │       ├── ProfileModal.tsx
│   │   │       └── MediaPreview.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useMessages.ts
│   │   │   ├── useAIResponse.ts
│   │   │   └── useTypingSimulation.ts
│   │   ├── store/
│   │   │   ├── chatStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── settingsStore.ts
│   │   ├── styles/
│   │   │   ├── theme.ts            # WhatsApp color palette
│   │   │   ├── GlobalStyles.ts
│   │   │   └── animations.ts
│   │   ├── types/
│   │   │   ├── chat.ts
│   │   │   ├── message.ts
│   │   │   ├── contact.ts
│   │   │   └── call.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── dateUtils.ts
│   │   │   └── messageUtils.ts
│   │   ├── data/
│   │   │   └── personas.ts         # 20 persona definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                          # Local Express server
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── chats.ts
│   │   │   ├── messages.ts
│   │   │   └── ai.ts
│   │   ├── services/
│   │   │   ├── database.ts
│   │   │   ├── aiService.ts
│   │   │   └── resetService.ts
│   │   └── db/
│   │       ├── schema.sql
│   │       └── seed.sql
│   ├── package.json
│   └── tsconfig.json
├── scripts/                         # Setup & generation scripts
│   ├── generate_images.py          # Stable Diffusion profile pics
│   ├── seed_database.ts            # Populate mock conversations
│   └── setup.sh                    # Full setup script
├── data/
│   ├── personas.json               # 20 persona definitions with prompts
│   ├── conversations/              # Pre-generated conversation templates
│   └── media/                      # Stock media for messages
└── README.md
```

---

## 20 Personas Definition

### Individual Chats (14)

| # | Name | Relationship | Language | Key Topics | Profile Image Prompt |
|---|------|-------------|----------|------------|---------------------|
| 1 | **Sarah Chen** | Wife | English | House sale, son's school, daily life | "Professional headshot of Asian woman, 38, warm smile, dark hair, natural lighting, white background" |
| 2 | **Michael Torres** | Real Estate Agent | English | House listing, showings, market updates | "Professional headshot of Hispanic man, 45, business attire, confident expression, office background" |
| 3 | **David Kim** | Potential Buyer 1 | English | House viewing, price negotiation | "Casual headshot of Korean-American man, 35, glasses, friendly expression" |
| 4 | **Emily Watson** | Potential Buyer 2 | English | House questions, counteroffer | "Professional woman, 42, blonde, business casual, warm smile" |
| 5 | **Robert Hansen** | Business Partner (NYC) | English | Zoom meetings, contracts, timezone coordination | "Executive man, 52, gray hair, suit, serious professional look" |
| 6 | **Yuki Tanaka** | Japanese Colleague | Japanese | Project updates, meetings (in Japanese) | "Japanese businessman, 40, neat appearance, subtle smile" |
| 7 | **Pierre Dubois** | French Client | French | Business discussions (in French) | "French professional man, 48, stylish, slight beard, sophisticated" |
| 8 | **Mom** | Mother | English | Family updates, recipes, health | "Elderly woman, 68, kind eyes, silver hair, grandmotherly" |
| 9 | **Jake (Son)** | Son | English | School, games, weekend plans | "Teenage boy, 15, casual, friendly, school photo style" |
| 10 | **Dr. Amanda Foster** | Doctor | English | Appointment reminders, test results | "Female doctor, 45, professional, lab coat, stethoscope" |
| 11 | **Chris Miller** | Best Friend | English | Sports, jokes, weekend plans | "Casual man, 40, beard, laughing, outdoor setting" |
| 12 | **Jennifer Lee** | Colleague | English | Work projects, deadlines | "Professional Asian woman, 35, office attire, friendly" |
| 13 | **Alex Thompson** | Gym Buddy | English | Workout schedules, fitness tips | "Athletic man, 32, gym clothes, fit, energetic" |
| 14 | **Maria Garcia** | Housekeeper | English | Scheduling, house tasks | "Latina woman, 50, warm, dependable expression" |

### Group Chats (6)

| # | Group Name | Members | Topics |
|---|-----------|---------|--------|
| 15 | **House Sale Team** | Me, Sarah, Michael Torres | Coordinating sale, documents, updates |
| 16 | **Family Group** | Me, Sarah, Jake, Mom | Family announcements, photos, events |
| 17 | **Work Project Alpha** | Me, Robert, Jennifer, + 3 others | Project deadlines, meetings, files |
| 18 | **Jake's School - Parents** | Me, Sarah, + 8 other parents | School events, homework, teacher updates |
| 19 | **Weekend Warriors** | Me, Chris, Alex, + 2 others | Sports, outings, banter |
| 20 | **Neighborhood Watch** | Me, + 10 neighbors | Local alerts, packages, community |

---

## Database Schema

```sql
-- Contacts table
CREATE TABLE contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    about TEXT,
    is_group INTEGER DEFAULT 0,
    language TEXT DEFAULT 'en',
    persona_prompt TEXT,  -- For AI to maintain character
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Group members (for group chats)
CREATE TABLE group_members (
    group_id TEXT REFERENCES contacts(id),
    member_id TEXT REFERENCES contacts(id),
    is_admin INTEGER DEFAULT 0,
    PRIMARY KEY (group_id, member_id)
);

-- Messages table
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT REFERENCES contacts(id),
    sender_id TEXT,  -- NULL = "me", else contact id
    content TEXT,
    message_type TEXT DEFAULT 'text',  -- text, image, voice, video, call, system
    media_url TEXT,
    media_caption TEXT,
    call_duration INTEGER,  -- For call messages
    call_type TEXT,  -- voice, video
    status TEXT DEFAULT 'sent',  -- sent, delivered, read
    reply_to TEXT REFERENCES messages(id),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted INTEGER DEFAULT 0
);

-- Chat metadata
CREATE TABLE chats (
    contact_id TEXT PRIMARY KEY REFERENCES contacts(id),
    last_message_id TEXT REFERENCES messages(id),
    unread_count INTEGER DEFAULT 0,
    is_pinned INTEGER DEFAULT 0,
    is_muted INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0
);

-- For reset functionality
CREATE TABLE initial_state (
    table_name TEXT,
    data_json TEXT
);
```

---

## Mock Conversation Templates

### Conversation 1: Sarah (Wife) - House Sale Discussion
```
[3 days ago]
ME: The agent said we got another viewing request for Saturday
SARAH: That's great! Is it the couple from last week?
ME: No, new people. They saw the listing online
SARAH: We should declutter the garage before then
ME: Good idea. I'll move some boxes to storage
SARAH: Don't forget Jake has soccer practice at 2pm
ME: Right, I'll make sure to be back by then
[Image: Living room staged photo]
ME: How does this look for the listing?
SARAH: Much better! The new curtains really help
[Yesterday]
SARAH: Michael said the offer from the Watsons came in
ME: How much?
SARAH: $485,000. That's below asking
ME: We should counter at $510
SARAH: I agree. Let's discuss tonight after dinner
[Today]
SARAH: Did you call Michael back?
ME: Just got off the phone. He's presenting our counter today
SARAH: 🤞 Fingers crossed
```

### Conversation 2: Michael Torres (Real Estate Agent)
```
[1 week ago]
MICHAEL: Good morning! I've scheduled 3 viewings for this weekend
ME: Perfect. What times?
MICHAEL: Saturday at 10am, 2pm, and Sunday at 11am
ME: We'll make sure the house is ready
[5 days ago]
MICHAEL: The Saturday 10am went very well. They loved the backyard
ME: That's encouraging. Any feedback?
MICHAEL: They asked about the roof age. I mentioned it was replaced in 2019
ME: Yes, I have the warranty docs if needed
[Voice Call: 4 minutes]
[2 days ago]
MICHAEL: Offer came in! The Watsons are offering $485K
ME: That's $30K below asking
MICHAEL: Standard negotiation. We can counter
ME: Let's counter at $510K
MICHAEL: I'll draft the counter-offer now
[Today]
MICHAEL: They countered back at $495K
ME: Getting closer. Let me discuss with Sarah
MICHAEL: Take your time. They seem motivated
```

### Conversation 3: Robert Hansen (Business Partner - NYC Timezone)
```
[5 days ago]
ROBERT: Can we sync on the Q3 projections?
ME: Sure. What time works? I'm in Bangkok
ROBERT: I keep forgetting the 12-hour difference 😅
ME: How about 9am your time? That's 9pm here
ROBERT: That works. I'll send a Zoom link
[Video Call: 45 minutes]
[3 days ago]
ROBERT: The board meeting is moved to Thursday
ME: What time?
ROBERT: 2pm EST. That's... 2am for you?
ME: 3am actually. Can we do it earlier?
ROBERT: Let me check. Will get back to you
ROBERT: Best I could do is 10am EST
ME: That's 11pm here. Manageable
ME: Send me the prep docs when ready
[File: Q3_Projections_Draft.pdf]
ROBERT: Here you go. Let me know your thoughts
[Yesterday]
ME: Reviewed the doc. Few comments on slide 12
ROBERT: Which part?
ME: The revenue forecast seems optimistic given market conditions
ROBERT: Fair point. Let's discuss in the call
```

### Conversation 4: Yuki Tanaka (Japanese - Full Japanese)
```
[2 days ago]
YUKI: お疲れ様です。来週の会議の件でご連絡しました。
ME: (Send in English - will trigger translation demo later)
YUKI: プレゼン資料は金曜日までに準備できますか？
YUKI: クライアントが月曜日に確認したいそうです
ME: (Response)
YUKI: ありがとうございます。よろしくお願いします。
[Yesterday]
YUKI: 資料を確認しました。いくつか修正点があります。
YUKI: ページ5のグラフを更新してください
YUKI: あと、予算の部分も再確認が必要です
```

### Conversation 5: Pierre Dubois (French - Full French)
```
[3 days ago]
PIERRE: Bonjour! Comment allez-vous?
PIERRE: J'ai reçu votre proposition. Très intéressant.
ME: (Response)
PIERRE: Nous pouvons organiser un appel cette semaine?
PIERRE: Je suis disponible jeudi ou vendredi après-midi
[Yesterday]
PIERRE: J'ai quelques questions sur le délai de livraison
PIERRE: Est-ce que 6 semaines est réaliste?
PIERRE: Notre équipe a besoin de plus de détails
```

---

## AI Response Configuration

### Claude API Integration
```typescript
// server/src/services/aiService.ts

import Anthropic from '@anthropic-ai/sdk';

interface PersonaContext {
  name: string;
  relationship: string;
  language: string;
  personality: string;
  currentTopics: string[];
  conversationHistory: string;
}

export class AIService {
  private client: Anthropic;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  async generateResponse(
    userMessage: string,
    persona: PersonaContext
  ): Promise<string> {
    const systemPrompt = `You are ${persona.name}, ${persona.relationship} of the user.
    
Personality: ${persona.personality}
Language: Respond in ${persona.language}
Current conversation topics: ${persona.currentTopics.join(', ')}

Important rules:
1. Stay completely in character as ${persona.name}
2. Keep responses natural and conversational (1-3 sentences typically)
3. Reference ongoing topics naturally
4. Use appropriate emoji sparingly (like real texting)
5. If in a non-English language, respond entirely in that language
6. Match the casual/formal tone of the relationship
7. Never break character or mention being an AI

Recent conversation context:
${persona.conversationHistory}`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    });
    
    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
  }
}
```

---

## Image Generation Setup

### Profile Picture Generation Script
```python
# scripts/generate_images.py

from diffusers import StableDiffusionPipeline
import torch
import json
import os

def generate_profile_images():
    # Load model (will auto-download if not present)
    model_id = "runwayml/stable-diffusion-v1-5"
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id, 
        torch_dtype=torch.float16
    )
    pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load persona definitions
    with open('../data/personas.json', 'r') as f:
        personas = json.load(f)
    
    output_dir = '../client/public/assets/images/profiles'
    os.makedirs(output_dir, exist_ok=True)
    
    for persona in personas:
        prompt = f"{persona['image_prompt']}, portrait photo, high quality, 4k"
        negative_prompt = "blurry, bad quality, distorted, ugly, deformed"
        
        image = pipe(
            prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=30,
            guidance_scale=7.5
        ).images[0]
        
        # Save as 256x256 avatar
        image = image.resize((256, 256))
        image.save(f"{output_dir}/{persona['id']}.png")
        print(f"Generated: {persona['name']}")

if __name__ == "__main__":
    generate_profile_images()
```

### Chat Media Generation
```python
# Generate sample images for in-chat media
def generate_chat_media():
    media_prompts = [
        ("house_living_room.png", "modern living room, staged for real estate, bright natural light, minimalist decor"),
        ("house_backyard.png", "beautiful backyard garden, green lawn, patio furniture, sunny day"),
        ("travel_gadget_1.png", "portable travel charger product photo, white background, sleek design"),
        ("family_selfie.png", "happy family selfie at park, casual, natural lighting, smiling"),
        ("sunset_beach.png", "beautiful sunset at tropical beach, vacation photo, golden hour"),
        ("office_meeting.png", "business meeting in modern office, professional setting"),
        ("soccer_game.png", "youth soccer game, action shot, green field"),
        ("restaurant_food.png", "gourmet dinner plate, fine dining, appetizing presentation"),
    ]
    
    output_dir = '../client/public/assets/images/media'
    os.makedirs(output_dir, exist_ok=True)
    
    for filename, prompt in media_prompts:
        # Generate using same pipeline
        pass
```

---

## WhatsApp UI Specifications

### Color Palette (Dark Theme - Default)
```typescript
// styles/theme.ts

export const darkTheme = {
  // Main backgrounds
  bg: {
    primary: '#111b21',        // Main background
    secondary: '#202c33',      // Sidebar, input areas
    tertiary: '#2a3942',       // Hover states
    conversation: '#0b141a',   // Chat area background
  },
  
  // Message bubbles
  bubble: {
    outgoing: '#005c4b',       // Green - sent messages
    incoming: '#202c33',       // Gray - received messages
    system: '#1e2428',         // System messages
  },
  
  // Text colors
  text: {
    primary: '#e9edef',        // Main text
    secondary: '#8696a0',      // Secondary text, timestamps
    link: '#53bdeb',           // Links
    danger: '#f15c6d',         // Delete, errors
  },
  
  // Accent colors
  accent: {
    primary: '#00a884',        // WhatsApp green
    blue: '#53bdeb',           // Read receipts, links
    lightGreen: '#25d366',     // Online status
  },
  
  // Borders and dividers
  border: {
    primary: '#2a3942',
    light: '#222d34',
  },
  
  // Icons
  icon: {
    primary: '#aebac1',
    secondary: '#8696a0',
    active: '#00a884',
  }
};

export const lightTheme = {
  bg: {
    primary: '#ffffff',
    secondary: '#f0f2f5',
    tertiary: '#d9dbd8',
    conversation: '#efeae2',
  },
  bubble: {
    outgoing: '#d9fdd3',
    incoming: '#ffffff',
    system: '#fdf4c5',
  },
  text: {
    primary: '#111b21',
    secondary: '#667781',
    link: '#027eb5',
    danger: '#ea0038',
  },
  accent: {
    primary: '#00a884',
    blue: '#53bdeb',
    lightGreen: '#25d366',
  },
  border: {
    primary: '#e9edef',
    light: '#d1d7db',
  },
  icon: {
    primary: '#54656f',
    secondary: '#8696a0',
    active: '#00a884',
  }
};
```

### Typography
```typescript
export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14.2px',
    md: '15px',
    lg: '17px',
    xl: '19px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
  }
};
```

### Layout Specifications
```typescript
export const layout = {
  sidebar: {
    width: '400px',
    minWidth: '340px',
    maxWidth: '500px',
  },
  chatHeader: {
    height: '59px',
  },
  messageInput: {
    minHeight: '62px',
  },
  avatar: {
    xs: '28px',
    sm: '40px',
    md: '49px',
    lg: '200px',
  },
  messageMaxWidth: '65%',
};
```

### Message Status Icons
```typescript
// Single gray check: Sent
// Double gray checks: Delivered  
// Double blue checks: Read
// Clock icon: Pending

export const MessageStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};
```

---

## Development Phases

### Phase 1: Project Setup (Prompt 1)
- Initialize Vite React TypeScript project
- Set up folder structure
- Install dependencies
- Configure Styled-Components theming
- Create base layout components

### Phase 2: UI Shell (Prompt 2)
- Sidebar component with chat list
- Chat window component
- Message input component
- Theme implementation (dark/light)
- Basic responsive layout

### Phase 3: Data Layer (Prompt 3)
- SQLite database setup
- Express server with routes
- Zustand store configuration
- API integration hooks

### Phase 4: Personas & Seed Data (Prompt 4)
- Define 20 personas in JSON
- Generate profile images (Stable Diffusion)
- Create conversation templates
- Seed database with mock data

### Phase 5: Messaging Core (Prompt 5)
- Message list with infinite scroll
- Message bubbles (text, media, calls)
- Typing indicator animation
- Read receipts and status icons
- Time grouping (Today, Yesterday, dates)

### Phase 6: AI Integration (Prompt 6)
- Claude API service
- Persona-based response generation
- Typing delay simulation
- Response streaming effect

### Phase 7: Media & Calls (Prompt 7)
- Image message display
- Media preview modal
- Call log entries
- Mock call interface modal

### Phase 8: Special Features (Prompt 8)
- /reset command implementation
- Japanese/French conversation display
- Group chat differentiation
- Search functionality

### Phase 9: Polish & Testing (Prompt 9)
- Animation refinements
- Sound effects (optional)
- Performance optimization
- Bug fixes and edge cases

---

## Claude Code Prompts Sequence

### Prompt 1: Project Initialization
```
Create a new project called "obliq-demo" with the following structure:

1. Initialize a Vite React TypeScript project in /client
2. Initialize an Express TypeScript server in /server
3. Set up the folder structure as specified in the development plan
4. Install these dependencies:

Client:
- react, react-dom
- styled-components, @types/styled-components
- zustand
- lucide-react
- date-fns
- framer-motion
- axios

Server:
- express, @types/express
- better-sqlite3, @types/better-sqlite3
- @anthropic-ai/sdk
- cors
- uuid

Create the base configuration files:
- vite.config.ts with proxy to localhost:3001
- tsconfig.json for both client and server
- .env.example with ANTHROPIC_API_KEY placeholder

Create a basic App.tsx that renders "OBLIQ Demo" with Styled-Components GlobalStyles.
```

### Prompt 2: UI Shell & Theme
```
Implement the WhatsApp Web UI shell with these specifications:

1. Create the theme system in styles/theme.ts:
   - Dark theme (default) with exact WhatsApp colors
   - Light theme variant
   - Typography settings
   - Layout constants

2. Create GlobalStyles.ts with:
   - CSS reset
   - Custom scrollbar styling (thin, matching theme)
   - Font imports

3. Build the main layout:
   - Left sidebar (400px default, resizable)
   - Right chat area (fills remaining space)
   - Vertical divider between them

4. Create Sidebar components:
   - SidebarHeader: Avatar, status icons, menu
   - SearchBar: Search input with icon
   - ChatList: Scrollable container
   - ChatListItem: Avatar, name, last message preview, time, unread badge

5. Create ChatWindow placeholder:
   - ChatHeader: Contact info, call/video/menu icons
   - MessageList: Empty scrollable area
   - MessageInput: Text input, emoji, attach, mic icons

Use the exact color palette from the development plan. Match WhatsApp Web's current design.
```

### Prompt 3: Data Layer & State Management
```
Set up the complete data layer:

1. Create SQLite schema in server/src/db/schema.sql:
   - contacts table (with persona_prompt for AI)
   - group_members table
   - messages table (with all message types)
   - chats table (metadata)
   - initial_state table (for reset feature)

2. Create database service in server/src/services/database.ts:
   - Initialize database
   - CRUD operations for contacts, messages, chats
   - Batch operations for seeding
   - Backup/restore for reset functionality

3. Create Express routes:
   - GET /api/chats - List all chats with last message
   - GET /api/chats/:id/messages - Get messages with pagination
   - POST /api/chats/:id/messages - Send message
   - GET /api/contacts/:id - Get contact details
   - POST /api/reset - Reset to initial state

4. Create Zustand stores:
   - chatStore: chats list, selected chat, messages by chat
   - uiStore: sidebar state, modals, theme
   - Create selectors and actions

5. Create React hooks:
   - useChats: Fetch and manage chat list
   - useMessages: Fetch and manage messages for selected chat
   - useContact: Get contact details
   - useSendMessage: Send message with optimistic updates

Wire everything together so selecting a chat loads its messages.
```

### Prompt 4: Personas & Seed Data
```
Create the 20 personas and seed the database:

1. Create data/personas.json with all 20 personas:
   - 14 individual contacts (as specified in plan)
   - 6 group chats (as specified in plan)
   - Include: id, name, phone, about, language, relationship, persona_prompt
   - Include: image_prompt for Stable Diffusion generation

2. Create conversation templates for each chat:
   - At least 20 messages per conversation
   - Mix of: text (70%), images (15%), calls (15%)
   - Use realistic timestamps spanning 1 week
   - Include the specific conversations from the plan:
     * Sarah (wife) - house sale discussions
     * Michael Torres - real estate negotiations
     * Robert Hansen - timezone coordination for Zoom
     * Yuki Tanaka - Japanese messages
     * Pierre Dubois - French messages
     * Potential buyers - price negotiations

3. Create server/src/db/seed.ts script:
   - Insert all contacts
   - Insert all messages with proper timestamps
   - Set up group memberships
   - Save initial state for reset feature

4. Create scripts/generate_images.py:
   - Script to generate profile pictures using Stable Diffusion
   - Generate chat media images
   - Save to client/public/assets/images/

Run the seed script and verify data loads correctly.
```

### Prompt 5: Messaging Core
```
Implement the complete messaging UI:

1. Create MessageList component:
   - Infinite scroll (load older messages on scroll up)
   - Group messages by date (Today, Yesterday, specific dates)
   - Auto-scroll to bottom on new messages
   - Smooth scroll animations

2. Create MessageBubble component:
   - Outgoing (green) vs incoming (gray) styling
   - Tail/arrow on bubble pointing to sender
   - Timestamp inside bubble (bottom right)
   - Status icons for outgoing (pending, sent, delivered, read)
   - Support for: text, image, voice note indicator, call log

3. Create MediaMessage component:
   - Image with thumbnail and full preview
   - Caption support
   - Download button
   - Blur hash placeholder while loading

4. Create CallIndicator component:
   - Voice call icon + duration
   - Video call icon + duration
   - Missed call styling (red)
   - "Tap to call back" functionality (opens mock call)

5. Create TypingIndicator component:
   - Three bouncing dots animation
   - Appears in message list above input
   - Smooth fade in/out

6. Implement timestamp formatting:
   - Messages: "10:30 AM"
   - Chat list: "10:30 AM" / "Yesterday" / "Mon" / "12/1/25"
   - Message groups: "Today", "Yesterday", "December 1, 2025"

7. Create message status icons:
   - Clock (pending)
   - Single check (sent)
   - Double check gray (delivered)
   - Double check blue (read)
```

### Prompt 6: AI Integration
```
Implement Claude AI-powered responses:

1. Create server/src/services/aiService.ts:
   - Initialize Anthropic client
   - generateResponse method with persona context
   - System prompt template for character maintenance
   - Handle language-specific responses (Japanese, French)
   - Error handling with fallback responses

2. Create AI response endpoint:
   - POST /api/chats/:id/ai-response
   - Accept: user message, chat history context
   - Return: AI-generated response

3. Create useAIResponse hook:
   - Trigger AI response after user sends message
   - 1-3 second delay before "typing" begins
   - Show typing indicator for 2-5 seconds (varies)
   - Simulate "reading" incoming message (delivered -> read)

4. Create useTypingSimulation hook:
   - Calculate realistic typing duration based on message length
   - Add natural variation (±20%)
   - Handle message streaming effect (optional)

5. Update message flow:
   - User sends message -> optimistic update
   - After 1-2s delay, show typing indicator
   - After typing duration, insert AI response
   - Update message status (sent -> delivered -> read)

6. Handle group chats:
   - Randomly select responder from group members
   - Use appropriate persona for selected member
   - Longer delays for group responses (multiple people "reading")

Test with various personas ensuring character consistency.
```

### Prompt 7: Media & Call Interface
```
Implement media handling and mock call interface:

1. Create MediaPreview modal:
   - Full-screen image view
   - Dark overlay background
   - Close button (X)
   - Download button
   - Image zoom/pan (optional)

2. Create ProfileModal component:
   - Large avatar
   - Contact name, phone, about
   - Media gallery (images from conversation)
   - Encryption info (placeholder for Stage 2)
   - Block/Report buttons (non-functional)

3. Create CallModal component:
   - Full-screen overlay
   - Avatar centered, large
   - Contact name
   - Call duration timer
   - Mute, speaker, video toggle buttons
   - End call button (red)
   - Ringing animation on initiate

4. Create VoiceCall and VideoCall variants:
   - VoiceCall: Static avatar with pulse animation
   - VideoCall: Mock video feed (blurred gradient or static image)
   - Self-preview in corner (blurred or placeholder)

5. Wire up interactions:
   - Click call icon in ChatHeader -> Open CallModal
   - Click call log in messages -> Open CallModal
   - End call -> Close modal, add call entry to chat

6. Add call entries to messages:
   - Icon indicating voice/video
   - Duration or "Missed"
   - Timestamp
   - Tap to call back
```

### Prompt 8: Special Features
```
Implement special demo features:

1. Create /reset command handler:
   - Detect "/reset" in message input
   - Don't send as message
   - Call POST /api/reset
   - Reload all chats and messages
   - Show toast notification: "Demo reset to initial state"

2. Create ResetService on server:
   - Store initial state on first seed
   - Restore from backup tables
   - Clear all messages added during demo
   - Reset unread counts

3. Handle multi-language chats:
   - Yuki's messages display in Japanese characters
   - Pierre's messages display in French
   - No translation yet (Stage 2 feature)
   - Ensure fonts support Japanese characters

4. Group chat enhancements:
   - Show sender name above message (not for outgoing)
   - Different color for each sender name
   - Member count in header
   - "X is typing..." with name

5. Search functionality:
   - Search bar in sidebar
   - Filter chats by name
   - Highlight matching text
   - Clear search button

6. Chat list sorting:
   - Pinned chats at top
   - Then by last message time
   - Unread indicator (green badge with count)
   - Muted icon for muted chats

7. Add subtle animations:
   - New message slide in
   - Chat select transition
   - Hover effects on interactive elements
   - Smooth scrolling everywhere
```

### Prompt 9: Final Polish
```
Final polish and testing:

1. Add notification sounds (optional):
   - Message received sound
   - Message sent sound
   - Can be toggled off

2. Performance optimizations:
   - Virtualize message list (only render visible)
   - Lazy load images
   - Debounce search input
   - Memoize expensive computations

3. Error handling:
   - API error states
   - Retry failed messages
   - Offline indicator (if applicable)
   - Graceful AI fallbacks

4. Accessibility:
   - Keyboard navigation
   - Focus management
   - Screen reader labels
   - Proper heading hierarchy

5. Visual polish:
   - Double-check all spacing
   - Verify color consistency
   - Test dark/light theme toggle
   - Ensure no layout shifts

6. Create setup script (scripts/setup.sh):
   - Install all dependencies
   - Generate images (or use pre-generated)
   - Initialize and seed database
   - Print startup instructions

7. Create README.md with:
   - Project description
   - Setup instructions
   - Environment variables needed
   - How to run the demo
   - Available commands (/reset)
   - Stage 2 preview

8. Test all 20 conversations:
   - Verify messages display correctly
   - Test AI responses for each persona
   - Verify Japanese/French display
   - Test call interface from each chat
   - Verify reset functionality
```

---

## Fallback: Pre-generated Assets

If Stable Diffusion setup is complex, use these alternatives:

### Option A: AI Image Generation APIs
- Use DALL-E API or Midjourney (manual)
- Generate images separately and include in repo

### Option B: Stock Photo Approach
- Use royalty-free stock photos for profiles
- Generated.photos for AI faces
- Unsplash for media images

### Option C: Avatar Generators
- Use DiceBear or similar for profile avatars
- Stylized rather than photorealistic
- Simpler to implement programmatically

---

## Environment Variables

```env
# .env (server)
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_PATH=./data/obliq-demo.db
PORT=3001

# .env (client - if needed)
VITE_API_URL=http://localhost:3001
```

---

## Running the Demo

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client  
cd client
npm run dev

# Access at http://localhost:5173
```

---

## Stage 2 Features (Implemented)

The following Stage 2 features have been implemented:

1. **CLI Interface**: ✅ Command parser with `/reset`, `/translate`, `/calendar`, `/collect` commands
2. **Migration Demo**: Pending
3. **Encryption Indicators**: Pending
4. **Lanes/Sub-chats**: Pending
5. **Calendar Integration**: ✅ In-chat calendar overlay for group chats
6. **In-chat Purchases**: Pending
7. **Live Translation**: ✅ Real-time translation with Claude API (supports bi-lingual and tri-lingual)
8. **Dynamic Views**: ✅ AI-powered message collection with `/collect` command
9. **Language Moderation**: ✅ Profanity detection for chats with minors (Alert Only / Alert and Block modes)

---

## Summary

This development plan provides:
- ✅ Complete technical specification
- ✅ 9 sequential prompts for Claude Code
- ✅ 20 detailed personas with conversation templates
- ✅ Exact WhatsApp UI specifications
- ✅ AI integration for realistic responses
- ✅ Reset functionality for demo repeatability
- ✅ Multi-language support (Japanese, French)
- ✅ Extensible architecture for Stage 2 features
- ✅ Live Translation (Stage 2)
- ✅ Dynamic Views (Stage 2)
- ✅ Calendar Integration (Stage 2)
- ✅ Language Moderation (Stage 2)

Estimated development time: 4-6 hours with Claude Code (Stage 1)
