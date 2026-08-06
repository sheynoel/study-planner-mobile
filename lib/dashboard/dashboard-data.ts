import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { FileRecord } from '@/lib/api/file.types';
import type { Task } from '@/lib/api/task.types';

export const DASHBOARD_TASK_LIMIT = 5;
export const DASHBOARD_FILE_LIMIT = 4;

export type DashboardSections = {
  tasksDueToday: Task[];
  allTasksDueTodayCount: number;
  tasksThisWeekCount: number;
  upcomingDeadlines: Task[];
  todaySchedule: CalendarItem[];
  nextScheduleItem: CalendarItem | null;
  classesTodayCount: number;
  recentFiles: FileRecord[];
};

export function buildDashboardSections(
  tasks: Task[],
  scheduleItems: CalendarItem[],
  files: FileRecord[],
  now = new Date(),
): DashboardSections {
  const startToday = startOfLocalDay(now);
  const startTomorrow = addLocalDays(startToday, 1);
  const endUpcomingWindow = addLocalDays(startToday, 8);
  const incompleteDatedTasks = tasks.filter(
    (task) => task.status !== 'COMPLETED' && task.dueAt !== null,
  );
  const allTasksDueToday = incompleteDatedTasks
    .filter((task) => isWithin(task.dueAt!, startToday, startTomorrow))
    .sort(compareTaskDueDates);
  const allUpcomingDeadlines = incompleteDatedTasks
    .filter((task) => isWithin(task.dueAt!, startTomorrow, endUpcomingWindow))
    .sort(compareTaskDueDates);
  const upcomingDeadlines = allUpcomingDeadlines.slice(0, DASHBOARD_TASK_LIMIT);
  const todaySchedule = [...scheduleItems]
    .filter((item) => item.sourceType !== 'task')
    .sort(compareScheduleItems);

  return {
    tasksDueToday: allTasksDueToday.slice(0, DASHBOARD_TASK_LIMIT),
    allTasksDueTodayCount: allTasksDueToday.length,
    tasksThisWeekCount: allTasksDueToday.length + allUpcomingDeadlines.length,
    upcomingDeadlines,
    todaySchedule,
    nextScheduleItem: findNextScheduleItem(todaySchedule, now),
    classesTodayCount: todaySchedule.filter((item) => item.sourceType === 'class_schedule').length,
    recentFiles: [...files]
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
      .slice(0, DASHBOARD_FILE_LIMIT),
  };
}

function findNextScheduleItem(items: CalendarItem[], now: Date): CalendarItem | null {
  const nowTime = now.getTime();
  return items.find((item) => {
    if (item.isAllDay) return true;
    const start = Date.parse(item.startAt);
    const end = Date.parse(item.endAt ?? item.startAt);
    return start >= nowTime || end >= nowTime;
  }) ?? null;
}

function compareTaskDueDates(left: Task, right: Task): number {
  const difference = Date.parse(left.dueAt!) - Date.parse(right.dueAt!);
  return difference || left.id.localeCompare(right.id);
}

function compareScheduleItems(left: CalendarItem, right: CalendarItem): number {
  if (left.isAllDay !== right.isAllDay) return left.isAllDay ? -1 : 1;
  const difference = Date.parse(left.startAt) - Date.parse(right.startAt);
  return difference || left.id.localeCompare(right.id);
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addLocalDays(value: Date, days: number): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
}

function isWithin(value: string, fromInclusive: Date, toExclusive: Date): boolean {
  const timestamp = Date.parse(value);
  return timestamp >= fromInclusive.getTime() && timestamp < toExclusive.getTime();
}
