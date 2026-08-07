import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import { toLocalDateKey } from '@/lib/calendar/calendar-date';
import { generateClassScheduleOccurrences } from '@/lib/class-schedules/occurrences';

export function findNextClassOccurrence(
  schedules: ClassSchedule[],
  courses: Course[],
  now = new Date(),
  horizonDays = 14,
): CalendarItem | null {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + horizonDays, 23, 59, 59, 999);
  return generateClassScheduleOccurrences(schedules, courses, {
    from: now.toISOString(),
    to: end.toISOString(),
    firstDate: toLocalDateKey(now),
    lastDate: toLocalDateKey(end),
  })
    .filter((item) => Date.parse(item.endAt ?? item.startAt) >= now.getTime())
    .sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt))[0] ?? null;
}

export function formatNextClassLabel(item: CalendarItem): string {
  return new Date(item.startAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
}

export function formatScheduleSummary(scheduleCount: number, nextClass: CalendarItem | null): string {
  const count = `${scheduleCount} weekly ${scheduleCount === 1 ? 'class' : 'classes'}`;
  return nextClass ? `${count} · Next ${formatNextClassLabel(nextClass)}` : count;
}
