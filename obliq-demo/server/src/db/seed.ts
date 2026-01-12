/**
 * Database Seed Script for OBLIQ Demo
 *
 * This script:
 * 1. Reads personas from data/personas.json
 * 2. Reads conversation templates from data/conversations/*.json
 * 3. Populates the database with contacts, messages, and chats
 * 4. Sets up group memberships
 * 5. Saves initial state for reset functionality
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { db } from '../services/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths - __dirname is server/src/db, so go up 3 levels to project root
const DATA_DIR = join(__dirname, '../../../data');
const PERSONAS_PATH = join(DATA_DIR, 'personas.json');
const CONVERSATIONS_DIR = join(DATA_DIR, 'conversations');

// Types
interface PersonaIndividual {
  id: string;
  name: string;
  phone: string;
  about: string;
  language: string;
  relationship: string;
  key_topics: string[];
  persona_prompt: string;
  image_prompt: string;
}

interface PersonaGroup {
  id: string;
  name: string;
  about: string;
  members: string[];
  topics: string[];
}

interface PersonasData {
  individuals: PersonaIndividual[];
  groups: PersonaGroup[];
}

interface ConversationMessage {
  sender: string;
  content: string;
  offset_days: number;
  offset_hours: number;
  offset_minutes: number;
  type?: string;
  media_url?: string;
  media_caption?: string;
  call_duration?: number;
  call_type?: string;
}

interface ConversationTemplate {
  chat_id: string;
  is_group?: boolean;
  messages: ConversationMessage[];
}

// Helper to generate timestamp from offsets
function generateTimestamp(
  offsetDays: number,
  offsetHours: number,
  offsetMinutes: number
): string {
  const now = new Date();
  const timestamp = new Date(
    now.getTime() +
      offsetDays * 24 * 60 * 60 * 1000 +
      offsetHours * 60 * 60 * 1000 +
      offsetMinutes * 60 * 1000
  );
  return timestamp.toISOString();
}

// Load personas
function loadPersonas(): PersonasData {
  const data = readFileSync(PERSONAS_PATH, 'utf-8');
  return JSON.parse(data);
}

// Load all conversation templates
function loadConversations(): ConversationTemplate[] {
  const files = readdirSync(CONVERSATIONS_DIR).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    const data = readFileSync(join(CONVERSATIONS_DIR, file), 'utf-8');
    return JSON.parse(data);
  });
}

// Seed the database
async function seed(): Promise<void> {
  console.log('🌱 Starting database seed...\n');

  // Initialize database
  db.initialize();

  // Load data
  const personas = loadPersonas();
  const conversations = loadConversations();

  console.log(`📋 Loaded ${personas.individuals.length} individuals`);
  console.log(`📋 Loaded ${personas.groups.length} groups`);
  console.log(`📋 Loaded ${conversations.length} conversations\n`);

  // 1. Create individual contacts
  console.log('👤 Creating individual contacts...');
  const individualContacts = personas.individuals.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    avatar_url: `/avatars/${p.id}.png`,
    about: p.about,
    is_group: 0,
    language: p.language,
    persona_prompt: p.persona_prompt,
  }));

  db.batchInsertContacts(individualContacts);
  console.log(`   ✓ Created ${individualContacts.length} individual contacts`);

  // 2. Create group contacts
  console.log('👥 Creating group contacts...');
  const groupContacts = personas.groups.map((g) => ({
    id: g.id,
    name: g.name,
    phone: null,
    avatar_url: `/avatars/${g.id}.png`,
    about: g.about,
    is_group: 1,
    language: 'en',
    persona_prompt: null,
  }));

  db.batchInsertContacts(groupContacts);
  console.log(`   ✓ Created ${groupContacts.length} group contacts`);

  // 3. Create additional contacts for group members not in personas
  console.log('👤 Creating additional group member contacts...');
  const additionalContacts = [
    {
      id: 'lisa-parent',
      name: 'Lisa (Parent)',
      phone: '+1 (415) 555-0201',
      avatar_url: '/avatars/lisa-parent.png',
      about: 'Soccer mom extraordinaire',
      is_group: 0,
      language: 'en',
      persona_prompt: 'You are Lisa, a friendly parent from the school community.',
    },
    {
      id: 'tom-parent',
      name: 'Tom (Parent)',
      phone: '+1 (415) 555-0202',
      avatar_url: '/avatars/tom-parent.png',
      about: "Tom's dad",
      is_group: 0,
      language: 'en',
      persona_prompt: "You are Tom, a friendly parent whose son is friends with the user's son.",
    },
    {
      id: 'mike-weekend',
      name: 'Mike',
      phone: '+1 (415) 555-0203',
      avatar_url: '/avatars/mike-weekend.png',
      about: 'Always game for sports',
      is_group: 0,
      language: 'en',
      persona_prompt: "You are Mike, part of the user's weekend sports group.",
    },
    {
      id: 'helen-neighbor',
      name: 'Helen',
      phone: '+1 (415) 555-0204',
      avatar_url: '/avatars/helen-neighbor.png',
      about: 'Your friendly neighborhood coordinator',
      is_group: 0,
      language: 'en',
      persona_prompt: 'You are Helen, the neighborhood watch coordinator.',
    },
    {
      id: 'dave-neighbor',
      name: 'Dave',
      phone: '+1 (415) 555-0205',
      avatar_url: '/avatars/dave-neighbor.png',
      about: 'Grill master 🍖',
      is_group: 0,
      language: 'en',
      persona_prompt: 'You are Dave, a helpful neighbor.',
    },
    {
      id: 'karen-neighbor',
      name: 'Karen',
      phone: '+1 (415) 555-0206',
      avatar_url: '/avatars/karen-neighbor.png',
      about: 'Love my garden 🌻',
      is_group: 0,
      language: 'en',
      persona_prompt: 'You are Karen, a friendly neighbor.',
    },
  ];

  db.batchInsertContacts(additionalContacts);
  console.log(`   ✓ Created ${additionalContacts.length} additional contacts`);

  // 4. Set up group memberships
  console.log('🔗 Setting up group memberships...');
  const groupMemberships: { groupId: string; memberId: string; isAdmin: boolean }[] = [];

  // House Sale Team
  groupMemberships.push({ groupId: 'house-sale-team', memberId: 'sarah-chen', isAdmin: false });
  groupMemberships.push({ groupId: 'house-sale-team', memberId: 'michael-torres', isAdmin: false });

  // Family Group
  groupMemberships.push({ groupId: 'family-group', memberId: 'sarah-chen', isAdmin: true });
  groupMemberships.push({ groupId: 'family-group', memberId: 'jake-son', isAdmin: false });

  // Work Project Alpha (add yuki and pierre from conversations)
  groupMemberships.push({ groupId: 'work-project-alpha', memberId: 'robert-hansen', isAdmin: true });
  groupMemberships.push({ groupId: 'work-project-alpha', memberId: 'yuki-tanaka', isAdmin: false });
  groupMemberships.push({ groupId: 'work-project-alpha', memberId: 'pierre-dubois', isAdmin: false });

  // Jake's School Parents
  groupMemberships.push({ groupId: 'jakes-school-parents', memberId: 'sarah-chen', isAdmin: false });
  groupMemberships.push({ groupId: 'jakes-school-parents', memberId: 'lisa-parent', isAdmin: true });
  groupMemberships.push({ groupId: 'jakes-school-parents', memberId: 'tom-parent', isAdmin: false });

  // Weekend Warriors
  groupMemberships.push({ groupId: 'weekend-warriors', memberId: 'chris-miller', isAdmin: true });
  groupMemberships.push({ groupId: 'weekend-warriors', memberId: 'alex-thompson', isAdmin: false });
  groupMemberships.push({ groupId: 'weekend-warriors', memberId: 'mike-weekend', isAdmin: false });

  // Neighborhood Watch
  groupMemberships.push({ groupId: 'neighborhood-watch', memberId: 'sarah-chen', isAdmin: false });
  groupMemberships.push({ groupId: 'neighborhood-watch', memberId: 'helen-neighbor', isAdmin: true });
  groupMemberships.push({ groupId: 'neighborhood-watch', memberId: 'dave-neighbor', isAdmin: false });
  groupMemberships.push({ groupId: 'neighborhood-watch', memberId: 'karen-neighbor', isAdmin: false });

  for (const membership of groupMemberships) {
    db.addGroupMember(membership.groupId, membership.memberId, membership.isAdmin);
  }
  console.log(`   ✓ Created ${groupMemberships.length} group memberships`);

  // 5. Create messages from conversations
  console.log('💬 Creating messages...');
  const allMessages: {
    id: string;
    chat_id: string;
    sender_id: string | null;
    content: string | null;
    message_type: string;
    media_url: string | null;
    media_caption: string | null;
    call_duration: number | null;
    call_type: string | null;
    status: string;
    reply_to: string | null;
    timestamp: string;
  }[] = [];

  for (const conversation of conversations) {
    for (const msg of conversation.messages) {
      const messageId = randomUUID();
      const timestamp = generateTimestamp(msg.offset_days, msg.offset_hours, msg.offset_minutes);

      // Determine sender_id: "me" or "contact" -> null for me, contact id for contact
      let senderId: string | null = null;
      if (msg.sender !== 'me') {
        // In group chats, sender is the contact id; in individual chats, sender is "contact"
        if (conversation.is_group) {
          senderId = msg.sender; // Already the contact id
        } else {
          senderId = conversation.chat_id; // The contact we're chatting with
        }
      }

      allMessages.push({
        id: messageId,
        chat_id: conversation.chat_id,
        sender_id: senderId,
        content: msg.content,
        message_type: msg.type || 'text',
        media_url: msg.media_url || null,
        media_caption: msg.media_caption || null,
        call_duration: msg.call_duration || null,
        call_type: msg.call_type || null,
        status: 'read',
        reply_to: null,
        timestamp,
      });
    }
  }

  // Sort messages by timestamp
  allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  db.batchInsertMessages(allMessages);
  console.log(`   ✓ Created ${allMessages.length} messages`);

  // 6. Create chats with last message references
  console.log('📱 Creating chats...');
  const chatIds = new Set(conversations.map((c) => c.chat_id));
  const chats: {
    contact_id: string;
    last_message_id: string | null;
    unread_count: number;
    is_pinned: number;
    is_muted: number;
    is_archived: number;
  }[] = [];

  // Define which chats should have unread messages initially
  const chatsWithUnread: Record<string, number> = {
    'mom': 3,
    'jake-son': 2,
    'chris-miller': 1,
    'jennifer-lee': 2,
    'weekend-warriors': 4,
    'neighborhood-watch': 3,
  };

  for (const chatId of chatIds) {
    const chatMessages = allMessages
      .filter((m) => m.chat_id === chatId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const lastMessage = chatMessages[0];

    // Pin wife and family group
    const isPinned = chatId === 'sarah-chen' || chatId === 'family-group' ? 1 : 0;

    // Set unread count for specified chats
    const unreadCount = chatsWithUnread[chatId] || 0;

    chats.push({
      contact_id: chatId,
      last_message_id: lastMessage?.id || null,
      unread_count: unreadCount,
      is_pinned: isPinned,
      is_muted: 0,
      is_archived: 0,
    });
  }

  db.batchInsertChats(chats);
  console.log(`   ✓ Created ${chats.length} chats`);

  // 7. Save initial state for reset functionality
  console.log('💾 Saving initial state...');
  db.saveInitialState();
  console.log('   ✓ Initial state saved');

  console.log('\n✅ Database seeding complete!');
  console.log(`   Total contacts: ${individualContacts.length + groupContacts.length + additionalContacts.length}`);
  console.log(`   Total messages: ${allMessages.length}`);
  console.log(`   Total chats: ${chats.length}`);

  // Close database
  db.close();
}

// Run seed
seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
