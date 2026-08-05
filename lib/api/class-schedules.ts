import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import type {
  ClassSchedule,
  ClassScheduleDetailResponse,
  ClassScheduleFilters,
  ClassScheduleListResponse,
  ClassScheduleResponse,
  CreateClassScheduleRequest,
  CreateClassScheduleResponse,
  DeleteClassScheduleResponse,
  UpdateClassScheduleRequest,
  UpdateClassScheduleResponse,
} from '@/lib/api/class-schedule.types';
import { WEEKDAYS } from '@/lib/api/class-schedule.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isClassSchedule(value: unknown): value is ClassSchedule {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.courseId === 'string' &&
    typeof value.weekday === 'string' &&
    WEEKDAYS.includes(value.weekday as (typeof WEEKDAYS)[number]) &&
    typeof value.startTime === 'string' &&
    typeof value.endTime === 'string' &&
    (value.room === null || typeof value.room === 'string') &&
    typeof value.startDate === 'string' &&
    typeof value.endDate === 'string' &&
    typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt)) &&
    typeof value.updatedAt === 'string' && !Number.isNaN(Date.parse(value.updatedAt))
  );
}

function readData(value: unknown): Record<string, unknown> | null {
  return isRecord(value) && isRecord(value.data) ? value.data : null;
}

function invalidResponse(): never {
  throw new ApiClientError(
    'The API returned an unexpected class schedule response. Check that the mobile and backend versions match.',
    'invalid-response',
  );
}

function bearerHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function schedulePath(id: string): string {
  return `/class-schedules/${encodeURIComponent(id)}`;
}

function listPath(filters: ClassScheduleFilters): string {
  const parameters = new URLSearchParams();
  if (filters.courseId) parameters.set('courseId', filters.courseId);
  if (filters.from) parameters.set('from', filters.from);
  if (filters.to) parameters.set('to', filters.to);
  const query = parameters.toString();
  return query ? `/class-schedules?${query}` : '/class-schedules';
}

export async function getClassSchedules(
  accessToken: string,
  filters: ClassScheduleFilters = {},
): Promise<ClassScheduleListResponse> {
  const response = await getApiClient().get<unknown>(listPath(filters), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);
  if (!data || !Array.isArray(data.schedules) || !data.schedules.every(isClassSchedule)) {
    return invalidResponse();
  }
  return { data: { schedules: data.schedules } };
}

export async function createClassSchedule(
  accessToken: string,
  request: CreateClassScheduleRequest,
): Promise<CreateClassScheduleResponse> {
  const response = await getApiClient().post<unknown, CreateClassScheduleRequest>(
    '/class-schedules', request, { acceptedStatuses: [201], headers: bearerHeaders(accessToken) },
  );
  return readScheduleResponse(response);
}

export async function getClassSchedule(
  accessToken: string,
  id: string,
): Promise<ClassScheduleDetailResponse> {
  const response = await getApiClient().get<unknown>(schedulePath(id), {
    headers: bearerHeaders(accessToken),
  });
  return readScheduleResponse(response);
}

export async function updateClassSchedule(
  accessToken: string,
  id: string,
  request: UpdateClassScheduleRequest,
): Promise<UpdateClassScheduleResponse> {
  const response = await getApiClient().patch<unknown, UpdateClassScheduleRequest>(
    schedulePath(id), request, { headers: bearerHeaders(accessToken) },
  );
  return readScheduleResponse(response);
}

export async function deleteClassSchedule(
  accessToken: string,
  id: string,
): Promise<DeleteClassScheduleResponse> {
  const response = await getApiClient().delete<unknown>(schedulePath(id), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);
  if (!data || typeof data.message !== 'string') return invalidResponse();
  return { data: { message: data.message } };
}

function readScheduleResponse(value: unknown): ClassScheduleResponse {
  const data = readData(value);
  if (!data || !isClassSchedule(data.schedule)) return invalidResponse();
  return { data: { schedule: data.schedule } };
}
