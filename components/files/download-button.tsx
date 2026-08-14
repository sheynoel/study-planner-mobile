import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorBanner } from '@/components/auth/auth-form';
import { AppButton } from '@/components/ui/app-button';
import { useFiles } from '@/contexts/file-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { FileRecord } from '@/lib/api/file.types';

export function DownloadButton({ file }: { file: FileRecord }) {
  const { openFile } = useFiles();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handlePress() { if (opening) return; setOpening(true); setError(null); try { await openFile(file); } catch (reason) { setError(getApiErrorMessage(reason)); } finally { setOpening(false); } }
  return <View style={styles.container}><ErrorBanner message={error} /><AppButton label={opening ? 'Opening...' : 'Open file'} loading={opening} onPress={() => void handlePress()} /></View>;
}
const styles = StyleSheet.create({ container: { gap: 10 } });
