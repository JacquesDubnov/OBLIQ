import { useEffect, useMemo } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { chatToListItem } from '../types/chat';
import { formatChatListTime } from '../utils/dateUtils';
import type { ChatListItemData } from '../types/chat';

export function useChats() {
  const chats = useChatStore((state) => state.chats);
  const isLoading = useChatStore((state) => state.isLoadingChats);
  const error = useChatStore((state) => state.error);
  const fetchChats = useChatStore((state) => state.fetchChats);
  const typingChats = useChatStore((state) => state.typingChats);

  const searchQuery = useUIStore((state) => state.searchQuery);
  const activeFilter = useUIStore((state) => state.activeFilter);

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Transform, sort, and filter chats
  const chatListItems: ChatListItemData[] = useMemo(() => {
    // Sort chats: pinned first, then by last message timestamp (newest first)
    const sortedChats = [...chats].sort((a, b) => {
      // Pinned chats always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then sort by time
      const timeA = a.lastMessage?.timestamp || a.updatedAt;
      const timeB = b.lastMessage?.timestamp || b.updatedAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return sortedChats
      .map((chat) => ({
        ...chatToListItem(chat, formatChatListTime),
        isTyping: typingChats.has(chat.contactId),
      }))
      .filter((chat) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (!chat.name.toLowerCase().includes(query)) {
            return false;
          }
        }

        // Tab filter
        switch (activeFilter) {
          case 'unread':
            return chat.unreadCount > 0;
          case 'groups':
            return chat.isGroup;
          default:
            return true;
        }
      });
  }, [chats, typingChats, searchQuery, activeFilter]);

  return {
    chats: chatListItems,
    isLoading,
    error,
    refetch: fetchChats,
  };
}
