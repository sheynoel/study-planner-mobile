import * as DocumentPicker from 'expo-document-picker';

import type { PickedFile } from '@/lib/api/file.types';

const SUPPORTED_MIME_TYPES = [
  'application/pdf', 'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'image/png', 'image/jpeg', 'image/webp',
];

export async function pickSupportedFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: SUPPORTED_MIME_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/octet-stream',
    size: asset.size ?? null,
    webFile: asset.file,
  };
}
