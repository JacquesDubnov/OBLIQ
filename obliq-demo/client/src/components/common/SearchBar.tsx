import styled from 'styled-components';
import { Search, ArrowLeft, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchContainer = styled.div`
  padding: 8px 13px;
  background-color: ${({ theme }) => theme.bg.primary};
`;

const SearchInputWrapper = styled.div<{ $focused: boolean }>`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0;
  height: 36px;
  background-color: #ffffff;
  border: 1px solid #d1d7db;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.accent.primary};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 100%;

  svg {
    color: #54656f;
    width: 16px;
    height: 16px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  height: 100%;
  font-size: 15px;
  color: ${({ theme }) => theme.text.primary};
  padding-left: 24px;
  padding-right: 12px;

  &::placeholder {
    color: #667781;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 100%;

  svg {
    color: ${({ theme }) => theme.accent.primary};
    width: 16px;
    height: 16px;
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 100%;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.7;
  }

  svg {
    color: ${({ theme }) => theme.icon.secondary};
    width: 16px;
    height: 16px;
  }
`;

export function SearchBar({ value, onChange, placeholder = 'Search or start new chat' }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focused]);

  const handleBackClick = () => {
    onChange('');
    setFocused(false);
  };

  const handleClearClick = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <SearchContainer>
      <SearchInputWrapper $focused={focused}>
        {focused || value ? (
          <BackButton onClick={handleBackClick}>
            <ArrowLeft />
          </BackButton>
        ) : (
          <IconWrapper>
            <Search />
          </IconWrapper>
        )}
        <SearchInput
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => !value && setFocused(false)}
          placeholder={placeholder}
        />
        {value && (
          <ClearButton onClick={handleClearClick} title="Clear search">
            <X />
          </ClearButton>
        )}
      </SearchInputWrapper>
    </SearchContainer>
  );
}
