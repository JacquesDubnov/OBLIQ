import styled, { keyframes } from 'styled-components';
import { X, Check, Search, Sparkles, LayoutGrid } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useDynamicViewStore } from '../../store/dynamicViewStore';
import { useUIStore } from '../../store/uiStore';
import { useChatStore } from '../../store/chatStore';
import * as api from '../../utils/api';

type AnalysisPhase = 'scanning' | 'analyzing' | 'scoring' | 'building';

interface CollectProgressModalProps {
  criteria: string;
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
`;

const ModalContainer = styled.div`
  width: 480px;
  max-width: calc(100vw - 40px);
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: ${({ theme }) => theme.icon.primary};

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 17px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

const Content = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const IconContainer = styled.div<{ $status: 'loading' | 'success' | 'error' }>`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $status }) =>
    $status === 'success'
      ? theme.accent.success + '20'
      : $status === 'error'
      ? theme.accent.error + '20'
      : theme.accent.primary + '20'};

  svg {
    width: 36px;
    height: 36px;
    color: ${({ theme, $status }) =>
      $status === 'success'
        ? theme.accent.success
        : $status === 'error'
        ? theme.accent.error
        : theme.accent.primary};
  }
`;

const CriteriaText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 8px;
  max-width: 100%;
  word-break: break-word;

  span {
    color: ${({ theme }) => theme.text.primary};
    font-weight: 500;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProgressBarBackground = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 4px;
  overflow: hidden;
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const ProgressBarFill = styled.div<{ $progress: number; $isBuilding?: boolean }>`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background: ${({ theme, $isBuilding }) =>
    $isBuilding
      ? `linear-gradient(
          90deg,
          ${theme.accent.primary} 0%,
          ${theme.accent.primaryHover} 25%,
          ${theme.accent.primary} 50%,
          ${theme.accent.primaryHover} 75%,
          ${theme.accent.primary} 100%
        )`
      : theme.accent.primary};
  background-size: ${({ $isBuilding }) => ($isBuilding ? '200% 100%' : '100% 100%')};
  border-radius: 4px;
  transition: width 0.3s ease-out;
  animation: ${({ $isBuilding }) => ($isBuilding ? shimmer : 'none')} 1.5s linear infinite;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
`;

const ProgressText = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
`;

const MatchCount = styled.span`
  color: ${({ theme }) => theme.accent.primary};
  font-weight: 600;
`;

const PhaseIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  animation: ${pulse} 1.5s ease-in-out infinite;

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.accent.primary};
  }
`;

const PhaseText = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-weight: 500;
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ResultCount = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.accent.primary};
`;

const ResultLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
`;

const ViewName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  margin-top: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;

  ${({ theme, $primary }) =>
    $primary
      ? `
    background-color: ${theme.accent.primary};
    color: white;
    &:hover {
      background-color: ${theme.accent.primaryHover};
    }
  `
      : `
    background-color: ${theme.bg.secondary};
    color: ${theme.text.primary};
    &:hover {
      background-color: ${theme.hover.light};
    }
  `}
`;

const PHASE_CONFIG: Record<AnalysisPhase, { label: string; icon: 'search' | 'sparkles' | 'sparkles' | 'layout'; progressRange: [number, number] }> = {
  scanning: { label: 'Scanning messages', icon: 'search', progressRange: [0, 25] },
  analyzing: { label: 'AI understanding criteria', icon: 'sparkles', progressRange: [25, 50] },
  scoring: { label: 'Finding relevant matches', icon: 'sparkles', progressRange: [50, 85] },
  building: { label: 'Building collection view', icon: 'layout', progressRange: [85, 98] },
};

export function CollectProgressModal({ criteria, onClose }: CollectProgressModalProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [viewName, setViewName] = useState<string>('');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [viewId, setViewId] = useState<string | null>(null);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>('scanning');

  const createView = useDynamicViewStore((state) => state.createView);
  const selectView = useDynamicViewStore((state) => state.selectView);
  const showToast = useUIStore((state) => state.showToast);
  const selectChat = useChatStore((state) => state.selectChat);

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    let isMounted = true;

    const performCollection = async () => {
      try {
        // First, get the total message count
        const stats = await api.fetchViewStats();
        if (!isMounted) return;
        setTotalMessages(stats.totalMessages);

        // Phase-based progress simulation
        // Each phase has a different duration and progress range
        const phases: AnalysisPhase[] = ['scanning', 'analyzing', 'scoring', 'building'];
        let currentPhaseIndex = 0;
        phaseStartTimeRef.current = Date.now();

        // Phase durations in ms (total ~12-15 seconds for typical analysis)
        const phaseDurations: Record<AnalysisPhase, number> = {
          scanning: 1500,      // Quick scan phase
          analyzing: 3000,     // AI understanding
          scoring: 6000,       // Main semantic analysis
          building: 4000,      // Final assembly (this is where it used to get stuck)
        };

        progressIntervalRef.current = setInterval(() => {
          if (!isMounted) return;

          const phase = phases[currentPhaseIndex];
          const elapsed = Date.now() - phaseStartTimeRef.current;
          const phaseDuration = phaseDurations[phase];
          const phaseProgress = Math.min(elapsed / phaseDuration, 1);

          // Calculate progress within the phase's range
          const [rangeStart, rangeEnd] = PHASE_CONFIG[phase].progressRange;
          const progressInRange = rangeStart + (rangeEnd - rangeStart) * phaseProgress;

          setCurrentProgress(progressInRange);
          setCurrentPhase(phase);

          // Simulate finding matches during scoring phase
          if (phase === 'scoring' && Math.random() < 0.15) {
            setMatchedCount(prev => prev + Math.floor(Math.random() * 4) + 1);
          }

          // Move to next phase when current is complete
          if (phaseProgress >= 1 && currentPhaseIndex < phases.length - 1) {
            currentPhaseIndex++;
            phaseStartTimeRef.current = Date.now();
          }
        }, 80);

        // Actually create the view
        const view = await createView(criteria);

        // Stop the progress simulation
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        if (!isMounted) return;

        if (view) {
          // Complete the progress bar
          setCurrentProgress(100);
          setMatchedCount(view.messageCount);

          // Small delay to show 100% before switching to success
          setTimeout(() => {
            if (isMounted) {
              setStatus('success');
              setViewName(view.name);
              setMessageCount(view.messageCount);
              setViewId(view.id);
            }
          }, 300);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Collection failed:', error);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        if (isMounted) {
          setStatus('error');
        }
      }
    };

    performCollection();

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [criteria, createView]);

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'scanning':
        return <Search />;
      case 'analyzing':
      case 'scoring':
        return <Sparkles />;
      case 'building':
        return <LayoutGrid />;
    }
  };

  const handleViewCollection = () => {
    if (viewId) {
      selectView(viewId);
      selectChat(null);
      onClose();
      showToast(`Viewing "${viewName}" collection`, 'success');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && status !== 'loading') {
      onClose();
    }
  };

  const progressPercent = Math.round(currentProgress);

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          {status !== 'loading' && (
            <CloseButton onClick={onClose}>
              <X />
            </CloseButton>
          )}
          <HeaderTitle>
            {status === 'loading'
              ? 'Creating Collection...'
              : status === 'success'
              ? 'Collection Created'
              : 'Collection Failed'}
          </HeaderTitle>
        </Header>

        <Content>
          <IconContainer $status={status}>
            {status === 'loading' ? (
              <Search />
            ) : status === 'success' ? (
              <Check />
            ) : (
              <X />
            )}
          </IconContainer>

          <CriteriaText>
            Criteria: <span>"{criteria}"</span>
          </CriteriaText>

          {status === 'loading' && (
            <>
              <PhaseIndicator>
                {getPhaseIcon()}
                <PhaseText>{PHASE_CONFIG[currentPhase].label}</PhaseText>
              </PhaseIndicator>
              <ProgressContainer>
                <ProgressBarBackground>
                  <ProgressBarFill
                    $progress={currentProgress}
                    $isBuilding={currentPhase === 'building'}
                  />
                </ProgressBarBackground>
                <ProgressStats>
                  <span>{totalMessages} messages</span>
                  <span>{progressPercent}%</span>
                </ProgressStats>
              </ProgressContainer>
              {currentPhase === 'scoring' || currentPhase === 'building' ? (
                <ProgressText>
                  Found <MatchCount>{matchedCount}</MatchCount> matching messages
                </ProgressText>
              ) : (
                <ProgressText style={{ opacity: 0.7 }}>
                  Preparing semantic analysis...
                </ProgressText>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <ResultInfo>
                <ResultCount>{messageCount}</ResultCount>
                <ResultLabel>messages collected</ResultLabel>
              </ResultInfo>
              <ViewName>"{viewName}"</ViewName>
              <ButtonContainer>
                <Button onClick={onClose}>Close</Button>
                <Button $primary onClick={handleViewCollection}>
                  View Collection
                </Button>
              </ButtonContainer>
            </>
          )}

          {status === 'error' && (
            <>
              <ProgressText>
                Failed to create collection. Please try again.
              </ProgressText>
              <ButtonContainer>
                <Button onClick={onClose}>Close</Button>
              </ButtonContainer>
            </>
          )}
        </Content>
      </ModalContainer>
    </Overlay>
  );
}
