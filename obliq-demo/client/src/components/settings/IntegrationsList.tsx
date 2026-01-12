import { useState } from 'react';
import styled from 'styled-components';
import { Plus } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';

interface Integration {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const IntegrationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  min-height: 56px;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }
`;

const LogoContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.tertiary};

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const AppName = styled.span`
  flex: 1;
  font-size: 15px;
  color: ${({ theme }) => theme.text.primary};
`;

const AddIntegrationItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  min-height: 56px;
  width: 100%;
  text-align: left;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }
`;

const AddIconContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.accent.primary};
  color: white;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AddText = styled.span`
  flex: 1;
  font-size: 15px;
  color: ${({ theme }) => theme.accent.primary};
  font-weight: 500;
`;

// Initial integrations state - all connected by default
const initialIntegrations: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    connected: true,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    connected: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    connected: true,
  },
  {
    id: 'canva',
    name: 'Canva',
    logo: 'https://static.canva.com/web/images/12487a1e0770d29351bd4ce4f87ec8fe.svg',
    connected: true,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png',
    connected: true,
  },
  {
    id: 'chrome',
    name: 'Chrome',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg',
    connected: true,
  },
  {
    id: 'talk2mi',
    name: 'Talk2Mi',
    logo: '/integrations/talk2mi.png',
    connected: true,
  },
  {
    id: 'berlin-codes',
    name: 'Berlin.Codes',
    logo: '/integrations/berlin-codes.png',
    connected: true,
  },
  {
    id: 'n46',
    name: 'n46.ai',
    logo: '/integrations/n46.png',
    connected: true,
  },
];

// Placeholder SVG for apps without logos
const PlaceholderLogo = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

function getPlaceholderColor(id: string): string {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(/[\s.]/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function IntegrationsList() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);

  const handleToggle = (id: string, connected: boolean) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, connected } : integration
      )
    );
  };

  return (
    <Container>
      {integrations.map((integration) => (
        <IntegrationItem key={integration.id}>
          <LogoContainer>
            {integration.logo ? (
              <img src={integration.logo} alt={integration.name} />
            ) : (
              <PlaceholderLogo $color={getPlaceholderColor(integration.id)}>
                {getInitials(integration.name)}
              </PlaceholderLogo>
            )}
          </LogoContainer>
          <AppName>{integration.name}</AppName>
          <ToggleSwitch
            checked={integration.connected}
            onChange={(checked) => handleToggle(integration.id, checked)}
          />
        </IntegrationItem>
      ))}
      <AddIntegrationItem>
        <AddIconContainer>
          <Plus />
        </AddIconContainer>
        <AddText>Add integration</AddText>
      </AddIntegrationItem>
    </Container>
  );
}
