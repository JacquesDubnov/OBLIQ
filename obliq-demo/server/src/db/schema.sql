-- OBLIQ Demo Database Schema
-- SQLite database for WhatsApp Web clone simulator

-- Contacts table (individual contacts and group metadata)
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    about TEXT,
    is_group INTEGER DEFAULT 0,
    language TEXT DEFAULT 'en',
    persona_prompt TEXT,  -- AI system prompt to maintain character
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Group members (for group chats)
CREATE TABLE IF NOT EXISTS group_members (
    group_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    is_admin INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, member_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    sender_id TEXT,  -- NULL = "me" (the user), otherwise contact id
    content TEXT,
    message_type TEXT DEFAULT 'text',  -- text, image, voice, video, call, system
    media_url TEXT,
    media_caption TEXT,
    call_duration INTEGER,  -- For call messages (in seconds)
    call_type TEXT,  -- voice, video
    status TEXT DEFAULT 'sent',  -- pending, sent, delivered, read
    reply_to TEXT REFERENCES messages(id),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted INTEGER DEFAULT 0
);

-- Chat metadata (tracks state for each conversation)
CREATE TABLE IF NOT EXISTS chats (
    contact_id TEXT PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,
    last_message_id TEXT REFERENCES messages(id),
    unread_count INTEGER DEFAULT 0,
    is_pinned INTEGER DEFAULT 0,
    is_muted INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial state backup (for reset functionality)
CREATE TABLE IF NOT EXISTS initial_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    data_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic views (AI-curated message collections)
CREATE TABLE IF NOT EXISTS dynamic_views (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,                   -- AI-generated name, e.g., "House Sale"
    criteria TEXT NOT NULL,               -- Original user query
    ai_context TEXT,                      -- AI-generated context/reasoning
    keywords TEXT,                        -- JSON array of AI-extracted keywords
    entities TEXT,                        -- JSON array of people/topics
    is_live INTEGER DEFAULT 1,            -- Whether to auto-update with new messages
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Collected messages for dynamic views (references to original messages)
CREATE TABLE IF NOT EXISTS view_messages (
    id TEXT PRIMARY KEY,
    view_id TEXT NOT NULL REFERENCES dynamic_views(id) ON DELETE CASCADE,
    original_message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    source_chat_id TEXT NOT NULL,
    source_contact_name TEXT NOT NULL,    -- Display name for the source
    source_chat_name TEXT,                -- For group messages, the group name
    is_from_group INTEGER DEFAULT 0,
    relevance_score REAL,                 -- AI confidence 0-1
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_chat_timestamp ON messages(chat_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_chats_updated ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_views_updated ON dynamic_views(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_view_messages_view ON view_messages(view_id);
CREATE INDEX IF NOT EXISTS idx_view_messages_original ON view_messages(original_message_id);
