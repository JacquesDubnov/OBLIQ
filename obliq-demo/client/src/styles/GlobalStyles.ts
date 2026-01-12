import { createGlobalStyle } from 'styled-components';
import { typography } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: ${typography.fontFamily} !important;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font-family: ${typography.fontFamily} !important;
    font-size: ${typography.fontSize.base};
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.bg.app};
    color: ${({ theme }) => theme.text.primary};
  }

  /* Custom scrollbar styling - thin, matching WhatsApp */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border.light};
    border-radius: 3px;

    &:hover {
      background-color: ${({ theme }) => theme.text.secondary};
    }
  }

  /* Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.border.light} transparent;
  }

  /* Remove default button styles */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    color: inherit;
    padding: 0;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  /* Remove default input styles */
  input, textarea {
    font-family: inherit;
    font-size: inherit;
    border: none;
    outline: none;
    background: transparent;
    color: inherit;

    &::placeholder {
      color: ${({ theme }) => theme.input.placeholder};
    }
  }

  /* Remove default link styles */
  a {
    color: ${({ theme }) => theme.text.link};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  /* Disable text selection on UI elements */
  .no-select {
    user-select: none;
  }

  /* Icon button base styles */
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${({ theme }) => theme.hover.light};
    }

    svg {
      width: 19px;
      height: 19px;
      color: ${({ theme }) => theme.icon.secondary};
    }
  }

  /* Style SVG icons - thinner strokes, proper colors */
  svg {
    stroke-width: 1.5 !important;
    stroke: currentColor !important;
    fill: none !important;
    border: none !important;
    outline: none !important;
  }

  /* Ensure SVG elements don't have black strokes */
  svg path,
  svg line,
  svg circle,
  svg polyline,
  svg rect,
  svg polygon {
    stroke: inherit !important;
    fill: inherit !important;
  }
`;
