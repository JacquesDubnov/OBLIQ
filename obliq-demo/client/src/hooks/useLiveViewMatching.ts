import { useCallback } from 'react';
import { useDynamicViewStore } from '../store/dynamicViewStore';
import { useUIStore } from '../store/uiStore';
import { transformViewMessageFromApi } from '../types/chat';
import * as api from '../utils/api';

/**
 * Hook for checking new messages against live dynamic views.
 * When a message matches, it's automatically added to the view.
 */
export function useLiveViewMatching() {
  const showToast = useUIStore((state) => state.showToast);

  /**
   * Check a message against all live views
   * Uses getState() to always get current views, avoiding stale closures
   */
  const checkMessageAgainstViews = useCallback(
    async (messageId: string) => {
      // Get current state directly from store to avoid stale closures
      const { views } = useDynamicViewStore.getState();

      // Skip if no live views to check
      const hasLiveViews = views.some((v) => v.isLive);
      if (!hasLiveViews) {
        return;
      }

      try {
        const result = await api.checkMessageAgainstViews(messageId);

        if (result.checked && result.matchedViews.length > 0) {
          const { addMessageToView } = useDynamicViewStore.getState();

          for (const match of result.matchedViews) {
            const collectedMessage = transformViewMessageFromApi(match.viewMessage);
            addMessageToView(match.viewId, collectedMessage);
            showToast(`New message added to "${match.viewName}"`, 'info');
          }
        }
      } catch (error) {
        console.error('Error checking message against views:', error);
      }
    },
    [showToast]
  );

  return { checkMessageAgainstViews };
}
