import { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Phone, Mic, MicOff, Volume2, VolumeX, Video, VideoOff, User, X } from 'lucide-react';
import type { Contact } from '../../types/chat';

type CallState = 'ringing' | 'connected' | 'ended';
type CallType = 'voice' | 'video';

interface CallModalProps {
  contact: Contact;
  callType: CallType;
  onClose: () => void;
  onCallEnd?: (duration: number) => void;
}

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #00a884 0%, #075e54 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 60px 24px 48px;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const AvatarContainer = styled.div<{ $isRinging: boolean }>`
  position: relative;
  margin-bottom: 24px;

  ${({ $isRinging }) =>
    $isRinging &&
    css`
      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 150px;
        height: 150px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.4);
        animation: ${pulse} 2s infinite;
      }

      &::after {
        animation-delay: 0.5s;
      }
    `}
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 80px;
    height: 80px;
    color: rgba(255, 255, 255, 0.8);
  }
`;

const ContactName = styled.h2`
  font-size: 28px;
  font-weight: 400;
  color: white;
  margin-bottom: 8px;
`;

const CallStatus = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
`;

const CallDuration = styled.p`
  font-size: 18px;
  color: white;
  font-variant-numeric: tabular-nums;
`;

const MiddleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CallTypeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 12px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const EncryptionNote = styled.p`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 32px;
`;

const ControlButton = styled.button<{ $active?: boolean; $danger?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $active, $danger }) =>
    $danger ? '#ea0038' : $active ? 'white' : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ $active, $danger }) => ($active && !$danger ? '#075e54' : 'white')};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background-color: ${({ $active, $danger }) =>
      $danger ? '#ff1a4d' : $active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
  }

  svg {
    width: 28px;
    height: 28px;
  }
`;

const EndCallButton = styled(ControlButton)`
  width: 72px;
  height: 72px;
  background-color: #ea0038;

  &:hover {
    background-color: #ff1a4d;
  }

  svg {
    width: 32px;
    height: 32px;
    transform: rotate(135deg);
  }
`;

const ControlLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8px;
`;

const ControlWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VideoPreview = styled.div`
  position: absolute;
  bottom: 200px;
  right: 24px;
  width: 120px;
  height: 160px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    width: 40px;
    height: 40px;
    color: rgba(255, 255, 255, 0.6);
  }
`;

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function CallModal({ contact, callType, onClose, onCallEnd }: CallModalProps) {
  const [callState, setCallState] = useState<CallState>('ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate call connection after 2-4 seconds
  useEffect(() => {
    if (callState === 'ringing') {
      const connectDelay = 2000 + Math.random() * 2000;
      const timeout = setTimeout(() => {
        setCallState('connected');
      }, connectDelay);
      return () => clearTimeout(timeout);
    }
  }, [callState]);

  // Start duration timer when connected
  useEffect(() => {
    if (callState === 'connected') {
      durationRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [callState]);

  const handleEndCall = () => {
    if (durationRef.current) {
      clearInterval(durationRef.current);
    }
    setCallState('ended');
    onCallEnd?.(duration);

    // Close after a brief delay
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const getCallStatusText = () => {
    switch (callState) {
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return formatDuration(duration);
      case 'ended':
        return 'Call ended';
    }
  };

  return (
    <Overlay>
      <CloseButton onClick={handleEndCall}>
        <X />
      </CloseButton>

      <TopSection>
        <AvatarContainer $isRinging={callState === 'ringing'}>
          <Avatar>
            {contact.avatarUrl ? (
              <img src={contact.avatarUrl} alt={contact.name} />
            ) : (
              <User />
            )}
          </Avatar>
        </AvatarContainer>
        <ContactName>{contact.name}</ContactName>
        {callState === 'connected' ? (
          <CallDuration>{getCallStatusText()}</CallDuration>
        ) : (
          <CallStatus>{getCallStatusText()}</CallStatus>
        )}
      </TopSection>

      <MiddleSection>
        <CallTypeLabel>
          {callType === 'video' ? <Video /> : <Phone />}
          <span>WhatsApp {callType === 'video' ? 'Video' : 'Voice'} Call</span>
        </CallTypeLabel>
        <EncryptionNote>End-to-end encrypted</EncryptionNote>
      </MiddleSection>

      <ControlsSection>
        <ControlsRow>
          <ControlWrapper>
            <ControlButton
              $active={isSpeakerOn}
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            >
              {isSpeakerOn ? <Volume2 /> : <VolumeX />}
            </ControlButton>
            <ControlLabel>Speaker</ControlLabel>
          </ControlWrapper>

          {callType === 'video' && (
            <ControlWrapper>
              <ControlButton
                $active={isVideoOn}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video /> : <VideoOff />}
              </ControlButton>
              <ControlLabel>Video</ControlLabel>
            </ControlWrapper>
          )}

          <ControlWrapper>
            <ControlButton $active={isMuted} onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <MicOff /> : <Mic />}
            </ControlButton>
            <ControlLabel>Mute</ControlLabel>
          </ControlWrapper>
        </ControlsRow>

        <EndCallButton $danger onClick={handleEndCall}>
          <Phone />
        </EndCallButton>
      </ControlsSection>

      {callType === 'video' && isVideoOn && (
        <VideoPreview>
          <User />
        </VideoPreview>
      )}
    </Overlay>
  );
}
