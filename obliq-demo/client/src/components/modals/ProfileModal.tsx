import styled from 'styled-components';
import { X, Phone, Video, Star, Bell, Ban, Flag, Lock, Image, Users, Shield } from 'lucide-react';
import { User } from 'lucide-react';
import type { Contact, Message, GroupMember } from '../../types/chat';

interface ProfileModalProps {
  contact: Contact;
  messages?: Message[];
  members?: GroupMember[];
  onClose: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
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
  width: 680px;
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
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
  background-color: ${({ theme }) => theme.bg.primary};
`;

const LargeAvatar = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 100px;
    height: 100px;
    color: ${({ theme }) => theme.icon.secondary};
  }
`;

const ContactName = styled.h3`
  font-size: 24px;
  font-weight: 400;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 4px;
`;

const ContactPhone = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.text.secondary};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  border-top: 8px solid ${({ theme }) => theme.bg.secondary};
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  color: ${({ theme }) => theme.accent.primary};

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 24px;
    height: 24px;
  }

  span {
    font-size: 13px;
  }
`;

const Section = styled.div`
  padding: 16px;
  border-top: 8px solid ${({ theme }) => theme.bg.secondary};
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  color: ${({ theme }) => theme.accent.primary};
  margin-bottom: 12px;
`;

const AboutText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.4;
`;

const MediaGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const MediaThumb = styled.div`
  aspect-ratio: 1;
  background-color: ${({ theme }) => theme.bg.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.icon.secondary};
  }

  &:hover {
    opacity: 0.8;
  }
`;

const EmptyMedia = styled.div`
  grid-column: span 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
    opacity: 0.5;
  }
`;

const EncryptionInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-top: 8px solid ${({ theme }) => theme.bg.secondary};
`;

const EncryptionIcon = styled.div`
  color: ${({ theme }) => theme.accent.primary};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const EncryptionText = styled.div`
  flex: 1;

  h5 {
    font-size: 16px;
    font-weight: 400;
    color: ${({ theme }) => theme.text.primary};
    margin-bottom: 4px;
  }

  p {
    font-size: 13px;
    color: ${({ theme }) => theme.text.secondary};
    line-height: 1.4;
  }
`;

const OptionList = styled.div`
  border-top: 8px solid ${({ theme }) => theme.bg.secondary};
`;

const ParticipantsSection = styled.div`
  border-top: 8px solid ${({ theme }) => theme.bg.secondary};
  padding: 16px 0;
`;

const ParticipantsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px 16px;
`;

const ParticipantsIcon = styled.div`
  color: ${({ theme }) => theme.accent.primary};
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ParticipantsTitle = styled.h4`
  font-size: 14px;
  color: ${({ theme }) => theme.accent.primary};
`;

const ParticipantsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }
`;

const ParticipantAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.icon.secondary};
  }
`;

const ParticipantInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ParticipantName = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ParticipantAbout = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AdminBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.accent.primary};
  background-color: rgba(0, 168, 132, 0.1);
  padding: 2px 8px;
  border-radius: 4px;

  svg {
    width: 12px;
    height: 12px;
  }
`;


const OptionItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 16px 24px;
  text-align: left;
  color: ${({ theme, $danger }) => ($danger ? theme.text.danger : theme.text.primary)};

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme, $danger }) => ($danger ? theme.text.danger : theme.icon.secondary)};
  }

  span {
    font-size: 16px;
  }
`;

export function ProfileModal({
  contact,
  messages = [],
  members = [],
  onClose,
  onVoiceCall,
  onVideoCall,
}: ProfileModalProps) {
  // Filter media messages
  const mediaMessages = messages.filter(
    (msg) => msg.messageType === 'image' || msg.messageType === 'video'
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isGroup = contact.isGroup;
  const totalParticipants = members.length + 1; // +1 for current user

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
          <HeaderTitle>{isGroup ? 'Group info' : 'Contact info'}</HeaderTitle>
        </Header>

        <Content>
          <AvatarSection>
            <LargeAvatar>
              {contact.avatarUrl ? (
                <img src={contact.avatarUrl} alt={contact.name} />
              ) : isGroup ? (
                <Users />
              ) : (
                <User />
              )}
            </LargeAvatar>
            <ContactName>{contact.name}</ContactName>
            {isGroup ? (
              <ContactPhone>Group · {totalParticipants} {totalParticipants === 1 ? 'participant' : 'participants'}</ContactPhone>
            ) : (
              contact.phone && <ContactPhone>{contact.phone}</ContactPhone>
            )}
          </AvatarSection>

          <ActionButtons>
            <ActionButton onClick={onVoiceCall}>
              <Phone />
              <span>Audio</span>
            </ActionButton>
            <ActionButton onClick={onVideoCall}>
              <Video />
              <span>Video</span>
            </ActionButton>
            <ActionButton>
              <Star />
              <span>Favorite</span>
            </ActionButton>
          </ActionButtons>

          {contact.about && (
            <Section>
              <SectionTitle>{isGroup ? 'Description' : 'About'}</SectionTitle>
              <AboutText>{contact.about}</AboutText>
            </Section>
          )}

          {/* Group Participants */}
          {isGroup && (
            <ParticipantsSection>
              <ParticipantsHeader>
                <ParticipantsIcon>
                  <Users />
                </ParticipantsIcon>
                <ParticipantsTitle>{totalParticipants} {totalParticipants === 1 ? 'participant' : 'participants'}</ParticipantsTitle>
              </ParticipantsHeader>
              <ParticipantsList>
                {/* Current user (You) - always shown first */}
                <ParticipantItem>
                  <ParticipantAvatar>
                    <User />
                  </ParticipantAvatar>
                  <ParticipantInfo>
                    <ParticipantName>You</ParticipantName>
                  </ParticipantInfo>
                </ParticipantItem>

                {/* Other members */}
                {members.map((member) => (
                  <ParticipantItem key={member.memberId}>
                    <ParticipantAvatar>
                      {member.member.avatarUrl ? (
                        <img src={member.member.avatarUrl} alt={member.member.name} />
                      ) : (
                        <User />
                      )}
                    </ParticipantAvatar>
                    <ParticipantInfo>
                      <ParticipantName>{member.member.name}</ParticipantName>
                      {member.member.about && (
                        <ParticipantAbout>{member.member.about}</ParticipantAbout>
                      )}
                    </ParticipantInfo>
                    {member.isAdmin && (
                      <AdminBadge>
                        <Shield />
                        Admin
                      </AdminBadge>
                    )}
                  </ParticipantItem>
                ))}
              </ParticipantsList>
            </ParticipantsSection>
          )}

          <Section>
            <SectionTitle>Media, links and docs</SectionTitle>
            <MediaGallery>
              {mediaMessages.length > 0 ? (
                mediaMessages.slice(0, 6).map((msg) => (
                  <MediaThumb key={msg.id}>
                    {msg.mediaUrl && <img src={msg.mediaUrl} alt="" />}
                  </MediaThumb>
                ))
              ) : (
                <EmptyMedia>
                  <Image />
                  <span>No media</span>
                </EmptyMedia>
              )}
            </MediaGallery>
          </Section>

          <EncryptionInfo>
            <EncryptionIcon>
              <Lock />
            </EncryptionIcon>
            <EncryptionText>
              <h5>Encryption</h5>
              <p>
                Messages and calls are end-to-end encrypted. No one outside of this chat
                can read or listen to them.
              </p>
            </EncryptionText>
          </EncryptionInfo>

          <OptionList>
            <OptionItem>
              <Bell />
              <span>Mute notifications</span>
            </OptionItem>
            <OptionItem $danger>
              <Ban />
              <span>Block {contact.name}</span>
            </OptionItem>
            <OptionItem $danger>
              <Flag />
              <span>Report {contact.name}</span>
            </OptionItem>
          </OptionList>
        </Content>
      </ModalContainer>
    </Overlay>
  );
}
