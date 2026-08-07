import { parseLocalDate, toLocalDateKey } from '@/lib/calendar/calendar-date';

export type TaskWeekDay = {
  date: string;
  dayNumber: number;
  isToday: boolean;
  weekday: string;
};

export function startOfTaskWeek(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() - value.getDay());
}

export function taskWeekDays(anchor: Date, today = new Date()): TaskWeekDay[] {
  const start = startOfTaskWeek(anchor);
  const todayKey = toLocalDateKey(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addTaskDays(start, index);
    const key = toLocalDateKey(date);
    return {
      date: key,
      dayNumber: date.getDate(),
      isToday: key === todayKey,
      weekday: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
    };
  });
}

export function addTaskDays(value: Date, amount: number): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + amount);
}

export function shiftTaskDate(date: string, amount: number): string | null {
  const parsed = parseLocalDate(date);
  return parsed ? toLocalDateKey(addTaskDays(parsed, amount)) : null;
}
