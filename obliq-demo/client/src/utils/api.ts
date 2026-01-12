import axios from 'axios';
import type { ChatAPI, MessageAPI, ContactAPI, DynamicViewAPI, DynamicViewWithMessagesAPI } from '../types/chat';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chats
export async function fetchChats(): Promise<ChatAPI[]> {
  const response = await api.get<ChatAPI[]>('/chats');
  return response.data;
}

export async function fetchChat(chatId: string): Promise<ChatAPI> {
  const response = await api.get<ChatAPI>(`/chats/${chatId}`);
  return response.data;
}

export async function updateChat(
  chatId: string,
  updates: { is_pinned?: boolean; is_muted?: boolean; is_archived?: boolean; unread_count?: number }
): Promise<ChatAPI> {
  const response = await api.patch<ChatAPI>(`/chats/${chatId}`, updates);
  return response.data;
}

export async function markChatAsRead(chatId: string): Promise<void> {
  await api.post(`/chats/${chatId}/read`);
}

// Messages
export async function fetchMessages(
  chatId: string,
  limit = 50,
  before?: string
): Promise<MessageAPI[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.append('before', before);

  const response = await api.get<MessageAPI[]>(`/chats/${chatId}/messages?${params}`);
  return response.data;
}

export async function sendMessage(
  chatId: string,
  content: string,
  options?: {
    messageType?: string;
    mediaUrl?: string;
    mediaCaption?: string;
    replyTo?: string;
  }
): Promise<MessageAPI> {
  const response = await api.post<MessageAPI>(`/chats/${chatId}/messages`, {
    content,
    message_type: options?.messageType || 'text',
    media_url: options?.mediaUrl,
    media_caption: options?.mediaCaption,
    reply_to: options?.replyTo,
  });
  return response.data;
}

export async function updateMessageStatus(
  messageId: string,
  status: 'pending' | 'sent' | 'delivered' | 'read'
): Promise<MessageAPI> {
  const response = await api.patch<MessageAPI>(`/messages/${messageId}/status`, { status });
  return response.data;
}

export async function deleteMessage(messageId: string): Promise<void> {
  await api.delete(`/messages/${messageId}`);
}

// Contacts
export async function fetchContacts(): Promise<ContactAPI[]> {
  const response = await api.get<ContactAPI[]>('/contacts');
  return response.data;
}

export async function fetchContact(contactId: string): Promise<ContactAPI> {
  const response = await api.get<ContactAPI>(`/contacts/${contactId}`);
  return response.data;
}

// The API flattens contact columns directly (SELECT gm.*, c.*)
export interface GroupMemberAPI {
  // Group member fields
  group_id: string;
  member_id: string;
  is_admin: number;
  joined_at: string;
  // Flattened contact fields
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

export async function fetchGroupMembers(groupId: string): Promise<GroupMemberAPI[]> {
  const response = await api.get<GroupMemberAPI[]>(`/contacts/${groupId}/members`);
  return response.data;
}

// Reset
export async function resetDatabase(): Promise<{ success: boolean; message: string }> {
  const response = await api.post<{ success: boolean; message: string }>('/reset');
  return response.data;
}

// AI Response
export interface ResponderInfo {
  responderId: string;
  responderName: string;
}

export async function selectResponder(chatId: string): Promise<ResponderInfo> {
  const response = await api.get<ResponderInfo>(`/chats/${chatId}/select-responder`);
  return response.data;
}

export async function generateAIResponse(
  chatId: string,
  userMessage: string,
  senderId?: string
): Promise<MessageAPI> {
  const response = await api.post<MessageAPI>(`/chats/${chatId}/ai-response`, {
    userMessage,
    senderId,
  });
  return response.data;
}

// Call Entry
export async function createCallEntry(
  chatId: string,
  callType: 'voice' | 'video',
  duration: number
): Promise<MessageAPI> {
  const response = await api.post<MessageAPI>(`/chats/${chatId}/messages`, {
    content: null,
    message_type: 'call',
    call_type: callType,
    call_duration: duration,
  });
  return response.data;
}

// Translation
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<TranslationResult> {
  const response = await api.post<TranslationResult>('/translate', {
    text,
    targetLang,
    sourceLang,
  });
  return response.data;
}

export async function detectLanguage(text: string): Promise<string> {
  const response = await api.post<{ language: string }>('/translate/detect', { text });
  return response.data.language;
}

// ============ DYNAMIC VIEWS ============

export async function fetchViewStats(): Promise<{ totalMessages: number }> {
  const response = await api.get<{ totalMessages: number }>('/views/stats');
  return response.data;
}

export async function fetchDynamicViews(): Promise<DynamicViewAPI[]> {
  const response = await api.get<DynamicViewAPI[]>('/views');
  return response.data;
}

export async function fetchDynamicView(viewId: string): Promise<DynamicViewWithMessagesAPI> {
  const response = await api.get<DynamicViewWithMessagesAPI>(`/views/${viewId}`);
  return response.data;
}

export async function createDynamicView(criteria: string): Promise<DynamicViewAPI> {
  const response = await api.post<DynamicViewAPI>('/views', { criteria });
  return response.data;
}

export async function deleteDynamicView(viewId: string): Promise<void> {
  await api.delete(`/views/${viewId}`);
}

export async function deleteAllDynamicViews(): Promise<void> {
  await api.delete('/views');
}

export async function updateDynamicView(
  viewId: string,
  updates: { is_live?: boolean; name?: string }
): Promise<DynamicViewAPI> {
  const response = await api.patch<DynamicViewAPI>(`/views/${viewId}`, updates);
  return response.data;
}

export interface ViewMessageData {
  id: string;
  view_id: string;
  original_message_id: string;
  source_chat_id: string;
  source_contact_name: string;
  source_chat_name: string | null;
  is_from_group: number;
  relevance_score: number;
  added_at: string;
  message: MessageAPI;
}

export interface ViewCheckResult {
  checked: boolean;
  matchedViews: {
    viewId: string;
    viewName: string;
    score: number;
    viewMessage: ViewMessageData;
  }[];
}

export async function checkMessageAgainstViews(messageId: string): Promise<ViewCheckResult> {
  const response = await api.post<ViewCheckResult>('/views/check', { messageId });
  return response.data;
}

export default api;
