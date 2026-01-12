import { create } from 'zustand';
import type { DynamicView, CollectedMessage } from '../types/chat';
import { transformDynamicView, transformViewMessage } from '../types/chat';
import * as api from '../utils/api';

interface DynamicViewState {
  // Data
  views: DynamicView[];
  messagesByView: Record<string, CollectedMessage[]>;
  selectedViewId: string | null;

  // Loading states
  isLoadingViews: boolean;
  isLoadingMessages: boolean;
  isCreating: boolean;
  creationProgress: string;

  // Error state
  error: string | null;

  // Actions
  fetchViews: () => Promise<void>;
  fetchViewMessages: (viewId: string) => Promise<void>;
  createView: (criteria: string) => Promise<DynamicView | null>;
  deleteView: (viewId: string) => Promise<void>;
  selectView: (viewId: string | null) => void;
  clearSelection: () => void;
  updateViewInStore: (viewId: string, updates: Partial<DynamicView>) => void;
  addMessageToView: (viewId: string, message: CollectedMessage) => void;
  clearError: () => void;
  setCreationProgress: (progress: string) => void;
  clearAllViews: () => Promise<void>;
}

export const useDynamicViewStore = create<DynamicViewState>((set, get) => ({
  // Initial state
  views: [],
  messagesByView: {},
  selectedViewId: null,
  isLoadingViews: false,
  isLoadingMessages: false,
  isCreating: false,
  creationProgress: '',
  error: null,

  // Fetch all views
  fetchViews: async () => {
    set({ isLoadingViews: true, error: null });
    try {
      const viewsApi = await api.fetchDynamicViews();
      const views = viewsApi.map(transformDynamicView);
      set({ views, isLoadingViews: false });
    } catch (error) {
      console.error('Failed to fetch views:', error);
      set({ error: 'Failed to load views', isLoadingViews: false });
    }
  },

  // Fetch messages for a specific view
  fetchViewMessages: async (viewId: string) => {
    const { messagesByView } = get();

    // Skip if already loaded
    if (messagesByView[viewId]?.length > 0) return;

    set({ isLoadingMessages: true, error: null });
    try {
      const viewWithMessages = await api.fetchDynamicView(viewId);
      const messages = viewWithMessages.messages.map(transformViewMessage);

      set({
        messagesByView: { ...get().messagesByView, [viewId]: messages },
        isLoadingMessages: false,
      });
    } catch (error) {
      console.error('Failed to fetch view messages:', error);
      set({ error: 'Failed to load messages', isLoadingMessages: false });
    }
  },

  // Create a new view
  createView: async (criteria: string) => {
    set({ isCreating: true, creationProgress: 'Analyzing messages...', error: null });

    try {
      const viewApi = await api.createDynamicView(criteria);
      const view = transformDynamicView(viewApi);

      // Add to views list
      set({
        views: [view, ...get().views],
        isCreating: false,
        creationProgress: '',
        selectedViewId: view.id,
      });

      return view;
    } catch (error) {
      console.error('Failed to create view:', error);
      set({
        error: 'Failed to create view',
        isCreating: false,
        creationProgress: '',
      });
      return null;
    }
  },

  // Delete a view
  deleteView: async (viewId: string) => {
    try {
      await api.deleteDynamicView(viewId);

      const { views, messagesByView, selectedViewId } = get();
      const newMessagesByView = { ...messagesByView };
      delete newMessagesByView[viewId];

      set({
        views: views.filter(v => v.id !== viewId),
        messagesByView: newMessagesByView,
        selectedViewId: selectedViewId === viewId ? null : selectedViewId,
      });
    } catch (error) {
      console.error('Failed to delete view:', error);
      set({ error: 'Failed to delete view' });
    }
  },

  // Select a view
  selectView: (viewId: string | null) => {
    set({ selectedViewId: viewId });

    if (viewId) {
      get().fetchViewMessages(viewId);
    }
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedViewId: null });
  },

  // Update a view in the store
  updateViewInStore: (viewId: string, updates: Partial<DynamicView>) => {
    set({
      views: get().views.map(v =>
        v.id === viewId ? { ...v, ...updates } : v
      ),
    });
  },

  // Add a message to a view (for live updates)
  addMessageToView: (viewId: string, message: CollectedMessage) => {
    const { messagesByView, views } = get();
    const existingMessages = messagesByView[viewId] || [];

    // Don't add if already exists
    if (existingMessages.some(m => m.id === message.id)) return;

    // Add message and sort by timestamp
    const newMessages = [...existingMessages, message].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Update message count in view
    const updatedViews = views.map(v =>
      v.id === viewId
        ? { ...v, messageCount: newMessages.length, updatedAt: new Date().toISOString() }
        : v
    );

    set({
      messagesByView: { ...messagesByView, [viewId]: newMessages },
      views: updatedViews,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set creation progress message
  setCreationProgress: (progress: string) => set({ creationProgress: progress }),

  // Clear all views (for reset)
  clearAllViews: async () => {
    try {
      await api.deleteAllDynamicViews();
      set({
        views: [],
        messagesByView: {},
        selectedViewId: null,
      });
    } catch (error) {
      console.error('Failed to clear views:', error);
    }
  },
}));

// Selectors
export const selectViews = (state: DynamicViewState) => state.views;
export const selectSelectedView = (state: DynamicViewState) =>
  state.views.find(v => v.id === state.selectedViewId);
export const selectViewMessages = (viewId: string) => (state: DynamicViewState) =>
  state.messagesByView[viewId] || [];
export const selectIsCreating = (state: DynamicViewState) => state.isCreating;
export const selectCreationProgress = (state: DynamicViewState) => state.creationProgress;
