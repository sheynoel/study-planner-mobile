import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import type {
  CompleteTaskResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  DeleteTaskResponse,
  Task,
  TaskDetailResponse,
  TaskFilters,
  TaskListResponse,
  TaskPriority,
  TaskResponse,
  TaskStatus,
  UpdateTaskRequest,
  UpdateTaskResponse,
} from '@/lib/api/task.types';

const TASK_STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const TASK_PRIORITIES: readonly TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isNullableDate(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value)));
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    isNullableString(value.courseId) &&
    typeof value.title === 'string' &&
    isNullableString(value.description) &&
    typeof value.status === 'string' &&
    TASK_STATUSES.includes(value.status as TaskStatus) &&
    typeof value.priority === 'string' &&
    TASK_PRIORITIES.includes(value.priority as TaskPriority) &&
    isNullableDate(value.dueAt) &&
    isNullableDate(value.completedAt) &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.updatedAt))
  );
}

function readData(value: unknown): Record<string, unknown> | null {
  return isRecord(value) && isRecord(value.data) ? value.data : null;
}

function invalidTaskResponse(): never {
  throw new ApiClientError(
    'The API returned an unexpected task response. Check that the mobile and backend versions match.',
    'invalid-response',
  );
}

function bearerHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function taskPath(id: string): string {
  return `/tasks/${encodeURIComponent(id)}`;
}

function taskListPath(filters: TaskFilters): string {
  const parameters = new URLSearchParams();

  if (filters.status) parameters.set('status', filters.status);
  if (filters.priority) parameters.set('priority', filters.priority);
  if (filters.courseId) parameters.set('courseId', filters.courseId);
  if (filters.due) parameters.set('due', filters.due);

  const query = parameters.toString();
  return query ? `/tasks?${query}` : '/tasks';
}

export async function getTasks(
  accessToken: string,
  filters: TaskFilters = {},
): Promise<TaskListResponse> {
  const response = await getApiClient().get<unknown>(taskListPath(filters), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);

  if (!data || !Array.isArray(data.tasks) || !data.tasks.every(isTask)) {
    return invalidTaskResponse();
  }

  return { data: { tasks: data.tasks } };
}

export async function createTask(
  accessToken: string,
  request: CreateTaskRequest,
): Promise<CreateTaskResponse> {
  const response = await getApiClient().post<unknown, CreateTaskRequest>('/tasks', request, {
    acceptedStatuses: [201],
    headers: bearerHeaders(accessToken),
  });
  return readTaskResponse(response);
}

export async function getTask(
  accessToken: string,
  id: string,
): Promise<TaskDetailResponse> {
  const response = await getApiClient().get<unknown>(taskPath(id), {
    headers: bearerHeaders(accessToken),
  });
  return readTaskResponse(response);
}

export async function updateTask(
  accessToken: string,
  id: string,
  request: UpdateTaskRequest,
): Promise<UpdateTaskResponse> {
  const response = await getApiClient().patch<unknown, UpdateTaskRequest>(
    taskPath(id),
    request,
    { headers: bearerHeaders(accessToken) },
  );
  return readTaskResponse(response);
}

export async function completeTask(
  accessToken: string,
  id: string,
): Promise<CompleteTaskResponse> {
  const response = await getApiClient().patch<unknown, Record<string, never>>(
    `${taskPath(id)}/complete`,
    {},
    { headers: bearerHeaders(accessToken) },
  );
  return readTaskResponse(response);
}

export async function deleteTask(
  accessToken: string,
  id: string,
): Promise<DeleteTaskResponse> {
  const response = await getApiClient().delete<unknown>(taskPath(id), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);

  if (!data || typeof data.message !== 'string') {
    return invalidTaskResponse();
  }

  return { data: { message: data.message } };
}

function readTaskResponse(value: unknown): TaskResponse {
  const data = readData(value);

  if (!data || !isTask(data.task)) {
    return invalidTaskResponse();
  }

  return { data: { task: data.task } };
}
