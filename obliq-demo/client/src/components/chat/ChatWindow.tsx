import styled from 'styled-components';
import { useState, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ProfanityWarningDrawer } from './ProfanityWarningDrawer';
import type { Message, GroupMember } from '../../types/chat';

interface ChatWindowProps {
  chatId: string;
  name: string;
  avatarUrl?: string;
  status?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  typingName?: string;
  isGroup?: boolean;
  memberCount?: number;
  messages: Message[];
  contactLanguage?: string;
  onSendMessage: (content: string) => void;
  onLoadMoreMessages?: () => Promise<boolean>;
  hasMoreMessages?: boolean;
  onProfileClick?: () => void;
  onVoiceCallClick?: () => void;
  onVideoCallClick?: () => void;
  // Calendar props
  showCalendar?: boolean;
  calendarMembers?: GroupMember[];
  calendarScheduledAfterMessageId?: string | null;
  onCalendarSchedule?: () => void;
  // Profanity moderation props
  hasMinorParticipant?: boolean;
}

const WindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.conversation};
  position: relative;
`;

const ChatContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;
`;

export function ChatWindow({
  chatId,
  name,
  avatarUrl,
  status,
  isOnline,
  isTyping,
  typingName,
  isGroup = false,
  memberCount,
  messages,
  contactLanguage,
  onSendMessage,
  onLoadMoreMessages,
  hasMoreMessages = false,
  onProfileClick,
  onVoiceCallClick,
  onVideoCallClick,
  showCalendar = false,
  calendarMembers = [],
  calendarScheduledAfterMessageId,
  onCalendarSchedule,
  hasMinorParticipant = false,
}: ChatWindowProps) {
  const [showProfanityWarning, setShowProfanityWarning] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  const handleProfanityDetected = useCallback((hasProfanity: boolean) => {
    // Show warning only once when profanity is first detected
    if (hasProfanity && !hasShownWarning) {
      setShowProfanityWarning(true);
      setHasShownWarning(true);
    }
    // If no profanity (user deleted the word), auto-close the warning drawer
    if (!hasProfanity) {
      setShowProfanityWarning(false);
      setHasShownWarning(false);
    }
  }, [hasShownWarning]);

  const handleDismissWarning = useCallback(() => {
    setShowProfanityWarning(false);
  }, []);

  return (
    <WindowContainer>
      <ChatHeader
        chatId={chatId}
        name={name}
        avatarUrl={avatarUrl}
        status={status}
        isOnline={isOnline}
        isTyping={isTyping}
        typingName={typingName}
        isGroup={isGroup}
        memberCount={memberCount}
        onProfileClick={onProfileClick}
        onVoiceCallClick={onVoiceCallClick}
        onVideoCallClick={onVideoCallClick}
      />
      <ChatContent>
        <ProfanityWarningDrawer
          visible={showProfanityWarning}
          onDismiss={handleDismissWarning}
        />
        <MessageList
          messages={messages}
          chatId={chatId}
          isGroup={isGroup}
          isTyping={isTyping}
          typingName={typingName}
          onLoadMore={onLoadMoreMessages}
          hasMoreMessages={hasMoreMessages}
          showCalendar={showCalendar}
          calendarGroupName={name}
          calendarMembers={calendarMembers}
          calendarScheduledAfterMessageId={calendarScheduledAfterMessageId}
          onCalendarSchedule={onCalendarSchedule}
        />
      </ChatContent>
      <MessageInput
        chatId={chatId}
        contactLanguage={contactLanguage}
        isGroup={isGroup}
        onSendMessage={onSendMessage}
        hasMinorParticipant={hasMinorParticipant}
        onProfanityDetected={handleProfanityDetected}
      />
    </WindowContainer>
  );
}
