import styled, { keyframes } from 'styled-components';
import { Search, Trash2, MoreVertical, X } from 'lucide-react';
import type { DynamicView } from '../../types/chat';

interface DynamicViewHeaderProps {
  view: DynamicView;
  onClose: () => void;
  onDelete?: () => void;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  min-height: 59px;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.bg.secondary} 0%,
    ${({ theme }) => theme.accent.primary}08 100%
  );
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.icon.secondary};
  }
`;

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

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
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
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.accent.primary};
  }
`;

const ViewInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const ViewName = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ViewMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewCriteria = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
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
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.accent.success};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MessageCount = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
  background-color: ${({ theme }) => theme.bg.tertiary};
  padding: 2px 8px;
  border-radius: 10px;
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

const DeleteButton = styled(IconButton)`
  &:hover {
    background-color: ${({ theme }) => theme.accent.error}20;

    svg {
      color: ${({ theme }) => theme.accent.error};
    }
  }
`;

export function DynamicViewHeader({
  view,
  onClose,
  onDelete,
  onSearchClick,
  onMenuClick,
}: DynamicViewHeaderProps) {
  return (
    <HeaderContainer>
      <HeaderLeft>
        <CloseButton onClick={onClose} title="Close view">
          <X />
        </CloseButton>
        <IconContainer>
          <Search />
        </IconContainer>
        <ViewInfo>
          <ViewName>{view.name}</ViewName>
          <ViewMeta>
            {view.isLive && (
              <LiveIndicator>
                <LiveDot />
                <LiveText>Live</LiveText>
              </LiveIndicator>
            )}
            <MessageCount>{view.messageCount} messages</MessageCount>
            <ViewCriteria title={view.criteria}>"{view.criteria}"</ViewCriteria>
          </ViewMeta>
        </ViewInfo>
      </HeaderLeft>
      <HeaderRight>
        <IconButton onClick={onSearchClick} title="Search in view">
          <Search />
        </IconButton>
        {onDelete && (
          <DeleteButton onClick={onDelete} title="Delete view">
            <Trash2 />
          </DeleteButton>
        )}
        <IconButton onClick={onMenuClick} title="Menu">
          <MoreVertical />
        </IconButton>
      </HeaderRight>
    </HeaderContainer>
  );
}
