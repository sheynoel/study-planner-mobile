import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import { normalizeCourse, normalizeCourses } from '@/lib/api/course-normalization';
import type {
  CourseDetailResponse,
  CourseListResponse,
  CourseResponse,
  CreateCourseRequest,
  CreateCourseResponse,
  DeleteCourseResponse,
  UpdateCourseRequest,
  UpdateCourseResponse,
} from '@/lib/api/course.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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

export async function getCourses(accessToken: string, includeArchived = false): Promise<CourseListResponse> {
  const response = await getApiClient().get<unknown>(includeArchived ? '/courses?includeArchived=true' : '/courses', {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);
  const courses = data ? normalizeCourses(data.courses) : null;

  if (!courses) {
    return invalidCourseResponse();
  }

  return { data: { courses } };
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
  const course = data ? normalizeCourse(data.course) : null;

  if (!course) {
    return invalidCourseResponse();
  }

  return { data: { course } };
}

export async function getCourse(
  accessToken: string,
  id: string,
): Promise<CourseDetailResponse> {
  const response = await getApiClient().get<unknown>(coursePath(id), {
    headers: bearerHeaders(accessToken),
  });
  const data = readData(response);
  const course = data ? normalizeCourse(data.course) : null;

  if (!course) {
    return invalidCourseResponse();
  }

  return { data: { course } };
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
  const course = data ? normalizeCourse(data.course) : null;

  if (!course) {
    return invalidCourseResponse();
  }

  return { data: { course } };
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

export async function setCourseArchived(accessToken: string, id: string, archived: boolean): Promise<CourseResponse> {
  const response = await getApiClient().patch<unknown, Record<string, never>>(`${coursePath(id)}/${archived ? 'archive' : 'unarchive'}`, {}, { headers: bearerHeaders(accessToken) });
  const data = readData(response);
  const course = data ? normalizeCourse(data.course) : null;
  if (!course) return invalidCourseResponse();
  return { data: { course } };
}
