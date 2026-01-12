import styled from 'styled-components';
import { Lock } from 'lucide-react';
import { MessageInput } from './MessageInput';

const WindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.secondary};
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  width: 350px;
  height: auto;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 300;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  max-width: 500px;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const EncryptionNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.text.tertiary};

  svg {
    width: 14px;
    height: 14px;
  }
`;

// No-op handler for messages - commands are handled internally by MessageInput
const handleSendMessage = () => {
  // Messages can't be sent without a chat selected
  // But slash commands like /collect work independently
};

export function EmptyChat() {
  return (
    <WindowContainer>
      <ContentArea>
        <Logo src="/integrations/obliq.png" alt="OBLIQ" />
        <Title>Prototype</Title>
        <Subtitle>
          AI-powered, private messaging
          <br />
          Because your messages are your own.
        </Subtitle>
        <EncryptionNote>
          <Lock />
          Zero-knowledge forensic encryption.
        </EncryptionNote>
      </ContentArea>
      <MessageInput
        chatId="__empty__"
        onSendMessage={handleSendMessage}
      />
    </WindowContainer>
  );
}
