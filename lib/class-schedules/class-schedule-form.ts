import type { ClassSchedule, CreateClassScheduleRequest, Weekday } from '@/lib/api/class-schedule.types';
import { isValidTime, parseLocalDate } from '@/lib/calendar/calendar-date';

export type ClassScheduleFormValues = {
  weekday: Weekday;
  startTime: string;
  endTime: string;
  room: string;
  startDate: string;
  endDate: string;
};

export type ClassScheduleFormField = keyof ClassScheduleFormValues;
export type ClassScheduleFormErrors = Partial<Record<ClassScheduleFormField, string>>;

export type CourseScheduleFormValues = Omit<ClassScheduleFormValues, 'weekday'> & {
  weekdays: Weekday[];
};

export type CourseScheduleFormErrors = ClassScheduleFormErrors & { weekdays?: string };

export function emptyClassScheduleForm(today = new Date()): ClassScheduleFormValues {
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const semesterEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 120);
  const endDate = `${semesterEnd.getFullYear()}-${String(semesterEnd.getMonth() + 1).padStart(2, '0')}-${String(semesterEnd.getDate()).padStart(2, '0')}`;
  return { weekday: 'MONDAY', startTime: '09:00', endTime: '10:00', room: '', startDate: date, endDate };
}

export function emptyCourseScheduleForm(today = new Date()): CourseScheduleFormValues {
  const { weekday: _weekday, ...sharedValues } = emptyClassScheduleForm(today);
  return { ...sharedValues, weekdays: [] };
}

export function validateCourseScheduleForm(values: CourseScheduleFormValues): CourseScheduleFormErrors {
  const [weekday] = values.weekdays;
  const errors: CourseScheduleFormErrors = validateClassScheduleForm({
    ...values,
    weekday: weekday ?? 'MONDAY',
  });
  if (!values.weekdays.length) errors.weekdays = 'Select at least one day.';
  return errors;
}

export function classScheduleToForm(schedule: ClassSchedule): ClassScheduleFormValues {
  return {
    weekday: schedule.weekday,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    room: schedule.room ?? '',
    startDate: schedule.startDate,
    endDate: schedule.endDate,
  };
}

export function validateClassScheduleForm(values: ClassScheduleFormValues): ClassScheduleFormErrors {
  const errors: ClassScheduleFormErrors = {};
  if (!isValidTime(values.startTime)) errors.startTime = 'Choose a valid start time.';
  if (!isValidTime(values.endTime)) errors.endTime = 'Choose a valid end time.';
  if (isValidTime(values.startTime) && isValidTime(values.endTime) && values.endTime <= values.startTime) {
    errors.endTime = 'End time must be later than start time.';
  }
  const start = parseLocalDate(values.startDate);
  const end = parseLocalDate(values.endDate);
  if (!start) errors.startDate = 'Choose a valid start date.';
  if (!end) errors.endDate = 'Choose a valid end date.';
  if (start && end && end < start) errors.endDate = 'End date cannot be before start date.';
  if (values.room.trim().length > 100) errors.room = 'Room must be 100 characters or fewer.';
  return errors;
}

export function toCreateScheduleRequest(
  courseId: string,
  values: ClassScheduleFormValues,
): CreateClassScheduleRequest {
  return {
    courseId,
    weekday: values.weekday,
    startTime: values.startTime,
    endTime: values.endTime,
    room: values.room.trim() || null,
    startDate: values.startDate,
    endDate: values.endDate,
  };
}
