import type { Course, CreateCourseRequest, UpdateCourseRequest } from '@/lib/api/course.types';

export const COURSE_COLORS = [
  '#0A7EA4',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#16A34A',
  '#475569',
] as const;

export type CourseFormValues = {
  name: string;
  code: string;
  description: string;
  instructor: string;
  room: string;
  color: string;
};

export type CourseFormField = keyof CourseFormValues;
export type CourseFormErrors = Partial<Record<CourseFormField, string>>;

export const EMPTY_COURSE_FORM: CourseFormValues = {
  name: '',
  code: '',
  description: '',
  instructor: '',
  room: '',
  color: COURSE_COLORS[0],
};

export function courseToFormValues(course: Course): CourseFormValues {
  return {
    name: course.name,
    code: course.code ?? '',
    description: course.description ?? '',
    instructor: course.instructor ?? '',
    room: course.room ?? '',
    color: course.color,
  };
}

export function validateCourseForm(values: CourseFormValues): CourseFormErrors {
  const errors: CourseFormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = 'Course name is required.';
  } else if (name.length > 100) {
    errors.name = 'Course name must be at most 100 characters.';
  }

  if (values.code.trim().length > 50) {
    errors.code = 'Code must be at most 50 characters.';
  }

  if (values.description.trim().length > 2_000) {
    errors.description = 'Description must be at most 2,000 characters.';
  }

  if (values.instructor.trim().length > 100) {
    errors.instructor = 'Instructor must be at most 100 characters.';
  }

  if (values.room.trim().length > 100) {
    errors.room = 'Room must be at most 100 characters.';
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(values.color)) {
    errors.color = 'Select a valid course color.';
  }

  return errors;
}

function nullableTrimmed(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function toCreateCourseRequest(values: CourseFormValues): CreateCourseRequest {
  return {
    name: values.name.trim(),
    code: nullableTrimmed(values.code),
    description: nullableTrimmed(values.description),
    instructor: nullableTrimmed(values.instructor),
    room: nullableTrimmed(values.room),
    color: values.color,
  };
}

export function toUpdateCourseRequest(values: CourseFormValues): UpdateCourseRequest {
  return toCreateCourseRequest(values);
}
