import type { CalendarEvent, CalendarItem } from '@/lib/api/calendar-event.types';
import type { Course } from '@/lib/api/course.types';
import type { Task } from '@/lib/api/task.types';
import { eachLocalDate, toLocalDateKey } from '@/lib/calendar/calendar-date';

export function normalizeCalendarItems(
  events: CalendarEvent[],
  tasks: Task[],
  courses: Course[],
): CalendarItem[] {
  const courseNames = new Map(courses.map((course) => [course.id, course.name]));
  const eventItems = events.flatMap((event) => normalizeEvent(event, courseNames));
  const taskItems = tasks.flatMap((task) => normalizeTask(task, courseNames));
  return [...eventItems, ...taskItems].sort(compareCalendarItems);
}

function normalizeEvent(event: CalendarEvent, courseNames: Map<string, string>): CalendarItem[] {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt ?? event.startAt);
  return eachLocalDate(start, end).map((date) => ({
    id: `event:${event.id}:${date}`,
    sourceId: event.id,
    sourceType: 'event',
    title: event.title,
    date,
    startAt: event.startAt,
    endAt: event.endAt,
    isAllDay: event.isAllDay,
    courseId: event.courseId,
    courseName: event.courseId ? courseNames.get(event.courseId) ?? 'Course unavailable' : null,
    color: event.color,
    location: event.location,
    status: null,
    priority: null,
  }));
}

function normalizeTask(task: Task, courseNames: Map<string, string>): CalendarItem[] {
  if (!task.dueAt) return [];
  const date = toLocalDateKey(task.dueAt);
  return [{
    id: `task:${task.id}:${date}`,
    sourceId: task.id,
    sourceType: 'task',
    title: task.title,
    date,
    startAt: task.dueAt,
    endAt: null,
    isAllDay: false,
    courseId: task.courseId,
    courseName: task.courseId ? courseNames.get(task.courseId) ?? 'Course unavailable' : null,
    color: null,
    location: null,
    status: task.status,
    priority: task.priority,
  }];
}

function compareCalendarItems(left: CalendarItem, right: CalendarItem): number {
  if (left.date !== right.date) return left.date.localeCompare(right.date);
  if (left.isAllDay !== right.isAllDay) return left.isAllDay ? -1 : 1;
  const timeDifference = Date.parse(left.startAt) - Date.parse(right.startAt);
  if (timeDifference !== 0) return timeDifference;
  return left.id.localeCompare(right.id);
}

export function itemsForDate(items: CalendarItem[], date: string): CalendarItem[] {
  return items.filter((item) => item.date === date);
}

export function isCalendarTaskOverdue(item: CalendarItem, now = Date.now()): boolean {
  return item.sourceType === 'task' && item.status !== 'COMPLETED' && Date.parse(item.startAt) < now;
}
