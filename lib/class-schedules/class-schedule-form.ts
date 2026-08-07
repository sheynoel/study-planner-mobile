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

export function emptyClassScheduleForm(today = new Date()): ClassScheduleFormValues {
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const semesterEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 120);
  const endDate = `${semesterEnd.getFullYear()}-${String(semesterEnd.getMonth() + 1).padStart(2, '0')}-${String(semesterEnd.getDate()).padStart(2, '0')}`;
  return { weekday: 'MONDAY', startTime: '09:00', endTime: '10:00', room: '', startDate: date, endDate };
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
  if (!isValidTime(values.startTime)) errors.startTime = 'Use 24-hour time in HH:mm format.';
  if (!isValidTime(values.endTime)) errors.endTime = 'Use 24-hour time in HH:mm format.';
  if (isValidTime(values.startTime) && isValidTime(values.endTime) && values.endTime <= values.startTime) {
    errors.endTime = 'End time must be later than start time.';
  }
  const start = parseLocalDate(values.startDate);
  const end = parseLocalDate(values.endDate);
  if (!start) errors.startDate = 'Enter a valid date in YYYY-MM-DD format.';
  if (!end) errors.endDate = 'Enter a valid date in YYYY-MM-DD format.';
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
