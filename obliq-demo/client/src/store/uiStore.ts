import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';
type ProfanityMode = 'alert' | 'alert-and-block';

// Helper to get initial profanity mode from localStorage
const getInitialProfanityMode = (): ProfanityMode => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('obliq-profanity-mode');
    if (stored === 'alert' || stored === 'alert-and-block') {
      return stored;
    }
  }
  return 'alert-and-block'; // Default to alert-and-block
};

interface UIState {
  // Theme
  theme: ThemeMode;

  // Sidebar
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  searchQuery: string;
  activeFilter: 'all' | 'unread' | 'favorites' | 'groups';

  // Modals
  isProfileModalOpen: boolean;
  isMediaPreviewOpen: boolean;
  isCallModalOpen: boolean;
  isSettingsModalOpen: boolean;
  activeCallType: 'voice' | 'video' | null;
  mediaPreviewUrl: string | null;

  // Calendar
  isCalendarOpen: boolean;
  calendarGroupId: string | null;
  calendarScheduledAfterMessageId: string | null; // When scheduled, calendar stays after this message

  // Collect Modal (Dynamic Views)
  isCollectModalOpen: boolean;
  collectCriteria: string | null;

  // Notifications
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';

  // Profanity moderation
  profanityMode: ProfanityMode;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: 'all' | 'unread' | 'favorites' | 'groups') => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openMediaPreview: (url: string) => void;
  closeMediaPreview: () => void;
  openCallModal: (type: 'voice' | 'video') => void;
  closeCallModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openCalendar: (groupId: string) => void;
  closeCalendar: () => void;
  scheduleCalendar: (afterMessageId: string) => void;
  openCollectModal: (criteria: string) => void;
  closeCollectModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  setProfanityMode: (mode: ProfanityMode) => void;
}

const DEFAULT_SIDEBAR_WIDTH = 340;

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  theme: 'light',
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  isSidebarCollapsed: false,
  searchQuery: '',
  activeFilter: 'all',
  isProfileModalOpen: false,
  isMediaPreviewOpen: false,
  isCallModalOpen: false,
  isSettingsModalOpen: false,
  activeCallType: null,
  mediaPreviewUrl: null,
  isCalendarOpen: false,
  calendarGroupId: null,
  calendarScheduledAfterMessageId: null,
  isCollectModalOpen: false,
  collectCriteria: null,
  toastMessage: null,
  toastType: 'info',
  profanityMode: getInitialProfanityMode(),

  // Theme actions
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),

  // Sidebar actions
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  toggleSidebar: () => set({ isSidebarCollapsed: !get().isSidebarCollapsed }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  // Modal actions
  openProfileModal: () => set({ isProfileModalOpen: true }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),

  openMediaPreview: (url) => set({ isMediaPreviewOpen: true, mediaPreviewUrl: url }),
  closeMediaPreview: () => set({ isMediaPreviewOpen: false, mediaPreviewUrl: null }),

  openCallModal: (type) => set({ isCallModalOpen: true, activeCallType: type }),
  closeCallModal: () => set({ isCallModalOpen: false, activeCallType: null }),

  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),

  // Calendar actions
  openCalendar: (groupId) => set({ isCalendarOpen: true, calendarGroupId: groupId, calendarScheduledAfterMessageId: null }),
  closeCalendar: () => set({ isCalendarOpen: false, calendarGroupId: null, calendarScheduledAfterMessageId: null }),
  scheduleCalendar: (afterMessageId) => set({ calendarScheduledAfterMessageId: afterMessageId }),

  // Collect Modal actions
  openCollectModal: (criteria) => set({ isCollectModalOpen: true, collectCriteria: criteria }),
  closeCollectModal: () => set({ isCollectModalOpen: false, collectCriteria: null }),

  // Toast actions
  showToast: (message, type = 'info') => {
    set({ toastMessage: message, toastType: type });
    // Auto-clear after 3 seconds
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3000);
  },
  clearToast: () => set({ toastMessage: null }),

  // Profanity moderation actions
  setProfanityMode: (mode) => {
    localStorage.setItem('obliq-profanity-mode', mode);
    set({ profanityMode: mode });
  },
}));

// Selectors
export const selectTheme = (state: UIState) => state.theme;
export const selectSidebarWidth = (state: UIState) => state.sidebarWidth;
export const selectSearchQuery = (state: UIState) => state.searchQuery;
export const selectActiveFilter = (state: UIState) => state.activeFilter;
export const selectProfanityMode = (state: UIState) => state.profanityMode;
