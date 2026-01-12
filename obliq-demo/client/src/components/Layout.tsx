import styled, { keyframes } from 'styled-components';
import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { NavigationBar } from './common/NavigationBar';
import { Sidebar } from './sidebar/Sidebar';
import { ChatWindow } from './chat/ChatWindow';
import { DynamicViewWindow } from './chat/DynamicViewWindow';
import { EmptyChat } from './chat/EmptyChat';
import { ProfileModal, CallModal, SettingsModal } from './modals';
import { CollectProgressModal } from './modals/CollectProgressModal';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { useDynamicViewStore } from '../store/dynamicViewStore';
import { useChats } from '../hooks/useChats';
import { useMessages } from '../hooks/useMessages';
import { useContact } from '../hooks/useContact';
import { useSendMessage } from '../hooks/useSendMessage';
import { useGroupMembers } from '../hooks/useGroupMembers';
import { layout } from '../styles/theme';
import { createCallEntry } from '../utils/api';
import { transformMessage, dynamicViewToListItem } from '../types/chat';
import type { DynamicViewListItemData } from '../types/chat';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.bg.app};
`;

const AppWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);

  @media (min-width: 1440px) {
    margin-top: 20px;
    margin-bottom: 20px;
    height: calc(100% - 40px);
    border-radius: 4px;
    overflow: hidden;
  }
`;

const SidebarWrapper = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  min-width: ${layout.sidebar.minWidth}px;
  max-width: ${layout.sidebar.maxWidth}px;
  flex-shrink: 0;
  position: relative;
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  z-index: 10;
  transition: background-color 0.15s ease;

  &:hover,
  &:active {
    background-color: ${({ theme }) => theme.accent.primary};
  }
`;

const ChatArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.secondary};
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

const Toast = styled.div<{ $type: 'success' | 'error' | 'info'; $isTranslation?: boolean }>`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.25s ease-out;

  ${({ $type, $isTranslation }) => {
    if ($isTranslation) {
      return `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border: 1px solid rgba(57, 255, 20, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(57, 255, 20, 0.15);
      `;
    }
    switch ($type) {
      case 'success':
        return 'background-color: #00a884;';
      case 'error':
        return 'background-color: #f15c6d;';
      default:
        return 'background-color: #54656f;';
    }
  }}
`;

const ToastIcon = styled.span`
  font-size: 18px;
  display: flex;
  align-items: center;
`;

export function Layout() {
  const selectedChatId = useChatStore((state) => state.selectedChatId);
  const selectChat = useChatStore((state) => state.selectChat);
  const typingChats = useChatStore((state) => state.typingChats);
  const getTypingName = useChatStore((state) => state.getTypingName);

  const sidebarWidth = useUIStore((state) => state.sidebarWidth);
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth);
  const toastMessage = useUIStore((state) => state.toastMessage);
  const toastType = useUIStore((state) => state.toastType);
  const isCalendarOpen = useUIStore((state) => state.isCalendarOpen);
  const calendarGroupId = useUIStore((state) => state.calendarGroupId);
  const calendarScheduledAfterMessageId = useUIStore((state) => state.calendarScheduledAfterMessageId);
  const scheduleCalendar = useUIStore((state) => state.scheduleCalendar);
  const isSettingsModalOpen = useUIStore((state) => state.isSettingsModalOpen);
  const openSettingsModal = useUIStore((state) => state.openSettingsModal);
  const closeSettingsModal = useUIStore((state) => state.closeSettingsModal);
  const isCollectModalOpen = useUIStore((state) => state.isCollectModalOpen);
  const collectCriteria = useUIStore((state) => state.collectCriteria);
  const closeCollectModal = useUIStore((state) => state.closeCollectModal);

  // Dynamic view store
  const views = useDynamicViewStore((state) => state.views);
  const selectedViewId = useDynamicViewStore((state) => state.selectedViewId);
  const selectView = useDynamicViewStore((state) => state.selectView);
  const clearViewSelection = useDynamicViewStore((state) => state.clearSelection);
  const fetchViews = useDynamicViewStore((state) => state.fetchViews);
  const deleteView = useDynamicViewStore((state) => state.deleteView);
  const messagesByView = useDynamicViewStore((state) => state.messagesByView);
  const showToast = useUIStore((state) => state.showToast);

  const addMessage = useChatStore((state) => state.addMessage);

  const { chats, isLoading: isLoadingChats } = useChats();
  const { messages } = useMessages(selectedChatId);
  const selectedContact = useContact(selectedChatId);
  const { sendMessage } = useSendMessage();
  const { members, memberCount } = useGroupMembers(selectedChatId, selectedContact?.isGroup);

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  const isResizing = useRef(false);

  // Fetch dynamic views on mount
  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  // Get selected view and its messages
  const selectedView = views.find(v => v.id === selectedViewId);
  const viewMessages = selectedViewId ? messagesByView[selectedViewId] || [] : [];

  // Convert dynamic views to list item format for sidebar
  const dynamicViewListItems: DynamicViewListItemData[] = views.map(dynamicViewToListItem);

  const handleMouseDown = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return;

      // Account for navigation bar width (68px)
      const newWidth = e.clientX - 68;
      if (newWidth >= layout.sidebar.minWidth && newWidth <= layout.sidebar.maxWidth) {
        setSidebarWidth(newWidth);
      }
    },
    [setSidebarWidth]
  );

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      // Clear view selection when selecting a chat
      clearViewSelection();
      selectChat(chatId);
    },
    [selectChat, clearViewSelection]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      if (selectedChatId) {
        sendMessage(selectedChatId, content);
      }
    },
    [selectedChatId, sendMessage]
  );

  const handleOpenProfile = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  const handleVoiceCall = useCallback(() => {
    setCallType('voice');
    setIsCallModalOpen(true);
  }, []);

  const handleVideoCall = useCallback(() => {
    setCallType('video');
    setIsCallModalOpen(true);
  }, []);

  const handleCloseCall = useCallback(() => {
    setIsCallModalOpen(false);
  }, []);

  const handleCallEnd = useCallback(
    async (duration: number) => {
      if (!selectedChatId) return;

      try {
        const messageApi = await createCallEntry(selectedChatId, callType, duration);
        const message = transformMessage(messageApi);
        addMessage(message);
      } catch (error) {
        console.error('Failed to create call entry:', error);
      }
    },
    [selectedChatId, callType, addMessage]
  );

  const isTyping = selectedChatId ? typingChats.has(selectedChatId) : false;
  const typingName = selectedChatId ? getTypingName(selectedChatId) : undefined;

  // Determine if the current chat involves a minor (Jake)
  // Jake's ID is 'jake-son' - we check both direct chat and group membership
  const MINOR_CONTACT_ID = 'jake-son';
  const hasMinorParticipant = useMemo(() => {
    if (!selectedChatId) return false;
    // Direct chat with Jake
    if (selectedChatId === MINOR_CONTACT_ID) return true;
    // Group chat - check if Jake is a member
    if (selectedContact?.isGroup && members) {
      return members.some(m => m.memberId === MINOR_CONTACT_ID);
    }
    return false;
  }, [selectedChatId, selectedContact?.isGroup, members]);

  // Handle calendar scheduling - lock it in place after the last message
  const handleCalendarSchedule = useCallback(() => {
    if (messages.length > 0) {
      const lastMessageId = messages[messages.length - 1].id;
      scheduleCalendar(lastMessageId);
    }
  }, [messages, scheduleCalendar]);

  // Handle navigation item click
  const handleNavItemClick = useCallback(
    (item: 'chats' | 'calls' | 'status' | 'channels' | 'communities' | 'starred' | 'metaAI' | 'settings') => {
      if (item === 'settings') {
        openSettingsModal();
      }
    },
    [openSettingsModal]
  );

  // Handle dynamic view selection
  const handleSelectView = useCallback(
    (viewId: string) => {
      // Clear chat selection when selecting a view
      selectChat(null);
      selectView(viewId);
    },
    [selectChat, selectView]
  );

  // Handle closing a dynamic view
  const handleCloseView = useCallback(() => {
    clearViewSelection();
  }, [clearViewSelection]);

  // Handle deleting a dynamic view
  const handleDeleteView = useCallback(async () => {
    if (selectedViewId) {
      const viewName = selectedView?.name || 'view';
      await deleteView(selectedViewId);
      showToast(`Deleted "${viewName}" collection`, 'info');
    }
  }, [selectedViewId, selectedView, deleteView, showToast]);

  return (
    <LayoutContainer>
      <AppWrapper>
        <NavigationBar activeItem="chats" onItemClick={handleNavItemClick} />
        <SidebarWrapper $width={sidebarWidth}>
          {isLoadingChats ? (
            <LoadingOverlay>Loading chats...</LoadingOverlay>
          ) : (
            <Sidebar
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              dynamicViews={dynamicViewListItems}
              selectedViewId={selectedViewId}
              onSelectView={handleSelectView}
            />
          )}
          <ResizeHandle onMouseDown={handleMouseDown} />
        </SidebarWrapper>
        <ChatArea>
          {selectedViewId && selectedView ? (
            <DynamicViewWindow
              view={selectedView}
              messages={viewMessages}
              onClose={handleCloseView}
              onDelete={handleDeleteView}
            />
          ) : selectedChatId && selectedContact ? (
            <ChatWindow
              chatId={selectedChatId}
              name={selectedContact.name}
              avatarUrl={selectedContact.avatarUrl}
              isGroup={selectedContact.isGroup}
              memberCount={selectedContact.isGroup ? memberCount : undefined}
              isTyping={isTyping}
              typingName={typingName}
              messages={messages}
              contactLanguage={selectedContact.language}
              onSendMessage={handleSendMessage}
              onProfileClick={handleOpenProfile}
              onVoiceCallClick={handleVoiceCall}
              onVideoCallClick={handleVideoCall}
              showCalendar={isCalendarOpen && calendarGroupId === selectedChatId}
              calendarMembers={members}
              calendarScheduledAfterMessageId={calendarScheduledAfterMessageId}
              onCalendarSchedule={handleCalendarSchedule}
              hasMinorParticipant={hasMinorParticipant}
            />
          ) : (
            <EmptyChat />
          )}
        </ChatArea>
      </AppWrapper>

      {/* Profile Modal */}
      {isProfileModalOpen && selectedContact && (
        <ProfileModal
          contact={selectedContact}
          messages={messages}
          members={selectedContact.isGroup ? members : undefined}
          onClose={handleCloseProfile}
          onVoiceCall={handleVoiceCall}
          onVideoCall={handleVideoCall}
        />
      )}

      {/* Call Modal */}
      {isCallModalOpen && selectedContact && (
        <CallModal
          contact={selectedContact}
          callType={callType}
          onClose={handleCloseCall}
          onCallEnd={handleCallEnd}
        />
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && <SettingsModal onClose={closeSettingsModal} />}

      {/* Collect Progress Modal */}
      {isCollectModalOpen && collectCriteria && (
        <CollectProgressModal
          criteria={collectCriteria}
          onClose={closeCollectModal}
        />
      )}

      {toastMessage && (
        <Toast
          $type={toastType}
          $isTranslation={toastMessage.toLowerCase().includes('translation')}
        >
          {toastMessage.toLowerCase().includes('translation') && (
            <ToastIcon>🌐</ToastIcon>
          )}
          {toastMessage}
        </Toast>
      )}
    </LayoutContainer>
  );
}
