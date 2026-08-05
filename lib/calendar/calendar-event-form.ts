import type {
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from '@/lib/api/calendar-event.types';
import {
  combineLocalDateTime,
  formatTimeInput,
  isValidTime,
  parseLocalDate,
  toLocalDateKey,
} from '@/lib/calendar/calendar-date';

export const CALENDAR_EVENT_COLORS = [
  '#0A7EA4',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#16A34A',
] as const;

export type CalendarEventFormValues = {
  title: string;
  description: string;
  location: string;
  courseId: string | null;
  startDate: string;
  startTime: string;
  hasEnd: boolean;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
  color: string | null;
};

export type CalendarEventFormField = keyof CalendarEventFormValues;
export type CalendarEventFormErrors = Partial<Record<CalendarEventFormField, string>>;

export function createEmptyCalendarEventForm(date = new Date()): CalendarEventFormValues {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1, 0);
  return {
    title: '',
    description: '',
    location: '',
    courseId: null,
    startDate: toLocalDateKey(start),
    startTime: formatTimeInput(start),
    hasEnd: false,
    endDate: toLocalDateKey(start),
    endTime: formatTimeInput(new Date(start.getTime() + 60 * 60 * 1_000)),
    isAllDay: false,
    color: null,
  };
}

export function calendarEventToFormValues(event: CalendarEvent): CalendarEventFormValues {
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;
  return {
    title: event.title,
    description: event.description ?? '',
    location: event.location ?? '',
    courseId: event.courseId,
    startDate: toLocalDateKey(start),
    startTime: formatTimeInput(start),
    hasEnd: end !== null,
    endDate: toLocalDateKey(end ?? start),
    endTime: formatTimeInput(end ?? start),
    isAllDay: event.isAllDay,
    color: event.color,
  };
}

export function validateCalendarEventForm(
  values: CalendarEventFormValues,
): CalendarEventFormErrors {
  const errors: CalendarEventFormErrors = {};
  const title = values.title.trim();
  if (!title) errors.title = 'Event title is required.';
  else if (title.length > 200) errors.title = 'Event title must be at most 200 characters.';

  if (values.description.trim().length > 2_000) {
    errors.description = 'Description must be at most 2,000 characters.';
  }
  if (values.location.trim().length > 200) {
    errors.location = 'Location must be at most 200 characters.';
  }
  if (values.color && values.color.trim().length > 32) {
    errors.color = 'Color must be at most 32 characters.';
  }

  const startDate = parseLocalDate(values.startDate);
  if (!startDate) errors.startDate = 'Use a valid start date in YYYY-MM-DD format.';
  if (!values.isAllDay && !isValidTime(values.startTime)) {
    errors.startTime = 'Use 24-hour time in HH:mm format.';
  }

  let endDate: Date | null = null;
  if (values.hasEnd) {
    endDate = parseLocalDate(values.endDate);
    if (!endDate) errors.endDate = 'Use a valid end date in YYYY-MM-DD format.';
    if (!values.isAllDay && !isValidTime(values.endTime)) {
      errors.endTime = 'Use 24-hour time in HH:mm format.';
    }
  }

  if (startDate && (!values.hasEnd || endDate)) {
    const startAt = toLocalDateTime(values.startDate, values.startTime, values.isAllDay);
    const endAt = values.hasEnd
      ? toLocalDateTime(values.endDate, values.endTime, values.isAllDay)
      : null;
    if (startAt && endAt && endAt < startAt) {
      errors.endDate = 'End date and time cannot be earlier than the start.';
    }
  }

  return errors;
}

export function toCreateCalendarEventRequest(
  values: CalendarEventFormValues,
): CreateCalendarEventRequest {
  const startAt = toLocalDateTime(values.startDate, values.startTime, values.isAllDay);
  if (!startAt) throw new Error('The event start date and time are invalid.');
  const endAt = values.hasEnd
    ? toLocalDateTime(values.endDate, values.endTime, values.isAllDay)
    : null;

  return {
    title: values.title.trim(),
    description: nullableTrimmed(values.description),
    location: nullableTrimmed(values.location),
    courseId: values.courseId,
    startAt: startAt.toISOString(),
    endAt: endAt?.toISOString() ?? null,
    isAllDay: values.isAllDay,
    color: values.color,
  };
}

export function toUpdateCalendarEventRequest(
  values: CalendarEventFormValues,
): UpdateCalendarEventRequest {
  return toCreateCalendarEventRequest(values);
}

function toLocalDateTime(date: string, time: string, isAllDay: boolean): Date | null {
  if (isAllDay) {
    const parsed = parseLocalDate(date);
    return parsed
      ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0)
      : null;
  }
  return combineLocalDateTime(date, time);
}

function nullableTrimmed(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}
