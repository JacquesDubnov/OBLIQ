import styled from 'styled-components';
import { Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { formatCallDuration } from '../../utils/dateUtils';

interface CallIndicatorProps {
  callType: 'voice' | 'video';
  duration?: number;
  isOutgoing: boolean;
  isMissed?: boolean;
}

const CallContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const CallIconWrapper = styled.div<{ $isMissed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ $isMissed }) =>
    $isMissed ? 'rgba(234, 0, 56, 0.1)' : 'rgba(0, 168, 132, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme, $isMissed }) =>
      $isMissed ? theme.text.danger : theme.accent.primary};
  }
`;

const CallInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const CallTitle = styled.span<{ $isMissed: boolean; $isOutgoing: boolean }>`
  font-size: 14px;
  color: ${({ theme, $isMissed, $isOutgoing }) =>
    $isMissed
      ? theme.text.danger
      : $isOutgoing
        ? theme.bubble.outgoingText
        : theme.bubble.incomingText};
`;

const CallDuration = styled.span<{ $isOutgoing: boolean }>`
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
`;

function getCallIcon(callType: 'voice' | 'video', isOutgoing: boolean, isMissed: boolean) {
  if (isMissed) {
    return <PhoneMissed />;
  }
  if (callType === 'video') {
    return <Video />;
  }
  return isOutgoing ? <PhoneOutgoing /> : <PhoneIncoming />;
}

function getCallLabel(callType: 'voice' | 'video', isOutgoing: boolean, isMissed: boolean): string {
  if (isMissed) {
    return 'Missed call';
  }
  const typeLabel = callType === 'video' ? 'Video call' : 'Voice call';
  return isOutgoing ? `Outgoing ${typeLabel.toLowerCase()}` : `Incoming ${typeLabel.toLowerCase()}`;
}

export function CallIndicator({
  callType,
  duration,
  isOutgoing,
  isMissed = false,
}: CallIndicatorProps) {
  const hasDuration = duration !== undefined && duration > 0;
  const showAsMissed = isMissed || (!hasDuration && !isOutgoing);

  return (
    <CallContainer>
      <CallIconWrapper $isMissed={showAsMissed}>
        {getCallIcon(callType, isOutgoing, showAsMissed)}
      </CallIconWrapper>
      <CallInfo>
        <CallTitle $isMissed={showAsMissed} $isOutgoing={isOutgoing}>
          {getCallLabel(callType, isOutgoing, showAsMissed)}
        </CallTitle>
        {hasDuration && (
          <CallDuration $isOutgoing={isOutgoing}>
            {formatCallDuration(duration)}
          </CallDuration>
        )}
      </CallInfo>
    </CallContainer>
  );
}
