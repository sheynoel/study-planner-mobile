import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import type { CreateNoteRequest, DeleteNoteResponse, Note, NoteFilters, NoteListResponse, NoteResponse, UpdateNoteRequest } from '@/lib/api/note.types';

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isNullableString(value: unknown): value is string | null { return value === null || typeof value === 'string'; }
function isNote(value: unknown): value is Note {
  return isRecord(value) && typeof value.id === 'string' && typeof value.userId === 'string' && isNullableString(value.courseId) && typeof value.title === 'string' && isNullableString(value.content) && isNullableString(value.relevantAt) && isNullableString(value.reminderAt) && typeof value.isPinned === 'boolean' && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string';
}
function readData(value: unknown): Record<string, unknown> | null { return isRecord(value) && isRecord(value.data) ? value.data : null; }
function invalidResponse(): never { throw new ApiClientError('The API returned an unexpected Note response. Check that the mobile and backend versions match.', 'invalid-response'); }
function headers(token: string): HeadersInit { return { Authorization: `Bearer ${token}` }; }
function path(id: string): string { return `/notes/${encodeURIComponent(id)}`; }
function listPath(filters: NoteFilters): string {
  const params = new URLSearchParams();
  if (filters.courseId) params.set('courseId', filters.courseId);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.pinned !== undefined) params.set('pinned', String(filters.pinned));
  if (filters.search) params.set('search', filters.search);
  return params.size ? `/notes?${params}` : '/notes';
}
function readNoteResponse(value: unknown): NoteResponse { const data = readData(value); if (!data || !isNote(data.note)) return invalidResponse(); return { data: { note: data.note } }; }

export async function getNotes(token: string, filters: NoteFilters = {}): Promise<NoteListResponse> {
  const data = readData(await getApiClient().get<unknown>(listPath(filters), { headers: headers(token) }));
  if (!data || !Array.isArray(data.notes) || !data.notes.every(isNote)) return invalidResponse();
  return { data: { notes: data.notes } };
}
export async function createNote(token: string, request: CreateNoteRequest): Promise<NoteResponse> { return readNoteResponse(await getApiClient().post<unknown, CreateNoteRequest>('/notes', request, { acceptedStatuses: [201], headers: headers(token) })); }
export async function getNote(token: string, id: string): Promise<NoteResponse> { return readNoteResponse(await getApiClient().get<unknown>(path(id), { headers: headers(token) })); }
export async function updateNote(token: string, id: string, request: UpdateNoteRequest): Promise<NoteResponse> { return readNoteResponse(await getApiClient().patch<unknown, UpdateNoteRequest>(path(id), request, { headers: headers(token) })); }
export async function deleteNote(token: string, id: string): Promise<DeleteNoteResponse> { const data = readData(await getApiClient().delete<unknown>(path(id), { headers: headers(token) })); if (!data || typeof data.message !== 'string') return invalidResponse(); return { data: { message: data.message } }; }
