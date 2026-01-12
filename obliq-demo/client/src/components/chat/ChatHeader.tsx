import styled from 'styled-components';
import { Phone, Video, Search, MoreVertical } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { LiveTranslateIndicator } from './LiveTranslateIndicator';
import { useChatStore, selectTranslationEnabled } from '../../store/chatStore';

interface ChatHeaderProps {
  chatId: string;
  name: string;
  avatarUrl?: string;
  status?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  typingName?: string;
  isGroup?: boolean;
  memberCount?: number;
  onProfileClick?: () => void;
  onVoiceCallClick?: () => void;
  onVideoCallClick?: () => void;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  height: 59px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ContactName = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContactStatus = styled.span<{ $isTyping?: boolean }>`
  font-size: 13px;
  color: ${({ theme, $isTyping }) =>
    $isTyping ? theme.accent.primary : theme.text.secondary};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.icon.secondary};
  }
`;

export function ChatHeader({
  chatId,
  name,
  avatarUrl,
  status,
  isOnline,
  isTyping,
  typingName,
  isGroup,
  memberCount,
  onProfileClick,
  onVoiceCallClick,
  onVideoCallClick,
  onSearchClick,
  onMenuClick,
}: ChatHeaderProps) {
  const isTranslationEnabled = useChatStore(selectTranslationEnabled(chatId));

  const getDisplayStatus = () => {
    if (isTyping) {
      // For groups, show who is typing
      if (isGroup && typingName) {
        return `${typingName} is typing...`;
      }
      return 'typing...';
    }
    if (isGroup && memberCount) {
      return `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`;
    }
    if (isOnline) return 'online';
    return status || 'click here for contact info';
  };

  const displayStatus = getDisplayStatus();

  return (
    <HeaderContainer>
      <HeaderLeft onClick={onProfileClick}>
        <Avatar src={avatarUrl} name={name} size="sm" />
        <ContactInfo>
          <ContactName>{name}</ContactName>
          <ContactStatus $isTyping={isTyping}>{displayStatus}</ContactStatus>
        </ContactInfo>
      </HeaderLeft>
      <HeaderRight>
        {isTranslationEnabled && <LiveTranslateIndicator />}
        <IconButton onClick={onVideoCallClick} title="Video call">
          <Video />
        </IconButton>
        <IconButton onClick={onVoiceCallClick} title="Voice call">
          <Phone />
        </IconButton>
        <IconButton onClick={onSearchClick} title="Search">
          <Search />
        </IconButton>
        <IconButton onClick={onMenuClick} title="Menu">
          <MoreVertical />
        </IconButton>
      </HeaderRight>
    </HeaderContainer>
  );
}
