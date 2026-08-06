export const FILE_TYPES = [
  'pdf',
  'ppt',
  'pptx',
  'doc',
  'docx',
  'txt',
  'png',
  'jpg',
  'jpeg',
  'webp',
] as const;

export type FileType = (typeof FILE_TYPES)[number];

export type FileListFilters = {
  courseId?: string;
  fileType?: FileType;
  search?: string;
};

type FileFilterInput = {
  courseId?: string | null;
  fileType?: string | null;
  search?: string | null;
};

export function normalizeExtension(value: string | null | undefined): FileType | undefined {
  const normalized = value?.trim().toLowerCase().replace(/^\./, '');

  return FILE_TYPES.includes(normalized as FileType) ? normalized as FileType : undefined;
}

export function normalizeCourseId(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

export function normalizeFileFilters(filters: FileFilterInput = {}): FileListFilters {
  const courseId = normalizeCourseId(filters.courseId);
  const fileType = normalizeExtension(filters.fileType);
  const search = filters.search?.trim() || undefined;

  return {
    ...(courseId ? { courseId } : {}),
    ...(fileType ? { fileType } : {}),
    ...(search ? { search } : {}),
  };
}

export function buildFileListPath(filters: FileFilterInput = {}): string {
  const normalized = normalizeFileFilters(filters);
  const query = new URLSearchParams();

  if (normalized.courseId) query.set('courseId', normalized.courseId);
  if (normalized.fileType) query.set('fileType', normalized.fileType);
  if (normalized.search) query.set('search', normalized.search);

  const queryString = query.toString();
  return queryString ? `/files?${queryString}` : '/files';
}

export function createLatestFileRequestGuard() {
  let latestRequestId = 0;

  return {
    begin(): number {
      latestRequestId += 1;
      return latestRequestId;
    },
    isLatest(requestId: number): boolean {
      return requestId === latestRequestId;
    },
  };
}
