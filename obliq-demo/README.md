# OBLIQ Demo Simulator

A WhatsApp Web clone simulator for demonstrating OBLIQ's advanced messaging features. This is a local demonstration tool showcasing innovative messaging capabilities.

## Features

### Core Features (Stage 1)
- **WhatsApp Web UI Clone**: Pixel-perfect recreation of WhatsApp Web interface
- **20 Mock Conversations**: Realistic personas including family, business contacts, and friends
- **AI-Powered Responses**: Claude AI generates contextual, in-character responses
- **Multi-Language Support**: Japanese and French conversations with native speakers
- **Real-time Messaging**: Full send/receive message flow with typing indicators
- **Media Support**: Images, voice messages, and call indicators
- **Dark/Light Theme**: Toggle between themes

### Advanced Features (Stage 2)
- **Live Translation**: Real-time translation for multilingual conversations (`/translate` command)
- **Tri-Lingual Translation**: Support for 3-way translation in group chats
- **Dynamic Views**: AI-powered message collection based on criteria (`/collect` command)
- **Calendar Integration**: In-chat calendar for group scheduling (`/calendar` command)
- **Language Moderation**: Profanity detection for chats with minors (configurable modes)
- **Demo Reset**: Reset to initial state (`/reset` command)

## Tech Stack

### Frontend
- React 19 + TypeScript
- Styled-Components (theming)
- Zustand (state management)
- Framer Motion (animations)
- Lucide React (icons)

### Backend
- Express.js
- SQLite (better-sqlite3)
- Claude API (@anthropic-ai/sdk)

### Build Tools
- Vite
- TypeScript

## Project Structure

```
obliq-demo/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── chat/          # Chat window, messages, input
│   │   │   ├── sidebar/       # Chat list, navigation
│   │   │   ├── modals/        # Settings, profile, calls
│   │   │   ├── calendar/      # Calendar overlay
│   │   │   └── common/        # Shared components
│   │   ├── hooks/             # React hooks
│   │   ├── store/             # Zustand stores
│   │   ├── styles/            # Theme, global styles
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilities
│   └── public/                # Static assets
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── db/                # Database schema
│   └── data/                  # SQLite database
├── data/                      # Seed data
│   ├── conversations/         # Pre-built conversations
│   └── personas.json          # Character definitions
└── scripts/                   # Utility scripts
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/obliq.git
cd obliq/obliq-demo
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

3. Set up environment variables:
```bash
# Copy example env file
cp server/.env.example server/.env

# Edit with your Anthropic API key
# ANTHROPIC_API_KEY=your_key_here
```

4. Seed the database:
```bash
cd server
npm run seed
```

### Running the Demo

Start both client and server:

```bash
# Terminal 1: Start server (from server directory)
cd server
npm run dev

# Terminal 2: Start client (from client directory)
cd client
npm run dev
```

Access at: http://localhost:5173

## Available Commands

Type these in the message input:

| Command | Description |
|---------|-------------|
| `/reset` | Reset demo to initial state |
| `/translate` | Enable live translation for current chat |
| `/calendar` | Open calendar view (group chats only) |
| `/collect <criteria>` | Create dynamic view from messages matching criteria |

## Settings

Access settings via the gear icon in the sidebar:

- **Language Moderation**: Configure profanity detection for chats with minors
  - *Alert Only*: Show warning but allow sending
  - *Alert and Block*: Block messages until profanity is removed
- **Integrations**: View connected integrations (demo)
- **Theme**: Toggle dark/light mode

## 20 Personas

### Individual Chats
1. Sarah Chen (Wife) - House sale discussions
2. Michael Torres (Real Estate Agent) - Property negotiations
3. David Kim (Potential Buyer) - House viewing inquiries
4. Emily Watson (Potential Buyer) - Counteroffers
5. Robert Hansen (Business Partner) - NYC timezone coordination
6. Yuki Tanaka (Japanese Colleague) - Japanese conversations
7. Pierre Dubois (French Client) - French business discussions
8. Mom - Family updates
9. Jake (Son) - School, games, weekend plans (minor - language moderation)
10. Dr. Amanda Foster - Medical appointments
11. Chris Miller (Best Friend) - Sports, jokes
12. Jennifer Lee (Colleague) - Work projects
13. Alex Thompson (Gym Buddy) - Fitness
14. Maria Garcia (Housekeeper) - Scheduling

### Group Chats
15. House Sale Team - Coordinating sale
16. Family Group - Family announcements
17. Work Project Alpha - Project management
18. Jake's School Parents - School events
19. Weekend Warriors - Sports and outings
20. Neighborhood Watch - Community alerts

## Development

### Build for Production

```bash
# Build client
cd client && npm run build

# Build server
cd server && npm run build
```

### Code Quality

```bash
# Lint client
cd client && npm run lint
```

## Environment Variables

### Server (.env)
```
ANTHROPIC_API_KEY=your_anthropic_api_key
DATABASE_PATH=./data/obliq-demo.db
PORT=3001
```

### Client (optional)
```
VITE_API_URL=http://localhost:3001
```

## License

Private - OBLIQ Demo Simulator

## Acknowledgments

- WhatsApp Web for UI inspiration
- Anthropic Claude for AI responses
