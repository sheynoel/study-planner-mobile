export type CalendarRange = {
  from: string;
  to: string;
  firstDate: string;
  lastDate: string;
};

export type CalendarDay = {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function toLocalDateKey(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function combineLocalDateTime(dateValue: string, timeValue: string): Date | null {
  const date = parseLocalDate(dateValue);
  if (!date || !isValidTime(timeValue)) return null;
  const [hours, minutes] = timeValue.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
}

export function formatTimeInput(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatLocalDate(value: string): string {
  const date = parseLocalDate(value);
  return date
    ? date.toLocaleDateString(undefined, { dateStyle: 'full' })
    : value;
}

export function formatLocalDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatLocalTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function getMonthRange(month: Date): CalendarRange {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const from = new Date(first.getFullYear(), first.getMonth(), first.getDate(), 0, 0, 0, 0);
  const to = new Date(last.getFullYear(), last.getMonth(), last.getDate(), 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString(), firstDate: toLocalDateKey(first), lastDate: toLocalDateKey(last) };
}

export function getMonthDays(month: Date): CalendarDay[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const today = toLocalDateKey(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
    const key = toLocalDateKey(date);
    return {
      date: key,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month.getMonth(),
      isToday: key === today,
    };
  });
}

export function addMonths(month: Date, amount: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + amount, 1);
}

export function monthTitle(month: Date): string {
  return month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function eachLocalDate(from: Date, to: Date): string[] {
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const last = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  const result: string[] = [];
  while (cursor <= last) {
    result.push(toLocalDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
