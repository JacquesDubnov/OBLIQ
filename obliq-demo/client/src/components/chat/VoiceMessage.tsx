import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Play, Pause, Mic } from 'lucide-react';
import { formatVoiceDuration } from '../../utils/dateUtils';

interface VoiceMessageProps {
  mediaUrl?: string;
  duration?: number;
  isOutgoing: boolean;
}

const VoiceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
`;

const PlayPauseButton = styled.button<{ $isOutgoing: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme, $isOutgoing }) =>
    $isOutgoing ? theme.accent.teal : theme.accent.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
    color: white;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const WaveformContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Waveform = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 24px;
`;

const WaveBar = styled.div<{ $height: number; $isOutgoing: boolean; $progress: number; $index: number }>`
  width: 3px;
  height: ${({ $height }) => $height}px;
  border-radius: 1.5px;
  background-color: ${({ theme, $isOutgoing, $progress, $index }) => {
    const isPlayed = $index < $progress * 30;
    if ($isOutgoing) {
      return isPlayed ? theme.accent.teal : 'rgba(0, 128, 105, 0.4)';
    }
    return isPlayed ? theme.accent.primary : 'rgba(0, 168, 132, 0.4)';
  }};
  transition: background-color 0.1s;
`;

const DurationText = styled.span<{ $isOutgoing: boolean }>`
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
`;

const MicIndicator = styled.div<{ $isOutgoing: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $isOutgoing }) =>
    $isOutgoing ? 'rgba(0, 128, 105, 0.2)' : 'rgba(0, 168, 132, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 12px;
    height: 12px;
    color: ${({ theme, $isOutgoing }) =>
      $isOutgoing ? theme.accent.teal : theme.accent.primary};
  }
`;

// Generate random waveform heights for visual effect
function generateWaveform(): number[] {
  const bars = 30;
  const heights: number[] = [];
  for (let i = 0; i < bars; i++) {
    // Create a more natural looking waveform pattern
    const base = 8;
    const variance = Math.sin(i * 0.5) * 8 + Math.random() * 8;
    heights.push(Math.max(4, Math.min(24, base + variance)));
  }
  return heights;
}

export function VoiceMessage({ mediaUrl, duration = 0, isOutgoing }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [waveformHeights] = useState(() => generateWaveform());
  const [currentDuration, setCurrentDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (mediaUrl) {
      audioRef.current = new Audio(mediaUrl);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current && audioRef.current.duration) {
          setCurrentDuration(Math.floor(audioRef.current.duration));
        }
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [mediaUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progressValue = audioRef.current.currentTime / audioRef.current.duration;
      setProgress(progressValue);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const togglePlayPause = () => {
    if (!audioRef.current && !mediaUrl) {
      // No audio available, just simulate for demo
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const displayDuration = currentDuration || duration;

  return (
    <VoiceContainer>
      <PlayPauseButton $isOutgoing={isOutgoing} onClick={togglePlayPause}>
        {isPlaying ? <Pause /> : <Play style={{ marginLeft: 2 }} />}
      </PlayPauseButton>
      <WaveformContainer>
        <Waveform>
          {waveformHeights.map((height, index) => (
            <WaveBar
              key={index}
              $height={height}
              $isOutgoing={isOutgoing}
              $progress={progress}
              $index={index}
            />
          ))}
        </Waveform>
        <DurationText $isOutgoing={isOutgoing}>
          {formatVoiceDuration(displayDuration)}
        </DurationText>
      </WaveformContainer>
      <MicIndicator $isOutgoing={isOutgoing}>
        <Mic />
      </MicIndicator>
    </VoiceContainer>
  );
}
