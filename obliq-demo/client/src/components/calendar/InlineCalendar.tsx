import styled from 'styled-components';
import { useState, useMemo } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarLane } from './CalendarLane';
import {
  generateCalendarData,
  findCommonAvailableSlots,
  generateMeetingTitle,
  formatHour,
  utcToLocal,
  formatCalendarDate,
} from './calendarData';
import type { GroupMember } from '../../types/chat';

interface InlineCalendarProps {
  groupName: string;
  members: GroupMember[];
  onSchedule?: () => void;
}

const CalendarContainer = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 1040px;
  margin: 10px 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 21px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
`;

const CalendarIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background-color: #00a884;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 23px;
    height: 23px;
    color: white;
  }
`;

const HeaderTitle = styled.div`
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 3px 0;
  }

  p {
    font-size: 16px;
    color: #64748b;
    margin: 0;
  }
`;

const DateNavigationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 21px;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
`;

const DateDisplay = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  flex: 1;
`;

const NavButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NavButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }

  &:active {
    background-color: #f1f5f9;
  }

  svg {
    width: 23px;
    height: 23px;
    color: #64748b;
  }
`;

const CalendarBody = styled.div`
  display: flex;
  max-height: 520px;
  overflow: hidden;
`;

const TimeAxis = styled.div`
  width: 65px;
  flex-shrink: 0;
  background-color: #f1f5f9;
  display: flex;
  flex-direction: column;
`;

const TimeAxisHeader = styled.div`
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const TimeAxisSlot = styled.div`
  height: 57px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
`;

const LanesContainer = styled.div`
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const Footer = styled.div`
  padding: 16px 21px;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SelectedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const SelectedBadge = styled.div`
  background-color: #dcfce7;
  border: 1px solid #22c55e;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
    color: #16a34a;
  }
`;

const SelectedText = styled.div`
  h4 {
    font-size: 17px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }
`;

const NoSelection = styled.div`
  font-size: 16px;
  color: #64748b;
`;

const ScheduleButton = styled.button<{ $disabled: boolean }>`
  padding: 10px 21px;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 600;
  background-color: ${({ $disabled }) => ($disabled ? '#e2e8f0' : '#00a884')};
  color: ${({ $disabled }) => ($disabled ? '#94a3b8' : 'white')};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  transition: opacity 0.15s ease;

  &:hover {
    opacity: ${({ $disabled }) => ($disabled ? 1 : 0.9)};
  }
`;

export function InlineCalendar({
  groupName,
  members,
  onSchedule,
}: InlineCalendarProps) {
  const [selectedUtcHour, setSelectedUtcHour] = useState<number | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);

  // Generate calendar data for all members for the current day
  const calendarMembers = useMemo(() => {
    const memberData = members.map((m) => ({
      id: m.memberId,
      name: m.member.name,
    }));
    return generateCalendarData(memberData, dayOffset);
  }, [members, dayOffset]);

  // Format the current date for display
  const currentDateDisplay = useMemo(() => {
    return formatCalendarDate(dayOffset);
  }, [dayOffset]);

  const handlePreviousDay = () => {
    setDayOffset((prev) => prev - 1);
    // Clear selection when changing days (unless already scheduled)
    if (!isScheduled) {
      setSelectedUtcHour(null);
    }
  };

  const handleNextDay = () => {
    setDayOffset((prev) => prev + 1);
    // Clear selection when changing days (unless already scheduled)
    if (!isScheduled) {
      setSelectedUtcHour(null);
    }
  };

  // Find common available slots
  const commonAvailableSlots = useMemo(() => {
    return findCommonAvailableSlots(calendarMembers);
  }, [calendarMembers]);

  // Display hours range (business hours 8am-8pm in "You" timezone which is UTC-5)
  const displayHoursUtc = useMemo(() => {
    const youOffset = calendarMembers[0]?.utcOffset || -5;
    const hours: number[] = [];
    for (let localHour = 8; localHour < 20; localHour++) {
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
      onSchedule?.();
    }
  };

  // Get the local time display for selected slot
  const selectedLocalTime = selectedUtcHour !== null
    ? formatHour(utcToLocal(selectedUtcHour, calendarMembers[0].utcOffset))
    : null;

  return (
    <CalendarContainer>
      <Header>
        <HeaderLeft>
          <CalendarIcon>
            <Calendar />
          </CalendarIcon>
          <HeaderTitle>
            <h3>Find a Time</h3>
            <p>{groupName} - {calendarMembers.length} participants</p>
          </HeaderTitle>
        </HeaderLeft>
      </Header>

      <DateNavigationBar>
        <NavButtonGroup>
          <NavButton onClick={handlePreviousDay}>
            <ChevronLeft />
          </NavButton>
        </NavButtonGroup>
        <DateDisplay>{currentDateDisplay}</DateDisplay>
        <NavButtonGroup>
          <NavButton onClick={handleNextDay}>
            <ChevronRight />
          </NavButton>
        </NavButtonGroup>
      </DateNavigationBar>

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
            <NoSelection>Click on a green slot to select a meeting time</NoSelection>
          )}
        </SelectedInfo>
        <ScheduleButton
          $disabled={selectedUtcHour === null || isScheduled}
          onClick={handleSchedule}
        >
          {isScheduled ? 'Scheduled!' : 'Schedule'}
        </ScheduleButton>
      </Footer>
    </CalendarContainer>
  );
}
