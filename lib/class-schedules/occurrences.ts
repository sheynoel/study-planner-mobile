import type { ClassSchedule, Weekday } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { CalendarRange } from '@/lib/calendar/calendar-date';
import { parseLocalDate, toLocalDateKey, toLocalWallClockDateTime } from '@/lib/calendar/calendar-date';

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
    const firstKey = schedule.startDate > range.firstDate ? schedule.startDate : range.firstDate;
    const lastKey = schedule.endDate < range.lastDate ? schedule.endDate : range.lastDate;
    const first = parseLocalDate(firstKey);
    const last = parseLocalDate(lastKey);
    if (!first || !last || first > last) continue;

    const offset = (JAVASCRIPT_WEEKDAY[schedule.weekday] - first.getDay() + 7) % 7;
    const cursor = new Date(first.getFullYear(), first.getMonth(), first.getDate() + offset);

    while (cursor <= last) {
      const date = toLocalDateKey(cursor);
      const start = toLocalWallClockDateTime(date, schedule.startTime);
      const end = toLocalWallClockDateTime(date, schedule.endTime);
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
          color: course?.color ?? null,
          location: schedule.room,
          status: null,
          priority: null,
        });
      }
      cursor.setDate(cursor.getDate() + 7);
    }
  }

  return [...occurrences.values()];
}
