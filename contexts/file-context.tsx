import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { useCourses } from '@/contexts/course-context';
import type { FileListFilters, FileRecord, UpdateFileRequest, UploadFileRequest } from '@/lib/api/file.types';
import { getLocalFileRecord, listLocalFileRecords, updateLocalFileRecord } from '@/lib/files/local-file-database';
import { importPickedFile, openLocalFile, removeImportedFile, shareLocalFile } from '@/lib/files/local-file-service';

type FileListStatus = 'idle' | 'loading' | 'success' | 'error';
type FileContextValue = {
  files: FileRecord[]; listStatus: FileListStatus; listError: string | null;
  loadFiles: (filters?: FileListFilters) => Promise<FileRecord[]>;
  loadFile: (id: string) => Promise<FileRecord>; getCachedFile: (id: string) => FileRecord | undefined;
  uploadFile: (request: UploadFileRequest) => Promise<FileRecord>;
  updateFile: (id: string, request: UpdateFileRequest & { description?: string | null }) => Promise<FileRecord>;
  deleteFile: (id: string) => Promise<void>; openFile: (file: FileRecord) => Promise<void>;
  shareFile: (file: FileRecord) => Promise<void>;
};

const FileContext = createContext<FileContextValue | null>(null);

export function FileProvider({ children }: PropsWithChildren) {
  const { courses } = useCourses();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [listStatus, setListStatus] = useState<FileListStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setListStatus('loading'); setListError(null);
    try { const records = await listLocalFileRecords(); setFiles(records); setListStatus('success'); return records; }
    catch (error) { const message = error instanceof Error ? error.message : 'The local library could not be opened.'; setListError(message); setListStatus('error'); throw error; }
  }, []);

  const loadFile = useCallback(async (id: string) => {
    const file = await getLocalFileRecord(id);
    if (!file) throw new Error('This file is no longer in the local library.');
    setFiles((current) => current.some((item) => item.id === id) ? current.map((item) => item.id === id ? file : item) : [file, ...current]);
    return file;
  }, []);

  const uploadFile = useCallback(async (request: UploadFileRequest) => {
    const course = request.courseId ? courses.find((item) => item.id === request.courseId) : undefined;
    const file = await importPickedFile({ ...request, courseName: course?.name ?? request.courseName });
    setFiles((current) => [file, ...current]);
    setListStatus('success');
    return file;
  }, [courses]);

  const updateFile = useCallback(async (id: string, request: UpdateFileRequest & { description?: string | null }) => {
    const course = request.courseId ? courses.find((item) => item.id === request.courseId) : undefined;
    await updateLocalFileRecord(id, { ...request, courseName: request.courseId ? course?.name ?? 'Course' : request.courseId === null ? null : undefined });
    return loadFile(id);
  }, [courses, loadFile]);

  const deleteFile = useCallback(async (id: string) => {
    const file = await getLocalFileRecord(id);
    if (!file) return;
    await removeImportedFile(file);
    setFiles((current) => current.filter((item) => item.id !== id));
  }, []);

  const openFile = useCallback(async (file: FileRecord) => { await openLocalFile(file); await loadFile(file.id); }, [loadFile]);
  const shareFile = useCallback((file: FileRecord) => shareLocalFile(file), []);
  const getCachedFile = useCallback((id: string) => files.find((file) => file.id === id), [files]);
  const value = useMemo(() => ({ files, listStatus, listError, loadFiles, loadFile, getCachedFile, uploadFile, updateFile, deleteFile, openFile, shareFile }), [deleteFile, files, getCachedFile, listError, listStatus, loadFile, loadFiles, openFile, shareFile, updateFile, uploadFile]);
  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}

export function useFiles(): FileContextValue { const context = useContext(FileContext); if (!context) throw new Error('useFiles must be used inside FileProvider.'); return context; }
