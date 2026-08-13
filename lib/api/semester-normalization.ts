import type { Semester, SemesterHoliday } from './semesters';

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isLocalDate(value: unknown): value is string { if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const date = new Date(`${value}T00:00:00.000Z`); return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value; }

function normalizeHoliday(value: unknown): SemesterHoliday | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !isLocalDate(value.date) || typeof value.title !== 'string') return null;
  return { id: value.id, date: value.date, title: value.title };
}

export function normalizeSemester(value: unknown): Semester | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string' || !isLocalDate(value.startDate) || !isLocalDate(value.endDate) || typeof value.isActive !== 'boolean' || !Array.isArray(value.holidays)) return null;
  const holidays = value.holidays.map(normalizeHoliday);
  if (holidays.some((holiday) => holiday === null)) return null;
  return { id: value.id, title: value.title, startDate: value.startDate, endDate: value.endDate, isActive: value.isActive, holidays: holidays as SemesterHoliday[] };
}

export function normalizeSemesters(value: unknown): Semester[] | null {
  if (!Array.isArray(value)) return null;
  const semesters = value.map(normalizeSemester);
  return semesters.some((semester) => semester === null) ? null : semesters as Semester[];
}
