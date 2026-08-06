import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import type {
  DeleteFileResponse,
  FileDetailResponse,
  FileListFilters,
  FileListResponse,
  FileRecord,
  FileResponse,
  UpdateFileRequest,
  UpdateFileResponse,
  UploadFileRequest,
  UploadFileResponse,
} from '@/lib/api/file.types';
import { buildFileListPath } from '@/lib/files/file-filters';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isFileRecord(value: unknown): value is FileRecord {
  if (!isRecord(value)) return false;
  const course = value.course;
  const validCourse = course === null || (
    isRecord(course) && typeof course.id === 'string' && typeof course.name === 'string' &&
    isNullableString(course.code) && typeof course.color === 'string'
  );
  return typeof value.id === 'string' && isNullableString(value.courseId) &&
    typeof value.displayName === 'string' && typeof value.originalName === 'string' &&
    typeof value.mimeType === 'string' && isNullableString(value.extension) &&
    typeof value.sizeBytes === 'number' && Number.isInteger(value.sizeBytes) &&
    typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt)) &&
    typeof value.updatedAt === 'string' && !Number.isNaN(Date.parse(value.updatedAt)) && validCourse;
}

function readData(value: unknown): Record<string, unknown> | null {
  return isRecord(value) && isRecord(value.data) ? value.data : null;
}

function invalidResponse(): never {
  throw new ApiClientError(
    'The API returned an unexpected file response. Check that the mobile and backend versions match.',
    'invalid-response',
  );
}

function bearerHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function filePath(id: string): string {
  return `/files/${encodeURIComponent(id)}`;
}

export async function getFiles(token: string, filters: FileListFilters = {}): Promise<FileListResponse> {
  const response = await getApiClient().get<unknown>(buildFileListPath(filters), { headers: bearerHeaders(token) });
  const data = readData(response);
  if (!data || !Array.isArray(data.files) || !data.files.every(isFileRecord)) return invalidResponse();
  return { data: { files: data.files } };
}

export async function uploadFile(token: string, request: UploadFileRequest): Promise<UploadFileResponse> {
  const body = new FormData();
  if (request.file.webFile) body.append('file', request.file.webFile, request.file.name);
  else body.append('file', { uri: request.file.uri, name: request.file.name, type: request.file.mimeType } as unknown as Blob);
  if (request.displayName?.trim()) body.append('displayName', request.displayName.trim());
  if (request.courseId) body.append('courseId', request.courseId);
  const response = await getApiClient().postForm<unknown>('/files/upload', body, {
    acceptedStatuses: [201], headers: bearerHeaders(token), timeoutMs: 120_000,
  });
  return readFileResponse(response);
}

export async function getFile(token: string, id: string): Promise<FileDetailResponse> {
  const response = await getApiClient().get<unknown>(filePath(id), { headers: bearerHeaders(token) });
  return readFileResponse(response);
}

export async function updateFile(token: string, id: string, request: UpdateFileRequest): Promise<UpdateFileResponse> {
  const response = await getApiClient().patch<unknown, UpdateFileRequest>(filePath(id), request, { headers: bearerHeaders(token) });
  return readFileResponse(response);
}

export async function deleteFile(token: string, id: string): Promise<DeleteFileResponse> {
  const response = await getApiClient().delete<unknown>(filePath(id), { headers: bearerHeaders(token) });
  const data = readData(response);
  if (!data || typeof data.message !== 'string') return invalidResponse();
  return { data: { message: data.message } };
}

function readFileResponse(value: unknown): FileResponse {
  const data = readData(value);
  if (!data || !isFileRecord(data.file)) return invalidResponse();
  return { data: { file: data.file } };
}
