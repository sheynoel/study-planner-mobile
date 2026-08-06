import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { DownloadButton } from '@/components/files/download-button';
import { FileTypeIcon } from '@/components/files/file-type-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { AppButton } from '@/components/ui/app-button';
import { BentoCard } from '@/components/ui/bento-card';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { useAppearance } from '@/contexts/appearance-context';
import { useFiles } from '@/contexts/file-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel, formatFileDate, formatFileSize } from '@/lib/files/file-display';
import { fileRoutes } from '@/lib/files/routes';

export default function FileDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const fileId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors } = useAppearance();
  const { deleteFile, getCachedFile, loadFile } = useFiles();
  const [file, setFile] = useState<FileRecord | null>(() => fileId ? getCachedFile(fileId) ?? null : null);
  const [loading, setLoading] = useState(!file);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    if (!fileId) { setError('This file link is invalid.'); setLoading(false); return; }
    setLoading(true); setError(null);
    try { setFile(await loadFile(fileId)); } catch (reason) { setError(getApiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [fileId, loadFile]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function performDelete() {
    if (!file || deleting) return;
    setDeleting(true); setError(null);
    try { await deleteFile(file.id); router.back(); }
    catch (reason) { setError(getApiErrorMessage(reason)); setDeleting(false); }
  }

  function confirmDelete() {
    showDestructiveConfirmation({ title: 'Delete file?', message: 'This permanently removes the uploaded file and its metadata.', onConfirm: () => void performDelete() });
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <AppHeader onBack={() => router.back()} onRightAction={fileId ? () => router.push(fileRoutes.edit(fileId)) : undefined} rightActionLabel={fileId ? 'Edit' : undefined} title="File details" />
    {loading && !file ? <LoadingState label="Loading file details..." /> : null}
    {error && !file ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
    {file ? <ScrollView contentContainerStyle={styles.content}>
      <BentoCard style={styles.hero} tone="accent"><FileTypeIcon file={file} /><View style={styles.flex}><ThemedText type="title">{file.displayName}</ThemedText><ThemedText numberOfLines={2} style={{ color: colors.textSecondary }}>{file.originalName}</ThemedText></View></BentoCard>
      <BentoCard style={styles.card}>
        <Row color={colors.textSecondary} label="File type" value={`${fileTypeLabel(file)} · ${file.mimeType}`} />
        <Row color={colors.textSecondary} label="File size" value={formatFileSize(file.sizeBytes)} />
        <Row color={colors.textSecondary} label="Course" value={file.course ? `${file.course.name}${file.course.code ? ` (${file.course.code})` : ''}` : 'No course (personal)'} />
        <Row color={colors.textSecondary} label="Uploaded" value={formatFileDate(file.createdAt)} />
        <Row color={colors.textSecondary} label="Updated" value={formatFileDate(file.updatedAt)} />
      </BentoCard>
      <DownloadButton file={file} />
      <ErrorBanner message={error} />
      <AppButton label={deleting ? 'Deleting file...' : 'Delete file'} loading={deleting} onPress={confirmDelete} variant="danger" />
    </ScrollView> : null}
  </SafeAreaView></ThemedView>;
}

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.row}><ThemedText type="defaultSemiBold" style={{ color }}>{label}</ThemedText><ThemedText selectable>{value}</ThemedText></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 }, content: { gap: 16, padding: 20, paddingBottom: 40 }, hero: { alignItems: 'center', flexDirection: 'row', gap: 14, padding: 20 }, flex: { flex: 1, gap: 3 }, card: { gap: 16, padding: 20 }, row: { gap: 4 } });
