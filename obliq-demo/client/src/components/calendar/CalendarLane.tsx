import styled from 'styled-components';
import type { CalendarMember } from './calendarData';
import { utcToLocal, formatHour, hasMeetingAt, isBusinessHour } from './calendarData';

interface CalendarLaneProps {
  member: CalendarMember;
  selectedUtcHour: number | null;
  commonAvailableSlots: number[];
  onSlotClick: (utcHour: number) => void;
  displayHoursUtc: number[];
}

const LaneContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 156px;
  flex: 1;
  background-color: #f8fafc;
`;

const LaneHeader = styled.div`
  padding: 13px 8px;
  text-align: center;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 2;
`;

const MemberName = styled.div`
  font-weight: 600;
  font-size: 17px;
  color: #1e293b;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CountryName = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const SlotsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TimeSlot = styled.div<{
  $isBusy: boolean;
  $isAvailable: boolean;
  $isSelected: boolean;
  $isOutsideHours: boolean;
}>`
  height: 57px;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid #e2e8f0;
  cursor: ${({ $isAvailable }) => ($isAvailable ? 'pointer' : 'default')};
  transition: all 0.15s ease;
  background-color: #f8fafc;

  ${({ $isSelected, $isAvailable, $isBusy, $isOutsideHours }) => {
    if ($isSelected) {
      return `
        background-color: #dcfce7;
        border: 2px solid #22c55e;
        margin: -1px;
      `;
    }
    if ($isBusy) {
      return `
        background-color: #fee2e2;
      `;
    }
    if ($isOutsideHours) {
      return `
        background-color: #f1f5f9;
        opacity: 0.6;
      `;
    }
    if ($isAvailable) {
      return `
        background-color: #dcfce7;
        &:hover {
          background-color: #bbf7d0;
        }
      `;
    }
    return '';
  }}
`;

const LocalTime = styled.div`
  font-size: 13px;
  color: #64748b;
`;

const MeetingBlock = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #dc2626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AvailableLabel = styled.div`
  font-size: 13px;
  color: #16a34a;
  font-weight: 600;
`;

export function CalendarLane({
  member,
  selectedUtcHour,
  commonAvailableSlots,
  onSlotClick,
  displayHoursUtc,
}: CalendarLaneProps) {
  return (
    <LaneContainer>
      <LaneHeader>
        <MemberName>{member.name}</MemberName>
        <CountryName>({member.country})</CountryName>
      </LaneHeader>
      <SlotsContainer>
        {displayHoursUtc.map((utcHour) => {
          const localHour = utcToLocal(utcHour, member.utcOffset);
          const meeting = hasMeetingAt(member, utcHour);
          const isBusy = meeting !== null;
          const isInBusinessHours = isBusinessHour(utcHour, member.utcOffset);
          const isCommonAvailable = commonAvailableSlots.includes(utcHour);
          const isSelected = selectedUtcHour === utcHour;

          return (
            <TimeSlot
              key={utcHour}
              $isBusy={isBusy}
              $isAvailable={isCommonAvailable}
              $isSelected={isSelected}
              $isOutsideHours={!isInBusinessHours}
              onClick={() => {
                if (isCommonAvailable) {
                  onSlotClick(utcHour);
                }
              }}
            >
              <LocalTime>{formatHour(localHour)}</LocalTime>
              {isBusy && <MeetingBlock title={meeting.title}>{meeting.title}</MeetingBlock>}
              {!isBusy && isCommonAvailable && <AvailableLabel>Available</AvailableLabel>}
            </TimeSlot>
          );
        })}
      </SlotsContainer>
    </LaneContainer>
  );
}
