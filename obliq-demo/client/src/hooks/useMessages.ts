import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types/chat';

export function useMessages(chatId: string | null) {
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const isLoading = useChatStore((state) => state.isLoadingMessages);
  const fetchMessages = useChatStore((state) => state.fetchMessages);

  const messages: Message[] = chatId ? messagesByChat[chatId] || [] : [];

  // Fetch messages when chat changes
  useEffect(() => {
    if (chatId && !messagesByChat[chatId]) {
      fetchMessages(chatId);
    }
  }, [chatId, messagesByChat, fetchMessages]);

  return {
    messages,
    isLoading,
    refetch: () => chatId && fetchMessages(chatId),
  };
}
