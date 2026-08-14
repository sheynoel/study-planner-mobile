import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { FileCard } from '@/components/files/file-card';
import { MaterialFilterBar } from '@/components/files/material-filter-bar';
import { ThemedText } from '@/components/themed-text';
import { BottomActionSheet } from '@/components/ui/bottom-action-sheet';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { EmptyState, ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { useFiles } from '@/contexts/file-context';
import type { FileRecord } from '@/lib/api/file.types';
import { fileRoutes } from '@/lib/files/routes';
import { DEFAULT_MATERIAL_FILTERS, filterMaterialFiles, type MaterialFilterState, type MaterialLibraryScope } from '@/lib/files/material-filters';

export function FileLibrary({ scope }: { scope: MaterialLibraryScope }) {
  const { colors } = useAppearance();
  const { courses, loadCourses } = useCourses();
  const { deleteFile, files, listError, listStatus, loadFiles, openFile, shareFile } = useFiles();
  const [filters, setFilters] = useState<MaterialFilterState>(DEFAULT_MATERIAL_FILTERS);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const visibleFiles = useMemo(() => filterMaterialFiles(files, scope, filters), [files, filters, scope]);
  const hasFilters = Boolean(filters.search.trim() || filters.category !== 'all' || filters.courseId || (filters.sort ?? 'newest') !== 'newest');
  const refresh = useCallback(async () => { await Promise.all([loadFiles(), scope.kind === 'all' ? loadCourses().catch(() => undefined) : Promise.resolve()]); }, [loadCourses, loadFiles, scope.kind]);
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));
  const openUpload = () => router.push(scope.kind === 'course' ? fileRoutes.uploadForCourse(scope.courseId) : scope.kind === 'personal' ? fileRoutes.uploadPersonal : fileRoutes.upload);
  const run = (operation: () => Promise<void>) => void operation().catch((error) => Alert.alert('File unavailable', error instanceof Error ? error.message : 'The action could not be completed.'));

  function confirmRemove(file: FileRecord) { showDestructiveConfirmation({ title: 'Remove from app?', message: 'This deletes the app’s private copy and local record. The original file outside this app will not be changed.', confirmLabel: 'Remove', onConfirm: () => run(() => deleteFile(file.id)) }); }
  const actions = selectedFile ? [
    { icon: 'open-outline' as const, label: 'Open', onPress: () => run(() => openFile(selectedFile)) },
    { icon: 'information-circle-outline' as const, label: 'View file information', onPress: () => router.push(fileRoutes.details(selectedFile.id)) },
    { icon: 'create-outline' as const, label: 'Rename display name', onPress: () => router.push(fileRoutes.edit(selectedFile.id)) },
    { icon: 'folder-open-outline' as const, label: 'Move to another course', onPress: () => router.push(fileRoutes.edit(selectedFile.id)) },
    { icon: 'share-outline' as const, label: 'Share or export a copy', onPress: () => run(() => shareFile(selectedFile)) },
    { icon: 'trash-outline' as const, label: 'Remove from app', onPress: () => confirmRemove(selectedFile) },
  ] : [];

  return <View style={styles.library}>
    <View style={[styles.notice, { backgroundColor: colors.primaryContainer }]}><ThemedText style={styles.noticeTitle}>Stored only on this device</ThemedText><ThemedText style={[styles.noticeText, { color: colors.textSecondary }]}>Available offline. Uninstalling the app or clearing app data can remove these files.</ThemedText></View>
    <MaterialFilterBar courses={courses} filters={filters} onChange={setFilters} scope={scope} />
    <View style={styles.resultRow}><ThemedText style={[styles.count, { color: colors.textSecondary }]}>{visibleFiles.length} {visibleFiles.length === 1 ? 'file' : 'files'}</ThemedText>{hasFilters ? <Pressable accessibilityRole="button" onPress={() => setFilters(DEFAULT_MATERIAL_FILTERS)}><ThemedText style={[styles.clear, { color: colors.primary }]}>Clear filters</ThemedText></Pressable> : null}</View>
    {listStatus === 'idle' || listStatus === 'loading' ? <LoadingSkeleton rows={3} /> : null}
    {listStatus === 'error' ? <ErrorState message={listError ?? 'Your local library could not be opened.'} onRetry={() => void refresh().catch(() => undefined)} /> : null}
    {listStatus === 'success' && visibleFiles.length === 0 ? <EmptyState actionLabel="Import File" description={hasFilters ? 'No files match these filters. Clear filters or try another search.' : 'Choose one or more files from your phone. The app will keep private copies available offline.'} onAction={openUpload} title={hasFilters ? 'No matching files' : 'Import your first file'} /> : null}
    {listStatus === 'success' && visibleFiles.length ? <View style={styles.list}>{visibleFiles.map((file) => <FileCard file={file} key={file.id} onMenu={() => setSelectedFile(file)} onPress={() => run(() => openFile(file))} />)}</View> : null}
    <BottomActionSheet actions={actions} compact={false} onClose={() => setSelectedFile(null)} title={selectedFile?.displayName ?? 'File actions'} visible={Boolean(selectedFile)} />
  </View>;
}

const styles = StyleSheet.create({ library: { gap: DesignTokens.spacing.md }, notice: { borderRadius: DesignTokens.radius.md, gap: 2, padding: DesignTokens.spacing.md }, noticeTitle: { fontSize: 12, fontWeight: '800' }, noticeText: { fontSize: 10.5, lineHeight: 15 }, resultRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 28 }, count: { fontSize: 11, fontWeight: '600' }, clear: { fontSize: 11, fontWeight: '700' }, list: { gap: 7 } });
