import { useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useDynamicViewStore } from '../store/dynamicViewStore';
import { useUIStore } from '../store/uiStore';
import * as api from '../utils/api';
import { transformMessage, transformViewMessageFromApi, type Message } from '../types/chat';

export function useAIResponse() {
  const setTyping = useChatStore((state) => state.setTyping);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const getTranslationInfo = useChatStore((state) => state.getTranslationInfo);
  const showToast = useUIStore((state) => state.showToast);

  // Track pending responses to prevent duplicates
  const pendingResponses = useRef<Set<string>>(new Set());

  const triggerAIResponse = useCallback(
    async (chatId: string, userMessage: string, userMessageId: string) => {
      // Prevent duplicate triggers for the same message
      if (pendingResponses.current.has(userMessageId)) {
        return;
      }
      pendingResponses.current.add(userMessageId);

      try {
        // Update our message status immediately
        updateMessage(userMessageId, { status: 'delivered' });
        updateMessage(userMessageId, { status: 'read' });

        // Select who will respond (for groups, this picks a random member)
        const responder = await api.selectResponder(chatId);

        // Wait 2 seconds before showing typing indicator
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Show typing indicator and start generating AI response in parallel
        setTyping(chatId, true, responder.responderName);

        // Run both in parallel: 2-second typing animation and AI response generation
        const [aiMessageApi] = await Promise.all([
          api.generateAIResponse(chatId, userMessage, responder.responderId),
          new Promise(resolve => setTimeout(resolve, 2000)), // Minimum 2-second typing animation
        ]);

        // Transform the AI message (keep typing indicator visible during translation)
        let aiMessage: Message = transformMessage(aiMessageApi);

        // Check if translation is enabled and translate the AI response
        const translationInfo = getTranslationInfo(chatId);
        if (translationInfo?.enabled && aiMessageApi.content) {
          try {
            if (translationInfo.isTriLingual && translationInfo.triLingualLanguages) {
              // Tri-lingual mode: AI responds in their native language
              // We need to translate to the other two languages
              // Detect responder's language based on their ID
              const responderLang = responder.responderId?.includes('yuki') ? 'ja' :
                                   responder.responderId?.includes('pierre') ? 'fr' : 'en';

              // Get the other two languages to translate to
              const otherLangs = translationInfo.triLingualLanguages.filter(l => l !== responderLang);

              // Translate to both languages in parallel to cut time in half
              const [translation1, translation2] = await Promise.all([
                api.translateText(aiMessageApi.content, otherLangs[0], responderLang),
                api.translateText(aiMessageApi.content, otherLangs[1], responderLang),
              ]);

              // Add both translations to the message
              aiMessage = {
                ...aiMessage,
                translatedContent: translation1.translatedText,
                originalLanguage: responderLang,
                targetLanguage: otherLangs[0],
                secondTranslatedContent: translation2.translatedText,
                secondTargetLanguage: otherLangs[1],
              };
            } else {
              // Standard bi-lingual mode
              // Translate from contact's language to English
              const translation = await api.translateText(
                aiMessageApi.content,
                'en', // Target: English
                translationInfo.targetLanguage // Source: contact's language (ja, fr, etc.)
              );

              // Add translation to the message
              aiMessage = {
                ...aiMessage,
                translatedContent: translation.translatedText,
                originalLanguage: translationInfo.targetLanguage,
                targetLanguage: 'en',
              };
            }
          } catch (error) {
            console.error('Translation error for AI response:', error);
          }
        }

        // Hide typing indicator and show message simultaneously
        setTyping(chatId, false);
        addMessage(aiMessage);

        // Update chat's last message in the store
        useChatStore.setState((state) => ({
          chats: state.chats.map((c) =>
            c.contactId === chatId
              ? { ...c, lastMessage: aiMessage, updatedAt: aiMessage.timestamp }
              : c
          ),
        }));

        // Check if the AI message matches any live dynamic views
        // Use getState() to avoid stale closures
        const { views, addMessageToView } = useDynamicViewStore.getState();
        const liveViews = views.filter((v) => v.isLive);
        if (liveViews.length > 0) {
          try {
            const result = await api.checkMessageAgainstViews(aiMessage.id);
            if (result.checked && result.matchedViews.length > 0) {
              for (const match of result.matchedViews) {
                // Transform and add the message to the view
                const collectedMessage = transformViewMessageFromApi(match.viewMessage);
                addMessageToView(match.viewId, collectedMessage);
                showToast(`New message added to "${match.viewName}"`, 'info');
              }
            }
          } catch (viewError) {
            console.error('Error checking AI message against views:', viewError);
          }
        }
      } catch (error) {
        console.error('Error triggering AI response:', error);
        setTyping(chatId, false);
      } finally {
        pendingResponses.current.delete(userMessageId);
      }
    },
    [setTyping, addMessage, updateMessage, getTranslationInfo, showToast]
  );

  return { triggerAIResponse };
}
