import { useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { useAIResponse } from './useAIResponse';
import { useLiveViewMatching } from './useLiveViewMatching';
import * as api from '../utils/api';

export function useSendMessage() {
  const sendMessageAction = useChatStore((state) => state.sendMessage);
  const isSending = useChatStore((state) => state.isSendingMessage);
  const resetStore = useChatStore((state) => state.resetStore);
  const showToast = useUIStore((state) => state.showToast);
  const getTranslationInfo = useChatStore((state) => state.getTranslationInfo);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const { triggerAIResponse } = useAIResponse();
  const { checkMessageAgainstViews } = useLiveViewMatching();

  const sendMessage = useCallback(
    async (chatId: string, content: string) => {
      const trimmedContent = content.trim().toLowerCase();

      // Handle /reset command
      if (trimmedContent === '/reset') {
        showToast('Resetting demo to initial state...', 'info');
        await resetStore();
        showToast('Demo reset to initial state', 'success');
        return null;
      }

      // Handle /translate command - should be intercepted by MessageInput, but safety net here
      if (trimmedContent === '/translate') {
        // Don't send as a message - this should have been handled by MessageInput
        return null;
      }

      // Check if translation is enabled for this chat
      const translationInfo = getTranslationInfo(chatId);

      const message = await sendMessageAction(chatId, content);

      // If translation is enabled, translate the message
      if (message && translationInfo?.enabled) {
        // Show "Translating..." indicator
        updateMessage(message.id, { isTranslating: true });

        try {
          if (translationInfo.isTriLingual && translationInfo.triLingualLanguages) {
            // Tri-lingual mode: translate from English to both Japanese and French in parallel
            const langs = translationInfo.triLingualLanguages.filter(l => l !== 'en');

            // Translate to both languages in parallel to cut time in half
            const [translation1, translation2] = await Promise.all([
              api.translateText(content, langs[0], 'en'),
              api.translateText(content, langs[1], 'en'),
            ]);

            // Update message with both translations (clears isTranslating)
            updateMessage(message.id, {
              translatedContent: translation1.translatedText,
              originalLanguage: 'en',
              targetLanguage: langs[0],
              secondTranslatedContent: translation2.translatedText,
              secondTargetLanguage: langs[1],
              isTranslating: false,
            });
          } else {
            // Standard bi-lingual mode
            const translation = await api.translateText(
              content,
              translationInfo.targetLanguage,
              'en'
            );

            // Update message with translation (clears isTranslating)
            updateMessage(message.id, {
              translatedContent: translation.translatedText,
              originalLanguage: 'en',
              targetLanguage: translationInfo.targetLanguage,
              isTranslating: false,
            });
          }
        } catch (error) {
          console.error('Translation error:', error);
          // Clear translating state on error
          updateMessage(message.id, { isTranslating: false });
        }
      }

      // Trigger AI response after sending message
      if (message) {
        // Don't await - let it run in background
        // Pass translation info to AI response for translation of reply
        triggerAIResponse(chatId, content, message.id);

        // Check if the sent message matches any live dynamic views
        // Run in background - don't await
        checkMessageAgainstViews(message.id);
      }

      return message;
    },
    [sendMessageAction, resetStore, showToast, getTranslationInfo, updateMessage, triggerAIResponse, checkMessageAgainstViews]
  );

  return {
    sendMessage,
    isSending,
  };
}
