import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useTasks } from '@/contexts/task-context';
import type { CalendarEvent, CalendarItem } from '@/lib/api/calendar-event.types';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import type { FileRecord } from '@/lib/api/file.types';
import type { Task } from '@/lib/api/task.types';
import { normalizeCalendarItems } from '@/lib/calendar/calendar-items';
import { toLocalDateKey } from '@/lib/calendar/calendar-date';
import { buildDashboardSections, type DashboardSections } from '@/lib/dashboard/dashboard-data';
import {
  loadDashboardData,
  type DashboardSource,
} from '@/lib/dashboard/dashboard-service';

type DashboardContextValue = DashboardSections & {
  courses: Course[];
  files: FileRecord[];
  tasks: Task[];
  errors: Partial<Record<DashboardSource, string>>;
  hasLoaded: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  completeTask: (id: string) => Promise<Task>;
  refresh: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: PropsWithChildren) {
  const { accessToken, logout } = useAuth();
  const { completeTask: completeSharedTask } = useTasks();
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [errors, setErrors] = useState<Partial<Record<DashboardSource, string>>>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestId = useRef(0);
  const snapshotTime = useRef(new Date());
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    const currentRequest = ++requestId.current;
    if (hasLoadedRef.current) setIsRefreshing(true);
    else setIsLoading(true);

    const now = new Date();
    const result = await loadDashboardData(accessToken, now);
    if (currentRequest !== requestId.current) return;
    if (result.unauthorized) {
      await logout();
      return;
    }

    snapshotTime.current = now;
    setCourses(result.courses);
    setTasks(result.tasks);
    setEvents(result.events);
    setSchedules(result.schedules);
    setFiles(result.files);
    setErrors(result.errors);
    setHasLoaded(true);
    hasLoadedRef.current = true;
    setIsLoading(false);
    setIsRefreshing(false);
  }, [accessToken, logout]);

  const completeTask = useCallback(async (id: string) => {
    const completed = await completeSharedTask(id);
    setTasks((current) => current.map((task) => task.id === id ? completed : task));
    return completed;
  }, [completeSharedTask]);

  const scheduleItems = useMemo<CalendarItem[]>(() => {
    const now = snapshotTime.current;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 23, 59, 59, 999);
    return normalizeCalendarItems(events, tasks, courses, schedules, {
      from: start.toISOString(),
      to: end.toISOString(),
      firstDate: toLocalDateKey(start),
      lastDate: toLocalDateKey(end),
    });
  }, [courses, events, schedules, tasks]);

  const sections = useMemo(
    () => buildDashboardSections(tasks, scheduleItems, files, snapshotTime.current),
    [files, scheduleItems, tasks],
  );

  const value = useMemo(() => ({
    ...sections,
    courses,
    files,
    tasks,
    errors,
    hasLoaded,
    isLoading,
    isRefreshing,
    completeTask,
    refresh,
  }), [completeTask, courses, errors, files, hasLoaded, isLoading, isRefreshing, refresh, sections, tasks]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used inside DashboardProvider.');
  return context;
}
