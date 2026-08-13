import { WEEKDAYS, type ClassSchedule, type ClassScheduleException } from './class-schedule.types.ts';

/** Normalizes both the canonical grouped response and pre-group schedule records. */
export function normalizeClassSchedule(value: unknown, fallbackTimezone = deviceTimezone()): ClassSchedule | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.userId !== 'string' || typeof value.courseId !== 'string') return null;
  if (typeof value.weekday !== 'string' || !WEEKDAYS.includes(value.weekday as ClassSchedule['weekday'])) return null;
  if (!isTime(value.startTime) || !isTime(value.endTime) || (value.room !== null && typeof value.room !== 'string')) return null;
  if (!isLocalDate(value.startDate) || !isLocalDate(value.endDate) || !isIsoDateTime(value.createdAt) || !isIsoDateTime(value.updatedAt)) return null;
  if (value.scheduleGroupId !== undefined && value.scheduleGroupId !== null && typeof value.scheduleGroupId !== 'string') return null;
  if (value.timezone !== undefined && typeof value.timezone !== 'string') return null;
  if (value.courseArchived !== undefined && typeof value.courseArchived !== 'boolean') return null;

  const holidayDates = value.holidayDates === undefined ? [] : normalizeHolidayDates(value.holidayDates);
  const exceptions = value.exceptions === undefined ? [] : normalizeExceptions(value.exceptions);
  if (!holidayDates || !exceptions) return null;

  return {
    id: value.id,
    userId: value.userId,
    courseId: value.courseId,
    weekday: value.weekday as ClassSchedule['weekday'],
    startTime: value.startTime,
    endTime: value.endTime,
    room: value.room,
    startDate: value.startDate,
    endDate: value.endDate,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    scheduleGroupId: value.scheduleGroupId ?? null,
    timezone: value.timezone ?? fallbackTimezone,
    courseArchived: value.courseArchived ?? false,
    holidayDates,
    exceptions,
  };
}

export function normalizeClassSchedules(value: unknown, fallbackTimezone?: string): ClassSchedule[] | null {
  if (!Array.isArray(value)) return null;
  const schedules = value.map((item) => normalizeClassSchedule(item, fallbackTimezone));
  return schedules.some((item) => item === null) ? null : schedules as ClassSchedule[];
}

function normalizeHolidayDates(value: unknown): string[] | null {
  return Array.isArray(value) && value.every(isLocalDate) ? value : null;
}

function normalizeExceptions(value: unknown): ClassScheduleException[] | null {
  if (!Array.isArray(value)) return null;
  const result: ClassScheduleException[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== 'string' || !isLocalDate(item.date) || typeof item.cancelled !== 'boolean') return null;
    if (!isNullableTime(item.startTimeOverride) || !isNullableTime(item.endTimeOverride) || !isNullableString(item.roomOverride)) return null;
    result.push({ id: item.id, date: item.date, cancelled: item.cancelled, startTimeOverride: item.startTimeOverride, endTimeOverride: item.endTimeOverride, roomOverride: item.roomOverride });
  }
  return result;
}

function deviceTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; }
  catch { return 'UTC'; }
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isTime(value: unknown): value is string { return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
function isNullableTime(value: unknown): value is string | null { return value === null || isTime(value); }
function isNullableString(value: unknown): value is string | null { return value === null || typeof value === 'string'; }
function isLocalDate(value: unknown): value is string { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T00:00:00.000Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value; }
function isIsoDateTime(value: unknown): value is string { return typeof value === 'string' && !Number.isNaN(Date.parse(value)); }
