import type { CalendarEvent, CalendarItem } from '@/lib/api/calendar-event.types';
import type { Course } from '@/lib/api/course.types';
import type { Task } from '@/lib/api/task.types';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Note } from '@/lib/api/note.types';
import { eachLocalDate, toLocalDateKey } from '@/lib/calendar/calendar-date';
import type { CalendarRange } from '@/lib/calendar/calendar-date';
import { generateClassScheduleOccurrences } from '@/lib/class-schedules/occurrences';

export function normalizeCalendarItems(
  events: CalendarEvent[],
  tasks: Task[],
  courses: Course[],
  schedules: ClassSchedule[] = [],
  range?: CalendarRange,
  notes: Note[] = [],
): CalendarItem[] {
  const courseData = new Map(courses.map((course) => [course.id, { code: course.code, color: course.color, name: course.name }]));
  const eventItems = events.flatMap((event) => normalizeEvent(event, courseData));
  const taskItems = tasks.flatMap((task) => normalizeTask(task, courseData));
  const noteItems = normalizeCalendarNotes(notes, courses);
  const scheduleItems = range ? generateClassScheduleOccurrences(schedules, courses, range) : [];
  return [...eventItems, ...taskItems, ...scheduleItems, ...noteItems].sort(compareCalendarItems);
}

export function normalizeCalendarNotes(notes: Note[], courses: Course[]): CalendarItem[] {
  const courseData = new Map(courses.map((course) => [course.id, { code: course.code, color: course.color, name: course.name }]));
  return notes.flatMap((note) => normalizeNote(note, courseData)).sort(compareCalendarItems);
}

type CourseCalendarData = Map<string, { code: string | null; color: string; name: string }>;

function normalizeEvent(event: CalendarEvent, courseData: CourseCalendarData): CalendarItem[] {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt ?? event.startAt);
  return eachLocalDate(start, end).map((date) => ({
    id: `event:${event.id}:${date}`,
    sourceId: event.id,
    scheduleId: null,
    sourceType: 'event',
    title: event.title,
    date,
    startAt: event.startAt,
    endAt: event.endAt,
    isAllDay: event.isAllDay,
    courseId: event.courseId,
    courseName: event.courseId ? courseData.get(event.courseId)?.name ?? 'Course unavailable' : null,
    courseCode: event.courseId ? courseData.get(event.courseId)?.code ?? null : null,
    color: event.color ?? (event.courseId ? courseData.get(event.courseId)?.color ?? null : null),
    location: event.location,
    status: null,
    priority: null,
  }));
}

function normalizeTask(task: Task, courseData: CourseCalendarData): CalendarItem[] {
  if (!task.dueAt) return [];
  const date = toLocalDateKey(task.dueAt);
  return [{
    id: `task:${task.id}:${date}`,
    sourceId: task.id,
    scheduleId: null,
    sourceType: 'task',
    title: task.title,
    date,
    startAt: task.dueAt,
    endAt: null,
    isAllDay: false,
    courseId: task.courseId,
    courseName: task.courseId ? courseData.get(task.courseId)?.name ?? 'Course unavailable' : null,
    courseCode: task.courseId ? courseData.get(task.courseId)?.code ?? null : null,
    color: task.courseId ? courseData.get(task.courseId)?.color ?? null : null,
    location: null,
    status: task.status,
    priority: task.priority,
  }];
}

function normalizeNote(note: Note, courseData: CourseCalendarData): CalendarItem[] {
  const moments = [...new Set([note.reminderAt, note.relevantAt].filter((value): value is string => Boolean(value)).map((value) => `${toLocalDateKey(value)}|${value}`))];
  const seenDates = new Set<string>();
  return moments.flatMap((moment) => {
    const [date, startAt] = moment.split('|');
    if (seenDates.has(date)) return [];
    seenDates.add(date);
    return [{ id: `note:${note.id}:${date}`, sourceId: note.id, scheduleId: null, sourceType: 'note' as const, title: note.title || note.content?.trim() || 'Note', date, startAt, endAt: null, isAllDay: false, courseId: note.courseId, courseName: note.courseId ? courseData.get(note.courseId)?.name ?? 'Course unavailable' : null, courseCode: note.courseId ? courseData.get(note.courseId)?.code ?? null : null, color: note.courseId ? courseData.get(note.courseId)?.color ?? null : null, location: null, status: null, priority: null }];
  });
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
