import styled, { keyframes } from 'styled-components';
import { layout } from '../../styles/theme';

interface TypingIndicatorProps {
  senderName?: string;
}

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
`;

const BubbleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2px;
`;

const BubbleContainer = styled.div`
  position: relative;
  padding: 12px 14px;
  border-radius: ${layout.message.borderRadius}px;
  background-color: ${({ theme }) => theme.bubble.incoming};
`;

const SenderName = styled.span`
  display: block;
  font-size: 12.8px;
  font-weight: 500;
  color: ${({ theme }) => theme.accent.primary};
  margin-bottom: 4px;
`;

const DotsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
`;

const Dot = styled.span<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.text.secondary};
  animation: ${bounce} 1.4s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay}s;
`;

// Format sender ID to display name (e.g., "jake-son" -> "Jake Son")
function formatSenderName(senderId: string): string {
  return senderId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function TypingIndicator({ senderName }: TypingIndicatorProps) {
  const displayName = senderName ? formatSenderName(senderName) : undefined;

  return (
    <BubbleWrapper>
      <BubbleContainer>
        {displayName && <SenderName>{displayName} typing...</SenderName>}
        <DotsContainer>
          <Dot $delay={0} />
          <Dot $delay={0.2} />
          <Dot $delay={0.4} />
        </DotsContainer>
      </BubbleContainer>
    </BubbleWrapper>
  );
}
