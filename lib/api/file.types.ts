export {
  FILE_TYPES,
  type FileListFilters,
  type FileType,
} from '@/lib/files/file-filters';

export type FileCourse = {
  id: string;
  name: string;
  code: string | null;
  color: string;
};

export type FileRecord = {
  id: string;
  courseId: string | null;
  displayName: string;
  originalName: string;
  mimeType: string;
  extension: string | null;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
  course: FileCourse | null;
};

export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size: number | null;
  webFile?: Blob;
};

export type UploadFileRequest = {
  file: PickedFile;
  displayName?: string;
  courseId?: string;
};

export type UpdateFileRequest = {
  displayName?: string;
  courseId?: string | null;
};

export type FileListResponse = { data: { files: FileRecord[] } };
export type FileResponse = { data: { file: FileRecord } };
export type UploadFileResponse = FileResponse;
export type FileDetailResponse = FileResponse;
export type UpdateFileResponse = FileResponse;
export type DeleteFileResponse = { data: { message: string } };
