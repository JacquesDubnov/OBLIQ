import styled from 'styled-components';
import { ChatListItem } from './ChatListItem';
import { DynamicViewListItem } from './DynamicViewListItem';
import type { ChatListItemData, DynamicViewListItemData } from '../../types/chat';

interface ChatListProps {
  chats: ChatListItemData[];
  selectedChatId: string | null;
  searchQuery?: string;
  onSelectChat: (chatId: string) => void;
  dynamicViews?: DynamicViewListItemData[];
  selectedViewId?: string | null;
  onSelectView?: (viewId: string) => void;
}

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  padding: 20px;
  text-align: center;
`;

// Combined list item type for sorting
type ListItem =
  | { type: 'chat'; data: ChatListItemData; updatedAt: string }
  | { type: 'view'; data: DynamicViewListItemData; updatedAt: string };

export function ChatList({
  chats,
  selectedChatId,
  searchQuery,
  onSelectChat,
  dynamicViews = [],
  selectedViewId,
  onSelectView,
}: ChatListProps) {
  // Combine chats and views into a single sorted list
  const combinedItems: ListItem[] = [
    ...chats.map((chat) => ({
      type: 'chat' as const,
      data: chat,
      updatedAt: chat.lastMessageTime || '',
    })),
    ...dynamicViews.map((view) => ({
      type: 'view' as const,
      data: view,
      updatedAt: view.updatedAt,
    })),
  ];

  // Sort by updatedAt (most recent first)
  combinedItems.sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return dateB - dateA;
  });

  // Filter by search query if present
  const filteredItems = searchQuery
    ? combinedItems.filter((item) =>
        item.data.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : combinedItems;

  if (filteredItems.length === 0) {
    return (
      <ListContainer>
        <EmptyState>{searchQuery ? 'No chats found' : 'No chats yet'}</EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      {filteredItems.map((item) =>
        item.type === 'chat' ? (
          <ChatListItem
            key={`chat-${item.data.id}`}
            chat={item.data}
            isSelected={item.data.id === selectedChatId && !selectedViewId}
            searchQuery={searchQuery}
            onClick={() => onSelectChat(item.data.id)}
          />
        ) : (
          <DynamicViewListItem
            key={`view-${item.data.id}`}
            view={item.data}
            isSelected={item.data.id === selectedViewId}
            onClick={() => onSelectView?.(item.data.id)}
          />
        )
      )}
    </ListContainer>
  );
}
