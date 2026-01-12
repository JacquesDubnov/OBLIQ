import styled, { keyframes } from 'styled-components';
import { Search } from 'lucide-react';
import { layout } from '../../styles/theme';
import type { DynamicViewListItemData } from '../../types/chat';
import { formatChatListTime } from '../../utils/dateUtils';

interface DynamicViewListItemProps {
  view: DynamicViewListItemData;
  isSelected: boolean;
  onClick: () => void;
}

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
`;

const ItemContainer = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  height: ${layout.chatListItem.height}px;
  padding: ${layout.chatListItem.padding};
  gap: ${layout.chatListItem.avatarMargin}px;
  cursor: pointer;
  background: ${({ theme, $selected }) =>
    $selected
      ? `linear-gradient(135deg, ${theme.bg.chatListItemSelected} 0%, ${theme.accent.primary}10 100%)`
      : 'transparent'};
  transition: background-color 0.1s ease;

  &:hover {
    background: ${({ theme, $selected }) =>
      $selected
        ? `linear-gradient(135deg, ${theme.bg.chatListItemSelected} 0%, ${theme.accent.primary}10 100%)`
        : theme.bg.chatListItemHover};
  }
`;

const IconContainer = styled.div`
  width: 49px;
  height: 49px;
  border-radius: 50%;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.accent.primary}30 0%,
    ${({ theme }) => theme.accent.primary}50 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.accent.primary};
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
  font-weight: 500;
  line-height: 1.3;
  color: ${({ theme }) => theme.text.chatName};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Time = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text.timestamp};
  white-space: nowrap;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const PreviewText = styled.span`
  flex: 1;
  font-size: 14px;
  line-height: 1.35;
  color: ${({ theme }) => theme.text.chatPreview};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badges = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.accent.success}20;
`;

const LiveDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.accent.success};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LiveText = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.accent.success};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const MessageCount = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.accent.primary}30;
  color: ${({ theme }) => theme.accent.primary};
  font-size: 12px;
  font-weight: 500;
`;

export function DynamicViewListItem({ view, isSelected, onClick }: DynamicViewListItemProps) {
  return (
    <ItemContainer $selected={isSelected} onClick={onClick}>
      <IconContainer>
        <Search />
      </IconContainer>
      <ContentWrapper>
        <TopRow>
          <Name>{view.name}</Name>
          <Time>{formatChatListTime(view.updatedAt)}</Time>
        </TopRow>
        <BottomRow>
          <PreviewText>"{view.criteria}"</PreviewText>
          <Badges>
            {view.isLive && (
              <LiveIndicator>
                <LiveDot />
                <LiveText>Live</LiveText>
              </LiveIndicator>
            )}
            <MessageCount>{view.messageCount}</MessageCount>
          </Badges>
        </BottomRow>
      </ContentWrapper>
    </ItemContainer>
  );
}
