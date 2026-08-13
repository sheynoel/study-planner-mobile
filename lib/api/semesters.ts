import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import { normalizeSemester, normalizeSemesters } from '@/lib/api/semester-normalization';

export type SemesterHoliday = { id: string; date: string; title: string };
export type Semester = { id: string; title: string; startDate: string; endDate: string; isActive: boolean; holidays: SemesterHoliday[] };
export type SemesterRequest = { title: string; startDate: string; endDate: string; isActive?: boolean };
const headers = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });
function data(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || !('data' in value) || !(value as { data?: unknown }).data || typeof (value as { data: unknown }).data !== 'object') throw new ApiClientError('The API returned an invalid semester response.', 'invalid-response'); return (value as { data: Record<string, unknown> }).data; }
function semesterPath(id: string): string { return `/semesters/${encodeURIComponent(id)}`; }
function invalidSemester(): never { throw new ApiClientError('The API returned an invalid semester response.', 'invalid-response'); }
function readSemester(value: unknown): Semester { return normalizeSemester(value) ?? invalidSemester(); }
export async function getSemesters(token: string): Promise<Semester[]> { const body = data(await getApiClient().get<unknown>('/semesters', { headers: headers(token) })); return normalizeSemesters(body.semesters) ?? invalidSemester(); }
export async function getActiveSemester(token: string): Promise<Semester | null> { const body = data(await getApiClient().get<unknown>('/semesters/active', { headers: headers(token) })); return body.semester === null ? null : readSemester(body.semester); }
export async function createSemester(token: string, request: SemesterRequest): Promise<Semester> { const body = data(await getApiClient().post<unknown, SemesterRequest>('/semesters', request, { acceptedStatuses: [201], headers: headers(token) })); return readSemester(body.semester); }
export async function updateSemester(token: string, id: string, request: SemesterRequest): Promise<Semester> { const body = data(await getApiClient().patch<unknown, SemesterRequest>(semesterPath(id), request, { headers: headers(token) })); return readSemester(body.semester); }
export async function activateSemester(token: string, id: string): Promise<Semester> { const body = data(await getApiClient().patch<unknown, Record<string, never>>(`${semesterPath(id)}/activate`, {}, { headers: headers(token) })); return readSemester(body.semester); }
export async function addSemesterHoliday(token: string, id: string, request: { date: string; title: string }): Promise<void> { await getApiClient().post(`/semesters/${encodeURIComponent(id)}/holidays`, request, { acceptedStatuses: [201], headers: headers(token) }); }
