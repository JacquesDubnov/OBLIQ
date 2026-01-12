import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Types
export interface Contact {
  id: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  about: string | null;
  is_group: number;
  language: string;
  persona_prompt: string | null;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  member_id: string;
  is_admin: number;
  joined_at: string;
}

export interface Message {
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
  is_deleted: number;
}

export interface Chat {
  contact_id: string;
  last_message_id: string | null;
  unread_count: number;
  is_pinned: number;
  is_muted: number;
  is_archived: number;
  updated_at: string;
}

export interface ChatWithDetails extends Chat {
  contact: Contact;
  last_message: Message | null;
}

export interface DynamicView {
  id: string;
  name: string;
  criteria: string;
  ai_context: string | null;
  keywords: string | null;  // JSON array
  entities: string | null;  // JSON array
  is_live: number;
  created_at: string;
  updated_at: string;
}

export interface ViewMessage {
  id: string;
  view_id: string;
  original_message_id: string;
  source_chat_id: string;
  source_contact_name: string;
  source_chat_name: string | null;
  is_from_group: number;
  relevance_score: number | null;
  added_at: string;
}

export interface ViewMessageWithDetails extends ViewMessage {
  message: Message;
}

class DatabaseService {
  private db: Database.Database;
  private initialized = false;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/obliq-demo.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  initialize(): void {
    if (this.initialized) return;

    const schemaPath = join(__dirname, '../db/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
    this.initialized = true;
    console.log('Database initialized');
  }

  // ============ CONTACTS ============

  getContact(id: string): Contact | undefined {
    return this.db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as Contact | undefined;
  }

  getAllContacts(): Contact[] {
    return this.db.prepare('SELECT * FROM contacts ORDER BY name').all() as Contact[];
  }

  createContact(contact: Omit<Contact, 'created_at'>): Contact {
    const stmt = this.db.prepare(`
      INSERT INTO contacts (id, name, phone, avatar_url, about, is_group, language, persona_prompt)
      VALUES (@id, @name, @phone, @avatar_url, @about, @is_group, @language, @persona_prompt)
    `);
    stmt.run(contact);
    return this.getContact(contact.id)!;
  }

  updateContact(id: string, updates: Partial<Contact>): Contact | undefined {
    const fields = Object.keys(updates)
      .filter(k => k !== 'id' && k !== 'created_at')
      .map(k => `${k} = @${k}`)
      .join(', ');

    if (!fields) return this.getContact(id);

    const stmt = this.db.prepare(`UPDATE contacts SET ${fields} WHERE id = @id`);
    stmt.run({ ...updates, id });
    return this.getContact(id);
  }

  // ============ GROUP MEMBERS ============

  getGroupMembers(groupId: string): (GroupMember & { contact: Contact })[] {
    return this.db.prepare(`
      SELECT gm.*, c.*
      FROM group_members gm
      JOIN contacts c ON c.id = gm.member_id
      WHERE gm.group_id = ?
      ORDER BY gm.is_admin DESC, c.name
    `).all(groupId) as (GroupMember & { contact: Contact })[];
  }

  addGroupMember(groupId: string, memberId: string, isAdmin = false): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO group_members (group_id, member_id, is_admin)
      VALUES (?, ?, ?)
    `).run(groupId, memberId, isAdmin ? 1 : 0);
  }

  // ============ MESSAGES ============

  getMessage(id: string): Message | undefined {
    return this.db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as Message | undefined;
  }

  getMessages(chatId: string, limit = 50, before?: string): Message[] {
    if (before) {
      return this.db.prepare(`
        SELECT * FROM messages
        WHERE chat_id = ? AND timestamp < ? AND is_deleted = 0
        ORDER BY timestamp DESC
        LIMIT ?
      `).all(chatId, before, limit) as Message[];
    }

    return this.db.prepare(`
      SELECT * FROM messages
      WHERE chat_id = ? AND is_deleted = 0
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(chatId, limit) as Message[];
  }

  createMessage(message: Omit<Message, 'timestamp' | 'is_deleted'>): Message {
    const stmt = this.db.prepare(`
      INSERT INTO messages (id, chat_id, sender_id, content, message_type, media_url, media_caption, call_duration, call_type, status, reply_to)
      VALUES (@id, @chat_id, @sender_id, @content, @message_type, @media_url, @media_caption, @call_duration, @call_type, @status, @reply_to)
    `);
    stmt.run(message);

    // Update chat's last message and timestamp
    this.db.prepare(`
      UPDATE chats
      SET last_message_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE contact_id = ?
    `).run(message.id, message.chat_id);

    return this.getMessage(message.id)!;
  }

  updateMessageStatus(id: string, status: string): void {
    this.db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, id);
  }

  deleteMessage(id: string): void {
    this.db.prepare('UPDATE messages SET is_deleted = 1 WHERE id = ?').run(id);
  }

  // ============ CHATS ============

  getChat(contactId: string): ChatWithDetails | undefined {
    const chat = this.db.prepare('SELECT * FROM chats WHERE contact_id = ?').get(contactId) as Chat | undefined;
    if (!chat) return undefined;

    const contact = this.getContact(contactId);
    if (!contact) return undefined;

    const lastMessage = chat.last_message_id
      ? this.getMessage(chat.last_message_id)
      : undefined;

    return {
      ...chat,
      contact,
      last_message: lastMessage || null,
    };
  }

  getAllChats(): ChatWithDetails[] {
    const chats = this.db.prepare(`
      SELECT c.*, ct.*, m.*,
        c.contact_id as chat_contact_id,
        ct.id as contact_id,
        m.id as message_id
      FROM chats c
      JOIN contacts ct ON ct.id = c.contact_id
      LEFT JOIN messages m ON m.id = c.last_message_id
      WHERE c.is_archived = 0
      ORDER BY c.is_pinned DESC, c.updated_at DESC
    `).all() as any[];

    return chats.map(row => ({
      contact_id: row.chat_contact_id,
      last_message_id: row.last_message_id,
      unread_count: row.unread_count,
      is_pinned: row.is_pinned,
      is_muted: row.is_muted,
      is_archived: row.is_archived,
      updated_at: row.updated_at,
      contact: {
        id: row.contact_id,
        name: row.name,
        phone: row.phone,
        avatar_url: row.avatar_url,
        about: row.about,
        is_group: row.is_group,
        language: row.language,
        persona_prompt: row.persona_prompt,
        created_at: row.created_at,
      },
      last_message: row.message_id ? {
        id: row.message_id,
        chat_id: row.chat_id,
        sender_id: row.sender_id,
        content: row.content,
        message_type: row.message_type,
        media_url: row.media_url,
        media_caption: row.media_caption,
        call_duration: row.call_duration,
        call_type: row.call_type,
        status: row.status,
        reply_to: row.reply_to,
        timestamp: row.timestamp,
        is_deleted: row.is_deleted,
      } : null,
    }));
  }

  createChat(contactId: string, isPinned = false, isMuted = false): Chat {
    this.db.prepare(`
      INSERT OR IGNORE INTO chats (contact_id, is_pinned, is_muted)
      VALUES (?, ?, ?)
    `).run(contactId, isPinned ? 1 : 0, isMuted ? 1 : 0);

    return this.db.prepare('SELECT * FROM chats WHERE contact_id = ?').get(contactId) as Chat;
  }

  updateChat(contactId: string, updates: Partial<Chat>): void {
    const fields = Object.keys(updates)
      .filter(k => k !== 'contact_id')
      .map(k => `${k} = @${k}`)
      .join(', ');

    if (!fields) return;

    this.db.prepare(`UPDATE chats SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE contact_id = @contact_id`)
      .run({ ...updates, contact_id: contactId });
  }

  incrementUnreadCount(contactId: string): void {
    this.db.prepare('UPDATE chats SET unread_count = unread_count + 1 WHERE contact_id = ?').run(contactId);
  }

  clearUnreadCount(contactId: string): void {
    this.db.prepare('UPDATE chats SET unread_count = 0 WHERE contact_id = ?').run(contactId);
  }

  // ============ BATCH OPERATIONS ============

  batchInsertContacts(contacts: Omit<Contact, 'created_at'>[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO contacts (id, name, phone, avatar_url, about, is_group, language, persona_prompt)
      VALUES (@id, @name, @phone, @avatar_url, @about, @is_group, @language, @persona_prompt)
    `);

    const transaction = this.db.transaction((items: Omit<Contact, 'created_at'>[]) => {
      for (const item of items) {
        stmt.run(item);
      }
    });

    transaction(contacts);
  }

  batchInsertMessages(messages: Omit<Message, 'is_deleted'>[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO messages (id, chat_id, sender_id, content, message_type, media_url, media_caption, call_duration, call_type, status, reply_to, timestamp)
      VALUES (@id, @chat_id, @sender_id, @content, @message_type, @media_url, @media_caption, @call_duration, @call_type, @status, @reply_to, @timestamp)
    `);

    const transaction = this.db.transaction((items: Omit<Message, 'is_deleted'>[]) => {
      for (const item of items) {
        stmt.run(item);
      }
    });

    transaction(messages);
  }

  batchInsertChats(chats: Omit<Chat, 'updated_at'>[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO chats (contact_id, last_message_id, unread_count, is_pinned, is_muted, is_archived)
      VALUES (@contact_id, @last_message_id, @unread_count, @is_pinned, @is_muted, @is_archived)
    `);

    const transaction = this.db.transaction((items: Omit<Chat, 'updated_at'>[]) => {
      for (const item of items) {
        stmt.run(item);
      }
    });

    transaction(chats);
  }

  // ============ DYNAMIC VIEWS ============

  getDynamicView(id: string): DynamicView | undefined {
    return this.db.prepare('SELECT * FROM dynamic_views WHERE id = ?').get(id) as DynamicView | undefined;
  }

  getAllDynamicViews(): DynamicView[] {
    return this.db.prepare(`
      SELECT * FROM dynamic_views
      ORDER BY updated_at DESC
    `).all() as DynamicView[];
  }

  createDynamicView(view: Omit<DynamicView, 'created_at' | 'updated_at'>): DynamicView {
    const stmt = this.db.prepare(`
      INSERT INTO dynamic_views (id, name, criteria, ai_context, keywords, entities, is_live)
      VALUES (@id, @name, @criteria, @ai_context, @keywords, @entities, @is_live)
    `);
    stmt.run(view);
    return this.getDynamicView(view.id)!;
  }

  updateDynamicView(id: string, updates: Partial<DynamicView>): DynamicView | undefined {
    const fields = Object.keys(updates)
      .filter(k => k !== 'id' && k !== 'created_at')
      .map(k => `${k} = @${k}`)
      .join(', ');

    if (!fields) return this.getDynamicView(id);

    this.db.prepare(`UPDATE dynamic_views SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`)
      .run({ ...updates, id });
    return this.getDynamicView(id);
  }

  deleteDynamicView(id: string): void {
    // View messages will be deleted by CASCADE
    this.db.prepare('DELETE FROM dynamic_views WHERE id = ?').run(id);
  }

  deleteAllDynamicViews(): void {
    // View messages will be deleted by CASCADE
    this.db.prepare('DELETE FROM dynamic_views').run();
  }

  // ============ VIEW MESSAGES ============

  getViewMessages(viewId: string): ViewMessageWithDetails[] {
    const rows = this.db.prepare(`
      SELECT vm.*, m.*,
        vm.id as view_message_id,
        m.id as message_id
      FROM view_messages vm
      JOIN messages m ON m.id = vm.original_message_id
      WHERE vm.view_id = ?
      ORDER BY m.timestamp ASC
    `).all(viewId) as any[];

    return rows.map(row => ({
      id: row.view_message_id,
      view_id: row.view_id,
      original_message_id: row.original_message_id,
      source_chat_id: row.source_chat_id,
      source_contact_name: row.source_contact_name,
      source_chat_name: row.source_chat_name,
      is_from_group: row.is_from_group,
      relevance_score: row.relevance_score,
      added_at: row.added_at,
      message: {
        id: row.message_id,
        chat_id: row.chat_id,
        sender_id: row.sender_id,
        content: row.content,
        message_type: row.message_type,
        media_url: row.media_url,
        media_caption: row.media_caption,
        call_duration: row.call_duration,
        call_type: row.call_type,
        status: row.status,
        reply_to: row.reply_to,
        timestamp: row.timestamp,
        is_deleted: row.is_deleted,
      },
    }));
  }

  addViewMessage(viewMessage: Omit<ViewMessage, 'added_at'>): ViewMessage {
    const stmt = this.db.prepare(`
      INSERT INTO view_messages (id, view_id, original_message_id, source_chat_id, source_contact_name, source_chat_name, is_from_group, relevance_score)
      VALUES (@id, @view_id, @original_message_id, @source_chat_id, @source_contact_name, @source_chat_name, @is_from_group, @relevance_score)
    `);
    stmt.run(viewMessage);

    // Update the view's updated_at timestamp
    this.db.prepare('UPDATE dynamic_views SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(viewMessage.view_id);

    return this.db.prepare('SELECT * FROM view_messages WHERE id = ?').get(viewMessage.id) as ViewMessage;
  }

  batchAddViewMessages(viewMessages: Omit<ViewMessage, 'added_at'>[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO view_messages (id, view_id, original_message_id, source_chat_id, source_contact_name, source_chat_name, is_from_group, relevance_score)
      VALUES (@id, @view_id, @original_message_id, @source_chat_id, @source_contact_name, @source_chat_name, @is_from_group, @relevance_score)
    `);

    const transaction = this.db.transaction((items: Omit<ViewMessage, 'added_at'>[]) => {
      for (const item of items) {
        stmt.run(item);
      }
      // Update the view's updated_at timestamp (assume all messages belong to same view)
      if (items.length > 0) {
        this.db.prepare('UPDATE dynamic_views SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(items[0].view_id);
      }
    });

    transaction(viewMessages);
  }

  isMessageInView(viewId: string, messageId: string): boolean {
    const result = this.db.prepare(`
      SELECT 1 FROM view_messages WHERE view_id = ? AND original_message_id = ?
    `).get(viewId, messageId);
    return !!result;
  }

  getViewMessageCount(viewId: string): number {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM view_messages WHERE view_id = ?
    `).get(viewId) as { count: number };
    return result.count;
  }

  // Get all messages from all chats (for AI analysis)
  getAllMessagesWithContext(): (Message & { contact_name: string; chat_name: string; is_group: number })[] {
    return this.db.prepare(`
      SELECT m.*,
        CASE
          WHEN m.sender_id IS NULL THEN 'Me'
          ELSE COALESCE(sender.name, c.name)
        END as contact_name,
        c.name as chat_name,
        c.is_group
      FROM messages m
      JOIN contacts c ON c.id = m.chat_id
      LEFT JOIN contacts sender ON sender.id = m.sender_id
      WHERE m.is_deleted = 0
      ORDER BY m.timestamp ASC
    `).all() as (Message & { contact_name: string; chat_name: string; is_group: number })[];
  }

  // Get all live dynamic views (for checking new messages)
  getLiveDynamicViews(): DynamicView[] {
    return this.db.prepare(`
      SELECT * FROM dynamic_views WHERE is_live = 1
    `).all() as DynamicView[];
  }

  // ============ RESET FUNCTIONALITY ============

  saveInitialState(): void {
    // Clear existing initial state
    this.db.prepare('DELETE FROM initial_state').run();

    // Save current state of each table
    const contacts = this.db.prepare('SELECT * FROM contacts').all();
    const messages = this.db.prepare('SELECT * FROM messages').all();
    const chats = this.db.prepare('SELECT * FROM chats').all();
    const groupMembers = this.db.prepare('SELECT * FROM group_members').all();

    const insertState = this.db.prepare(`
      INSERT INTO initial_state (table_name, data_json)
      VALUES (?, ?)
    `);

    this.db.transaction(() => {
      insertState.run('contacts', JSON.stringify(contacts));
      insertState.run('messages', JSON.stringify(messages));
      insertState.run('chats', JSON.stringify(chats));
      insertState.run('group_members', JSON.stringify(groupMembers));
    })();

    console.log('Initial state saved');
  }

  resetToInitialState(): boolean {
    const states = this.db.prepare('SELECT * FROM initial_state').all() as { table_name: string; data_json: string }[];

    if (states.length === 0) {
      console.log('No initial state found');
      return false;
    }

    this.db.transaction(() => {
      // Clear current data (including dynamic views)
      this.db.prepare('DELETE FROM view_messages').run();
      this.db.prepare('DELETE FROM dynamic_views').run();
      this.db.prepare('DELETE FROM messages').run();
      this.db.prepare('DELETE FROM group_members').run();
      this.db.prepare('DELETE FROM chats').run();
      this.db.prepare('DELETE FROM contacts').run();

      // Restore from initial state
      for (const state of states) {
        const data = JSON.parse(state.data_json) as Record<string, unknown>[];

        if (data.length === 0) continue;

        const columns = Object.keys(data[0]);
        const placeholders = columns.map(c => `@${c}`).join(', ');
        const stmt = this.db.prepare(
          `INSERT INTO ${state.table_name} (${columns.join(', ')}) VALUES (${placeholders})`
        );

        for (const row of data) {
          stmt.run(row);
        }
      }
    })();

    console.log('Database reset to initial state');
    return true;
  }

  // ============ UTILITY ============

  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const db = new DatabaseService();
