import type { CreateNoteRequest, Note, UpdateNoteRequest } from '@/lib/api/note.types';
import { combineLocalDateTime, formatTimeInput, isValidTime, parseLocalDate, toLocalDateKey } from '../calendar/calendar-date.ts';

export type NoteFormValues = { title: string; content: string; courseId: string | null; relevantDate: string; relevantTime: string; reminderDate: string; reminderTime: string; isPinned: boolean };
export type NoteFormField = keyof NoteFormValues;
export type NoteFormErrors = Partial<Record<NoteFormField, string>>;
export const EMPTY_NOTE_FORM: NoteFormValues = { title: '', content: '', courseId: null, relevantDate: '', relevantTime: '', reminderDate: '', reminderTime: '', isPinned: false };

export function noteToForm(note: Note): NoteFormValues {
  const relevant = note.relevantAt ? new Date(note.relevantAt) : null; const reminder = note.reminderAt ? new Date(note.reminderAt) : null;
  return { title: note.title, content: note.content ?? '', courseId: note.courseId, relevantDate: relevant ? toLocalDateKey(relevant) : '', relevantTime: relevant ? formatTimeInput(relevant) : '', reminderDate: reminder ? toLocalDateKey(reminder) : '', reminderTime: reminder ? formatTimeInput(reminder) : '', isPinned: note.isPinned };
}
export function createNoteForm(courseId: string | null = null): NoteFormValues { return { ...EMPTY_NOTE_FORM, courseId }; }
export function validateNoteForm(values: NoteFormValues): NoteFormErrors {
  const errors: NoteFormErrors = {};
  if (!values.title.trim() && !values.content.trim()) errors.content = 'Add a title or write a note.';
  if (values.title.trim().length > 200) errors.title = 'Note title must be at most 200 characters.';
  if (values.content.trim().length > 5_000) errors.content = 'Details must be at most 5,000 characters.';
  validateOptionalDateTime(values.relevantDate, values.relevantTime, 'relevantDate', 'relevantTime', errors);
  validateOptionalDateTime(values.reminderDate, values.reminderTime, 'reminderDate', 'reminderTime', errors);
  return errors;
}
export function toCreateNoteRequest(values: NoteFormValues): CreateNoteRequest { return mapRequest(values); }
export function toUpdateNoteRequest(values: NoteFormValues): UpdateNoteRequest { return mapRequest(values); }
function mapRequest(values: NoteFormValues): CreateNoteRequest { const content = values.content.trim(); return { title: values.title.trim() || deriveTitle(content), content: content || null, courseId: values.courseId, relevantAt: toTimestamp(values.relevantDate, values.relevantTime), reminderAt: toTimestamp(values.reminderDate, values.reminderTime), isPinned: values.isPinned }; }
function deriveTitle(content: string): string { return content.replace(/\s+/g, ' ').trim().slice(0, 200); }
function toTimestamp(date: string, time: string): string | null { if (!date) return null; return combineLocalDateTime(date, time || '09:00')?.toISOString() ?? null; }
function validateOptionalDateTime(date: string, time: string, dateField: 'relevantDate' | 'reminderDate', timeField: 'relevantTime' | 'reminderTime', errors: NoteFormErrors) { if (date && !parseLocalDate(date)) errors[dateField] = 'Choose a valid date.'; if (time && !isValidTime(time)) errors[timeField] = 'Choose a valid time.'; if (time && !date) errors[dateField] = 'Add a date before adding a time.'; }
