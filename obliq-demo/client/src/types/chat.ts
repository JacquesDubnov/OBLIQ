// API response types (snake_case from backend)
export interface ContactAPI {
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

export interface MessageAPI {
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

export interface ChatAPI {
  contact_id: string;
  last_message_id: string | null;
  unread_count: number;
  is_pinned: number;
  is_muted: number;
  is_archived: number;
  updated_at: string;
  contact: ContactAPI;
  last_message: MessageAPI | null;
}

// Frontend types (camelCase)
export interface Contact {
  id: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  about?: string;
  isGroup: boolean;
  language: string;
  personaPrompt?: string;
  createdAt: string;
}

export interface GroupMember {
  groupId: string;
  memberId: string;
  isAdmin: boolean;
  member: Contact;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string | null; // null = "me"
  content: string;
  messageType: MessageType;
  mediaUrl?: string;
  mediaCaption?: string;
  callDuration?: number;
  callType?: 'voice' | 'video';
  status: MessageStatus;
  replyTo?: string;
  timestamp: string;
  isDeleted: boolean;
  // Translation fields
  translatedContent?: string;
  originalLanguage?: string;
  targetLanguage?: string;
  isTranslating?: boolean;
  // Second translation for tri-lingual mode
  secondTranslatedContent?: string;
  secondTargetLanguage?: string;
}

export type MessageType = 'text' | 'image' | 'voice' | 'video' | 'call' | 'system';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read';

export interface Chat {
  contactId: string;
  contact: Contact;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  updatedAt: string;
}

export interface ChatListItemData {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isGroup: boolean;
  isTyping?: boolean;
  isOnline?: boolean;
}

// Transformers
export function transformContact(api: ContactAPI): Contact {
  return {
    id: api.id,
    name: api.name,
    phone: api.phone || undefined,
    avatarUrl: api.avatar_url || undefined,
    about: api.about || undefined,
    isGroup: api.is_group === 1,
    language: api.language,
    personaPrompt: api.persona_prompt || undefined,
    createdAt: api.created_at,
  };
}

export function transformMessage(api: MessageAPI): Message {
  return {
    id: api.id,
    chatId: api.chat_id,
    senderId: api.sender_id,
    content: api.content || '',
    messageType: api.message_type as MessageType,
    mediaUrl: api.media_url || undefined,
    mediaCaption: api.media_caption || undefined,
    callDuration: api.call_duration || undefined,
    callType: api.call_type as 'voice' | 'video' | undefined,
    status: api.status as MessageStatus,
    replyTo: api.reply_to || undefined,
    timestamp: api.timestamp,
    isDeleted: api.is_deleted === 1,
  };
}

export function transformChat(api: ChatAPI): Chat {
  return {
    contactId: api.contact_id,
    contact: transformContact(api.contact),
    lastMessage: api.last_message ? transformMessage(api.last_message) : undefined,
    unreadCount: api.unread_count,
    isPinned: api.is_pinned === 1,
    isMuted: api.is_muted === 1,
    isArchived: api.is_archived === 1,
    updatedAt: api.updated_at,
  };
}

export function chatToListItem(
  chat: Chat,
  formatTime?: (timestamp: string) => string
): ChatListItemData {
  return {
    id: chat.contactId,
    name: chat.contact.name,
    avatarUrl: chat.contact.avatarUrl,
    lastMessage: chat.lastMessage?.content,
    lastMessageTime: chat.lastMessage?.timestamp
      ? formatTime
        ? formatTime(chat.lastMessage.timestamp)
        : chat.lastMessage.timestamp
      : undefined,
    unreadCount: chat.unreadCount,
    isPinned: chat.isPinned,
    isMuted: chat.isMuted,
    isGroup: chat.contact.isGroup,
  };
}

// ============ DYNAMIC VIEWS ============

// API response types (snake_case from backend)
export interface DynamicViewAPI {
  id: string;
  name: string;
  criteria: string;
  ai_context: string | null;
  keywords: string[];
  entities: string[];
  is_live: number;
  created_at: string;
  updated_at: string;
  messageCount: number;
}

export interface ViewMessageAPI {
  id: string;
  view_id: string;
  original_message_id: string;
  source_chat_id: string;
  source_contact_name: string;
  source_chat_name: string | null;
  is_from_group: number;
  relevance_score: number | null;
  added_at: string;
  message: MessageAPI;
}

export interface DynamicViewWithMessagesAPI extends DynamicViewAPI {
  messages: ViewMessageAPI[];
}

// Frontend types (camelCase)
export interface DynamicView {
  id: string;
  name: string;
  criteria: string;
  aiContext?: string;
  keywords: string[];
  entities: string[];
  isLive: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface CollectedMessage extends Message {
  viewMessageId: string;
  sourceChatId: string;
  sourceContactName: string;
  sourceChatName?: string;
  isFromGroup: boolean;
  relevanceScore?: number;
  addedAt: string;
}

export interface DynamicViewListItemData {
  id: string;
  name: string;
  criteria: string;
  messageCount: number;
  isLive: boolean;
  updatedAt: string;
}

// Transformers for dynamic views
export function transformDynamicView(api: DynamicViewAPI): DynamicView {
  return {
    id: api.id,
    name: api.name,
    criteria: api.criteria,
    aiContext: api.ai_context || undefined,
    keywords: api.keywords || [],
    entities: api.entities || [],
    isLive: api.is_live === 1,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
    messageCount: api.messageCount,
  };
}

// Shared interface for view message metadata
interface ViewMessageMetadata {
  id: string;
  source_chat_id: string;
  source_contact_name: string;
  source_chat_name: string | null;
  is_from_group: number;
  relevance_score: number | null;
  added_at: string;
}

// Helper to create CollectedMessage from view message metadata and message API
function createCollectedMessage(meta: ViewMessageMetadata, msg: MessageAPI): CollectedMessage {
  return {
    ...transformMessage(msg),
    viewMessageId: meta.id,
    sourceChatId: meta.source_chat_id,
    sourceContactName: meta.source_contact_name,
    sourceChatName: meta.source_chat_name || undefined,
    isFromGroup: meta.is_from_group === 1,
    relevanceScore: meta.relevance_score || undefined,
    addedAt: meta.added_at,
  };
}

export function transformViewMessage(api: ViewMessageAPI): CollectedMessage {
  return createCollectedMessage(api, api.message);
}

export function dynamicViewToListItem(view: DynamicView): DynamicViewListItemData {
  return {
    id: view.id,
    name: view.name,
    criteria: view.criteria,
    messageCount: view.messageCount,
    isLive: view.isLive,
    updatedAt: view.updatedAt,
  };
}

// Transform from the ViewMessageData returned by /api/views/check
export function transformViewMessageFromApi(data: ViewMessageMetadata & { message: MessageAPI }): CollectedMessage {
  return createCollectedMessage(data, data.message);
}
