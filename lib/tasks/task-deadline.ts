import type { Task } from '@/lib/api/task.types';

export type TaskDeadlineTone = 'danger' | 'muted' | 'primary' | 'success';
export type TaskDeadline = { label: string; tone: TaskDeadlineTone };

const HOUR = 60 * 60 * 1000;

export function getTaskDeadline(task: Pick<Task, 'completedAt' | 'dueAt' | 'status'>, now = new Date()): TaskDeadline {
  if (task.status === 'COMPLETED') return { label: 'Completed', tone: 'success' };
  if (!task.dueAt) return { label: 'No deadline', tone: 'muted' };

  const due = new Date(task.dueAt);
  const difference = due.getTime() - now.getTime();
  const calendarDays = dayDistance(now, due);

  if (difference < 0) {
    return { label: `Overdue by ${plural(Math.max(1, Math.abs(calendarDays)), 'day')}`, tone: 'danger' };
  }

  if (calendarDays === 0) {
    const remainingHours = Math.max(1, Math.ceil(difference / HOUR));
    return remainingHours <= 8
      ? { label: `Due in ${plural(remainingHours, 'hour')}`, tone: 'primary' }
      : { label: 'Due today', tone: 'primary' };
  }
  if (calendarDays === 1) return { label: 'Due tomorrow', tone: 'primary' };
  return { label: `Due in ${plural(calendarDays, 'day')}`, tone: 'muted' };
}

function dayDistance(from: Date, to: Date): number {
  const fromDate = localMidnight(from);
  const toDate = localMidnight(to);
  return Math.round((toDate.getTime() - fromDate.getTime()) / (24 * HOUR));
}

function localMidnight(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'}`;
}
