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
import { ApiClientError, getApiErrorMessage } from '@/lib/api/api-client';
import type {
  ClassSchedule,
  ClassScheduleFilters,
  CreateClassScheduleRequest,
  UpdateClassScheduleRequest,
} from '@/lib/api/class-schedule.types';
import {
  createClassSchedule as createClassScheduleRequest,
  deleteClassSchedule as deleteClassScheduleRequest,
  getClassSchedule as getClassScheduleRequest,
  getClassSchedules,
  updateClassSchedule as updateClassScheduleRequest,
} from '@/lib/api/class-schedules';

type ListStatus = 'idle' | 'loading' | 'success' | 'error';

type ClassScheduleContextValue = {
  schedules: ClassSchedule[];
  listError: string | null;
  listStatus: ListStatus;
  createSchedule: (request: CreateClassScheduleRequest) => Promise<ClassSchedule>;
  deleteSchedule: (id: string) => Promise<void>;
  fetchSchedules: (filters?: ClassScheduleFilters) => Promise<ClassSchedule[]>;
  getCachedSchedule: (id: string) => ClassSchedule | undefined;
  loadCourseSchedules: (courseId: string) => Promise<void>;
  loadSchedule: (id: string) => Promise<ClassSchedule>;
  updateSchedule: (id: string, request: UpdateClassScheduleRequest) => Promise<ClassSchedule>;
};

const ClassScheduleContext = createContext<ClassScheduleContextValue | null>(null);

export function ClassScheduleProvider({ children }: PropsWithChildren) {
  const { accessToken, logout } = useAuth();
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const listRequestId = useRef(0);

  const runAuthenticated = useCallback(async <T,>(request: (token: string) => Promise<T>) => {
    if (!accessToken) throw new Error('Your session is unavailable. Please sign in again.');
    try {
      return await request(accessToken);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) await logout();
      throw error;
    }
  }, [accessToken, logout]);

  const upsert = useCallback((schedule: ClassSchedule) => {
    setSchedules((current) => current.some((item) => item.id === schedule.id)
      ? current.map((item) => item.id === schedule.id ? schedule : item)
      : [...current, schedule]);
  }, []);

  const fetchSchedules = useCallback(async (filters: ClassScheduleFilters = {}) => {
    const response = await runAuthenticated((token) => getClassSchedules(token, filters));
    return response.data.schedules;
  }, [runAuthenticated]);

  const loadCourseSchedules = useCallback(async (courseId: string) => {
    const requestId = ++listRequestId.current;
    setListStatus('loading');
    setListError(null);
    try {
      const loaded = await fetchSchedules({ courseId });
      if (requestId !== listRequestId.current) return;
      setSchedules(loaded);
      setListStatus('success');
    } catch (error) {
      if (requestId !== listRequestId.current) return;
      setListError(getApiErrorMessage(error));
      setListStatus('error');
      throw error;
    }
  }, [fetchSchedules]);

  const loadSchedule = useCallback(async (id: string) => {
    const response = await runAuthenticated((token) => getClassScheduleRequest(token, id));
    upsert(response.data.schedule);
    return response.data.schedule;
  }, [runAuthenticated, upsert]);

  const createSchedule = useCallback(async (request: CreateClassScheduleRequest) => {
    const response = await runAuthenticated((token) => createClassScheduleRequest(token, request));
    upsert(response.data.schedule);
    try { await loadCourseSchedules(request.courseId); } catch { /* Keep confirmed create response. */ }
    return response.data.schedule;
  }, [loadCourseSchedules, runAuthenticated, upsert]);

  const updateSchedule = useCallback(async (id: string, request: UpdateClassScheduleRequest) => {
    const response = await runAuthenticated((token) => updateClassScheduleRequest(token, id, request));
    upsert(response.data.schedule);
    try { await loadCourseSchedules(response.data.schedule.courseId); } catch { /* Keep confirmed update. */ }
    return response.data.schedule;
  }, [loadCourseSchedules, runAuthenticated, upsert]);

  const deleteSchedule = useCallback(async (id: string) => {
    await runAuthenticated((token) => deleteClassScheduleRequest(token, id));
    setSchedules((current) => current.filter((schedule) => schedule.id !== id));
  }, [runAuthenticated]);

  const getCachedSchedule = useCallback(
    (id: string) => schedules.find((schedule) => schedule.id === id),
    [schedules],
  );

  const value = useMemo(() => ({
    schedules, listError, listStatus, createSchedule, deleteSchedule, fetchSchedules,
    getCachedSchedule, loadCourseSchedules, loadSchedule, updateSchedule,
  }), [
    createSchedule, deleteSchedule, fetchSchedules, getCachedSchedule, listError, listStatus,
    loadCourseSchedules, loadSchedule, schedules, updateSchedule,
  ]);

  return <ClassScheduleContext.Provider value={value}>{children}</ClassScheduleContext.Provider>;
}

export function useClassSchedules(): ClassScheduleContextValue {
  const context = useContext(ClassScheduleContext);
  if (!context) throw new Error('useClassSchedules must be used inside ClassScheduleProvider.');
  return context;
}
