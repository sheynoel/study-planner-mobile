import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { FileRecord, PickedFile, UploadFileRequest } from '@/lib/api/file.types';
import { deleteLocalFileRecord, insertLocalFileRecord, updateLocalFileRecord } from '@/lib/files/local-file-database';

const storageDirectory = new Directory(Paths.document, 'offline-materials');
const LARGE_FILE_WARNING_BYTES = 100 * 1024 * 1024;

export function sanitizeLocalFilename(name: string): string {
  const cleaned = name.normalize('NFKC').replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_').replace(/^\.+/, '').trim();
  return (cleaned || 'file').slice(0, 180);
}

export function isLargeLocalFile(size: number | null): boolean { return size !== null && size >= LARGE_FILE_WARNING_BYTES; }

export async function importPickedFile(request: UploadFileRequest): Promise<FileRecord> {
  if (Platform.OS === 'web') throw new Error('Persistent offline file importing is available in the Android and iOS app.');
  if (!storageDirectory.exists) storageDirectory.create({ intermediates: true, idempotent: true });
  const source = new File(request.file.uri);
  if (!source.exists) throw new Error('The selected file is no longer available. Please choose it again.');
  const size = request.file.size ?? source.size;
  if (typeof size === 'number' && Paths.availableDiskSpace > 0 && size > Paths.availableDiskSpace) throw new Error('There is not enough free space on this device to import this file.');
  const id = createLocalId();
  const safeName = sanitizeLocalFilename(request.file.name);
  const storedName = `${id}-${safeName}`;
  const destination = new File(storageDirectory, storedName);
  try {
    await LegacyFileSystem.copyAsync({ from: source.uri, to: destination.uri });
    const now = new Date().toISOString();
    const extension = extensionOf(request.file.name);
    const record: FileRecord = {
      id, originalName: request.file.name, displayName: request.displayName?.trim() || request.file.name,
      localUri: destination.uri, extension, mimeType: request.file.mimeType || mimeFromExtension(extension),
      sizeBytes: typeof size === 'number' ? size : destination.size, createdAt: now, updatedAt: now,
      lastOpenedAt: null, courseId: request.courseId ?? null,
      course: request.courseId ? { id: request.courseId, name: request.courseName ?? 'Course', code: null, color: '#64806A' } : null,
      description: request.description?.trim() || null, localOnly: true,
    };
    await insertLocalFileRecord(record);
    return record;
  } catch (error) {
    if (destination.exists) destination.delete();
    throw friendlyStorageError(error);
  }
}

export async function removeImportedFile(file: FileRecord): Promise<void> {
  const localFile = new File(file.localUri);
  if (localFile.exists) localFile.delete();
  await deleteLocalFileRecord(file.id);
}

export async function assertLocalFileExists(file: FileRecord): Promise<void> {
  if (!new File(file.localUri).exists) throw new Error('This file is missing from app storage. You can remove its record and import it again.');
}

export async function openLocalFile(file: FileRecord): Promise<void> {
  await assertLocalFileExists(file);
  try {
    if (Platform.OS === 'android') {
      const contentUri = await LegacyFileSystem.getContentUriAsync(file.localUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: contentUri, type: file.mimeType || '*/*', flags: 1 });
    } else {
      if (!(await Sharing.isAvailableAsync())) throw new Error('No compatible application is available.');
      await Sharing.shareAsync(file.localUri, { mimeType: file.mimeType, dialogTitle: `Open ${file.displayName}`, UTI: utiForExtension(file.extension) });
    }
    await updateLocalFileRecord(file.id, { lastOpenedAt: new Date().toISOString() });
  } catch (error) {
    throw new Error(error instanceof Error && /missing|available/i.test(error.message) ? error.message : 'No compatible app could open this file. Install a suitable viewer and try again.');
  }
}

export async function shareLocalFile(file: FileRecord): Promise<void> {
  await assertLocalFileExists(file);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.localUri, { mimeType: file.mimeType, dialogTitle: `Export ${file.displayName}`, UTI: utiForExtension(file.extension) });
}

export function extensionOf(name: string): string | null {
  const match = /\.([^.]+)$/.exec(name.trim());
  return match ? match[1].toLowerCase().slice(0, 20) : null;
}

function createLocalId(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }
function mimeFromExtension(extension: string | null): string { return ({ pdf: 'application/pdf', txt: 'text/plain', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } as Record<string, string>)[extension ?? ''] ?? 'application/octet-stream'; }
function utiForExtension(extension: string | null): string | undefined { return ({ pdf: 'com.adobe.pdf', txt: 'public.plain-text', csv: 'public.comma-separated-values-text', png: 'public.png', jpg: 'public.jpeg', jpeg: 'public.jpeg', heic: 'public.heic', doc: 'com.microsoft.word.doc', docx: 'org.openxmlformats.wordprocessingml.document', ppt: 'com.microsoft.powerpoint.ppt', pptx: 'org.openxmlformats.presentationml.presentation', xls: 'com.microsoft.excel.xls', xlsx: 'org.openxmlformats.spreadsheetml.sheet' } as Record<string, string>)[extension ?? '']; }
function friendlyStorageError(error: unknown): Error { const message = error instanceof Error ? error.message : ''; if (/space|disk full|quota/i.test(message)) return new Error('There is not enough free space to import this file.'); if (/permission|denied/i.test(message)) return new Error('The app could not access local storage. Please check device settings.'); return new Error('The file could not be copied into app storage. Nothing was saved.'); }
