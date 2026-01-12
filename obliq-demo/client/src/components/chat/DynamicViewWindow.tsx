import styled from 'styled-components';
import { useEffect, useRef } from 'react';
import { DynamicViewHeader } from './DynamicViewHeader';
import { CollectedMessageBubble } from './CollectedMessageBubble';
import { MessageInput } from './MessageInput';
import { useDynamicViewStore } from '../../store/dynamicViewStore';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import type { DynamicView, CollectedMessage } from '../../types/chat';

interface DynamicViewWindowProps {
  view: DynamicView;
  messages: CollectedMessage[];
  onClose: () => void;
  onDelete?: () => void;
}

const WindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.conversation};
`;

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 60px;
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  text-align: center;
  gap: 8px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
  margin-bottom: 8px;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
`;


export function DynamicViewWindow({
  view,
  messages,
  onClose,
  onDelete,
}: DynamicViewWindowProps) {
  const isLoadingMessages = useDynamicViewStore((state) => state.isLoadingMessages);
  const selectChat = useChatStore((state) => state.selectChat);
  const clearSelection = useDynamicViewStore((state) => state.clearSelection);
  const showToast = useUIStore((state) => state.showToast);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSourceClick = (chatId: string) => {
    // Navigate to the source chat
    clearSelection();
    selectChat(chatId);
    showToast('Navigated to original chat', 'info');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <WindowContainer>
      <DynamicViewHeader
        view={view}
        onClose={onClose}
        onDelete={handleDelete}
      />

      <MessageListContainer>
        {isLoadingMessages ? (
          <LoadingState>Loading messages...</LoadingState>
        ) : messages.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <div>No messages found</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              Messages matching "{view.criteria}" will appear here
            </div>
          </EmptyState>
        ) : (
          <>
            {messages.map((message) => (
              <CollectedMessageBubble
                key={message.viewMessageId}
                message={message}
                onSourceClick={handleSourceClick}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </MessageListContainer>

      <MessageInput
        chatId={`__view__${view.id}`}
        onSendMessage={() => {
          // Messages can't be sent directly in view mode
          // But slash commands work
        }}
      />
    </WindowContainer>
  );
}
