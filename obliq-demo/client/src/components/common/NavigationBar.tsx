import styled from 'styled-components';
import {
  MessageCircle,
  Phone,
  CircleDot,
  Radio,
  Users,
  Star,
  Sparkles,
  Settings,
} from 'lucide-react';

type NavItem = 'chats' | 'calls' | 'status' | 'channels' | 'communities' | 'starred' | 'metaAI' | 'settings';

interface NavigationBarProps {
  activeItem?: NavItem;
  onItemClick?: (item: NavItem) => void;
}

const NavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  width: 68px;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.primary};
  border-right: 1px solid ${({ theme }) => theme.border.primary};
`;

const TopIcons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12px;
  gap: 4px;
`;

const BottomIcons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  padding-bottom: 12px;
  gap: 4px;
`;

const NavButton = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 19px;
    height: 19px;
    color: ${({ theme, $active }) =>
      $active ? theme.accent.primary : theme.icon.primary};
    transition: color 0.15s ease;
  }

  /* Active indicator bar on the left */
  &::before {
    content: '';
    position: absolute;
    left: -14px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 19px;
    border-radius: 0 3px 3px 0;
    background-color: ${({ theme, $active }) =>
      $active ? theme.accent.primary : 'transparent'};
    transition: background-color 0.15s ease;
  }
`;

const topNavItems: { id: NavItem; icon: React.ReactNode; label: string }[] = [
  { id: 'chats', icon: <MessageCircle />, label: 'Chats' },
  { id: 'calls', icon: <Phone />, label: 'Calls' },
  { id: 'status', icon: <CircleDot />, label: 'Status' },
  { id: 'channels', icon: <Radio />, label: 'Channels' },
  { id: 'communities', icon: <Users />, label: 'Communities' },
];

const bottomNavItems: { id: NavItem; icon: React.ReactNode; label: string }[] = [
  { id: 'starred', icon: <Star />, label: 'Starred' },
  { id: 'metaAI', icon: <Sparkles />, label: 'Meta AI' },
  { id: 'settings', icon: <Settings />, label: 'Settings' },
];

export function NavigationBar({ activeItem = 'chats', onItemClick }: NavigationBarProps) {
  return (
    <NavContainer>
      <TopIcons>
        {topNavItems.map((item) => (
          <NavButton
            key={item.id}
            $active={activeItem === item.id}
            onClick={() => onItemClick?.(item.id)}
            title={item.label}
          >
            {item.icon}
          </NavButton>
        ))}
      </TopIcons>
      <BottomIcons>
        {bottomNavItems.map((item) => (
          <NavButton
            key={item.id}
            $active={activeItem === item.id}
            onClick={() => onItemClick?.(item.id)}
            title={item.label}
          >
            {item.icon}
          </NavButton>
        ))}
      </BottomIcons>
    </NavContainer>
  );
}
