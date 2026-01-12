import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface TypewriterEffectProps {
  text: string;
  delayPerWord?: number; // Delay in ms between each word (default: 500ms)
  wordByWord?: boolean; // true = word by word, false = character by character
  onStart?: () => void; // Called when animation starts (before first word)
  onComplete?: () => void;
  className?: string;
}

const TypewriterText = styled.span`
  display: inline;
`;

export function TypewriterEffect({
  text,
  delayPerWord = 500,
  wordByWord = true,
  onStart,
  onComplete,
  className,
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Use refs to avoid dependency issues with callbacks
  const onStartRef = useRef(onStart);
  const onCompleteRef = useRef(onComplete);

  // Update refs when callbacks change
  useEffect(() => {
    onStartRef.current = onStart;
    onCompleteRef.current = onComplete;
  }, [onStart, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    // Call onStart immediately when animation begins
    onStartRef.current?.();

    // Split text into words (keeping whitespace as separate units)
    const units = wordByWord ? text.split(/(\s+)/) : text.split('');

    let currentIndex = 0;
    let currentText = '';

    // Show first unit immediately
    if (units.length > 0) {
      currentText = units[0];
      setDisplayedText(currentText);
      currentIndex = 1;
    }

    if (units.length <= 1) {
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    const timer = setInterval(() => {
      if (currentIndex >= units.length) {
        clearInterval(timer);
        setIsComplete(true);
        onCompleteRef.current?.();
        return;
      }

      currentText += units[currentIndex];
      setDisplayedText(currentText);
      currentIndex++;
    }, delayPerWord);

    return () => clearInterval(timer);
  }, [text, delayPerWord, wordByWord]);

  if (isComplete) {
    return <TypewriterText className={className}>{text}</TypewriterText>;
  }

  return <TypewriterText className={className}>{displayedText}</TypewriterText>;
}
