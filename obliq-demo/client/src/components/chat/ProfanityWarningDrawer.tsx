import styled, { keyframes } from 'styled-components';
import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

interface ProfanityWarningDrawerProps {
  visible: boolean;
  onDismiss: () => void;
}

const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

const DrawerContainer = styled.div<{ $visible: boolean; $exiting: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg, #e63946 0%, #b82e3b 100%);
  box-shadow:
    0 0 20px rgba(230, 57, 70, 0.24),
    0 0 40px rgba(230, 57, 70, 0.14),
    0 4px 12px rgba(0, 0, 0, 0.14);
  padding: 20px 24px;
  display: ${({ $visible, $exiting }) => ($visible || $exiting ? 'flex' : 'none')};
  align-items: center;
  gap: 16px;
  animation: ${({ $exiting }) => ($exiting ? slideUp : slideDown)} 0.3s ease-out forwards;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  flex-shrink: 0;

  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
`;

const MessageContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WarningTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const WarningText = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
`;

const DismissButton = styled.button`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  color: #b82e3b;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background: white;
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export function ProfanityWarningDrawer({ visible, onDismiss }: ProfanityWarningDrawerProps) {
  // Handle animation state for exit animation
  const [exiting, setExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setExiting(false);
    }
  }, [visible]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setShouldRender(false);
      setExiting(false);
      onDismiss();
    }, 300); // Match animation duration
  };

  if (!shouldRender && !visible) return null;

  return (
    <DrawerContainer $visible={visible && !exiting} $exiting={exiting}>
      <IconWrapper>
        <ShieldAlert />
      </IconWrapper>
      <MessageContent>
        <WarningTitle>Inappropriate Language Detected</WarningTitle>
        <WarningText>
          You should not use language like this with an underage person.
          Please remove or modify the highlighted words before sending your message.
        </WarningText>
      </MessageContent>
      <DismissButton onClick={handleDismiss}>
        Thank you
      </DismissButton>
    </DrawerContainer>
  );
}
