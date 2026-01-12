import styled, { css, keyframes } from 'styled-components';
import { Check, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { layout } from '../../styles/theme';
import { formatCollectedMessageTime } from '../../utils/dateUtils';
import { MediaMessage } from './MediaMessage';
import { VoiceMessage } from './VoiceMessage';
import type { CollectedMessage } from '../../types/chat';

// WhatsApp-style color palette for sender names
const SENDER_COLORS = [
  '#00a884', // teal (default accent)
  '#ff7f50', // coral
  '#6a5acd', // slate blue
  '#e91e63', // pink
  '#2196f3', // blue
  '#ff9800', // orange
  '#9c27b0', // purple
  '#4caf50', // green
  '#795548', // brown
  '#607d8b', // blue grey
  '#f44336', // red
  '#3f51b5', // indigo
];

// Hash function to get consistent color for a sender
function getSenderColor(senderId: string): string {
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    const char = senderId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
}

interface CollectedMessageBubbleProps {
  message: CollectedMessage;
  isNew?: boolean;
  onSourceClick?: (chatId: string) => void;
}

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const BubbleWrapper = styled.div<{ $isNew?: boolean; $isOutgoing: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isOutgoing }) => ($isOutgoing ? 'flex-end' : 'flex-start')};
  margin: 12px 0;
  ${({ $isNew }) =>
    $isNew &&
    css`
      animation: ${slideIn} 0.2s ease-out;
    `}
`;

const SourceTag = styled.button<{ $isOutgoing: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  margin-bottom: 4px;
  border-radius: ${({ $isOutgoing }) =>
    $isOutgoing ? '10px 10px 10px 2px' : '10px 10px 2px 10px'};
  background-color: ${({ theme }) => theme.accent.primary}15;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.accent.primary};
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.accent.primary}25;
  }

  svg {
    width: 12px;
    height: 12px;
    opacity: 0.7;
  }
`;

const BubbleContainer = styled.div<{ $hasMedia: boolean; $isOutgoing: boolean }>`
  position: relative;
  max-width: ${layout.message.maxWidth};
  min-width: ${layout.message.minWidth}px;
  padding: ${({ $hasMedia }) => ($hasMedia ? '20px' : layout.message.padding)};
  border-radius: ${({ $isOutgoing }) =>
    $isOutgoing
      ? `${layout.message.borderRadius}px 0 ${layout.message.borderRadius}px ${layout.message.borderRadius}px`
      : `0 ${layout.message.borderRadius}px ${layout.message.borderRadius}px ${layout.message.borderRadius}px`};
  background-color: ${({ theme, $isOutgoing }) =>
    $isOutgoing ? theme.bubble.outgoing : theme.bubble.incoming};
  border-left: ${({ $isOutgoing, theme }) =>
    $isOutgoing ? 'none' : `3px solid ${theme.accent.primary}40`};
  border-right: ${({ $isOutgoing, theme }) =>
    $isOutgoing ? `3px solid ${theme.accent.primary}40` : 'none'};
`;

const SenderName = styled.span<{ $color?: string }>`
  display: block;
  font-size: 12.8px;
  font-weight: 500;
  color: ${({ $color, theme }) => $color || theme.accent.primary};
  margin-bottom: 4px;
`;

const MessageContent = styled.div<{ $hasMedia: boolean; $isOutgoing: boolean }>`
  font-size: 14.2px;
  line-height: 1.4;
  color: ${({ theme, $isOutgoing }) =>
    $isOutgoing ? theme.bubble.outgoingText : theme.bubble.incomingText};
  word-wrap: break-word;
  white-space: pre-wrap;
  padding: ${({ $hasMedia }) => ($hasMedia ? '6px' : '0')};
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
`;

const Timestamp = styled.span<{ $isOutgoing: boolean }>`
  font-size: 11px;
  color: ${({ theme, $isOutgoing }) =>
    $isOutgoing ? theme.bubble.outgoingMeta : theme.text.tertiary};
`;

const StatusIcon = styled.span<{ $status: string }>`
  display: flex;
  align-items: center;

  svg {
    width: 15px;
    height: 15px;
    color: ${({ theme, $status }) =>
      $status === 'read'
        ? theme.messageStatus.read
        : theme.text.tertiary};
  }
`;

const GroupSourceInfo = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text.tertiary};
  margin-left: 4px;
`;

export function CollectedMessageBubble({
  message,
  isNew,
  onSourceClick,
}: CollectedMessageBubbleProps) {
  const isOutgoing = message.senderId === null;
  const hasMedia = message.messageType === 'image' || message.messageType === 'video';
  const hasVoice = message.messageType === 'voice';

  // Get color based on source contact
  const senderColor = getSenderColor(message.sourceContactName);

  const renderStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return <Clock />;
      case 'sent':
        return <Check />;
      case 'delivered':
        return <CheckCheck />;
      case 'read':
        return <CheckCheck />;
      default:
        return null;
    }
  };

  const handleSourceClick = () => {
    if (onSourceClick) {
      onSourceClick(message.sourceChatId);
    }
  };

  // Format source display
  const sourceDisplay = message.isFromGroup && message.sourceChatName
    ? `${message.sourceChatName}`
    : message.sourceContactName;

  return (
    <BubbleWrapper $isNew={isNew} $isOutgoing={isOutgoing}>
      <SourceTag onClick={handleSourceClick} title="Go to original chat" $isOutgoing={isOutgoing}>
        {isOutgoing ? 'You' : sourceDisplay}
        {isOutgoing && message.isFromGroup && message.sourceChatName && (
          <span style={{ opacity: 0.7 }}> → {message.sourceChatName}</span>
        )}
        {!isOutgoing && <ExternalLink />}
      </SourceTag>
      <BubbleContainer $hasMedia={hasMedia || hasVoice} $isOutgoing={isOutgoing}>
        {!isOutgoing && (
          <SenderName $color={senderColor}>
            {message.sourceContactName}
            {message.isFromGroup && message.sourceChatName && (
              <GroupSourceInfo>in {message.sourceChatName}</GroupSourceInfo>
            )}
          </SenderName>
        )}

        {hasMedia && message.mediaUrl && (
          <MediaMessage
            type={message.messageType as 'image' | 'video'}
            mediaUrl={message.mediaUrl}
            caption={message.mediaCaption}
            isOutgoing={isOutgoing}
          />
        )}

        {hasVoice && message.mediaUrl && (
          <VoiceMessage mediaUrl={message.mediaUrl} duration={30} isOutgoing={isOutgoing} />
        )}

        {message.content && (
          <MessageContent $hasMedia={hasMedia || hasVoice} $isOutgoing={isOutgoing}>
            {message.content}
          </MessageContent>
        )}

        <MessageMeta>
          <Timestamp $isOutgoing={isOutgoing}>{formatCollectedMessageTime(message.timestamp)}</Timestamp>
          {isOutgoing && (
            <StatusIcon $status={message.status}>
              {renderStatusIcon()}
            </StatusIcon>
          )}
        </MessageMeta>
      </BubbleContainer>
    </BubbleWrapper>
  );
}
