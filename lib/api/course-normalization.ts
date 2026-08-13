import type { Course } from './course.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

export function normalizeCourse(value: unknown): Course | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.userId !== 'string' ||
    typeof value.name !== 'string' ||
    !isNullableString(value.code) ||
    !isNullableString(value.description) ||
    !isNullableString(value.instructor) ||
    !isNullableString(value.room) ||
    typeof value.color !== 'string' ||
    !/^#[0-9a-fA-F]{6}$/.test(value.color) ||
    !isValidTimestamp(value.createdAt) ||
    !isValidTimestamp(value.updatedAt)
  ) {
    return null;
  }

  const semesterId = value.semesterId ?? null;
  const archivedAt = value.archivedAt ?? null;
  if (
    !isNullableString(semesterId) ||
    !isNullableString(archivedAt) ||
    (archivedAt !== null && !isValidTimestamp(archivedAt))
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    name: value.name,
    code: value.code,
    description: value.description,
    instructor: value.instructor,
    room: value.room,
    color: value.color,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    semesterId,
    archivedAt,
  };
}

export function normalizeCourses(value: unknown): Course[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const courses = value.map(normalizeCourse);
  return courses.some((course) => course === null) ? null : (courses as Course[]);
}
