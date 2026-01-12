import { useChatStore } from '../store/chatStore';
import type { Contact } from '../types/chat';

export function useContact(contactId: string | null): Contact | undefined {
  const chats = useChatStore((state) => state.chats);

  if (!contactId) return undefined;

  const chat = chats.find((c) => c.contactId === contactId);
  return chat?.contact;
}

export function useSelectedContact(): Contact | undefined {
  const selectedChatId = useChatStore((state) => state.selectedChatId);
  return useContact(selectedChatId);
}
