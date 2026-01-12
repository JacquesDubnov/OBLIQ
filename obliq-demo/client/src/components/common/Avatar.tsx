import styled from 'styled-components';
import { User } from 'lucide-react';
import { layout } from '../../styles/theme';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const AvatarContainer = styled.div<{ $size: number; $clickable: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  min-width: ${({ $size }) => $size}px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    color: ${({ theme }) => theme.icon.secondary};
    width: 60%;
    height: 60%;
  }
`;

export function Avatar({ src, name, size = 'sm', onClick }: AvatarProps) {
  const sizeValue = layout.avatar[size];

  return (
    <AvatarContainer $size={sizeValue} $clickable={!!onClick} onClick={onClick}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <User />
      )}
    </AvatarContainer>
  );
}
