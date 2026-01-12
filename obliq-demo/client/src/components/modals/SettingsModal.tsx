import styled from 'styled-components';
import { useState } from 'react';
import {
  X,
  User,
  Key,
  MessageSquare,
  Bell,
  HardDrive,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Puzzle,
  Download,
  ShieldAlert,
} from 'lucide-react';
import { IntegrationsList } from '../settings/IntegrationsList';
import { useUIStore } from '../../store/uiStore';

interface SettingsModalProps {
  onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 50px;
`;

const ModalContainer = styled.div`
  width: 1200px;
  max-width: calc(100vw - 100px);
  max-height: calc(100vh - 100px);
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 16px;
  background-color: ${({ theme }) => theme.bg.secondary};
  position: relative;
`;

const HeaderLogo = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 50px;
  width: 120px;
  height: 120px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: ${({ theme }) => theme.icon.primary};

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 19px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 0;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.bg.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 40px;
    height: 40px;
    color: ${({ theme }) => theme.icon.secondary};
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProfileName = styled.div`
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 4px;
`;

const ProfileStatus = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Divider = styled.div`
  height: 8px;
  background-color: ${({ theme }) => theme.bg.secondary};
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 16px 24px;
  text-align: left;
  color: ${({ theme }) => theme.text.primary};

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme }) => theme.icon.secondary};
  }
`;

const OptionText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OptionTitle = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.text.primary};
`;

const OptionDescription = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
`;

const ChevronIcon = styled.span`
  color: ${({ theme }) => theme.icon.secondary};
  opacity: 0.5;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px 8px;
`;

const SectionIcon = styled.div`
  color: ${({ theme }) => theme.accent.primary};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.accent.primary};
`;

const ImportItem = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 24px;
  text-align: left;
  background-color: ${({ theme }) => theme.bg.primary};

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }
`;

const ImportText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ImportTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

const ImportDescription = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
`;

const ImportIcon = styled.span`
  color: ${({ theme }) => theme.accent.primary};

  svg {
    width: 22px;
    height: 22px;
  }
`;

// Profanity settings sub-panel styles
const ProfanitySubPanel = styled.div`
  padding: 12px 24px 12px 66px;
  background-color: ${({ theme }) => theme.bg.secondary};
`;

const ProfanityModeOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.accent.primary + '15' : theme.bg.primary};
  border: 2px solid ${({ theme, $selected }) =>
    $selected ? theme.accent.primary : 'transparent'};
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.accent.primary + '20' : theme.hover.light};
  }
`;

const RadioCircle = styled.span<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ theme, $selected }) =>
    $selected ? theme.accent.primary : theme.border.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.accent.primary : 'transparent'};
  }
`;

const ModeOptionText = styled.div`
  flex: 1;
  text-align: left;
`;

const ModeOptionTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 2px;
`;

const ModeOptionDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
`;

const settingsOptions = [
  {
    id: 'account',
    icon: <Key />,
    title: 'Account',
    description: 'Security notifications, change number',
  },
  {
    id: 'privacy',
    icon: <User />,
    title: 'Privacy',
    description: 'Block contacts, disappearing messages',
  },
  {
    id: 'chats',
    icon: <MessageSquare />,
    title: 'Chats',
    description: 'Theme, wallpapers, chat history',
  },
  {
    id: 'notifications',
    icon: <Bell />,
    title: 'Notifications',
    description: 'Message, group & call tones',
  },
  {
    id: 'storage',
    icon: <HardDrive />,
    title: 'Storage and data',
    description: 'Network usage, auto-download',
  },
  {
    id: 'help',
    icon: <HelpCircle />,
    title: 'Help',
    description: 'Help center, contact us, privacy policy',
  },
];

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [isProfanityExpanded, setIsProfanityExpanded] = useState(false);
  const profanityMode = useUIStore((state) => state.profanityMode);
  const setProfanityMode = useUIStore((state) => state.setProfanityMode);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleProfanityClick = () => {
    setIsProfanityExpanded(!isProfanityExpanded);
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
          <HeaderTitle>Settings</HeaderTitle>
          <HeaderLogo>
            <img src="/integrations/obliq.png" alt="OBLIQ" />
          </HeaderLogo>
        </Header>

        <Content>
          <ImportItem>
            <ImportText>
              <ImportTitle>Import WhatsApp messages to OBLIQ</ImportTitle>
              <ImportDescription>Transfer your chat history, media, and contacts</ImportDescription>
            </ImportText>
            <ImportIcon>
              <Download />
            </ImportIcon>
          </ImportItem>

          <Divider />

          <ProfileSection>
            <Avatar>
              <User />
            </Avatar>
            <ProfileInfo>
              <ProfileName>You</ProfileName>
              <ProfileStatus>Hey there! I am using WhatsApp.</ProfileStatus>
            </ProfileInfo>
          </ProfileSection>

          <Divider />

          <OptionsList>
            {settingsOptions.map((option) => (
              <OptionItem key={option.id}>
                {option.icon}
                <OptionText>
                  <OptionTitle>{option.title}</OptionTitle>
                  <OptionDescription>{option.description}</OptionDescription>
                </OptionText>
                <ChevronIcon>
                  <ChevronRight />
                </ChevronIcon>
              </OptionItem>
            ))}

            {/* Profanity Settings Option */}
            <OptionItem onClick={handleProfanityClick}>
              <ShieldAlert />
              <OptionText>
                <OptionTitle>Profanity</OptionTitle>
                <OptionDescription>Language moderation for chats with minors</OptionDescription>
              </OptionText>
              <ChevronIcon>
                {isProfanityExpanded ? <ChevronDown /> : <ChevronRight />}
              </ChevronIcon>
            </OptionItem>

            {isProfanityExpanded && (
              <ProfanitySubPanel>
                <ProfanityModeOption
                  $selected={profanityMode === 'alert'}
                  onClick={() => setProfanityMode('alert')}
                >
                  <RadioCircle $selected={profanityMode === 'alert'} />
                  <ModeOptionText>
                    <ModeOptionTitle>Alert Only</ModeOptionTitle>
                    <ModeOptionDescription>
                      Highlights profanity but allows sending messages
                    </ModeOptionDescription>
                  </ModeOptionText>
                </ProfanityModeOption>

                <ProfanityModeOption
                  $selected={profanityMode === 'alert-and-block'}
                  onClick={() => setProfanityMode('alert-and-block')}
                >
                  <RadioCircle $selected={profanityMode === 'alert-and-block'} />
                  <ModeOptionText>
                    <ModeOptionTitle>Alert and Block</ModeOptionTitle>
                    <ModeOptionDescription>
                      Highlights profanity and prevents sending until removed
                    </ModeOptionDescription>
                  </ModeOptionText>
                </ProfanityModeOption>
              </ProfanitySubPanel>
            )}
          </OptionsList>

          <Divider />

          <SectionHeader>
            <SectionIcon>
              <Puzzle />
            </SectionIcon>
            <SectionTitle>Integrations</SectionTitle>
          </SectionHeader>

          <IntegrationsList />
        </Content>
      </ModalContainer>
    </Overlay>
  );
}
