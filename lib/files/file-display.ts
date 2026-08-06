import type { FileRecord } from '@/lib/api/file.types';

export const DEFAULT_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return 'Size unavailable';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(bytes < 10 * 1024 ** 2 ? 1 : 0)} MB`;
}

export function fileTypeLabel(file: Pick<FileRecord, 'extension' | 'mimeType'>): string {
  if (file.extension) return file.extension.toUpperCase();
  return file.mimeType.split('/').at(-1)?.toUpperCase() ?? 'FILE';
}

export function formatFileDate(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function sanitizeDownloadName(displayName: string, extension: string | null): string {
  const safe = displayName.replace(/[^a-zA-Z0-9._ -]/g, '_').trim().slice(0, 180) || 'download';
  if (!extension || safe.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) return safe;
  return `${safe}.${extension.toLowerCase()}`;
}
