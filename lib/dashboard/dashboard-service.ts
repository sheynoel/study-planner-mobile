import { ApiClientError, getApiErrorMessage } from '@/lib/api/api-client';
import type { CalendarEvent } from '@/lib/api/calendar-event.types';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import type { FileRecord } from '@/lib/api/file.types';
import type { Task } from '@/lib/api/task.types';
import { getCalendarEvents } from '@/lib/api/calendar-events';
import { getClassSchedules } from '@/lib/api/class-schedules';
import { getCourses } from '@/lib/api/courses';
import { getFiles } from '@/lib/api/files';
import { getTasks } from '@/lib/api/tasks';
import { toLocalDateKey } from '@/lib/calendar/calendar-date';

export type DashboardSource = 'courses' | 'tasks' | 'events' | 'schedules' | 'files';

export type DashboardLoadResult = {
  courses: Course[];
  tasks: Task[];
  events: CalendarEvent[];
  schedules: ClassSchedule[];
  files: FileRecord[];
  errors: Partial<Record<DashboardSource, string>>;
  unauthorized: boolean;
};

export async function loadDashboardData(
  accessToken: string,
  now = new Date(),
): Promise<DashboardLoadResult> {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 23, 59, 59, 999);
  const firstDate = toLocalDateKey(start);
  const lastDate = toLocalDateKey(end);
  const requests = await Promise.allSettled([
    getCourses(accessToken),
    getTasks(accessToken),
    getCalendarEvents(accessToken, { from: start.toISOString(), to: end.toISOString() }),
    getClassSchedules(accessToken, { from: firstDate, to: lastDate }),
    getFiles(accessToken),
  ] as const);
  const sources: DashboardSource[] = ['courses', 'tasks', 'events', 'schedules', 'files'];
  const errors: Partial<Record<DashboardSource, string>> = {};

  requests.forEach((result, index) => {
    if (result.status === 'rejected') errors[sources[index]] = getApiErrorMessage(result.reason);
  });

  return {
    courses: requests[0].status === 'fulfilled' ? requests[0].value.data.courses : [],
    tasks: requests[1].status === 'fulfilled' ? requests[1].value.data.tasks : [],
    events: requests[2].status === 'fulfilled' ? requests[2].value.data.events : [],
    schedules: requests[3].status === 'fulfilled' ? requests[3].value.data.schedules : [],
    files: requests[4].status === 'fulfilled' ? requests[4].value.data.files : [],
    errors,
    unauthorized: requests.some(
      (result) => result.status === 'rejected' && result.reason instanceof ApiClientError && result.reason.status === 401,
    ),
  };
}
