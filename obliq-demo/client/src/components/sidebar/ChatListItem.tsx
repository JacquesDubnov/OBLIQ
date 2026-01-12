import styled from 'styled-components';
import { Pin, BellOff, CheckCheck } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { layout } from '../../styles/theme';
import type { ChatListItemData } from '../../types/chat';

interface ChatListItemProps {
  chat: ChatListItemData;
  isSelected: boolean;
  searchQuery?: string;
  onClick: () => void;
}

const ItemContainer = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  height: ${layout.chatListItem.height}px;
  padding: ${layout.chatListItem.padding};
  gap: ${layout.chatListItem.avatarMargin}px;
  cursor: pointer;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.bg.chatListItemSelected : 'transparent'};
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.bg.chatListItemSelected : theme.bg.chatListItemHover};
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Name = styled.span`
  font-size: 17px;
  font-weight: 400;
  line-height: 1.3;
  color: ${({ theme }) => theme.text.chatName};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Time = styled.span<{ $hasUnread: boolean }>`
  font-size: 12px;
  color: ${({ theme, $hasUnread }) =>
    $hasUnread ? theme.text.timestampUnread : theme.text.timestamp};
  white-space: nowrap;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const LastMessage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

const MessageStatus = styled.span<{ $read: boolean }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme, $read }) =>
    $read ? theme.messageStatus.read : theme.messageStatus.delivered};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MessagePreview = styled.span`
  font-size: 14px;
  line-height: 1.35;
  color: ${({ theme }) => theme.text.chatPreview};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TypingText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.accent.primary};
`;

const Badges = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const UnreadBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.badges.unread};
  color: ${({ theme }) => theme.badges.unreadText};
  font-size: 12px;
  font-weight: 500;
`;

const IconBadge = styled.span`
  display: flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.badges.muted};
  }
`;

const Highlight = styled.mark`
  background-color: rgba(0, 168, 132, 0.2);
  color: inherit;
  padding: 0;
  border-radius: 2px;
`;

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <Highlight>{match}</Highlight>
      {after}
    </>
  );
}

export function ChatListItem({ chat, isSelected, searchQuery, onClick }: ChatListItemProps) {
  return (
    <ItemContainer $selected={isSelected} onClick={onClick}>
      <Avatar src={chat.avatarUrl} name={chat.name} size="lg" />
      <ContentWrapper>
        <TopRow>
          <Name>{searchQuery ? highlightText(chat.name, searchQuery) : chat.name}</Name>
          {chat.lastMessageTime && (
            <Time $hasUnread={chat.unreadCount > 0}>{chat.lastMessageTime}</Time>
          )}
        </TopRow>
        <BottomRow>
          <LastMessage>
            {chat.isTyping ? (
              <TypingText>typing...</TypingText>
            ) : (
              <>
                {chat.lastMessage && !chat.isGroup && (
                  <MessageStatus $read={false}>
                    <CheckCheck />
                  </MessageStatus>
                )}
                <MessagePreview>{chat.lastMessage || ''}</MessagePreview>
              </>
            )}
          </LastMessage>
          <Badges>
            {chat.isMuted && (
              <IconBadge>
                <BellOff />
              </IconBadge>
            )}
            {chat.isPinned && (
              <IconBadge>
                <Pin />
              </IconBadge>
            )}
            {chat.unreadCount > 0 && (
              <UnreadBadge>{chat.unreadCount}</UnreadBadge>
            )}
          </Badges>
        </BottomRow>
      </ContentWrapper>
    </ItemContainer>
  );
}
