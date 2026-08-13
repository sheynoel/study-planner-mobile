import type { ClassSchedule, Weekday } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { CalendarRange } from '@/lib/calendar/calendar-date';
import { zonedWallClockToIso } from './zoned-date-time.ts';

const JAVASCRIPT_WEEKDAY: Record<Weekday, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export function generateClassScheduleOccurrences(
  schedules: ClassSchedule[],
  courses: Course[],
  range: CalendarRange,
): CalendarItem[] {
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const occurrences = new Map<string, CalendarItem>();

  for (const schedule of schedules) {
    if (schedule.courseArchived) continue;
    const firstKey = schedule.startDate > range.firstDate ? schedule.startDate : range.firstDate;
    const lastKey = schedule.endDate < range.lastDate ? schedule.endDate : range.lastDate;
    const first = parseDateKey(firstKey);
    const last = parseDateKey(lastKey);
    if (!first || !last || first > last) continue;

    const offset = (JAVASCRIPT_WEEKDAY[schedule.weekday] - first.getUTCDay() + 7) % 7;
    const cursor = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate() + offset));
    const holidays = new Set(schedule.holidayDates);
    const exceptionByDate = new Map(schedule.exceptions.map((item) => [item.date, item]));

    while (cursor <= last) {
      const date = toDateKey(cursor);
      const exception = exceptionByDate.get(date);
      if (holidays.has(date) || exception?.cancelled) { cursor.setUTCDate(cursor.getUTCDate() + 7); continue; }
      const start = zonedWallClockToIso(date, exception?.startTimeOverride ?? schedule.startTime, schedule.timezone);
      const end = zonedWallClockToIso(date, exception?.endTimeOverride ?? schedule.endTime, schedule.timezone);
      const course = courseById.get(schedule.courseId);
      const id = `class_schedule:${schedule.id}:${date}`;
      if (start && end && !occurrences.has(id)) {
        occurrences.set(id, {
          id,
          sourceId: schedule.id,
          scheduleId: schedule.id,
          sourceType: 'class_schedule',
          title: course?.name ?? 'Class meeting',
          date,
          startAt: start,
          endAt: end,
          isAllDay: false,
          courseId: schedule.courseId,
          courseName: course?.name ?? 'Course unavailable',
          courseCode: course?.code ?? null,
          color: course?.color ?? null,
          location: exception?.roomOverride ?? schedule.room,
          status: null,
          priority: null,
        });
      }
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }
  }

  return [...occurrences.values()];
}

function parseDateKey(value: string): Date | null { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); if (!match) return null; const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))); return toDateKey(date) === value ? date : null; }
function toDateKey(value: Date): string { return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(value.getUTCDate()).padStart(2, '0')}`; }
