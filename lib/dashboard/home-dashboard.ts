import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { Task, TaskPriority, TaskStatus } from '@/lib/api/task.types';

export type HomeTaskTime = 'any' | 'today' | 'this_week' | 'this_month';
export type HomeTaskCourse = string | 'personal' | undefined;

export type HomeTaskFilters = {
  status?: TaskStatus;
  time: HomeTaskTime;
  courseId?: HomeTaskCourse;
  priority?: TaskPriority;
};

export const DEFAULT_HOME_TASK_FILTERS: HomeTaskFilters = { time: 'any' };

export type ClassTimeState = 'past' | 'current' | 'upcoming';

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

export function getClassReminders(tasks: Task[], courseId: string | null, now = new Date()): Task[] {
  if (!courseId) return [];
  const today = toLocalDateKey(now);
  return tasks
    .filter((task) => task.courseId === courseId && task.status !== 'COMPLETED' && task.dueAt !== null && toLocalDateKey(task.dueAt) === today)
    .sort(compareHomeTasks)
    .slice(0, 2);
}

export function filterHomeTasks(tasks: Task[], filters: HomeTaskFilters, now = new Date()): Task[] {
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(today, 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  return tasks.filter((task) => {
    if (filters.status ? task.status !== filters.status : task.status === 'COMPLETED') return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.courseId === 'personal' && task.courseId !== null) return false;
    if (filters.courseId && filters.courseId !== 'personal' && task.courseId !== filters.courseId) return false;
    if (filters.time === 'any') return true;
    if (!task.dueAt) return false;
    const due = new Date(task.dueAt);
    if (filters.time === 'today') return due >= today && due < tomorrow;
    if (filters.time === 'this_week') return due >= today && due < weekEnd;
    return due >= monthStart && due < monthEnd;
  }).sort(compareHomeTasks);
}

export function activeHomeTaskFilterCount(filters: HomeTaskFilters): number {
  return Number(Boolean(filters.status)) + Number(filters.time !== 'any') + Number(Boolean(filters.courseId)) + Number(Boolean(filters.priority));
}

export function countSelectedDateItems(items: CalendarItem[], date: string) {
  const selected = items.filter((item) => item.date === date);
  return {
    classes: selected.filter((item) => item.sourceType === 'class_schedule').length,
    tasks: selected.filter((item) => item.sourceType === 'task').length,
    events: selected.filter((item) => item.sourceType === 'event').length,
  };
}

function compareHomeTasks(left: Task, right: Task): number {
  const leftDue = left.dueAt ? Date.parse(left.dueAt) : Number.MAX_SAFE_INTEGER;
  const rightDue = right.dueAt ? Date.parse(right.dueAt) : Number.MAX_SAFE_INTEGER;
  return leftDue - rightDue || left.title.localeCompare(right.title) || left.id.localeCompare(right.id);
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
