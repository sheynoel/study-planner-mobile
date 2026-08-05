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
import type { CreateTaskRequest, Task, TaskFilters, UpdateTaskRequest } from '@/lib/api/task.types';
import {
  completeTask as completeTaskRequest,
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  getTask as getTaskRequest,
  getTasks as getTasksRequest,
  updateTask as updateTaskRequest,
} from '@/lib/api/tasks';

type TaskListStatus = 'idle' | 'loading' | 'success' | 'error';

type TaskContextValue = {
  tasks: Task[];
  listStatus: TaskListStatus;
  listError: string | null;
  loadTasks: (filters?: TaskFilters) => Promise<void>;
  loadTask: (id: string) => Promise<Task>;
  getCachedTask: (id: string) => Task | undefined;
  createTask: (request: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, request: UpdateTaskRequest) => Promise<Task>;
  completeTask: (id: string) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: PropsWithChildren) {
  const { accessToken, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [listStatus, setListStatus] = useState<TaskListStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const activeFilters = useRef<TaskFilters>({});

  const runAuthenticated = useCallback(
    async <T,>(request: (accessToken: string) => Promise<T>): Promise<T> => {
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

  const upsertTask = useCallback((task: Task) => {
    setTasks((current) => {
      if (!current.some((candidate) => candidate.id === task.id)) return [task, ...current];
      return current.map((candidate) => (candidate.id === task.id ? task : candidate));
    });
  }, []);

  const loadTasks = useCallback(
    async (filters: TaskFilters = activeFilters.current) => {
      activeFilters.current = filters;
      setListStatus('loading');
      setListError(null);

      try {
        const response = await runAuthenticated((token) => getTasksRequest(token, filters));
        setTasks(response.data.tasks);
        setListStatus('success');
      } catch (error) {
        setListError(getApiErrorMessage(error));
        setListStatus('error');
        throw error;
      }
    },
    [runAuthenticated],
  );

  const loadTask = useCallback(
    async (id: string) => {
      const response = await runAuthenticated((token) => getTaskRequest(token, id));
      upsertTask(response.data.task);
      return response.data.task;
    },
    [runAuthenticated, upsertTask],
  );

  const refreshAfterMutation = useCallback(async () => {
    try {
      await loadTasks(activeFilters.current);
    } catch {
      // Keep the confirmed mutation result if the follow-up refresh fails.
    }
  }, [loadTasks]);

  const createTask = useCallback(
    async (request: CreateTaskRequest) => {
      const response = await runAuthenticated((token) => createTaskRequest(token, request));
      upsertTask(response.data.task);
      await refreshAfterMutation();
      return response.data.task;
    },
    [refreshAfterMutation, runAuthenticated, upsertTask],
  );

  const updateTask = useCallback(
    async (id: string, request: UpdateTaskRequest) => {
      const response = await runAuthenticated((token) => updateTaskRequest(token, id, request));
      upsertTask(response.data.task);
      await refreshAfterMutation();
      return response.data.task;
    },
    [refreshAfterMutation, runAuthenticated, upsertTask],
  );

  const completeTask = useCallback(
    async (id: string) => {
      const response = await runAuthenticated((token) => completeTaskRequest(token, id));
      upsertTask(response.data.task);
      await refreshAfterMutation();
      return response.data.task;
    },
    [refreshAfterMutation, runAuthenticated, upsertTask],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await runAuthenticated((token) => deleteTaskRequest(token, id));
      setTasks((current) => current.filter((task) => task.id !== id));
      await refreshAfterMutation();
    },
    [refreshAfterMutation, runAuthenticated],
  );

  const getCachedTask = useCallback(
    (id: string) => tasks.find((task) => task.id === id),
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      listStatus,
      listError,
      loadTasks,
      loadTask,
      getCachedTask,
      createTask,
      updateTask,
      completeTask,
      deleteTask,
    }),
    [
      tasks,
      listStatus,
      listError,
      loadTasks,
      loadTask,
      getCachedTask,
      createTask,
      updateTask,
      completeTask,
      deleteTask,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used inside TaskProvider.');
  return context;
}
