import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import type {
  Course,
  CourseDetailResponse,
  CourseListResponse,
  CreateCourseRequest,
  CreateCourseResponse,
  DeleteCourseResponse,
  UpdateCourseRequest,
  UpdateCourseResponse,
} from '@/lib/api/course.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isCourse(value: unknown): value is Course {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.name === 'string' &&
    isNullableString(value.code) &&
    isNullableString(value.description) &&
    isNullableString(value.instructor) &&
    isNullableString(value.room) &&
    typeof value.color === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(value.color) &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.updatedAt))
  );
}

function readData(value: unknown): Record<string, unknown> | null {
  return isRecord(value) && isRecord(value.data) ? value.data : null;
}

function invalidCourseResponse(): never {
  throw new ApiClientError(
    'The API returned an unexpected course response. Check that the mobile and backend versions match.',
    'invalid-response',
  );
}

function bearerHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function coursePath(id: string): string {
  return `/courses/${encodeURIComponent(id)}`;
}

export async function getCourses(accessToken: string): Promise<CourseListResponse> {
  const response = await getApiClient().get<unknown>('/courses', {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);

  if (!data || !Array.isArray(data.courses) || !data.courses.every(isCourse)) {
    return invalidCourseResponse();
  }

  return { data: { courses: data.courses } };
}

export async function createCourse(
  accessToken: string,
  request: CreateCourseRequest,
): Promise<CreateCourseResponse> {
  const response = await getApiClient().post<unknown, CreateCourseRequest>('/courses', request, {
    acceptedStatuses: [201],
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);

  if (!data || !isCourse(data.course)) {
    return invalidCourseResponse();
  }

  return { data: { course: data.course } };
}

export async function getCourse(
  accessToken: string,
  id: string,
): Promise<CourseDetailResponse> {
  const response = await getApiClient().get<unknown>(coursePath(id), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);

  if (!data || !isCourse(data.course)) {
    return invalidCourseResponse();
  }

  return { data: { course: data.course } };
}

export async function updateCourse(
  accessToken: string,
  id: string,
  request: UpdateCourseRequest,
): Promise<UpdateCourseResponse> {
  const response = await getApiClient().patch<unknown, UpdateCourseRequest>(
    coursePath(id),
    request,
    { headers: bearerHeaders(accessToken) },
  );
  const data = readData(response);

  if (!data || !isCourse(data.course)) {
    return invalidCourseResponse();
  }

  return { data: { course: data.course } };
}

export async function deleteCourse(
  accessToken: string,
  id: string,
): Promise<DeleteCourseResponse> {
  const response = await getApiClient().delete<unknown>(coursePath(id), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);

  if (!data || typeof data.message !== 'string') {
    return invalidCourseResponse();
  }

  return { data: { message: data.message } };
}
