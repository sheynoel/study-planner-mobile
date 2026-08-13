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
import {
  createCourse as createCourseRequest,
  deleteCourse as deleteCourseRequest,
  getCourse as getCourseRequest,
  getCourses as getCoursesRequest,
  updateCourse as updateCourseRequest,
  setCourseArchived as setCourseArchivedRequest,
} from '@/lib/api/courses';
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '@/lib/api/course.types';
import type { CourseListStatus } from '@/lib/courses/course-list-state';

type CourseContextValue = {
  courses: Course[];
  createCourse: (request: CreateCourseRequest) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  getCachedCourse: (id: string) => Course | undefined;
  listError: string | null;
  listStatus: CourseListStatus;
  loadCourse: (id: string) => Promise<Course>;
  loadCourses: () => Promise<void>;
  updateCourse: (id: string, request: UpdateCourseRequest) => Promise<Course>;
  setCourseArchived: (id: string, archived: boolean) => Promise<Course>;
};

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: PropsWithChildren) {
  const { accessToken, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [listStatus, setListStatus] = useState<CourseListStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const listRequestId = useRef(0);

  const runAuthenticated = useCallback(
    async <T,>(request: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!accessToken) {
        throw new Error('Your session is unavailable. Please sign in again.');
      }

      try {
        return await request(accessToken);
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          await logout();
        }

        throw error;
      }
    },
    [accessToken, logout],
  );

  const upsertCourse = useCallback((course: Course) => {
    setCourses((currentCourses) => {
      const existingIndex = currentCourses.findIndex((candidate) => candidate.id === course.id);

      if (existingIndex === -1) {
        return [course, ...currentCourses];
      }

      return currentCourses.map((candidate) =>
        candidate.id === course.id ? course : candidate,
      );
    });
  }, []);

  const loadCourses = useCallback(async () => {
    const requestId = ++listRequestId.current;
    setListStatus('loading');
    setListError(null);

    try {
      const response = await runAuthenticated((token) => getCoursesRequest(token));
      if (requestId !== listRequestId.current) return;
      setCourses(response.data.courses);
      setListStatus('success');
    } catch (error) {
      if (requestId !== listRequestId.current) return;
      setListError(getApiErrorMessage(error));
      setListStatus('error');
      throw error;
    }
  }, [runAuthenticated]);

  const loadCourse = useCallback(
    async (id: string) => {
      const response = await runAuthenticated((token) => getCourseRequest(token, id));
      upsertCourse(response.data.course);
      return response.data.course;
    },
    [runAuthenticated, upsertCourse],
  );

  const createCourse = useCallback(
    async (request: CreateCourseRequest) => {
      const response = await runAuthenticated((token) => createCourseRequest(token, request));
      upsertCourse(response.data.course);

      try {
        await loadCourses();
      } catch {
        // The confirmed create response remains usable if the follow-up list refresh fails.
      }

      return response.data.course;
    },
    [loadCourses, runAuthenticated, upsertCourse],
  );

  const updateCourse = useCallback(
    async (id: string, request: UpdateCourseRequest) => {
      const response = await runAuthenticated((token) => updateCourseRequest(token, id, request));
      upsertCourse(response.data.course);

      try {
        return await loadCourse(id);
      } catch {
        // Keep the server-confirmed PATCH response when the follow-up detail refresh fails.
        return response.data.course;
      }
    },
    [loadCourse, runAuthenticated, upsertCourse],
  );

  const deleteCourse = useCallback(
    async (id: string) => {
      await runAuthenticated((token) => deleteCourseRequest(token, id));
      setCourses((currentCourses) => currentCourses.filter((course) => course.id !== id));
    },
    [runAuthenticated],
  );

  const setCourseArchived = useCallback(async (id: string, archived: boolean) => {
    const response = await runAuthenticated((token) => setCourseArchivedRequest(token, id, archived));
    setCourses((current) => archived ? current.filter((course) => course.id !== id) : [response.data.course, ...current.filter((course) => course.id !== id)]);
    return response.data.course;
  }, [runAuthenticated]);

  const getCachedCourse = useCallback(
    (id: string) => courses.find((course) => course.id === id),
    [courses],
  );

  const value = useMemo(
    () => ({
      courses,
      createCourse,
      deleteCourse,
      getCachedCourse,
      listError,
      listStatus,
      loadCourse,
      loadCourses,
      updateCourse,
      setCourseArchived,
    }),
    [
      courses,
      createCourse,
      deleteCourse,
      getCachedCourse,
      listError,
      listStatus,
      loadCourse,
      loadCourses,
      updateCourse,
      setCourseArchived,
    ],
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourses(): CourseContextValue {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error('useCourses must be used inside CourseProvider.');
  }

  return context;
}
