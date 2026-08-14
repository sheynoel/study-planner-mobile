import * as DocumentPicker from 'expo-document-picker';

import type { PickedFile } from '@/lib/api/file.types';

export async function pickSupportedFiles(): Promise<PickedFile[] | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: true,
    base64: false,
  });
  if (result.canceled) return null;
  return result.assets.map((asset) => ({
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/octet-stream',
    size: asset.size ?? null,
    webFile: asset.file,
  }));
}
