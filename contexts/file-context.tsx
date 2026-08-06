import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { ApiClientError, getApiErrorMessage } from '@/lib/api/api-client';
import type { FileListFilters, FileRecord, UpdateFileRequest, UploadFileRequest } from '@/lib/api/file.types';
import {
  deleteFile as deleteFileRequest,
  getFile as getFileRequest,
  getFiles as getFilesRequest,
  updateFile as updateFileRequest,
  uploadFile as uploadFileRequest,
} from '@/lib/api/files';
import { downloadAuthenticatedFile, type FileTransferProgress } from '@/lib/files/file-download';
import { createLatestFileRequestGuard, normalizeFileFilters } from '@/lib/files/file-filters';

type FileListStatus = 'idle' | 'loading' | 'success' | 'error';

type FileContextValue = {
  files: FileRecord[];
  listStatus: FileListStatus;
  listError: string | null;
  loadFiles: (filters?: FileListFilters) => Promise<FileRecord[]>;
  loadFile: (id: string) => Promise<FileRecord>;
  getCachedFile: (id: string) => FileRecord | undefined;
  uploadFile: (request: UploadFileRequest) => Promise<FileRecord>;
  updateFile: (id: string, request: UpdateFileRequest) => Promise<FileRecord>;
  deleteFile: (id: string) => Promise<void>;
  downloadFile: (file: FileRecord, onProgress?: (progress: FileTransferProgress) => void) => Promise<string>;
};

const FileContext = createContext<FileContextValue | null>(null);

export function FileProvider({ children }: PropsWithChildren) {
  const { accessToken, logout } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [listStatus, setListStatus] = useState<FileListStatus>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const activeFilters = useRef<FileListFilters>({});
  const listRequestGuard = useRef(createLatestFileRequestGuard());

  const runAuthenticated = useCallback(async <T,>(operation: (token: string) => Promise<T>): Promise<T> => {
    if (!accessToken) throw new Error('Your session is unavailable. Please sign in again.');
    try { return await operation(accessToken); }
    catch (error) {
      if (error instanceof ApiClientError && error.status === 401) await logout();
      throw error;
    }
  }, [accessToken, logout]);

  const upsert = useCallback((file: FileRecord) => {
    setFiles((current) => current.some((candidate) => candidate.id === file.id)
      ? current.map((candidate) => candidate.id === file.id ? file : candidate)
      : [file, ...current]);
  }, []);

  const loadFiles = useCallback(async (filters: FileListFilters = activeFilters.current) => {
    const normalizedFilters = normalizeFileFilters(filters);
    const requestId = listRequestGuard.current.begin();
    activeFilters.current = normalizedFilters;
    setListStatus('loading');
    setListError(null);
    try {
      const response = await runAuthenticated((token) => getFilesRequest(token, normalizedFilters));
      if (!listRequestGuard.current.isLatest(requestId)) return response.data.files;
      setFiles(response.data.files);
      setListStatus('success');
      return response.data.files;
    } catch (error) {
      if (!listRequestGuard.current.isLatest(requestId)) return [];
      setListError(getApiErrorMessage(error));
      setListStatus('error');
      throw error;
    }
  }, [runAuthenticated]);

  const refreshAfterMutation = useCallback(async () => {
    try { await loadFiles(activeFilters.current); } catch { /* Keep confirmed mutation state. */ }
  }, [loadFiles]);

  const loadFile = useCallback(async (id: string) => {
    const response = await runAuthenticated((token) => getFileRequest(token, id));
    upsert(response.data.file);
    return response.data.file;
  }, [runAuthenticated, upsert]);

  const uploadFile = useCallback(async (request: UploadFileRequest) => {
    const response = await runAuthenticated((token) => uploadFileRequest(token, request));
    upsert(response.data.file);
    await refreshAfterMutation();
    return response.data.file;
  }, [refreshAfterMutation, runAuthenticated, upsert]);

  const updateFile = useCallback(async (id: string, request: UpdateFileRequest) => {
    const response = await runAuthenticated((token) => updateFileRequest(token, id, request));
    upsert(response.data.file);
    await refreshAfterMutation();
    return response.data.file;
  }, [refreshAfterMutation, runAuthenticated, upsert]);

  const deleteFile = useCallback(async (id: string) => {
    await runAuthenticated((token) => deleteFileRequest(token, id));
    setFiles((current) => current.filter((file) => file.id !== id));
    await refreshAfterMutation();
  }, [refreshAfterMutation, runAuthenticated]);

  const downloadFile = useCallback((file: FileRecord, onProgress?: (progress: FileTransferProgress) => void) =>
    runAuthenticated((token) => downloadAuthenticatedFile(file, token, onProgress)), [runAuthenticated]);

  const getCachedFile = useCallback((id: string) => files.find((file) => file.id === id), [files]);
  const value = useMemo(() => ({
    files, listStatus, listError, loadFiles, loadFile, getCachedFile, uploadFile,
    updateFile, deleteFile, downloadFile,
  }), [deleteFile, downloadFile, files, getCachedFile, listError, listStatus, loadFile, loadFiles, updateFile, uploadFile]);

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}

export function useFiles(): FileContextValue {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFiles must be used inside FileProvider.');
  return context;
}
