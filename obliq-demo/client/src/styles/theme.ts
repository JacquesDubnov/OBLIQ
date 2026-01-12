// Light theme (default) - WhatsApp Web colors (January 2025)
export const lightTheme = {
  // Main backgrounds
  bg: {
    primary: '#ffffff',
    secondary: '#f0f2f5',
    tertiary: '#e9edef',
    conversation: '#efeae2',
    wash: '#f0f2f5',
    app: '#d9dbd8',
    navbar: '#ffffff',
    header: '#ffffff',
    chatListItemHover: '#f5f6f6',
    chatListItemSelected: '#f0f2f5',
    messageInput: '#f0f2f5',
    messageInputBar: '#efeae2',
    inputField: '#ffffff',
  },

  // Message bubbles
  bubble: {
    outgoing: '#d9fdd3',
    incoming: '#ffffff',
    system: '#fdf4c5',
    outgoingText: '#111b21',
    incomingText: '#111b21',
    timestamp: '#667781',
  },

  // Text colors
  text: {
    primary: '#111b21',
    secondary: '#667781',
    tertiary: '#8696a0',
    link: '#027eb5',
    danger: '#ea0038',
    success: '#00a884',
    chatName: '#111b21',
    chatPreview: '#667781',
    timestamp: '#667781',
    timestampUnread: '#00a884',
  },

  // Accent colors
  accent: {
    primary: '#00a884',
    primaryHover: '#008069',
    blue: '#53bdeb',
    lightGreen: '#25d366',
    teal: '#008069',
    success: '#00a884',
    error: '#ea0038',
  },

  // Borders and dividers
  border: {
    primary: '#e9edef',
    light: '#e9edef',
    conversation: '#d1d7db',
    navbar: '#e9edef',
  },

  // Icons
  icon: {
    primary: '#54656f',
    secondary: '#8696a0',
    active: '#00a884',
    hover: '#111b21',
  },

  // Input
  input: {
    bg: '#f0f2f5',
    placeholder: '#667781',
  },

  // Hover states
  hover: {
    bg: '#f5f6f6',
    light: 'rgba(0, 0, 0, 0.05)',
  },

  // Filter tabs
  filterTabs: {
    bg: '#ffffff',
    tabBg: '#e9edef',
    tabBgActive: '#e7fce3',
    tabText: '#54656f',
    tabTextActive: '#008069',
  },

  // Message status
  messageStatus: {
    pending: '#667781',
    sent: '#667781',
    delivered: '#667781',
    read: '#53bdeb',
  },

  // Badges
  badges: {
    unread: '#25d366',
    unreadText: '#ffffff',
    muted: '#8696a0',
  },

  // Scrollbar
  scrollbar: {
    track: 'transparent',
    thumb: 'rgba(0, 0, 0, 0.2)',
    thumbHover: 'rgba(0, 0, 0, 0.3)',
  },
};

// Dark theme - WhatsApp Web dark mode colors
export const darkTheme = {
  // Main backgrounds
  bg: {
    primary: '#111b21',
    secondary: '#202c33',
    tertiary: '#2a3942',
    conversation: '#0b141a',
    wash: '#111b21',
    app: '#0b141a',
    navbar: '#202c33',
    header: '#202c33',
    chatListItemHover: '#202c33',
    chatListItemSelected: '#2a3942',
    messageInput: '#202c33',
    messageInputBar: '#202c33',
    inputField: '#2a3942',
  },

  // Message bubbles
  bubble: {
    outgoing: '#005c4b',
    incoming: '#202c33',
    system: 'rgba(32, 44, 51, 0.95)',
    outgoingText: '#e9edef',
    incomingText: '#e9edef',
    timestamp: 'rgba(255, 255, 255, 0.6)',
  },

  // Text colors
  text: {
    primary: '#e9edef',
    secondary: '#8696a0',
    tertiary: '#667781',
    link: '#53bdeb',
    danger: '#f15c6d',
    success: '#00a884',
    chatName: '#e9edef',
    chatPreview: '#8696a0',
    timestamp: '#8696a0',
    timestampUnread: '#00a884',
  },

  // Accent colors
  accent: {
    primary: '#00a884',
    primaryHover: '#00c298',
    blue: '#53bdeb',
    lightGreen: '#25d366',
    teal: '#008069',
    success: '#00a884',
    error: '#f15c6d',
  },

  // Borders and dividers
  border: {
    primary: '#2a3942',
    light: '#222d34',
    conversation: '#222d34',
    navbar: '#2a3942',
  },

  // Icons
  icon: {
    primary: '#aebac1',
    secondary: '#8696a0',
    active: '#00a884',
    hover: '#e9edef',
  },

  // Input
  input: {
    bg: '#2a3942',
    placeholder: '#8696a0',
  },

  // Hover states
  hover: {
    bg: '#2a3942',
    light: 'rgba(255, 255, 255, 0.05)',
  },

  // Filter tabs
  filterTabs: {
    bg: '#111b21',
    tabBg: '#202c33',
    tabBgActive: '#103629',
    tabText: '#8696a0',
    tabTextActive: '#25d366',
  },

  // Message status
  messageStatus: {
    pending: '#8696a0',
    sent: '#8696a0',
    delivered: '#8696a0',
    read: '#53bdeb',
  },

  // Badges
  badges: {
    unread: '#00a884',
    unreadText: '#111b21',
    muted: '#8696a0',
  },

  // Scrollbar
  scrollbar: {
    track: 'transparent',
    thumb: 'rgba(134, 150, 160, 0.3)',
    thumbHover: 'rgba(134, 150, 160, 0.5)',
  },
};

export const typography = {
  fontFamily: 'Helvetica Neue, Helvetica, Arial, "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", "Hiragino Sans", "Hiragino Kaku Gothic Pro", "Yu Gothic", "Meiryo", sans-serif',
  fontSize: {
    xs: '11px',
    sm: '12px',
    smPlus: '13px',
    base: '14px',
    md: '15px',
    lg: '17px',
    xl: '19px',
    xxl: '22px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.35,
    relaxed: 1.5,
  },
};

export const layout = {
  navbar: {
    width: 68,
  },
  sidebar: {
    width: 340,
    minWidth: 300,
    maxWidth: 500,
    headerHeight: 59,
    searchHeight: 49,
    filterHeight: 44,
  },
  chatHeader: {
    height: '59px',
  },
  messageInput: {
    minHeight: '62px',
    maxHeight: '200px',
  },
  chatListItem: {
    height: 72,
    padding: '0 15px',
    avatarSize: 49,
    avatarMargin: 15,
  },
  avatar: {
    xs: 28,
    sm: 36,
    md: 40,
    lg: 49,
    xl: 60,
    profile: 200,
  },
  message: {
    maxWidth: '400px',
    minWidth: 80,
    padding: '21px 22px 23px 24px',
    borderRadius: 7.5,
    tailWidth: 8,
    tailHeight: 13,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 18,
    full: 9999,
  },
};

export type Theme = typeof lightTheme;
