import styled from 'styled-components';
import { useEffect, useRef } from 'react';

// All available commands in alphabetical order
export const COMMANDS = [
  { name: 'ai', description: 'AI assistant', hasAction: false },
  { name: 'attach', description: 'Attach file', hasAction: false },
  { name: 'calendar', description: 'Calendar event', hasAction: true },
  { name: 'collect', description: 'Create dynamic view', hasAction: true, acceptsArguments: true },
  { name: 'delete', description: 'Delete message', hasAction: false },
  { name: 'email', description: 'Send email', hasAction: false },
  { name: 'image', description: 'Send image', hasAction: false },
  { name: 'import', description: 'Import data', hasAction: false },
  { name: 'panic', description: 'Panic mode', hasAction: false },
  { name: 'pay', description: 'Payment', hasAction: false },
  { name: 'reset', description: 'Reset demo', hasAction: true },
  { name: 'sub-group', description: 'Create sub-group', hasAction: false },
  { name: 'summarize', description: 'Summarize chat', hasAction: false },
  { name: 'tags', description: 'Manage tags', hasAction: false },
  { name: 'transfer', description: 'Transfer funds', hasAction: false },
  { name: 'translate', description: 'Live translate', hasAction: true },
  { name: 'web', description: 'Web search', hasAction: false },
];

interface CommandMenuProps {
  filter: string;
  selectedIndex: number;
  onSelect: (command: string) => void;
}

const MenuContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 60px;
  max-width: 300px;
  max-height: 240px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 8px;
  box-shadow: 0 -4px 26px rgba(0, 0, 0, 0.30);
  margin-bottom: 8px;
  z-index: 100;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.scrollbar.thumb};
    border-radius: 3px;
  }
`;

const CommandItem = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.hover.light : 'transparent'};
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }
`;

const CommandName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

const CommandSlash = styled.span`
  color: ${({ theme }) => theme.accent.primary};
`;

const CommandDescription = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text.secondary};
  margin-left: 12px;
`;

export function getFilteredCommands(filter: string): typeof COMMANDS {
  if (!filter) return COMMANDS;
  const lowerFilter = filter.toLowerCase();
  return COMMANDS.filter(cmd => cmd.name.startsWith(lowerFilter));
}

export function CommandMenu({ filter, selectedIndex, onSelect }: CommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const filteredCommands = getFilteredCommands(filter);

  // Scroll selected item into view
  useEffect(() => {
    if (menuRef.current && selectedIndex >= 0) {
      const items = menuRef.current.querySelectorAll('[data-command-item]');
      const selectedItem = items[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <MenuContainer ref={menuRef}>
      {filteredCommands.map((cmd, index) => (
        <CommandItem
          key={cmd.name}
          $isSelected={index === selectedIndex}
          onClick={() => onSelect(cmd.name)}
          data-command-item
        >
          <CommandName>
            <CommandSlash>/</CommandSlash>
            {cmd.name}
          </CommandName>
          <CommandDescription>{cmd.description}</CommandDescription>
        </CommandItem>
      ))}
    </MenuContainer>
  );
}
