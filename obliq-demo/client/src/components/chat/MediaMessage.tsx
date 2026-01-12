import { useState } from 'react';
import styled from 'styled-components';
import { Play, Download, X } from 'lucide-react';

interface MediaMessageProps {
  mediaUrl: string;
  caption?: string;
  type: 'image' | 'video';
  isOutgoing: boolean;
}

const MediaContainer = styled.div`
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  max-width: 330px;
  margin-bottom: 4px;
`;

const MediaThumbnail = styled.img`
  display: block;
  width: 100%;
  max-height: 330px;
  object-fit: cover;
  cursor: pointer;
  background-color: ${({ theme }) => theme.bg.tertiary};
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
`;

const PlayButton = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 30px;
    height: 30px;
    color: white;
    margin-left: 4px;
  }
`;

const Caption = styled.p<{ $isOutgoing: boolean }>`
  font-size: 14.2px;
  line-height: 1.4;
  color: ${({ theme, $isOutgoing }) =>
    $isOutgoing ? theme.bubble.outgoingText : theme.bubble.incomingText};
  margin-top: 4px;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const DownloadButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;

  svg {
    width: 16px;
    height: 16px;
    color: white;
  }

  ${MediaContainer}:hover & {
    opacity: 1;
  }
`;

// Fullscreen preview modal
const PreviewOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PreviewImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
`;

const PreviewVideo = styled.video`
  max-width: 90vw;
  max-height: 90vh;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const PreviewDownload = styled.button`
  position: absolute;
  top: 20px;
  right: 80px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

// Add cache-busting version for images - update when images change
const IMAGE_VERSION = '20260112b';

function getCacheBustedUrl(url: string): string {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${IMAGE_VERSION}`;
}

export function MediaMessage({ mediaUrl, caption, type, isOutgoing }: MediaMessageProps) {
  const [showPreview, setShowPreview] = useState(false);
  const cacheBustedUrl = getCacheBustedUrl(mediaUrl);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = cacheBustedUrl;
    link.download = mediaUrl.split('/').pop() || 'download';
    link.click();
  };

  const handleThumbnailClick = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <>
      <MediaContainer>
        <MediaThumbnail
          src={cacheBustedUrl}
          alt={caption || 'Media'}
          onClick={handleThumbnailClick}
          onError={(e) => {
            // Fallback for broken images
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {type === 'video' && (
          <VideoOverlay onClick={handleThumbnailClick}>
            <PlayButton>
              <Play />
            </PlayButton>
          </VideoOverlay>
        )}
        <DownloadButton onClick={handleDownload}>
          <Download />
        </DownloadButton>
      </MediaContainer>
      {caption && <Caption $isOutgoing={isOutgoing}>{caption}</Caption>}

      {showPreview && (
        <PreviewOverlay onClick={handleClosePreview}>
          <CloseButton onClick={handleClosePreview}>
            <X />
          </CloseButton>
          <PreviewDownload onClick={handleDownload}>
            <Download />
          </PreviewDownload>
          {type === 'video' ? (
            <PreviewVideo
              src={cacheBustedUrl}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <PreviewImage
              src={cacheBustedUrl}
              alt={caption || 'Preview'}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </PreviewOverlay>
      )}
    </>
  );
}
