import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { Course } from '@/lib/api/course.types';
import type { Task, TaskPriority } from '@/lib/api/task.types';
import type { Note } from '@/lib/api/note.types';

export type ClassTimeState = 'past' | 'current' | 'upcoming';

export type HomeReminder = {
  id: string;
  sourceId: string;
  sourceType: 'event' | 'note';
  title: string;
  preview: string | null;
  courseId: string | null;
  courseLabel: string;
  color: string | null;
  at: string | null;
  isAllDay: boolean;
  isOverdue: boolean;
  isPinned: boolean;
};

export type HomeTodayHero = {
  tasksDueToday: number;
  nextItem: CalendarItem | null;
  nextTask: Task | null;
  nextState: 'current' | 'upcoming' | 'due' | null;
};

export function getTodayClasses(items: CalendarItem[], now = new Date()): CalendarItem[] {
  const today = toLocalDateKey(now);
  return items
    .filter((item) => item.sourceType === 'class_schedule' && item.date === today)
    .sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt));
}

export function getClassTimeState(item: Pick<CalendarItem, 'startAt' | 'endAt'>, now = new Date()): ClassTimeState {
  const start = Date.parse(item.startAt);
  const end = Date.parse(item.endAt ?? item.startAt);
  if (now.getTime() > end) return 'past';
  if (now.getTime() >= start) return 'current';
  return 'upcoming';
}

export function getClassNotes(notes: Note[], courseId: string | null, now = new Date()): Note[] {
  if (!courseId) return [];
  const today = toLocalDateKey(now);
  return notes
    .filter((note) => note.courseId === courseId && [note.relevantAt, note.reminderAt].some((value) => value !== null && toLocalDateKey(value) === today))
    .sort((left, right) => Date.parse(left.reminderAt ?? left.relevantAt!) - Date.parse(right.reminderAt ?? right.relevantAt!) || left.title.localeCompare(right.title));
}

export function getHomeReminders(
  items: CalendarItem[],
  notes: Note[],
  courses: Course[],
  excludedNoteIds: Set<string> = new Set(),
  now = new Date(),
  limit = 5,
): HomeReminder[] {
  const today = toLocalDateKey(now);
  const startToday = startOfDay(now);
  const startTomorrow = addDays(startToday, 1);
  const recentPinnedCutoff = addDays(startToday, -7).getTime();
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const events: HomeReminder[] = items
    .filter((item) => item.sourceType === 'event' && item.date === today)
    .map((item) => ({
      id: item.id,
      sourceId: item.sourceId,
      sourceType: 'event',
      title: item.title,
      preview: item.location,
      courseId: item.courseId,
      courseLabel: item.courseCode || item.courseName || 'Personal',
      color: item.color,
      at: item.startAt,
      isAllDay: item.isAllDay,
      isOverdue: false,
      isPinned: false,
    }));
  const noteReminders: HomeReminder[] = notes.flatMap((note) => {
    if (excludedNoteIds.has(note.id)) return [];
    const reminderTime = note.reminderAt ? Date.parse(note.reminderAt) : null;
    const relevantToday = note.relevantAt ? toLocalDateKey(note.relevantAt) === today : false;
    const reminderDue = reminderTime !== null && reminderTime < startTomorrow.getTime();
    const recentUndatedPin = note.isPinned && !note.relevantAt && !note.reminderAt && Date.parse(note.updatedAt) >= recentPinnedCutoff;
    if (!relevantToday && !reminderDue && !recentUndatedPin) return [];
    const course = note.courseId ? courseById.get(note.courseId) : undefined;
    const at = reminderDue ? note.reminderAt : relevantToday ? note.relevantAt : null;
    return [{
      id: `note:${note.id}:${at ? toLocalDateKey(at) : 'pinned'}`,
      sourceId: note.id,
      sourceType: 'note' as const,
      title: note.title,
      preview: note.content?.trim() && note.content.trim() !== note.title.trim() ? note.content.trim() : null,
      courseId: note.courseId,
      courseLabel: course?.code?.trim() || course?.name || 'Personal',
      color: course?.color ?? null,
      at,
      isAllDay: false,
      isOverdue: reminderTime !== null && reminderTime < startToday.getTime(),
      isPinned: note.isPinned,
    }];
  });
  return [...events, ...noteReminders].sort(compareHomeReminders).slice(0, limit);
}

export function getImportantHomeTasks(tasks: Task[], now = new Date(), limit = 5): Task[] {
  return tasks
    .filter((task) => task.status !== 'COMPLETED')
    .sort((left, right) => compareImportantTasks(left, right, now))
    .slice(0, limit);
}

export function getHomeTodayHero(items: CalendarItem[], tasks: Task[], now = new Date()): HomeTodayHero {
  const today = toLocalDateKey(now);
  const todayClasses = getTodayClasses(items, now);
  const remainingClasses = todayClasses.filter((item) => Date.parse(item.endAt ?? item.startAt) >= now.getTime());
  const activeTasksDueToday = tasks.filter((task) => task.status !== 'COMPLETED' && task.dueAt !== null && toLocalDateKey(task.dueAt) === today);
  const currentTimedItem = items
    .filter((item) => (item.sourceType === 'class_schedule' || item.sourceType === 'event') && item.date === today && !item.isAllDay && Date.parse(item.startAt) <= now.getTime() && Date.parse(item.endAt ?? item.startAt) >= now.getTime())
    .sort(compareCalendarTime)[0] ?? null;
  const upcomingClass = remainingClasses.find((item) => Date.parse(item.startAt) > now.getTime()) ?? null;
  const upcomingTimedEvent = items
    .filter((item) => item.sourceType === 'event' && item.date === today && !item.isAllDay && Date.parse(item.startAt) > now.getTime())
    .sort(compareCalendarTime)[0] ?? null;
  const nextItem = currentTimedItem ?? upcomingClass ?? upcomingTimedEvent;
  const endToday = addDays(startOfDay(now), 1).getTime();
  const nextTask = nextItem ? null : getImportantHomeTasks(tasks, now).find((task) => task.dueAt && Date.parse(task.dueAt) < endToday) ?? null;
  return {
    tasksDueToday: activeTasksDueToday.length,
    nextItem,
    nextTask,
    nextState: currentTimedItem ? 'current' : nextItem ? 'upcoming' : nextTask ? 'due' : null,
  };
}

export function getNextRemainingClass(items: CalendarItem[], now = new Date()): CalendarItem | null {
  return getTodayClasses(items, now).find((item) => Date.parse(item.endAt ?? item.startAt) >= now.getTime()) ?? null;
}

export function getNextUpcomingEvent(items: CalendarItem[], now = new Date()): CalendarItem | null {
  return items
    .filter((item) => item.sourceType === 'event' && (item.date > toLocalDateKey(now) || item.isAllDay || Date.parse(item.endAt ?? item.startAt) >= now.getTime()))
    .sort((left, right) => left.date.localeCompare(right.date) || compareCalendarTime(left, right))[0] ?? null;
}

function compareHomeReminders(left: HomeReminder, right: HomeReminder): number {
  if (left.isOverdue !== right.isOverdue) return left.isOverdue ? -1 : 1;
  if (left.isAllDay !== right.isAllDay) return left.isAllDay ? -1 : 1;
  const leftTime = left.at ? Date.parse(left.at) : Number.MAX_SAFE_INTEGER;
  const rightTime = right.at ? Date.parse(right.at) : Number.MAX_SAFE_INTEGER;
  return leftTime - rightTime || left.title.localeCompare(right.title) || left.id.localeCompare(right.id);
}

function compareCalendarTime(left: CalendarItem, right: CalendarItem): number {
  if (left.isAllDay !== right.isAllDay) return left.isAllDay ? -1 : 1;
  return Date.parse(left.startAt) - Date.parse(right.startAt) || left.id.localeCompare(right.id);
}

function compareImportantTasks(left: Task, right: Task, now: Date): number {
  const leftBucket = taskUrgencyBucket(left, now);
  const rightBucket = taskUrgencyBucket(right, now);
  if (leftBucket !== rightBucket) return leftBucket - rightBucket;
  const leftDue = left.dueAt ? Date.parse(left.dueAt) : Number.MAX_SAFE_INTEGER;
  const rightDue = right.dueAt ? Date.parse(right.dueAt) : Number.MAX_SAFE_INTEGER;
  const priorityRank: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return leftDue - rightDue || priorityRank[left.priority] - priorityRank[right.priority] || left.title.localeCompare(right.title) || left.id.localeCompare(right.id);
}

function taskUrgencyBucket(task: Task, now: Date): number {
  if (!task.dueAt) return 4;
  const due = new Date(task.dueAt);
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const soon = addDays(today, 8);
  if (due < today) return 0;
  if (due < tomorrow) return 1;
  if (due < soon) return 2;
  return 3;
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, amount: number): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + amount);
}

function toLocalDateKey(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
