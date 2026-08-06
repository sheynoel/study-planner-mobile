import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorBanner } from '@/components/auth/auth-form';
import { AppButton } from '@/components/ui/app-button';
import { useFiles } from '@/contexts/file-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { FileRecord } from '@/lib/api/file.types';
import { openOrShareDownloadedFile } from '@/lib/files/file-download';

export function DownloadButton({ file }: { file: FileRecord }) {
  const { downloadFile } = useFiles();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function handlePress() {
    if (downloading) return;
    setDownloading(true); setProgress(null); setError(null);
    try {
      const uri = await downloadFile(file, (value) => setProgress(value.fraction));
      await openOrShareDownloadedFile(uri, file);
    } catch (reason) { setError(getApiErrorMessage(reason)); }
    finally { setDownloading(false); }
  }
  const label = downloading ? progress === null ? 'Downloading...' : `Downloading ${Math.round(progress * 100)}%` : 'Open or Download';
  return <View style={styles.container}><ErrorBanner message={error} /><AppButton label={label} loading={downloading} onPress={() => void handlePress()} /></View>;
}

const styles = StyleSheet.create({ container: { gap: 10 } });
