import type { Task, TaskFilters, TaskPriority, TaskStatus } from '@/lib/api/task.types';

export type TaskDueSelection = 'any' | 'today' | 'this_week' | 'overdue';
export type TaskCourseSelection = string | 'personal' | undefined;
export type TaskSortOption = 'deadline_soonest' | 'deadline_latest' | 'priority' | 'created' | 'alphabetical';

export type TaskFilterState = {
  courseId?: TaskCourseSelection;
  priority?: TaskPriority;
  status?: TaskStatus;
  due: TaskDueSelection;
  search: string;
  selectedDate: string | null;
};

export const DEFAULT_TASK_FILTERS: TaskFilterState = { due: 'any', search: '', selectedDate: null };

export function toTaskApiFilters(state: TaskFilterState): TaskFilters {
  const selectedDue = state.due === 'today' || state.due === 'overdue' ? state.due : undefined;
  return {
    courseId: state.courseId && state.courseId !== 'personal' ? state.courseId : undefined,
    priority: state.priority,
    status: state.status,
    due: selectedDue,
  };
}

export function activeTaskFilterCount(state: TaskFilterState): number {
  return Number(Boolean(state.priority)) + Number(Boolean(state.status)) + Number(state.due !== 'any');
}

export function hasActiveTaskFilters(state: TaskFilterState): boolean {
  return Boolean(state.courseId) || activeTaskFilterCount(state) > 0 || Boolean(state.search.trim()) || Boolean(state.selectedDate);
}

export function filterTasksLocally(tasks: Task[], state: TaskFilterState, courseName: (courseId: string) => string | undefined, now = new Date()): Task[] {
  const query = state.search.trim().toLocaleLowerCase();
  const weekEnd = endOfWeek(now);
  return tasks.filter((task) => {
    if (state.courseId === 'personal' && task.courseId !== null) return false;
    if (state.courseId && state.courseId !== 'personal' && task.courseId !== state.courseId) return false;
    if (state.status && task.status !== state.status) return false;
    if (state.priority && task.priority !== state.priority) return false;
    if (state.selectedDate && (!task.dueAt || toLocalDateKey(task.dueAt) !== state.selectedDate)) return false;
    if (state.due === 'today' && (!task.dueAt || toLocalDateKey(task.dueAt) !== toLocalDateKey(now))) return false;
    if (state.due === 'overdue' && !isTaskOverdue(task, now.getTime())) return false;
    if (state.due === 'this_week') {
      if (!task.dueAt) return false;
      const due = new Date(task.dueAt);
      if (due < startOfDay(now) || due > weekEnd) return false;
    }
    if (!query) return true;
    const searchable = [task.title, task.description ?? '', task.courseId ? courseName(task.courseId) ?? '' : 'personal'].join(' ').toLocaleLowerCase();
    return searchable.includes(query);
  });
}

export function sortTasks(tasks: Task[], option: TaskSortOption): Task[] {
  const priorityRank: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return [...tasks].sort((left, right) => {
    if (option === 'priority') return priorityRank[left.priority] - priorityRank[right.priority] || dueTime(left) - dueTime(right);
    if (option === 'created') return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    if (option === 'alphabetical') return left.title.localeCompare(right.title);
    if (option === 'deadline_latest') return compareLatestDeadline(left, right) || priorityRank[left.priority] - priorityRank[right.priority];
    return dueTime(left) - dueTime(right) || priorityRank[left.priority] - priorityRank[right.priority];
  });
}

function dueTime(task: Task): number { return task.dueAt ? Date.parse(task.dueAt) : Number.MAX_SAFE_INTEGER; }
function compareLatestDeadline(left: Task, right: Task): number {
  if (!left.dueAt && !right.dueAt) return 0;
  if (!left.dueAt) return 1;
  if (!right.dueAt) return -1;
  return Date.parse(right.dueAt) - Date.parse(left.dueAt);
}
function startOfDay(value: Date): Date { return new Date(value.getFullYear(), value.getMonth(), value.getDate()); }
function endOfWeek(value: Date): Date { const start = startOfDay(value); const daysUntilSunday = (7 - start.getDay()) % 7; return new Date(start.getFullYear(), start.getMonth(), start.getDate() + daysUntilSunday, 23, 59, 59, 999); }
function toLocalDateKey(value: Date | string): string { const date = typeof value === 'string' ? new Date(value) : value; return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function isTaskOverdue(task: Task, now: number): boolean { return task.status !== 'COMPLETED' && task.dueAt !== null && Date.parse(task.dueAt) < now; }
