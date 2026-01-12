/**
 * Date and timestamp formatting utilities for WhatsApp-style display
 */

// Helper to get midnight date for comparison
function getMidnightDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Helper to format time as HH:mm
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Helper to format short date as D/M/YY
function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

// Date comparison helpers
function isToday(messageDate: Date, today: Date): boolean {
  return getMidnightDate(messageDate).getTime() === getMidnightDate(today).getTime();
}

function isYesterday(messageDate: Date, today: Date): boolean {
  const yesterday = new Date(getMidnightDate(today).getTime() - 24 * 60 * 60 * 1000);
  return getMidnightDate(messageDate).getTime() === yesterday.getTime();
}

/**
 * Format time for message bubbles (HH:mm)
 */
export function formatMessageTime(timestamp: string): string {
  return formatTime(new Date(timestamp));
}

/**
 * Format timestamp for chat list items
 * - Today: HH:mm
 * - Yesterday: "Yesterday"
 * - This week: Day name (Mon, Tue, etc.)
 * - Older: D/M/YY (short format)
 */
export function formatChatListTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = getMidnightDate(now);
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (isToday(date, now)) {
    return formatTime(date);
  }

  if (isYesterday(date, now)) {
    return 'Yesterday';
  }

  if (getMidnightDate(date).getTime() > oneWeekAgo.getTime()) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return formatShortDate(date);
}

/**
 * Format date divider in message list
 * - Today: "Today"
 * - Yesterday: "Yesterday"
 * - Older: D/M/YY (short format)
 */
export function formatDateDivider(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  if (isToday(date, now)) {
    return 'Today';
  }
  if (isYesterday(date, now)) {
    return 'Yesterday';
  }
  return formatShortDate(date);
}

/**
 * Format call duration (seconds to mm:ss or hh:mm:ss)
 */
export function formatCallDuration(seconds: number): string {
  if (seconds < 60) {
    return `0:${seconds.toString().padStart(2, '0')}`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format voice note duration (seconds to m:ss)
 */
export function formatVoiceDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if two timestamps are on different dates
 */
export function isDifferentDate(timestamp1: string, timestamp2: string): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getDate() !== date2.getDate()
  );
}

/**
 * Format date and time for collected messages (D/M/YY HH:mm or Today HH:mm)
 */
export function formatCollectedMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const time = formatTime(date);

  if (isToday(date, now)) {
    return `Today, ${time}`;
  }

  if (isYesterday(date, now)) {
    return `Yesterday, ${time}`;
  }

  return `${formatShortDate(date)}, ${time}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "just now")
 */
export function getRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  return formatDateDivider(timestamp);
}
