import type { Task, TaskFilters, TaskPriority, TaskStatus } from '@/lib/api/task.types';

export type TaskTimeView = 'today' | 'upcoming' | 'all' | 'completed';
export type TaskDueSelection = 'any' | 'today' | 'this_week' | 'overdue';
export type TaskCourseSelection = string | 'personal' | undefined;
export type TaskSortOption = 'due' | 'priority' | 'created' | 'course' | 'alphabetical';

export type TaskFilterState = {
  timeView: TaskTimeView;
  courseId?: TaskCourseSelection;
  priority?: TaskPriority;
  status?: TaskStatus;
  due: TaskDueSelection;
  search: string;
};

export const DEFAULT_TASK_FILTERS: TaskFilterState = { timeView: 'today', due: 'any', search: '' };

export function toTaskApiFilters(state: TaskFilterState): TaskFilters {
  const timeDue = state.timeView === 'today' || state.timeView === 'upcoming' ? state.timeView : undefined;
  const selectedDue = state.due === 'today' || state.due === 'overdue' ? state.due : undefined;
  return {
    courseId: state.courseId && state.courseId !== 'personal' ? state.courseId : undefined,
    priority: state.priority,
    status: state.timeView === 'completed' ? 'COMPLETED' : state.status,
    due: selectedDue ?? timeDue,
  };
}

export function activeTaskFilterCount(state: TaskFilterState): number {
  return Number(Boolean(state.courseId)) + Number(Boolean(state.priority)) + Number(Boolean(state.status)) + Number(state.due !== 'any');
}

export function hasActiveTaskFilters(state: TaskFilterState): boolean {
  return state.timeView !== DEFAULT_TASK_FILTERS.timeView || activeTaskFilterCount(state) > 0 || Boolean(state.search.trim());
}

export function filterTasksLocally(tasks: Task[], state: TaskFilterState, courseName: (courseId: string) => string | undefined, now = new Date()): Task[] {
  const query = state.search.trim().toLocaleLowerCase();
  const weekEnd = endOfWeek(now);
  return tasks.filter((task) => {
    if (state.courseId === 'personal' && task.courseId !== null) return false;
    if (state.status && task.status !== state.status) return false;
    if (state.priority && task.priority !== state.priority) return false;
    if (state.timeView !== 'completed' && state.status !== 'COMPLETED' && task.status === 'COMPLETED') return false;
    if (state.timeView === 'completed' && task.status !== 'COMPLETED') return false;
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

export function sortTasks(tasks: Task[], option: TaskSortOption, courseName: (courseId: string) => string | undefined): Task[] {
  const priorityRank: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return [...tasks].sort((left, right) => {
    if (option === 'priority') return priorityRank[left.priority] - priorityRank[right.priority] || dueTime(left) - dueTime(right);
    if (option === 'created') return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    if (option === 'course') return taskCourseName(left, courseName).localeCompare(taskCourseName(right, courseName)) || left.title.localeCompare(right.title);
    if (option === 'alphabetical') return left.title.localeCompare(right.title);
    return dueTime(left) - dueTime(right) || priorityRank[left.priority] - priorityRank[right.priority];
  });
}

export type TaskGroup = { key: string; title: string; tasks: Task[] };

export function groupTasks(tasks: Task[], now = new Date()): TaskGroup[] {
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const afterTomorrow = addDays(today, 2);
  const weekEnd = endOfWeek(now);
  const buckets: Record<string, Task[]> = { overdue: [], today: [], tomorrow: [], week: [], later: [], undated: [], completed: [] };
  for (const task of tasks) {
    if (task.status === 'COMPLETED') { buckets.completed.push(task); continue; }
    if (!task.dueAt) { buckets.undated.push(task); continue; }
    const due = new Date(task.dueAt);
    if (due < now) buckets.overdue.push(task);
    else if (due < tomorrow) buckets.today.push(task);
    else if (due < afterTomorrow) buckets.tomorrow.push(task);
    else if (due <= weekEnd) buckets.week.push(task);
    else buckets.later.push(task);
  }
  return [
    { key: 'overdue', title: 'Overdue', tasks: buckets.overdue },
    { key: 'today', title: 'Today', tasks: buckets.today },
    { key: 'tomorrow', title: 'Tomorrow', tasks: buckets.tomorrow },
    { key: 'week', title: 'Later This Week', tasks: buckets.week },
    { key: 'later', title: 'Later', tasks: buckets.later },
    { key: 'undated', title: 'No Due Date', tasks: buckets.undated },
    { key: 'completed', title: 'Completed', tasks: buckets.completed },
  ].filter((group) => group.tasks.length > 0);
}

function taskCourseName(task: Task, courseName: (courseId: string) => string | undefined): string { return task.courseId ? courseName(task.courseId) ?? 'Course unavailable' : 'Personal'; }
function dueTime(task: Task): number { return task.dueAt ? Date.parse(task.dueAt) : Number.MAX_SAFE_INTEGER; }
function startOfDay(value: Date): Date { return new Date(value.getFullYear(), value.getMonth(), value.getDate()); }
function addDays(value: Date, count: number): Date { return new Date(value.getFullYear(), value.getMonth(), value.getDate() + count); }
function endOfWeek(value: Date): Date { const start = startOfDay(value); const daysUntilSunday = (7 - start.getDay()) % 7; return new Date(start.getFullYear(), start.getMonth(), start.getDate() + daysUntilSunday, 23, 59, 59, 999); }
