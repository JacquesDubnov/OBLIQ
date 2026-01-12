import styled from 'styled-components';
import { SidebarHeader } from './SidebarHeader';
import { SearchBar } from '../common/SearchBar';
import { ChatList } from './ChatList';
import { useUIStore } from '../../store/uiStore';
import type { ChatListItemData, DynamicViewListItemData } from '../../types/chat';

interface SidebarProps {
  chats: ChatListItemData[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  dynamicViews?: DynamicViewListItemData[];
  selectedViewId?: string | null;
  onSelectView?: (viewId: string) => void;
}

const SidebarContainer = styled.aside`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.primary};
  border-right: 1px solid ${({ theme }) => theme.border.primary};
`;

const FilterTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.filterTabs.bg};
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  height: 32px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 400;
  background-color: ${({ theme, $active }) =>
    $active ? theme.filterTabs.tabBgActive : theme.filterTabs.tabBg};
  color: ${({ theme, $active }) =>
    $active ? theme.filterTabs.tabTextActive : theme.filterTabs.tabText};
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.filterTabs.tabBgActive : theme.hover.light};
  }
`;

export function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  dynamicViews = [],
  selectedViewId,
  onSelectView,
}: SidebarProps) {
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const activeFilter = useUIStore((state) => state.activeFilter);
  const setActiveFilter = useUIStore((state) => state.setActiveFilter);

  return (
    <SidebarContainer>
      <SidebarHeader
        onNewGroupClick={() => {}}
        onNewChatClick={() => {}}
        onMenuClick={() => {}}
      />
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search"
      />
      <FilterTabs>
        <FilterTab
          $active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        >
          All
        </FilterTab>
        <FilterTab
          $active={activeFilter === 'unread'}
          onClick={() => setActiveFilter('unread')}
        >
          Unread
        </FilterTab>
        <FilterTab
          $active={activeFilter === 'favorites'}
          onClick={() => setActiveFilter('favorites')}
        >
          Favorites
        </FilterTab>
        <FilterTab
          $active={activeFilter === 'groups'}
          onClick={() => setActiveFilter('groups')}
        >
          Groups
        </FilterTab>
      </FilterTabs>
      <ChatList
        chats={chats}
        selectedChatId={selectedChatId}
        searchQuery={searchQuery}
        onSelectChat={onSelectChat}
        dynamicViews={dynamicViews}
        selectedViewId={selectedViewId}
        onSelectView={onSelectView}
      />
    </SidebarContainer>
  );
}
