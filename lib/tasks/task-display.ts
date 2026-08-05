import type { Task, TaskPriority, TaskStatus } from '@/lib/api/task.types';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export function formatTaskDate(value: string | null): string {
  if (!value) return 'No due date';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function isTaskOverdue(task: Task, now = Date.now()): boolean {
  return task.status !== 'COMPLETED' && task.dueAt !== null && Date.parse(task.dueAt) < now;
}
