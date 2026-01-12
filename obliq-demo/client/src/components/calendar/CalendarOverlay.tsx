import styled from 'styled-components';
import { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { CalendarLane } from './CalendarLane';
import {
  generateCalendarData,
  findCommonAvailableSlots,
  generateMeetingTitle,
  formatHour,
  utcToLocal,
} from './calendarData';
import type { GroupMember } from '../../types/chat';

interface CalendarOverlayProps {
  groupId: string;
  groupName: string;
  members: GroupMember[];
  onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 50px;
`;

const CalendarContainer = styled.div`
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 20px;
  width: 90%;
  max-width: 1600px;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.light};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CalendarIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.accent.primary};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 22px;
    height: 22px;
    color: white;
  }
`;

const HeaderTitle = styled.div`
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.text.primary};
    margin: 0 0 2px 0;
  }

  p {
    font-size: 13px;
    color: ${({ theme }) => theme.text.secondary};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.hover.light};
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.icon.secondary};
  }
`;

const CalendarBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const TimeAxis = styled.div`
  width: 60px;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-right: 1px solid ${({ theme }) => theme.border.light};
  display: flex;
  flex-direction: column;
`;

const TimeAxisHeader = styled.div`
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.light};
`;

const TimeAxisSlot = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.light};
`;

const LanesContainer = styled.div`
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
`;

const Footer = styled.div`
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-top: 1px solid ${({ theme }) => theme.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
`;

const SelectedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SelectedBadge = styled.div`
  background-color: ${({ theme }) => theme.accent.primary}22;
  border: 1px solid ${({ theme }) => theme.accent.primary};
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.accent.primary};
  }
`;

const SelectedText = styled.div`
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.text.primary};
    margin: 0 0 2px 0;
  }

  p {
    font-size: 12px;
    color: ${({ theme }) => theme.text.secondary};
    margin: 0;
  }
`;

const NoSelection = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
`;

const ScheduleButton = styled.button<{ $disabled: boolean }>`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background-color: ${({ theme, $disabled }) =>
    $disabled ? theme.bg.tertiary || '#e0e0e0' : theme.accent.primary};
  color: ${({ $disabled }) => ($disabled ? '#999' : 'white')};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  transition: opacity 0.15s ease;

  &:hover {
    opacity: ${({ $disabled }) => ($disabled ? 1 : 0.9)};
  }
`;

export function CalendarOverlay({
  groupName,
  members,
  onClose,
}: CalendarOverlayProps) {
  const [selectedUtcHour, setSelectedUtcHour] = useState<number | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);

  // Generate calendar data for all members
  const calendarMembers = useMemo(() => {
    const memberData = members.map((m) => ({
      id: m.memberId,
      name: m.member.name,
    }));
    return generateCalendarData(memberData);
  }, [members]);

  // Find common available slots
  const commonAvailableSlots = useMemo(() => {
    return findCommonAvailableSlots(calendarMembers);
  }, [calendarMembers]);

  // Display hours range (business hours 8am-8pm in "You" timezone which is UTC-5)
  // So we show UTC hours 13-25 (which is 1pm-1am UTC, or 8am-8pm EST)
  const displayHoursUtc = useMemo(() => {
    // Show hours that cover 8am-8pm for the first member (You in EST)
    const youOffset = calendarMembers[0]?.utcOffset || -5;
    const hours: number[] = [];
    for (let localHour = 8; localHour < 20; localHour++) {
      // Convert local hour to UTC
      const utcHour = (localHour - youOffset + 24) % 24;
      hours.push(utcHour);
    }
    return hours;
  }, [calendarMembers]);

  // Generate meeting title
  const meetingTitle = useMemo(() => {
    const names = calendarMembers.map((m) => m.name);
    return generateMeetingTitle(names);
  }, [calendarMembers]);

  const handleSlotClick = (utcHour: number) => {
    setSelectedUtcHour(utcHour);
    setIsScheduled(false);
  };

  const handleSchedule = () => {
    if (selectedUtcHour !== null) {
      setIsScheduled(true);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Get the local time display for selected slot
  const selectedLocalTime = selectedUtcHour !== null
    ? formatHour(utcToLocal(selectedUtcHour, calendarMembers[0].utcOffset))
    : null;

  return (
    <Overlay onClick={onClose}>
      <CalendarContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <CalendarIcon>
              <Calendar />
            </CalendarIcon>
            <HeaderTitle>
              <h2>Find a Time</h2>
              <p>{groupName} - {calendarMembers.length} participants</p>
            </HeaderTitle>
          </HeaderLeft>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>

        <CalendarBody>
          <TimeAxis>
            <TimeAxisHeader>UTC</TimeAxisHeader>
            {displayHoursUtc.map((utcHour) => (
              <TimeAxisSlot key={utcHour}>{formatHour(utcHour)}</TimeAxisSlot>
            ))}
          </TimeAxis>
          <LanesContainer>
            {calendarMembers.map((member) => (
              <CalendarLane
                key={member.id}
                member={member}
                selectedUtcHour={selectedUtcHour}
                commonAvailableSlots={commonAvailableSlots}
                onSlotClick={handleSlotClick}
                displayHoursUtc={displayHoursUtc}
              />
            ))}
          </LanesContainer>
        </CalendarBody>

        <Footer>
          <SelectedInfo>
            {selectedUtcHour !== null ? (
              <SelectedBadge>
                {isScheduled ? <Check /> : <Calendar />}
                <SelectedText>
                  <h4>{isScheduled ? 'Scheduled!' : meetingTitle}</h4>
                  <p>{selectedLocalTime} (your time)</p>
                </SelectedText>
              </SelectedBadge>
            ) : (
              <NoSelection>Click on an available slot (green) to select a meeting time</NoSelection>
            )}
          </SelectedInfo>
          <ScheduleButton
            $disabled={selectedUtcHour === null || isScheduled}
            onClick={handleSchedule}
          >
            {isScheduled ? 'Scheduled!' : 'Schedule Meeting'}
          </ScheduleButton>
        </Footer>
      </CalendarContainer>
    </Overlay>
  );
}
