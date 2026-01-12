import { create } from 'zustand';
import type { Chat, Message } from '../types/chat';
import { transformChat, transformMessage } from '../types/chat';
import * as api from '../utils/api';

interface TypingInfo {
  chatId: string;
  responderId?: string;
  responderName?: string;
}

interface TranslationInfo {
  enabled: boolean;
  targetLanguage: string;
  sourceLanguage: string;
  // Tri-lingual mode for group chats
  isTriLingual?: boolean;
  triLingualLanguages?: string[]; // e.g., ['en', 'ja', 'fr']
}

interface ChatState {
  // Data
  chats: Chat[];
  messagesByChat: Record<string, Message[]>;
  selectedChatId: string | null;
  typingChats: Set<string>;
  typingInfo: Record<string, TypingInfo>; // chatId -> typing info

  // Translation state
  translationByChat: Record<string, TranslationInfo>; // chatId -> translation info
  activeTranslationChatId: string | null; // Currently active chat with translation

  // Loading states
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  selectChat: (chatId: string | null) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<Message | null>;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  markChatAsRead: (chatId: string) => Promise<void>;
  setTyping: (chatId: string, isTyping: boolean, responderName?: string) => void;
  getTypingName: (chatId: string) => string | undefined;
  resetStore: () => Promise<void>;
  clearError: () => void;

  // Translation actions
  enableTranslation: (chatId: string, targetLanguage: string, sourceLanguage?: string) => void;
  enableTriLingualTranslation: (chatId: string, languages: string[]) => void;
  disableTranslation: (chatId: string) => void;
  isTranslationEnabled: (chatId: string) => boolean;
  getTranslationInfo: (chatId: string) => TranslationInfo | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  chats: [],
  messagesByChat: {},
  selectedChatId: null,
  typingChats: new Set(),
  typingInfo: {},
  translationByChat: {},
  activeTranslationChatId: null,
  isLoadingChats: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,

  // Fetch all chats
  fetchChats: async () => {
    set({ isLoadingChats: true, error: null });
    try {
      const chatsApi = await api.fetchChats();
      const chats = chatsApi.map(transformChat);
      set({ chats, isLoadingChats: false });
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      set({ error: 'Failed to load chats', isLoadingChats: false });
    }
  },

  // Fetch messages for a chat
  fetchMessages: async (chatId: string) => {
    const { messagesByChat } = get();

    // Skip if already loaded
    if (messagesByChat[chatId]?.length > 0) return;

    set({ isLoadingMessages: true, error: null });
    try {
      const messagesApi = await api.fetchMessages(chatId);
      const messages = messagesApi.map(transformMessage);
      set({
        messagesByChat: { ...get().messagesByChat, [chatId]: messages },
        isLoadingMessages: false,
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ error: 'Failed to load messages', isLoadingMessages: false });
    }
  },

  // Select a chat and load its messages
  selectChat: async (chatId: string | null) => {
    const { activeTranslationChatId, translationByChat } = get();

    // Auto-disable translation when leaving a chat with active translation
    if (activeTranslationChatId && activeTranslationChatId !== chatId) {
      const newTranslationByChat = { ...translationByChat };
      delete newTranslationByChat[activeTranslationChatId];
      set({
        selectedChatId: chatId,
        translationByChat: newTranslationByChat,
        activeTranslationChatId: null,
      });
    } else {
      set({ selectedChatId: chatId });
    }

    if (chatId) {
      // Fetch messages if not already loaded
      await get().fetchMessages(chatId);

      // Mark as read
      await get().markChatAsRead(chatId);
    }
  },

  // Send a message
  sendMessage: async (chatId: string, content: string) => {
    if (!content.trim()) return null;

    set({ isSendingMessage: true });
    try {
      const messageApi = await api.sendMessage(chatId, content);
      const message = transformMessage(messageApi);

      // Add to messages
      get().addMessage(message);

      // Update chat's last message
      set({
        chats: get().chats.map((chat) =>
          chat.contactId === chatId
            ? { ...chat, lastMessage: message, updatedAt: message.timestamp }
            : chat
        ),
        isSendingMessage: false,
      });

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ error: 'Failed to send message', isSendingMessage: false });
      return null;
    }
  },

  // Add a message to the store (used for both sent and received)
  addMessage: (message: Message) => {
    const { messagesByChat } = get();
    const chatMessages = messagesByChat[message.chatId] || [];

    set({
      messagesByChat: {
        ...messagesByChat,
        [message.chatId]: [...chatMessages, message],
      },
    });
  },

  // Update a message (e.g., status change)
  updateMessage: (messageId: string, updates: Partial<Message>) => {
    const { messagesByChat } = get();
    const updatedMessagesByChat: Record<string, Message[]> = {};

    for (const [chatId, messages] of Object.entries(messagesByChat)) {
      updatedMessagesByChat[chatId] = messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
    }

    set({ messagesByChat: updatedMessagesByChat });
  },

  // Mark chat as read
  markChatAsRead: async (chatId: string) => {
    try {
      await api.markChatAsRead(chatId);
      set({
        chats: get().chats.map((chat) =>
          chat.contactId === chatId ? { ...chat, unreadCount: 0 } : chat
        ),
      });
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
    }
  },

  // Set typing indicator for a chat with optional responder name
  setTyping: (chatId: string, isTyping: boolean, responderName?: string) => {
    const { typingChats, typingInfo } = get();
    const newTypingChats = new Set(typingChats);
    const newTypingInfo = { ...typingInfo };

    if (isTyping) {
      newTypingChats.add(chatId);
      newTypingInfo[chatId] = {
        chatId,
        responderName,
      };
    } else {
      newTypingChats.delete(chatId);
      delete newTypingInfo[chatId];
    }

    set({ typingChats: newTypingChats, typingInfo: newTypingInfo });
  },

  // Get the typing name for a chat
  getTypingName: (chatId: string) => {
    const { typingInfo } = get();
    return typingInfo[chatId]?.responderName;
  },

  // Reset the database and store
  resetStore: async () => {
    try {
      await api.resetDatabase();
      set({
        chats: [],
        messagesByChat: {},
        selectedChatId: null,
        typingChats: new Set(),
        typingInfo: {},
        translationByChat: {},
        activeTranslationChatId: null,
        error: null,
      });
      // Reload chats
      await get().fetchChats();
    } catch (error) {
      console.error('Failed to reset database:', error);
      set({ error: 'Failed to reset database' });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Enable translation for a chat
  enableTranslation: (chatId: string, targetLanguage: string, sourceLanguage: string = 'en') => {
    const { translationByChat } = get();
    set({
      translationByChat: {
        ...translationByChat,
        [chatId]: {
          enabled: true,
          targetLanguage,
          sourceLanguage,
        },
      },
      activeTranslationChatId: chatId,
    });
  },

  // Enable tri-lingual translation for group chats
  enableTriLingualTranslation: (chatId: string, languages: string[]) => {
    const { translationByChat } = get();
    set({
      translationByChat: {
        ...translationByChat,
        [chatId]: {
          enabled: true,
          targetLanguage: languages[1] || 'ja', // First non-English target
          sourceLanguage: languages[0] || 'en',
          isTriLingual: true,
          triLingualLanguages: languages,
        },
      },
      activeTranslationChatId: chatId,
    });
  },

  // Disable translation for a chat
  disableTranslation: (chatId: string) => {
    const { translationByChat, activeTranslationChatId } = get();
    const newTranslationByChat = { ...translationByChat };
    delete newTranslationByChat[chatId];
    set({
      translationByChat: newTranslationByChat,
      activeTranslationChatId: activeTranslationChatId === chatId ? null : activeTranslationChatId,
    });
  },

  // Check if translation is enabled for a chat
  isTranslationEnabled: (chatId: string) => {
    const { translationByChat } = get();
    return translationByChat[chatId]?.enabled || false;
  },

  // Get translation info for a chat
  getTranslationInfo: (chatId: string) => {
    const { translationByChat } = get();
    return translationByChat[chatId];
  },
}));

// Selectors
export const selectChats = (state: ChatState) => state.chats;
export const selectSelectedChat = (state: ChatState) =>
  state.chats.find((c) => c.contactId === state.selectedChatId);
export const selectMessages = (chatId: string) => (state: ChatState) =>
  state.messagesByChat[chatId] || [];
export const selectIsTyping = (chatId: string) => (state: ChatState) =>
  state.typingChats.has(chatId);
export const selectTranslationEnabled = (chatId: string) => (state: ChatState) =>
  state.translationByChat[chatId]?.enabled || false;
export const selectTranslationInfo = (chatId: string) => (state: ChatState) =>
  state.translationByChat[chatId];
export const selectActiveTranslationChatId = (state: ChatState) =>
  state.activeTranslationChatId;
