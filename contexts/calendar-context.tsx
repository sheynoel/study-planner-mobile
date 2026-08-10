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
import { useCourses } from '@/contexts/course-context';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { ApiClientError, getApiErrorMessage } from '@/lib/api/api-client';
import type {
  CalendarEvent,
  CalendarItem,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from '@/lib/api/calendar-event.types';
import {
  createCalendarEvent as createCalendarEventRequest,
  deleteCalendarEvent as deleteCalendarEventRequest,
  getCalendarEvent as getCalendarEventRequest,
  getCalendarEvents,
  updateCalendarEvent as updateCalendarEventRequest,
} from '@/lib/api/calendar-events';
import type { Task } from '@/lib/api/task.types';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import { getTasks } from '@/lib/api/tasks';
import type { CalendarRange } from '@/lib/calendar/calendar-date';
import { normalizeCalendarItems } from '@/lib/calendar/calendar-items';

type CalendarListStatus = 'idle' | 'loading' | 'success' | 'error';

type CalendarContextValue = {
  events: CalendarEvent[];
  items: CalendarItem[];
  listError: string | null;
  listStatus: CalendarListStatus;
  createEvent: (request: CreateCalendarEventRequest) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  getCachedEvent: (id: string) => CalendarEvent | undefined;
  loadEvent: (id: string) => Promise<CalendarEvent>;
  loadCourseEvents: (courseId: string) => Promise<CalendarEvent[]>;
  loadRange: (range: CalendarRange) => Promise<void>;
  refresh: () => Promise<void>;
  updateEvent: (id: string, request: UpdateCalendarEventRequest) => Promise<CalendarEvent>;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: PropsWithChildren) {
  const { accessToken, logout } = useAuth();
  const { courses, loadCourses } = useCourses();
  const { fetchSchedules } = useClassSchedules();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [listStatus, setListStatus] = useState<CalendarListStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const activeRange = useRef<CalendarRange | null>(null);
  const [displayedRange, setDisplayedRange] = useState<CalendarRange | null>(null);

  const runAuthenticated = useCallback(
    async <T,>(request: (token: string) => Promise<T>): Promise<T> => {
      if (!accessToken) throw new Error('Your session is unavailable. Please sign in again.');
      try {
        return await request(accessToken);
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) await logout();
        throw error;
      }
    },
    [accessToken, logout],
  );

  const upsertEvent = useCallback((event: CalendarEvent) => {
    setEvents((current) => current.some((item) => item.id === event.id)
      ? current.map((item) => item.id === event.id ? event : item)
      : [...current, event]);
  }, []);

  const loadRange = useCallback(async (range: CalendarRange) => {
    activeRange.current = range;
    setDisplayedRange(range);
    setListStatus('loading');
    setListError(null);
    try {
      const [eventResponse, taskResponse, scheduleResponse] = await Promise.all([
        runAuthenticated((token) => getCalendarEvents(token, { from: range.from, to: range.to })),
        runAuthenticated((token) => getTasks(token)),
        fetchSchedules({ from: range.firstDate, to: range.lastDate }),
        loadCourses(),
      ]);
      setEvents(eventResponse.data.events);
      setTasks(taskResponse.data.tasks.filter((task) => task.dueAt !== null));
      setSchedules(scheduleResponse);
      setListStatus('success');
    } catch (error) {
      setListError(getApiErrorMessage(error));
      setListStatus('error');
      throw error;
    }
  }, [fetchSchedules, loadCourses, runAuthenticated]);

  const refresh = useCallback(async () => {
    if (!activeRange.current) return;
    await loadRange(activeRange.current);
  }, [loadRange]);

  const loadEvent = useCallback(async (id: string) => {
    const response = await runAuthenticated((token) => getCalendarEventRequest(token, id));
    upsertEvent(response.data.event);
    return response.data.event;
  }, [runAuthenticated, upsertEvent]);

  const loadCourseEvents = useCallback(async (courseId: string) => {
    const response = await runAuthenticated((token) => getCalendarEvents(token, { courseId }));
    return response.data.events;
  }, [runAuthenticated]);

  const refreshAfterMutation = useCallback(async () => {
    try { await refresh(); } catch { /* Preserve the confirmed mutation response. */ }
  }, [refresh]);

  const createEvent = useCallback(async (request: CreateCalendarEventRequest) => {
    const response = await runAuthenticated((token) => createCalendarEventRequest(token, request));
    upsertEvent(response.data.event);
    await refreshAfterMutation();
    return response.data.event;
  }, [refreshAfterMutation, runAuthenticated, upsertEvent]);

  const updateEvent = useCallback(async (id: string, request: UpdateCalendarEventRequest) => {
    const response = await runAuthenticated((token) => updateCalendarEventRequest(token, id, request));
    upsertEvent(response.data.event);
    await refreshAfterMutation();
    return response.data.event;
  }, [refreshAfterMutation, runAuthenticated, upsertEvent]);

  const deleteEvent = useCallback(async (id: string) => {
    await runAuthenticated((token) => deleteCalendarEventRequest(token, id));
    setEvents((current) => current.filter((event) => event.id !== id));
    await refreshAfterMutation();
  }, [refreshAfterMutation, runAuthenticated]);

  const getCachedEvent = useCallback(
    (id: string) => events.find((event) => event.id === id),
    [events],
  );

  const items = useMemo(() => {
    const normalized = normalizeCalendarItems(events, tasks, courses, schedules, displayedRange ?? undefined);
    if (!displayedRange) return normalized;
    return normalized.filter(
      (item) => item.date >= displayedRange.firstDate && item.date <= displayedRange.lastDate,
    );
  }, [courses, displayedRange, events, schedules, tasks]);

  const value = useMemo(() => ({
    events,
    items,
    listError,
    listStatus,
    createEvent,
    deleteEvent,
    getCachedEvent,
    loadEvent,
    loadCourseEvents,
    loadRange,
    refresh,
    updateEvent,
  }), [
    createEvent, deleteEvent, events, getCachedEvent, items, listError, listStatus,
    loadCourseEvents, loadEvent, loadRange, refresh, updateEvent,
  ]);

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendar must be used inside CalendarProvider.');
  return context;
}
