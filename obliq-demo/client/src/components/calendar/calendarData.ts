// Calendar data utilities for timezone-synced group scheduling

export interface CalendarMeeting {
  id: string;
  title: string;
  startHour: number; // UTC hour (0-23)
  duration: number;  // hours
}

export interface CalendarMember {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  utcOffset: number; // hours from UTC
  meetings: CalendarMeeting[];
}

// Country/timezone data with UTC offsets - each with unique offset for diversity
// Max 2 countries can share the same timezone
const TIMEZONE_DATA = [
  { country: 'United States', countryCode: 'US', utcOffset: -5 },   // EST
  { country: 'United Kingdom', countryCode: 'GB', utcOffset: 0 },   // GMT
  { country: 'Germany', countryCode: 'DE', utcOffset: 1 },          // CET
  { country: 'Brazil', countryCode: 'BR', utcOffset: -3 },          // BRT
  { country: 'India', countryCode: 'IN', utcOffset: 5.5 },          // IST
  { country: 'Japan', countryCode: 'JP', utcOffset: 9 },            // JST
  { country: 'Australia', countryCode: 'AU', utcOffset: 10 },       // AEST
  { country: 'Mexico', countryCode: 'MX', utcOffset: -6 },          // CST
  { country: 'UAE', countryCode: 'AE', utcOffset: 4 },              // GST
  { country: 'South Africa', countryCode: 'ZA', utcOffset: 2 },     // SAST
];

// Demo meeting titles
const MEETING_TITLES = [
  'Team Standup',
  'Project Review',
  'Client Call',
  'Design Review',
  'Sprint Planning',
  'Lunch',
  '1:1 Meeting',
  'Code Review',
  'Strategy Session',
  'Budget Review',
  'Kickoff Meeting',
  'Retrospective',
];

// Seeded random number generator for consistent results
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Track country usage to ensure diversity (max 2 per country)
// This is reset for each calendar generation
let countryUsageMap: Map<string, number> = new Map();

// Reset country usage tracking (call at start of generateCalendarData)
function resetCountryUsage(): void {
  countryUsageMap = new Map();
}

// Mark a country as used
function markCountryUsed(countryCode: string): void {
  countryUsageMap.set(countryCode, (countryUsageMap.get(countryCode) || 0) + 1);
}

// Check if a country can still be used (max 2 per country)
function canUseCountry(countryCode: string): boolean {
  return (countryUsageMap.get(countryCode) || 0) < 2;
}

// Assign country to a member, ensuring diversity
// Returns a timezone that hasn't been used more than once (preferably unique)
function getTimezoneForMember(memberId: string, preferUnique: boolean = true): typeof TIMEZONE_DATA[0] {
  // Generate a hash-based starting index
  let hash = 0;
  for (let i = 0; i < memberId.length; i++) {
    hash = ((hash << 5) - hash) + memberId.charCodeAt(i);
    hash = hash & hash;
  }
  const startIndex = Math.abs(hash) % TIMEZONE_DATA.length;

  // First pass: try to find an unused country
  if (preferUnique) {
    for (let i = 0; i < TIMEZONE_DATA.length; i++) {
      const index = (startIndex + i) % TIMEZONE_DATA.length;
      const tz = TIMEZONE_DATA[index];
      if ((countryUsageMap.get(tz.countryCode) || 0) === 0) {
        return tz;
      }
    }
  }

  // Second pass: find any country that can still be used (under max of 2)
  for (let i = 0; i < TIMEZONE_DATA.length; i++) {
    const index = (startIndex + i) % TIMEZONE_DATA.length;
    const tz = TIMEZONE_DATA[index];
    if (canUseCountry(tz.countryCode)) {
      return tz;
    }
  }

  // Fallback: just use the hash-based index (shouldn't happen with 10 countries and ~5 members)
  return TIMEZONE_DATA[startIndex];
}

// Generate demo meetings for a member, avoiding the protected slot
// dayOffset creates different meetings for different days
function generateMeetingsForMember(
  memberId: string,
  utcOffset: number,
  protectedUtcHour: number,
  dayOffset: number = 0
): CalendarMeeting[] {
  // Include dayOffset in the seed so different days have different meetings
  const seed = memberId.charCodeAt(0) + memberId.length + (dayOffset * 1000);
  const rand = seededRandom(seed);
  const meetings: CalendarMeeting[] = [];

  // Each member gets 5-8 meetings (more than before)
  const numMeetings = 5 + Math.floor(rand() * 4);
  const usedSlots = new Set<number>();

  // Protect the guaranteed available slot
  usedSlots.add(protectedUtcHour);

  let attempts = 0;
  while (meetings.length < numMeetings && attempts < 30) {
    attempts++;
    const titleIndex = Math.floor(rand() * MEETING_TITLES.length);
    // Create meetings during local business hours (8am-6pm)
    const localHour = 8 + Math.floor(rand() * 10);
    const utcHour = (localHour - utcOffset + 24) % 24;

    // Skip if slot already used or is the protected slot
    if (usedSlots.has(utcHour)) continue;
    usedSlots.add(utcHour);

    meetings.push({
      id: `meeting-${memberId}-${dayOffset}-${meetings.length}`,
      title: MEETING_TITLES[titleIndex],
      startHour: utcHour,
      duration: 1,
    });
  }

  return meetings.sort((a, b) => a.startHour - b.startHour);
}

// Find a UTC hour that works as business hours for all members
// The hour varies by day to show different available slots
function findGuaranteedAvailableHour(_members: { id: string; name: string }[], dayOffset: number = 0): number {
  // For members with US/Europe timezones, UTC 13:00-17:00 range usually works
  // We vary the slot based on day offset to show different times on different days
  const baseHours = [13, 14, 15, 16, 17];
  const index = ((dayOffset % baseHours.length) + baseHours.length) % baseHours.length;
  return baseHours[index];
}

// Generate calendar data for all members including "You"
// dayOffset: 0 = today, 1 = tomorrow, -1 = yesterday, etc.
export function generateCalendarData(
  members: { id: string; name: string }[],
  dayOffset: number = 0
): CalendarMember[] {
  const calendarMembers: CalendarMember[] = [];

  // Reset country usage tracking for this generation
  resetCountryUsage();

  // Calculate the guaranteed available hour first (varies by day)
  const protectedHour = findGuaranteedAvailableHour(members, dayOffset);

  // "You" is always first, always in US
  markCountryUsed('US');
  calendarMembers.push({
    id: 'you',
    name: 'You',
    country: 'United States',
    countryCode: 'US',
    utcOffset: -5, // EST
    meetings: generateMeetingsForMember('you', -5, protectedHour, dayOffset),
  });

  // Add each group member with their assigned timezone (ensuring diversity)
  for (const member of members) {
    const tz = getTimezoneForMember(member.id);
    markCountryUsed(tz.countryCode);
    calendarMembers.push({
      id: member.id,
      name: member.name,
      country: tz.country,
      countryCode: tz.countryCode,
      utcOffset: tz.utcOffset,
      meetings: generateMeetingsForMember(member.id, tz.utcOffset, protectedHour, dayOffset),
    });
  }

  return calendarMembers;
}

// Convert UTC hour to local hour for display
export function utcToLocal(utcHour: number, utcOffset: number): number {
  return (utcHour + utcOffset + 24) % 24;
}

// Convert local hour to UTC
export function localToUtc(localHour: number, utcOffset: number): number {
  return (localHour - utcOffset + 24) % 24;
}

// Check if a UTC hour falls within business hours (8am-8pm) for a given timezone
export function isBusinessHour(utcHour: number, utcOffset: number): boolean {
  const localHour = utcToLocal(utcHour, utcOffset);
  return localHour >= 8 && localHour < 20;
}

// Check if a member has a meeting at a given UTC hour
export function hasMeetingAt(member: CalendarMember, utcHour: number): CalendarMeeting | null {
  for (const meeting of member.meetings) {
    if (utcHour >= meeting.startHour && utcHour < meeting.startHour + meeting.duration) {
      return meeting;
    }
  }
  return null;
}

// Find common available slots (UTC hours where everyone is free and in business hours)
export function findCommonAvailableSlots(members: CalendarMember[]): number[] {
  const availableSlots: number[] = [];

  // Check each hour of the day
  for (let utcHour = 0; utcHour < 24; utcHour++) {
    let isAvailable = true;

    for (const member of members) {
      // Must be business hours for this member
      if (!isBusinessHour(utcHour, member.utcOffset)) {
        isAvailable = false;
        break;
      }

      // Must not have a meeting
      if (hasMeetingAt(member, utcHour)) {
        isAvailable = false;
        break;
      }
    }

    if (isAvailable) {
      availableSlots.push(utcHour);
    }
  }

  return availableSlots;
}

// Format hour for display (e.g., "9:00 AM", "2:00 PM")
export function formatHour(hour: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:00 ${ampm}`;
}

// Get current UTC hour
export function getCurrentUtcHour(): number {
  return new Date().getUTCHours();
}

// Generate a meeting title from member names
export function generateMeetingTitle(memberNames: string[]): string {
  const names = memberNames.filter(n => n !== 'You');
  if (names.length === 0) return 'Meeting';
  if (names.length === 1) return `Meeting with ${names[0]}`;
  if (names.length === 2) return `Meeting with ${names[0]} & ${names[1]}`;
  const lastIndex = names.length - 1;
  return `Meeting with ${names.slice(0, lastIndex).join(', ')} & ${names[lastIndex]}`;
}

// Format date for calendar header display
export function formatCalendarDate(dayOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();

  if (dayOffset === 0) {
    return `Today, ${dayName}, ${monthName} ${dayNum}`;
  } else if (dayOffset === 1) {
    return `Tomorrow, ${dayName}, ${monthName} ${dayNum}`;
  } else if (dayOffset === -1) {
    return `Yesterday, ${dayName}, ${monthName} ${dayNum}`;
  }

  return `${dayName}, ${monthName} ${dayNum}`;
}
