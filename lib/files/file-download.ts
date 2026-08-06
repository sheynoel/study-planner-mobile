import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { createApiClientErrorFromBody } from '@/lib/api/api-client';
import type { FileRecord } from '@/lib/api/file.types';
import { getApiBaseUrl } from '@/lib/config/environment';
import { sanitizeDownloadName } from '@/lib/files/file-display';

export type FileTransferProgress = { transferred: number; total: number | null; fraction: number | null };

export async function downloadAuthenticatedFile(
  file: FileRecord,
  accessToken: string,
  onProgress?: (progress: FileTransferProgress) => void,
): Promise<string> {
  if (!FileSystem.cacheDirectory) throw new Error('Temporary file storage is unavailable on this device.');
  const directory = `${FileSystem.cacheDirectory}explicit-downloads/${file.id}/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const destination = `${directory}${encodeURIComponent(sanitizeDownloadName(file.displayName, file.extension))}`;
  const task = FileSystem.createDownloadResumable(
    `${getApiBaseUrl()}/files/${encodeURIComponent(file.id)}/download`,
    destination,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    ({ totalBytesExpectedToWrite, totalBytesWritten }) => {
      const total = totalBytesExpectedToWrite > 0 ? totalBytesExpectedToWrite : null;
      onProgress?.({
        transferred: totalBytesWritten,
        total,
        fraction: total ? Math.min(totalBytesWritten / total, 1) : null,
      });
    },
  );
  const result = await task.downloadAsync();
  if (!result) throw new Error('The download was cancelled.');
  if (result.status < 200 || result.status >= 300) {
    let errorBody = '';
    try { errorBody = await FileSystem.readAsStringAsync(result.uri); } catch { /* Use generic status error. */ }
    await FileSystem.deleteAsync(result.uri, { idempotent: true });
    throw createApiClientErrorFromBody(result.status, errorBody);
  }
  return result.uri;
}

export async function openOrShareDownloadedFile(uri: string, file: FileRecord): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('No compatible application is available to open or share this file.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: file.mimeType,
    dialogTitle: `Open ${file.displayName}`,
  });
}
