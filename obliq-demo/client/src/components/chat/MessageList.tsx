import { useEffect, useRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { InlineCalendar } from '../calendar';
import { formatDateDivider, isDifferentDate } from '../../utils/dateUtils';
import type { Message, GroupMember } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  chatId?: string;
  isGroup?: boolean;
  isTyping?: boolean;
  typingName?: string;
  onLoadMore?: () => Promise<boolean>; // Returns true if more messages are available
  hasMoreMessages?: boolean;
  // Calendar props - renders inline with messages
  showCalendar?: boolean;
  calendarGroupName?: string;
  calendarMembers?: GroupMember[];
  calendarScheduledAfterMessageId?: string | null;
  onCalendarSchedule?: () => void;
}

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 60px;
  background-color: #efeae2;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%23d9d4cb' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- House --%3E%3Cpath d='M30 60 L45 45 L60 60 L60 80 L30 80 Z M40 80 L40 70 L50 70 L50 80'/%3E%3C!-- Sun --%3E%3Ccircle cx='320' cy='40' r='12'/%3E%3Cpath d='M320 20 L320 15 M320 60 L320 65 M300 40 L295 40 M340 40 L345 40 M306 26 L302 22 M334 54 L338 58 M306 54 L302 58 M334 26 L338 22'/%3E%3C!-- Flower --%3E%3Ccircle cx='180' cy='360' r='6'/%3E%3Cellipse cx='180' cy='348' rx='4' ry='8'/%3E%3Cellipse cx='192' cy='356' rx='8' ry='4'/%3E%3Cellipse cx='188' cy='370' rx='6' ry='4' transform='rotate(45 188 370)'/%3E%3Cellipse cx='168' cy='356' rx='8' ry='4'/%3E%3Cellipse cx='172' cy='370' rx='6' ry='4' transform='rotate(-45 172 370)'/%3E%3C!-- Drum --%3E%3Cellipse cx='100' cy='200' rx='20' ry='8'/%3E%3Cpath d='M80 200 L80 225 M120 200 L120 225'/%3E%3Cellipse cx='100' cy='225' rx='20' ry='8'/%3E%3Cpath d='M85 200 L85 225 M115 200 L115 225'/%3E%3C!-- Pencil --%3E%3Cpath d='M250 150 L270 130 L275 135 L255 155 Z M250 150 L248 158 L255 155 M270 130 L273 127'/%3E%3C!-- Music note --%3E%3Ccircle cx='50' cy='300' r='6'/%3E%3Cpath d='M56 300 L56 275 L70 270 L70 285'/%3E%3Ccircle cx='70' cy='290' r='5'/%3E%3C!-- Clock --%3E%3Ccircle cx='350' cy='300' r='15'/%3E%3Cpath d='M350 290 L350 300 L358 305'/%3E%3C!-- Smiley --%3E%3Ccircle cx='200' cy='80' r='18'/%3E%3Ccircle cx='194' cy='75' r='2' fill='%23d9d4cb'/%3E%3Ccircle cx='206' cy='75' r='2' fill='%23d9d4cb'/%3E%3Cpath d='M192 86 Q200 94 208 86'/%3E%3C!-- Star --%3E%3Cpath d='M300 200 L303 210 L314 210 L305 217 L308 228 L300 221 L292 228 L295 217 L286 210 L297 210 Z'/%3E%3C!-- Heart --%3E%3Cpath d='M50 140 C50 130 65 130 65 140 C65 130 80 130 80 140 C80 155 65 165 65 165 C65 165 50 155 50 140'/%3E%3C!-- Cloud --%3E%3Cpath d='M140 120 Q130 120 130 130 Q120 130 120 140 Q120 150 135 150 L165 150 Q180 150 180 140 Q180 130 170 130 Q170 115 155 115 Q145 115 140 120'/%3E%3C!-- Balloon --%3E%3Cellipse cx='350' cy='150' rx='12' ry='15'/%3E%3Cpath d='M350 165 L350 175 Q348 180 352 180'/%3E%3C!-- Book --%3E%3Cpath d='M220 250 L220 280 L250 280 L250 250 Z M235 250 L235 280 M225 260 L232 260 M238 260 L245 260 M225 270 L232 270 M238 270 L245 270'/%3E%3C!-- Camera --%3E%3Crect x='130' y='270' width='30' height='22' rx='3'/%3E%3Ccircle cx='145' cy='281' r='7'/%3E%3Crect x='138' y='266' width='14' height='6' rx='1'/%3E%3C!-- Lightning --%3E%3Cpath d='M380 80 L370 100 L378 100 L368 120 L382 95 L374 95 Z'/%3E%3C!-- Envelope --%3E%3Crect x='20' cy='370' y='360' width='30' height='22'/%3E%3Cpath d='M20 362 L35 375 L50 362'/%3E%3C!-- Gift --%3E%3Crect x='280' y='340' width='28' height='25'/%3E%3Cpath d='M280 350 L308 350 M294 340 L294 365'/%3E%3Cpath d='M284 340 Q284 332 294 340 Q304 332 304 340'/%3E%3C!-- Pizza slice --%3E%3Cpath d='M70 230 L90 260 L50 260 Z'/%3E%3Ccircle cx='65' cy='250' r='3' fill='%23d9d4cb'/%3E%3Ccircle cx='78' cy='252' r='2' fill='%23d9d4cb'/%3E%3C!-- Cup --%3E%3Cpath d='M330 230 L335 260 L355 260 L360 230 Z'/%3E%3Cpath d='M360 238 Q372 238 372 248 Q372 258 360 255'/%3E%3C!-- Plane --%3E%3Cpath d='M170 200 L200 190 L195 195 L210 193 L195 200 L200 205 L170 200 M175 200 L175 210'/%3E%3C!-- Rocket --%3E%3Cpath d='M260 60 Q260 45 270 35 Q280 45 280 60 L275 65 L275 75 L270 70 L265 75 L265 65 Z'/%3E%3C!-- Bike --%3E%3Ccircle cx='30' cy='180' r='10'/%3E%3Ccircle cx='60' cy='180' r='10'/%3E%3Cpath d='M30 180 L45 165 L60 180 M45 165 L45 175 L55 175'/%3E%3C!-- Tree --%3E%3Cpath d='M380 180 L380 200 M372 165 L380 150 L388 165 Z M370 175 L380 158 L390 175 Z'/%3E%3C!-- Fish --%3E%3Cellipse cx='130' cy='40' rx='18' ry='10'/%3E%3Cpath d='M110 40 L100 30 L100 50 Z'/%3E%3Ccircle cx='140' cy='38' r='2' fill='%23d9d4cb'/%3E%3C!-- Umbrella --%3E%3Cpath d='M230 320 Q210 320 210 340 Q230 340 230 320 Q250 340 250 320 Q250 340 230 320'/%3E%3Cpath d='M230 320 L230 355 Q230 360 225 360'/%3E%3C!-- Ice cream --%3E%3Ccircle cx='380' cy='360' r='10'/%3E%3Cpath d='M370 365 L380 390 L390 365'/%3E%3C!-- Dots scattered --%3E%3Ccircle cx='15' cy='110' r='2'/%3E%3Ccircle cx='95' cy='90' r='2'/%3E%3Ccircle cx='160' cy='160' r='2'/%3E%3Ccircle cx='240' cy='110' r='2'/%3E%3Ccircle cx='310' cy='120' r='2'/%3E%3Ccircle cx='375' cy='250' r='2'/%3E%3Ccircle cx='25' cy='250' r='2'/%3E%3Ccircle cx='190' cy='290' r='2'/%3E%3Ccircle cx='90' cy='340' r='2'/%3E%3Ccircle cx='320' cy='380' r='2'/%3E%3Ccircle cx='110' cy='140' r='1.5'/%3E%3Ccircle cx='270' cy='290' r='1.5'/%3E%3Ccircle cx='200' cy='200' r='1.5'/%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3Ccircle cx='340' cy='170' r='1.5'/%3E%3C!-- Plus signs --%3E%3Cpath d='M85 25 L85 35 M80 30 L90 30'/%3E%3Cpath d='M225 375 L225 385 M220 380 L230 380'/%3E%3Cpath d='M360 60 L360 70 M355 65 L365 65'/%3E%3Cpath d='M15 320 L15 330 M10 325 L20 325'/%3E%3C!-- Small circles --%3E%3Ccircle cx='145' cy='230' r='4'/%3E%3Ccircle cx='315' cy='260' r='4'/%3E%3Ccircle cx='55' cy='385' r='4'/%3E%3Ccircle cx='395' cy='130' r='4'/%3E%3C/g%3E%3C/svg%3E");

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.scrollbar.track};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.scrollbar.thumb};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.scrollbar.thumbHover};
  }
`;

const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  justify-content: flex-end;
  padding-bottom: 100px;
`;

const DateDivider = styled.div`
  display: flex;
  justify-content: center;
  margin: 12px 0;
`;

const DateBadge = styled.span`
  padding: 5px 12px;
  background-color: ${({ theme }) => theme.bubble.system};
  color: ${({ theme }) => theme.text.secondary};
  font-size: 12.5px;
  border-radius: 7.5px;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 13px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  background-color: ${({ theme }) => theme.accent.lightGreen};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '💬';
    font-size: 48px;
  }
`;

const EmptyTitle = styled.h2`
  font-size: 28px;
  font-weight: 300;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  max-width: 400px;
  line-height: 1.6;
`;

const CalendarWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 15px 0;
`;

function shouldShowDateDivider(currentMessage: Message, previousMessage?: Message): boolean {
  if (!previousMessage) return true;
  return isDifferentDate(previousMessage.timestamp, currentMessage.timestamp);
}

export function MessageList({
  messages,
  chatId,
  isGroup = false,
  isTyping = false,
  typingName,
  onLoadMore,
  hasMoreMessages = false,
  showCalendar = false,
  calendarGroupName,
  calendarMembers = [],
  calendarScheduledAfterMessageId,
  onCalendarSchedule,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const prevScrollHeight = useRef<number>(0);
  const prevMessageCount = useRef(messages.length);
  const prevFirstMessageId = useRef<string | null>(null);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const seenMessageIds = useRef<Set<string>>(new Set());

  // Scroll to bottom utility - immediate, no animation
  const scrollToBottom = useCallback(() => {
    if (listRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      });
    }
  }, []);

  // Track new messages for typewriter effect
  useEffect(() => {
    const currentFirstMessageId = messages.length > 0 ? messages[0].id : null;
    const chatSwitched = currentFirstMessageId !== prevFirstMessageId.current;

    if (chatSwitched) {
      // Chat switched - reset seen messages, mark all as seen (not new)
      seenMessageIds.current = new Set(messages.map(m => m.id));
      setNewMessageIds(new Set());
      prevFirstMessageId.current = currentFirstMessageId;
      prevMessageCount.current = messages.length;
      scrollToBottom();
    } else {
      // Find newly added messages
      const newIds: string[] = [];
      messages.forEach(m => {
        if (!seenMessageIds.current.has(m.id)) {
          newIds.push(m.id);
          seenMessageIds.current.add(m.id);
        }
      });

      if (newIds.length > 0) {
        setNewMessageIds(new Set(newIds));
        prevMessageCount.current = messages.length;
        scrollToBottom();

        // Clear new status after animation completes (e.g., 10 seconds for typewriter)
        setTimeout(() => {
          setNewMessageIds(prev => {
            const updated = new Set(prev);
            newIds.forEach(id => updated.delete(id));
            return updated;
          });
        }, 10000);
      } else {
        prevMessageCount.current = messages.length;
      }
    }
  }, [messages, scrollToBottom]);

  // Scroll to bottom when chat changes
  useEffect(() => {
    if (chatId) {
      // Use multiple requestAnimationFrame calls to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });
    }
  }, [chatId, scrollToBottom]);

  // Scroll to bottom when typing indicator appears
  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping, scrollToBottom]);

  // Scroll to bottom when calendar appears
  useEffect(() => {
    if (showCalendar) {
      scrollToBottom();
    }
  }, [showCalendar, scrollToBottom]);

  // Handle infinite scroll - load more when scrolling to top
  const handleScroll = useCallback(async () => {
    if (!listRef.current || !onLoadMore || isLoadingMore || !hasMoreMessages) return;

    const { scrollTop } = listRef.current;

    // Trigger load when scrolled near the top (within 100px)
    if (scrollTop < 100) {
      setIsLoadingMore(true);
      prevScrollHeight.current = listRef.current.scrollHeight;

      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);

        // Maintain scroll position after loading more messages
        if (listRef.current) {
          const newScrollHeight = listRef.current.scrollHeight;
          const scrollDiff = newScrollHeight - prevScrollHeight.current;
          listRef.current.scrollTop = scrollDiff;
        }
      }
    }
  }, [onLoadMore, isLoadingMore, hasMoreMessages]);

  // Attach scroll listener
  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (messages.length === 0 && !isTyping) {
    return (
      <ListContainer ref={listRef}>
        <EmptyState>
          <EmptyIcon />
          <EmptyTitle>Start a conversation</EmptyTitle>
          <EmptyText>
            Send and receive messages. Your personal messages are end-to-end encrypted.
          </EmptyText>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer ref={listRef}>
      <MessagesWrapper>
        {isLoadingMore && (
          <LoadingIndicator>Loading earlier messages...</LoadingIndicator>
        )}
        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : undefined;
          const showDateDivider = shouldShowDateDivider(message, previousMessage);
          // Show calendar after this message if it's the scheduled position
          const showCalendarAfterThisMessage = showCalendar &&
            calendarScheduledAfterMessageId === message.id &&
            calendarMembers.length > 0 &&
            calendarGroupName;

          return (
            <div key={message.id}>
              {showDateDivider && (
                <DateDivider>
                  <DateBadge>{formatDateDivider(message.timestamp)}</DateBadge>
                </DateDivider>
              )}
              <MessageBubble
                message={message}
                showSenderName={isGroup && message.senderId !== null}
                senderName={message.senderId || undefined}
                isNew={newMessageIds.has(message.id)}
              />
              {showCalendarAfterThisMessage && (
                <CalendarWrapper>
                  <InlineCalendar
                    groupName={calendarGroupName}
                    members={calendarMembers}
                    onSchedule={onCalendarSchedule}
                  />
                </CalendarWrapper>
              )}
            </div>
          );
        })}
        {/* Show calendar at the end if it's open but not yet scheduled */}
        {showCalendar && !calendarScheduledAfterMessageId && calendarMembers.length > 0 && calendarGroupName && (
          <CalendarWrapper>
            <InlineCalendar
              groupName={calendarGroupName}
              members={calendarMembers}
              onSchedule={onCalendarSchedule}
            />
          </CalendarWrapper>
        )}
        {isTyping && <TypingIndicator senderName={isGroup ? typingName : undefined} />}
      </MessagesWrapper>
    </ListContainer>
  );
}
