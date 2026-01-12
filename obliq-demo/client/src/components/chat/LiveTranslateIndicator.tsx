import styled, { keyframes } from 'styled-components';

const neonPulse = keyframes`
  0%, 100% {
    opacity: 0.7;
    text-shadow:
      0 0 4px #39FF14,
      0 0 8px #39FF14,
      0 0 12px #39FF14;
  }
  50% {
    opacity: 1;
    text-shadow:
      0 0 8px #39FF14,
      0 0 16px #39FF14,
      0 0 24px #39FF14,
      0 0 32px #39FF14;
  }
`;

const dotPulse = keyframes`
  0%, 100% {
    opacity: 0.7;
    box-shadow:
      0 0 4px #FF3B30,
      0 0 8px #FF3B30;
  }
  50% {
    opacity: 1;
    box-shadow:
      0 0 6px #FF3B30,
      0 0 12px #FF3B30,
      0 0 18px #FF3B30;
  }
`;

const IndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(57, 255, 20, 0.08);
`;

const NeonText = styled.span`
  color: #111111;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  animation: ${neonPulse} 1.5s ease-in-out infinite;
`;

const NeonDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #FF3B30;
  box-shadow:
    0 0 4px #FF3B30,
    0 0 8px #FF3B30;
  animation: ${dotPulse} 1.5s ease-in-out infinite;
`;

export function LiveTranslateIndicator() {
  return (
    <IndicatorContainer>
      <NeonDot />
      <NeonText>Live Translate</NeonText>
    </IndicatorContainer>
  );
}
