import styled from 'styled-components';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { useDynamicViewStore } from '../../store/dynamicViewStore';
import { CommandMenu, getFilteredCommands, COMMANDS } from './CommandMenu';
import { detectProfanity, type ProfanityMatch } from '../../utils/profanityFilter';

// Language display names for toast messages
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
};

interface MessageInputProps {
  chatId: string;
  contactLanguage?: string;
  isGroup?: boolean;
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  hasMinorParticipant?: boolean;
  onProfanityDetected?: (hasProfanity: boolean) => void;
}

const InputContainerWrapper = styled.div`
  position: relative;
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.125);
  z-index: 1;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-height: 50px;
  background-color: ${({ theme }) => theme.bg.messageInputBar};
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 19px;
    height: 19px;
    color: ${({ theme }) => theme.icon.secondary};
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.bg.inputField};
  border-radius: 60px;
  padding: 7px 14px;
  min-height: 34px;
  max-height: 96px;
  position: relative;
`;

const EditableInput = styled.div`
  flex: 1;
  font-size: 15px;
  line-height: 1.4;
  color: ${({ theme }) => theme.text.primary};
  background: transparent;
  border: none;
  outline: none;
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;

  &:empty:before {
    content: 'Type a message';
    color: ${({ theme }) => theme.input.placeholder};
    pointer-events: none;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border.light};
    border-radius: 2px;
  }
`;

const SendButton = styled(IconButton)<{ $active: boolean; $blocked?: boolean }>`
  svg {
    color: ${({ theme, $active, $blocked }) =>
      $blocked ? theme.icon.secondary : $active ? theme.accent.primary : theme.icon.secondary};
  }
  opacity: ${({ $blocked }) => ($blocked ? 0.5 : 1)};
  cursor: ${({ $blocked }) => ($blocked ? 'not-allowed' : 'pointer')};
`;

// Check if input is a command pattern (starts with / and no spaces)
function getCommandFilter(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.startsWith('/') && !trimmed.includes(' ')) {
    return trimmed.slice(1); // Return without the /
  }
  return null;
}

// Check if input exactly matches a command
function isExactCommand(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed.startsWith('/')) return false;
  const cmdName = trimmed.slice(1);
  return COMMANDS.some(cmd => cmd.name === cmdName);
}

// Parse command with arguments (e.g., "/collect messages about house sale")
function parseCommandWithArgs(input: string): { command: string; args: string } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;

  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    // No space - just command name
    const cmdName = trimmed.slice(1).toLowerCase();
    const command = COMMANDS.find(cmd => cmd.name === cmdName);
    if (command) {
      return { command: cmdName, args: '' };
    }
    return null;
  }

  // Has space - command with arguments
  const cmdName = trimmed.slice(1, spaceIndex).toLowerCase();
  const args = trimmed.slice(spaceIndex + 1).trim();
  const command = COMMANDS.find(cmd => cmd.name === cmdName);

  if (command) {
    return { command: cmdName, args };
  }
  return null;
}

// Helper to save and restore cursor position
function saveCursorPosition(element: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
}

function restoreCursorPosition(element: HTMLElement, position: number): void {
  const selection = window.getSelection();
  if (!selection) return;

  let charCount = 0;
  const nodeStack: Node[] = [element];
  let foundNode: Node | null = null;
  let foundOffset = 0;

  while (nodeStack.length > 0) {
    const node = nodeStack.pop()!;

    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;
      if (charCount + textLength >= position) {
        foundNode = node;
        foundOffset = position - charCount;
        break;
      }
      charCount += textLength;
    } else {
      // Push children in reverse order so we process them in order
      const children = node.childNodes;
      for (let i = children.length - 1; i >= 0; i--) {
        nodeStack.push(children[i]);
      }
    }
  }

  if (foundNode) {
    const range = document.createRange();
    range.setStart(foundNode, foundOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Build HTML with profanity highlighted
function buildHighlightedHTML(text: string, profaneWords: ProfanityMatch[]): string {
  if (profaneWords.length === 0) {
    return escapeHtml(text);
  }

  let result = '';
  let lastIndex = 0;

  // Sort matches by start position
  const sortedMatches = [...profaneWords].sort((a, b) => a.start - b.start);

  sortedMatches.forEach((match) => {
    // Add normal text before this match
    if (match.start > lastIndex) {
      result += escapeHtml(text.slice(lastIndex, match.start));
    }
    // Add the profane word with red + strikethrough styling
    // Explicitly set font-size to 16px (15px + 1px adjustment) to match visually
    result += `<span style="color: #ff0000; text-decoration: line-through; text-decoration-color: #ff0000; text-decoration-thickness: 2px; font-size: 16px; font-family: inherit; line-height: inherit;">${escapeHtml(text.slice(match.start, match.end))}</span>`;
    lastIndex = match.end;
  });

  // Add normal text after last match
  if (lastIndex < text.length) {
    result += escapeHtml(text.slice(lastIndex));
  }

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function MessageInput({
  chatId,
  contactLanguage = 'en',
  isGroup = false,
  onSendMessage,
  disabled = false,
  hasMinorParticipant = false,
  onProfanityDetected,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [profaneWords, setProfaneWords] = useState<ProfanityMatch[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);
  const resetStore = useChatStore((state) => state.resetStore);
  const enableTranslation = useChatStore((state) => state.enableTranslation);
  const enableTriLingualTranslation = useChatStore((state) => state.enableTriLingualTranslation);
  const showToast = useUIStore((state) => state.showToast);
  const openCalendar = useUIStore((state) => state.openCalendar);
  const openCollectModal = useUIStore((state) => state.openCollectModal);
  const profanityMode = useUIStore((state) => state.profanityMode);
  const clearAllViews = useDynamicViewStore((state) => state.clearAllViews);

  const hasContent = message.trim().length > 0;
  const commandFilter = getCommandFilter(message);
  const hasProfanity = profaneWords.length > 0;
  const isSendBlocked = hasMinorParticipant && hasProfanity && profanityMode === 'alert-and-block';

  // Update command menu visibility based on input
  useEffect(() => {
    if (commandFilter !== null) {
      const filtered = getFilteredCommands(commandFilter);
      if (filtered.length > 0) {
        setShowCommandMenu(true);
        // Reset selection when filter changes
        setSelectedCommandIndex(0);
      } else {
        setShowCommandMenu(false);
      }
    } else {
      setShowCommandMenu(false);
    }
  }, [commandFilter]);

  // Close command menu and reset state when chat changes
  useEffect(() => {
    setShowCommandMenu(false);
    setMessage('');
    setProfaneWords([]);
    if (inputRef.current) {
      inputRef.current.innerHTML = '';
    }
  }, [chatId]);

  // Notify parent when profanity state changes
  useEffect(() => {
    if (onProfanityDetected) {
      onProfanityDetected(hasProfanity && hasMinorParticipant);
    }
  }, [hasProfanity, hasMinorParticipant, onProfanityDetected]);

  // Update the contenteditable innerHTML when profane words change
  useEffect(() => {
    if (!inputRef.current || !hasMinorParticipant) return;

    const cursorPos = saveCursorPosition(inputRef.current);
    const newHTML = buildHighlightedHTML(message, profaneWords);

    // Only update if HTML actually changed (to avoid cursor jumps)
    if (inputRef.current.innerHTML !== newHTML) {
      inputRef.current.innerHTML = newHTML;
      restoreCursorPosition(inputRef.current, cursorPos);
    }
  }, [message, profaneWords, hasMinorParticipant]);

  const clearInput = useCallback(() => {
    setMessage('');
    setShowCommandMenu(false);
    setProfaneWords([]);
    if (inputRef.current) {
      inputRef.current.innerHTML = '';
    }
  }, []);

  // Check for profanity when a word is completed (space or punctuation)
  const checkProfanity = useCallback((text: string) => {
    if (!hasMinorParticipant) {
      setProfaneWords([]);
      return;
    }
    const matches = detectProfanity(text);
    setProfaneWords(matches);
  }, [hasMinorParticipant]);

  const executeCommand = useCallback(async (commandName: string) => {
    const command = COMMANDS.find(cmd => cmd.name === commandName);
    if (!command) return;

    clearInput();

    // Only execute commands that have actions
    if (!command.hasAction) {
      // Command has no action - just clear and do nothing
      return;
    }

    // Execute known commands
    switch (commandName) {
      case 'reset':
        await clearAllViews();
        await resetStore();
        showToast('Demo reset to initial state', 'success');
        window.location.reload();
        break;

      case 'translate':
        // Check if this is the Work Project Alpha group (has Japanese and French speakers)
        if (isGroup && chatId === 'work-project-alpha') {
          enableTriLingualTranslation(chatId, ['en', 'ja', 'fr']);
          showToast('Tri-Lingual Translation activated — English ↔ Japanese ↔ French', 'success');
        } else if (contactLanguage !== 'en') {
          enableTranslation(chatId, contactLanguage, 'en');
          const targetLangName = LANGUAGE_NAMES[contactLanguage] || contactLanguage;
          showToast(`Live Translation activated — English ↔ ${targetLangName}`, 'success');
        } else {
          showToast('Translation not available for English contacts', 'info');
        }
        break;

      case 'calendar':
        if (isGroup) {
          openCalendar(chatId);
        } else {
          showToast('Calendar is only available in group chats', 'info');
        }
        break;

      case 'collect':
        // This is handled separately in executeCollectCommand
        showToast('Use /collect followed by your criteria (e.g., /collect messages about house sale)', 'info');
        break;
    }
  }, [chatId, contactLanguage, isGroup, clearInput, clearAllViews, enableTranslation, enableTriLingualTranslation, openCalendar, resetStore, showToast]);

  // Special handler for collect command with arguments
  const executeCollectCommand = useCallback(async (criteria: string) => {
    if (!criteria.trim()) {
      showToast('Please provide criteria for collection (e.g., /collect messages about house sale)', 'info');
      return;
    }

    clearInput();
    openCollectModal(criteria.trim());
  }, [clearInput, openCollectModal, showToast]);

  const selectCommand = useCallback((commandName: string) => {
    // Check if the command accepts arguments
    const command = COMMANDS.find(cmd => cmd.name === commandName);
    if (command?.acceptsArguments) {
      // For commands that accept arguments, set the input to "/<command> " and let user type
      const newMessage = `/${commandName} `;
      setMessage(newMessage);
      if (inputRef.current) {
        inputRef.current.textContent = newMessage;
        // Move cursor to end
        const range = document.createRange();
        range.selectNodeContents(inputRef.current);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setShowCommandMenu(false);
      return;
    }
    executeCommand(commandName);
  }, [executeCommand]);

  const handleSend = async () => {
    if (hasContent && !disabled) {
      // Block sending if profanity detected and in block mode
      if (isSendBlocked) {
        return;
      }

      const trimmedMessage = message.trim();

      // Check if it's a command with arguments
      const parsed = parseCommandWithArgs(trimmedMessage);
      if (parsed) {
        // Special handling for collect command with arguments
        if (parsed.command === 'collect' && parsed.args) {
          await executeCollectCommand(parsed.args);
          return;
        }

        // For commands without arguments or that don't accept arguments
        if (!parsed.args || isExactCommand(trimmedMessage)) {
          await executeCommand(parsed.command);
          return;
        }
      }

      // Check if it's a command - don't send as message
      if (isExactCommand(trimmedMessage)) {
        const cmdName = trimmedMessage.slice(1).toLowerCase();
        await executeCommand(cmdName);
        return;
      }

      // Check if it starts with / but isn't a valid command - still don't send
      if (trimmedMessage.startsWith('/')) {
        clearInput();
        return;
      }

      onSendMessage(trimmedMessage);
      clearInput();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle command menu navigation
    if (showCommandMenu) {
      const filteredCommands = getFilteredCommands(commandFilter || '');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev > 0 ? prev - 1 : 0));
        return;
      }

      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedCommandIndex];
        if (selectedCommand) {
          selectCommand(selectedCommand.name);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandMenu(false);
        return;
      }

      // Close menu on space (command is complete)
      if (e.key === ' ') {
        setShowCommandMenu(false);
        return;
      }
    }

    // Regular enter handling (no command menu)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Escape always closes command menu
    if (e.key === 'Escape') {
      setShowCommandMenu(false);
    }
  };

  const handleInput = () => {
    if (!inputRef.current) return;

    // Get plain text content from contenteditable
    const value = inputRef.current.textContent || '';
    const prevValue = message;

    // If user deletes the /, close command menu
    if (!value.startsWith('/') && showCommandMenu) {
      setShowCommandMenu(false);
    }

    setMessage(value);

    // Check for profanity when a word is completed (space, punctuation, or deletion)
    if (hasMinorParticipant) {
      const lastChar = value.slice(-1);
      const isWordComplete = /[\s.,!?;:]/.test(lastChar);
      const isDeleting = value.length < prevValue.length;

      if (isWordComplete || isDeleting) {
        checkProfanity(value);
      }
    }
  };

  return (
    <InputContainerWrapper>
      {showCommandMenu && (
        <CommandMenu
          filter={commandFilter || ''}
          selectedIndex={selectedCommandIndex}
          onSelect={selectCommand}
        />
      )}
      <InputContainer>
        <IconButton title="Emoji">
          <Smile />
        </IconButton>
        <IconButton title="Attach">
          <Paperclip />
        </IconButton>
        <InputWrapper>
          <EditableInput
            ref={inputRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning
          />
        </InputWrapper>
        {hasContent ? (
          <SendButton
            $active={hasContent && !isSendBlocked}
            $blocked={isSendBlocked}
            onClick={handleSend}
            disabled={disabled || isSendBlocked}
            title={isSendBlocked ? "Remove inappropriate language to send" : "Send"}
          >
            <Send />
          </SendButton>
        ) : (
          <IconButton title="Voice message">
            <Mic />
          </IconButton>
        )}
      </InputContainer>
    </InputContainerWrapper>
  );
}
