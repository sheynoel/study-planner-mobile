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
  ScheduleGroupRequest,
  ScheduleGroupResponse,
  UpsertScheduleExceptionRequest,
} from '@/lib/api/class-schedule.types';
import { normalizeClassSchedule, normalizeClassSchedules } from '@/lib/api/class-schedule-normalization';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function createScheduleGroup(accessToken: string, request: ScheduleGroupRequest): Promise<ScheduleGroupResponse> {
  const response = await getApiClient().post<unknown, ScheduleGroupRequest>('/class-schedules/groups', request, { acceptedStatuses: [201], headers: bearerHeaders(accessToken) });
  return readGroupResponse(response);
}

export async function getScheduleGroup(accessToken: string, id: string): Promise<ScheduleGroupResponse> {
  return readGroupResponse(await getApiClient().get<unknown>(`/class-schedules/groups/${encodeURIComponent(id)}`, { headers: bearerHeaders(accessToken) }));
}

export async function updateScheduleGroup(accessToken: string, id: string, request: ScheduleGroupRequest): Promise<ScheduleGroupResponse> {
  return readGroupResponse(await getApiClient().patch<unknown, ScheduleGroupRequest>(`/class-schedules/groups/${encodeURIComponent(id)}`, request, { headers: bearerHeaders(accessToken) }));
}

export async function deleteScheduleGroup(accessToken: string, id: string): Promise<DeleteClassScheduleResponse> {
  const response = await getApiClient().delete<unknown>(`/class-schedules/groups/${encodeURIComponent(id)}`, { headers: bearerHeaders(accessToken) });
  const data = readData(response); if (!data || typeof data.message !== 'string') return invalidResponse();
  return { data: { message: data.message } };
}

export async function upsertScheduleException(accessToken: string, id: string, request: UpsertScheduleExceptionRequest) {
  return getApiClient().post<unknown, UpsertScheduleExceptionRequest>(`${schedulePath(id)}/exceptions`, request, { headers: bearerHeaders(accessToken) });
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
  const schedules = data ? normalizeClassSchedules(data.schedules) : null;
  if (!schedules) return invalidResponse();
  return { data: { schedules } };
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
  const schedule = data ? normalizeClassSchedule(data.schedule) : null;
  if (!schedule) return invalidResponse();
  return { data: { schedule } };
}

function readGroupResponse(value: unknown): ScheduleGroupResponse {
  const data = readData(value);
  if (!data || typeof data.groupId !== 'string') return invalidResponse();
  const schedules = normalizeClassSchedules(data.schedules);
  if (!schedules) return invalidResponse();
  return { data: { groupId: data.groupId, schedules } };
}
