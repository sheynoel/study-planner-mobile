import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { DownloadButton } from '@/components/files/download-button';
import { FileTypeIcon } from '@/components/files/file-type-icon';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { BentoCard } from '@/components/ui/bento-card';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { useAppearance } from '@/contexts/appearance-context';
import { useFiles } from '@/contexts/file-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel, formatFileDate, formatFileSize } from '@/lib/files/file-display';
import { fileRoutes } from '@/lib/files/routes';

export default function FileDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>(); const fileId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors } = useAppearance(); const { deleteFile, getCachedFile, loadFile, shareFile } = useFiles();
  const [file, setFile] = useState<FileRecord | null>(() => fileId ? getCachedFile(fileId) ?? null : null); const [loading, setLoading] = useState(!file); const [error, setError] = useState<string | null>(null); const [sharing, setSharing] = useState(false); const [deleting, setDeleting] = useState(false);
  const refresh = useCallback(async () => { if (!fileId) { setError('This file link is invalid.'); setLoading(false); return; } setLoading(true); setError(null); try { setFile(await loadFile(fileId)); } catch (reason) { setError(getApiErrorMessage(reason)); } finally { setLoading(false); } }, [fileId, loadFile]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  async function remove() { if (!file || deleting) return; setDeleting(true); try { await deleteFile(file.id); if (router.canGoBack()) router.back(); else router.replace(fileRoutes.list); } catch (reason) { setError(getApiErrorMessage(reason)); setDeleting(false); } }
  async function share() { if (!file || sharing) return; setSharing(true); setError(null); try { await shareFile(file); } catch (reason) { setError(getApiErrorMessage(reason)); } finally { setSharing(false); } }
  const isImage = file?.mimeType.startsWith('image/');
  return <AppScreen edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} onRightAction={fileId ? () => router.push(fileRoutes.edit(fileId)) : undefined} rightActionLabel={fileId ? 'Edit' : undefined} title="File information" />{loading && !file ? <LoadingState label="Loading local file..." /> : null}{error && !file ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}{file ? <ScrollView contentContainerStyle={styles.content}>{isImage ? <Image contentFit="contain" source={{ uri: file.localUri }} style={[styles.preview, { backgroundColor: colors.surfaceSubtle }]} /> : null}<BentoCard style={styles.hero} tone="accent"><FileTypeIcon file={file} /><View style={styles.flex}><ThemedText type="title">{file.displayName}</ThemedText><ThemedText numberOfLines={2} style={{ color: colors.textSecondary }}>{file.originalName}</ThemedText><ThemedText style={[styles.local, { color: colors.success }]}>Stored only on this device</ThemedText></View></BentoCard><BentoCard style={styles.card}><Row label="File type" value={`${fileTypeLabel(file)} · ${file.mimeType}`} /><Row label="File size" value={formatFileSize(file.sizeBytes)} /><Row label="Course" value={file.course?.name ?? 'Personal / No Course'} /><Row label="Date added" value={formatFileDate(file.createdAt)} /><Row label="Last opened" value={file.lastOpenedAt ? formatFileDate(file.lastOpenedAt) : 'Not opened yet'} /><Row label="Description" value={file.description || 'None'} /><Row label="Storage" value="Private app document directory" /></BentoCard><DownloadButton file={file} /><AppButton label={sharing ? 'Opening share sheet...' : 'Share or export a copy'} loading={sharing} onPress={() => void share()} variant="secondary" /><ErrorBanner message={error} /><AppButton label={deleting ? 'Removing...' : 'Remove from app'} loading={deleting} onPress={() => showDestructiveConfirmation({ title: 'Remove from app?', confirmLabel: 'Remove', message: 'The private app copy and local record will be deleted. Your original file will not be changed.', onConfirm: () => void remove() })} variant="danger" /><ThemedText style={[styles.warning, { color: colors.textSecondary }]}>Uninstalling the app or clearing app data can remove locally stored files.</ThemedText></ScrollView> : null}</AppScreen>;
}
function Row({ label, value }: { label: string; value: string }) { const { colors } = useAppearance(); return <View style={styles.row}><ThemedText style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</ThemedText><ThemedText selectable>{value}</ThemedText></View>; }
const styles = StyleSheet.create({ content: { gap: 14, padding: 20, paddingBottom: 40 }, preview: { borderRadius: 16, height: 240, width: '100%' }, hero: { alignItems: 'center', flexDirection: 'row', gap: 14, padding: 18 }, flex: { flex: 1, gap: 3 }, local: { fontSize: 10.5, fontWeight: '700' }, card: { gap: 14, padding: 18 }, row: { gap: 3 }, rowLabel: { fontSize: 11, fontWeight: '700' }, warning: { fontSize: 10.5, lineHeight: 15, textAlign: 'center' } });
