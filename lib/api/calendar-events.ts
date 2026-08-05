import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import type {
  CalendarEvent,
  CalendarEventDetailResponse,
  CalendarEventFilters,
  CalendarEventListResponse,
  CalendarEventResponse,
  CreateCalendarEventRequest,
  CreateCalendarEventResponse,
  DeleteCalendarEventResponse,
  UpdateCalendarEventRequest,
  UpdateCalendarEventResponse,
} from '@/lib/api/calendar-event.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isNullableDateString(value: unknown): value is string | null {
  return value === null || isDateString(value);
}

function isCalendarEvent(value: unknown): value is CalendarEvent {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    isNullableString(value.courseId) &&
    typeof value.title === 'string' &&
    isNullableString(value.description) &&
    isNullableString(value.location) &&
    isDateString(value.startAt) &&
    isNullableDateString(value.endAt) &&
    typeof value.isAllDay === 'boolean' &&
    isNullableString(value.color) &&
    isDateString(value.createdAt) &&
    isDateString(value.updatedAt)
  );
}

function readData(value: unknown): Record<string, unknown> | null {
  return isRecord(value) && isRecord(value.data) ? value.data : null;
}

function invalidCalendarEventResponse(): never {
  throw new ApiClientError(
    'The API returned an unexpected calendar event response. Check that the mobile and backend versions match.',
    'invalid-response',
  );
}

function bearerHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function eventPath(id: string): string {
  return `/calendar-events/${encodeURIComponent(id)}`;
}

function listPath(filters: CalendarEventFilters): string {
  const parameters = new URLSearchParams();
  if (filters.from) parameters.set('from', filters.from);
  if (filters.to) parameters.set('to', filters.to);
  if (filters.courseId) parameters.set('courseId', filters.courseId);
  const query = parameters.toString();
  return query ? `/calendar-events?${query}` : '/calendar-events';
}

export async function getCalendarEvents(
  accessToken: string,
  filters: CalendarEventFilters = {},
): Promise<CalendarEventListResponse> {
  const response = await getApiClient().get<unknown>(listPath(filters), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);

  if (!data || !Array.isArray(data.events) || !data.events.every(isCalendarEvent)) {
    return invalidCalendarEventResponse();
  }

  return { data: { events: data.events } };
}

export async function createCalendarEvent(
  accessToken: string,
  request: CreateCalendarEventRequest,
): Promise<CreateCalendarEventResponse> {
  const response = await getApiClient().post<unknown, CreateCalendarEventRequest>(
    '/calendar-events',
    request,
    { acceptedStatuses: [201], headers: bearerHeaders(accessToken) },
  );
  return readEventResponse(response);
}

export async function getCalendarEvent(
  accessToken: string,
  id: string,
): Promise<CalendarEventDetailResponse> {
  const response = await getApiClient().get<unknown>(eventPath(id), {
    headers: bearerHeaders(accessToken),
  });
  return readEventResponse(response);
}

export async function updateCalendarEvent(
  accessToken: string,
  id: string,
  request: UpdateCalendarEventRequest,
): Promise<UpdateCalendarEventResponse> {
  const response = await getApiClient().patch<unknown, UpdateCalendarEventRequest>(
    eventPath(id),
    request,
    { headers: bearerHeaders(accessToken) },
  );
  return readEventResponse(response);
}

export async function deleteCalendarEvent(
  accessToken: string,
  id: string,
): Promise<DeleteCalendarEventResponse> {
  const response = await getApiClient().delete<unknown>(eventPath(id), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);

  if (!data || typeof data.message !== 'string') return invalidCalendarEventResponse();
  return { data: { message: data.message } };
}

function readEventResponse(value: unknown): CalendarEventResponse {
  const data = readData(value);
  if (!data || !isCalendarEvent(data.event)) return invalidCalendarEventResponse();
  return { data: { event: data.event } };
}
