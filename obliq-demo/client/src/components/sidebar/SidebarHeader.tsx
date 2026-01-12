import styled from 'styled-components';
import { SquarePen, MoreVertical, UserPlus } from 'lucide-react';

interface SidebarHeaderProps {
  onNewGroupClick?: () => void;
  onNewChatClick?: () => void;
  onMenuClick?: () => void;
}

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  height: 59px;
  background-color: ${({ theme }) => theme.bg.header};
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
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
    color: ${({ theme }) => theme.icon.primary};
    transition: color 0.15s ease;
  }

  &:hover svg {
    color: ${({ theme }) => theme.icon.hover};
  }
`;

export function SidebarHeader({
  onNewGroupClick,
  onNewChatClick,
  onMenuClick,
}: SidebarHeaderProps) {
  return (
    <HeaderContainer>
      <Title>Chats</Title>
      <HeaderRight>
        <IconButton onClick={onNewGroupClick} title="New group">
          <UserPlus />
        </IconButton>
        <IconButton onClick={onNewChatClick} title="New chat">
          <SquarePen />
        </IconButton>
        <IconButton onClick={onMenuClick} title="Menu">
          <MoreVertical />
        </IconButton>
      </HeaderRight>
    </HeaderContainer>
  );
}
