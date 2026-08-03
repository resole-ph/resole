/**
 * Timestamp formatting for the inbox.
 *
 * These depend on the viewer's locale and timezone, so they must only ever run
 * in the browser — the server has no idea what either is, and formatting there
 * would both show the wrong time and mismatch on hydration. Render them through
 * `<LocalTime>` rather than baking their output into server-built data.
 */

/** "9:41 AM" today, "Yesterday", "Mon" this week, otherwise "May 20". */
export function formatListTime(value: string | Date | null | undefined): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);

  if (dayDiff === 0) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatMessageTime(value: string | Date | null | undefined): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return isToday ? time : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}
