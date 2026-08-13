import { ApiClientError, getApiClient } from '@/lib/api/api-client';

export type SemesterHoliday = { id: string; date: string; title: string };
export type Semester = { id: string; title: string; startDate: string; endDate: string; isActive: boolean; holidays: SemesterHoliday[] };
export type SemesterRequest = { title: string; startDate: string; endDate: string; isActive?: boolean };
const headers = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });
function data(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || !('data' in value) || !(value as { data?: unknown }).data || typeof (value as { data: unknown }).data !== 'object') throw new ApiClientError('The API returned an invalid semester response.', 'invalid-response'); return (value as { data: Record<string, unknown> }).data; }
export async function getSemesters(token: string): Promise<Semester[]> { const body = data(await getApiClient().get<unknown>('/semesters', { headers: headers(token) })); if (!Array.isArray(body.semesters)) throw new ApiClientError('The API returned an invalid semester response.', 'invalid-response'); return body.semesters as Semester[]; }
export async function createSemester(token: string, request: SemesterRequest): Promise<Semester> { const body = data(await getApiClient().post<unknown, SemesterRequest>('/semesters', request, { acceptedStatuses: [201], headers: headers(token) })); return body.semester as Semester; }
export async function updateSemester(token: string, id: string, request: SemesterRequest): Promise<Semester> { const body = data(await getApiClient().patch<unknown, SemesterRequest>(`/semesters/${encodeURIComponent(id)}`, request, { headers: headers(token) })); return body.semester as Semester; }
export async function addSemesterHoliday(token: string, id: string, request: { date: string; title: string }): Promise<void> { await getApiClient().post(`/semesters/${encodeURIComponent(id)}/holidays`, request, { acceptedStatuses: [201], headers: headers(token) }); }
