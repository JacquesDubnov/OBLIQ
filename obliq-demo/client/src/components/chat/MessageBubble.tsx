import styled, { css, keyframes } from 'styled-components';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { layout } from '../../styles/theme';
import { formatMessageTime } from '../../utils/dateUtils';
import { MediaMessage } from './MediaMessage';
import { VoiceMessage } from './VoiceMessage';
import { CallIndicator } from './CallIndicator';
import type { Message } from '../../types/chat';

// WhatsApp-style color palette for sender names in group chats
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

// Hash function to get consistent color for a sender ID
function getSenderColor(senderId: string): string {
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    const char = senderId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
}

// Format sender ID to display name (e.g., "jake-son" -> "Jake Son")
function formatSenderName(senderId: string): string {
  return senderId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

interface MessageBubbleProps {
  message: Message;
  showSenderName?: boolean;
  senderName?: string;
  isNew?: boolean;
}

// Animation for new messages sliding in
const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const BubbleWrapper = styled.div<{ $isOutgoing: boolean; $isSystem: boolean; $isNew?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isOutgoing, $isSystem }) =>
    $isSystem ? 'center' : $isOutgoing ? 'flex-end' : 'flex-start'};
  margin: 15px 0;
  ${({ $isNew, $isOutgoing }) =>
    $isNew &&
    css`
      animation: ${$isOutgoing ? slideInFromRight : slideInFromLeft} 0.2s ease-out;
    `}
`;

const BubbleContainer = styled.div<{
  $isOutgoing: boolean;
  $isSystem: boolean;
  $hasMedia: boolean;
}>`
  position: relative;
  max-width: ${({ $isSystem }) => ($isSystem ? '80%' : layout.message.maxWidth)};
  min-width: ${layout.message.minWidth}px;
  padding: ${({ $hasMedia }) => ($hasMedia ? '20px' : layout.message.padding)};
  border-radius: ${layout.message.borderRadius}px;
  background-color: ${({ theme, $isOutgoing, $isSystem }) =>
    $isSystem
      ? theme.bubble.system
      : $isOutgoing
        ? theme.bubble.outgoing
        : theme.bubble.incoming};
`;

const SenderName = styled.span<{ $color?: string }>`
  display: block;
  font-size: 12.8px;
  font-weight: 500;
  color: ${({ $color, theme }) => $color || theme.accent.primary};
  margin-bottom: 17px;
`;

const MessageContent = styled.div<{ $isOutgoing: boolean; $hasMedia: boolean }>`
  font-size: 14.2px;
  line-height: 0.95;
  color: ${({ theme, $isOutgoing }) =>
    $isOutgoing ? theme.bubble.outgoingText : theme.bubble.incomingText};
  word-wrap: break-word;
  white-space: pre-wrap;
  padding: ${({ $hasMedia }) => ($hasMedia ? '6px' : '0')};
`;

const TranslationSeparator = styled.div<{ $isOutgoing: boolean }>`
  width: 100%;
  height: 1px;
  margin: 18px 0;
  background-color: ${({ $isOutgoing }) =>
    $isOutgoing
      ? 'rgba(0, 0, 0, 0.35)'
      : 'rgba(0, 0, 0, 0.1)'};
`;

const TranslatedContent = styled.div<{ $isOutgoing: boolean }>`
  font-size: 14.2px;
  line-height: 0.95;
  font-weight: 600;
  color: ${({ theme, $isOutgoing }) =>
    $isOutgoing ? theme.bubble.outgoingText : theme.bubble.incomingText};
  word-wrap: break-word;
  white-space: pre-wrap;
`;

// Animation for translating dots
const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-3px);
  }
`;

const TranslatingIndicator = styled.div<{ $isOutgoing: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-style: italic;
  color: ${({ $isOutgoing }) =>
    $isOutgoing ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.5)'};
`;

const TranslatingDot = styled.span<{ $delay: number; $isOutgoing: boolean }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: ${({ $isOutgoing }) =>
    $isOutgoing ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.5)'};
  animation: ${bounce} 1.2s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay}s;
`;

const SystemContent = styled.div`
  font-size: 12.5px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  padding: 4px 8px;
`;

const MessageMeta = styled.div<{ $isMedia?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 4px;
  ${({ $isMedia }) =>
    $isMedia
      ? css`
          padding: 0 6px 4px;
        `
      : css`
          float: right;
          margin-left: 8px;
        `}
`;

const Timestamp = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.bubble.timestamp};
`;

const StatusIcon = styled.span<{ $status: string }>`
  display: flex;
  align-items: center;
  color: ${({ theme, $status }) =>
    $status === 'read' ? theme.messageStatus.read : theme.messageStatus.delivered};

  svg {
    width: 13px;
    height: 13px;
  }
`;

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock />;
    case 'sent':
      return <Check />;
    case 'delivered':
    case 'read':
      return <CheckCheck />;
    default:
      return null;
  }
}

export function MessageBubble({ message, showSenderName, senderName, isNew }: MessageBubbleProps) {
  const isOutgoing = message.senderId === null;
  const isSystem = message.messageType === 'system';
  const senderColor = message.senderId ? getSenderColor(message.senderId) : undefined;

  // Render system message
  if (isSystem) {
    return (
      <BubbleWrapper $isOutgoing={isOutgoing} $isSystem={true} $isNew={isNew}>
        <BubbleContainer $isOutgoing={isOutgoing} $isSystem={true} $hasMedia={false}>
          <SystemContent>{message.content}</SystemContent>
        </BubbleContainer>
      </BubbleWrapper>
    );
  }

  // Render call message
  if (message.messageType === 'call') {
    return (
      <BubbleWrapper $isOutgoing={isOutgoing} $isSystem={false} $isNew={isNew}>
        <BubbleContainer $isOutgoing={isOutgoing} $isSystem={false} $hasMedia={false}>
          {showSenderName && senderName && !isOutgoing && (
            <SenderName $color={senderColor}>{formatSenderName(senderName)}</SenderName>
          )}
          <CallIndicator
            callType={message.callType || 'voice'}
            duration={message.callDuration}
            isOutgoing={isOutgoing}
          />
          <MessageMeta>
            <Timestamp>{formatMessageTime(message.timestamp)}</Timestamp>
            {isOutgoing && (
              <StatusIcon $status={message.status}>
                {getStatusIcon(message.status)}
              </StatusIcon>
            )}
          </MessageMeta>
        </BubbleContainer>
      </BubbleWrapper>
    );
  }

  // Render voice message
  if (message.messageType === 'voice') {
    return (
      <BubbleWrapper $isOutgoing={isOutgoing} $isSystem={false} $isNew={isNew}>
        <BubbleContainer $isOutgoing={isOutgoing} $isSystem={false} $hasMedia={true}>
          {showSenderName && senderName && !isOutgoing && (
            <SenderName $color={senderColor}>{formatSenderName(senderName)}</SenderName>
          )}
          <div style={{ padding: '6px' }}>
            <VoiceMessage
              mediaUrl={message.mediaUrl}
              duration={message.callDuration}
              isOutgoing={isOutgoing}
            />
          </div>
          <MessageMeta $isMedia>
            <Timestamp>{formatMessageTime(message.timestamp)}</Timestamp>
            {isOutgoing && (
              <StatusIcon $status={message.status}>
                {getStatusIcon(message.status)}
              </StatusIcon>
            )}
          </MessageMeta>
        </BubbleContainer>
      </BubbleWrapper>
    );
  }

  // Render image/video message
  if (message.messageType === 'image' || message.messageType === 'video') {
    return (
      <BubbleWrapper $isOutgoing={isOutgoing} $isSystem={false} $isNew={isNew}>
        <BubbleContainer $isOutgoing={isOutgoing} $isSystem={false} $hasMedia={true}>
          {showSenderName && senderName && !isOutgoing && (
            <SenderName $color={senderColor}>{formatSenderName(senderName)}</SenderName>
          )}
          <MediaMessage
            mediaUrl={message.mediaUrl || ''}
            caption={message.mediaCaption}
            type={message.messageType}
            isOutgoing={isOutgoing}
          />
          <MessageMeta $isMedia>
            <Timestamp>{formatMessageTime(message.timestamp)}</Timestamp>
            {isOutgoing && (
              <StatusIcon $status={message.status}>
                {getStatusIcon(message.status)}
              </StatusIcon>
            )}
          </MessageMeta>
        </BubbleContainer>
      </BubbleWrapper>
    );
  }

  // Render text message (default)
  const hasTranslation = !!message.translatedContent;
  const hasSecondTranslation = !!message.secondTranslatedContent;
  const isTranslating = message.isTranslating && !hasTranslation;

  return (
    <BubbleWrapper $isOutgoing={isOutgoing} $isSystem={false} $isNew={isNew}>
      <BubbleContainer $isOutgoing={isOutgoing} $isSystem={false} $hasMedia={false}>
        {showSenderName && senderName && !isOutgoing && (
          <SenderName $color={senderColor}>{formatSenderName(senderName)}</SenderName>
        )}
        <MessageContent $isOutgoing={isOutgoing} $hasMedia={false}>
          {message.content}
          {isTranslating && (
            <>
              <TranslationSeparator $isOutgoing={isOutgoing} />
              <TranslatingIndicator $isOutgoing={isOutgoing}>
                Translating
                <TranslatingDot $delay={0} $isOutgoing={isOutgoing} />
                <TranslatingDot $delay={0.15} $isOutgoing={isOutgoing} />
                <TranslatingDot $delay={0.3} $isOutgoing={isOutgoing} />
              </TranslatingIndicator>
            </>
          )}
          {hasTranslation && (
            <>
              <TranslationSeparator $isOutgoing={isOutgoing} />
              <TranslatedContent $isOutgoing={isOutgoing}>
                {message.translatedContent}
              </TranslatedContent>
            </>
          )}
          {hasSecondTranslation && (
            <>
              <TranslationSeparator $isOutgoing={isOutgoing} />
              <TranslatedContent $isOutgoing={isOutgoing}>
                {message.secondTranslatedContent}
              </TranslatedContent>
            </>
          )}
          <MessageMeta>
            <Timestamp>{formatMessageTime(message.timestamp)}</Timestamp>
            {isOutgoing && (
              <StatusIcon $status={message.status}>
                {getStatusIcon(message.status)}
              </StatusIcon>
            )}
          </MessageMeta>
        </MessageContent>
      </BubbleContainer>
    </BubbleWrapper>
  );
}
