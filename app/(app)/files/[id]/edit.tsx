import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { FileMetadataForm } from '@/components/files/file-metadata-form';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCourses } from '@/contexts/course-context';
import { useFiles } from '@/contexts/file-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { FileRecord, UpdateFileRequest } from '@/lib/api/file.types';
import { fileRoutes } from '@/lib/files/routes';

export default function EditFileScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const fileId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { courses, loadCourses } = useCourses();
  const { getCachedFile, loadFile, updateFile } = useFiles();
  const [file, setFile] = useState<FileRecord | null>(() => fileId ? getCachedFile(fileId) ?? null : null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!fileId) { setError('This file link is invalid.'); return; }
    void Promise.all([loadFile(fileId), loadCourses()]).then(([loaded]) => setFile(loaded)).catch((reason) => setError(getApiErrorMessage(reason)));
  }, [fileId, loadCourses, loadFile]);
  async function submit(request: UpdateFileRequest) {
    if (!file) throw new Error('The file is unavailable.');
    await updateFile(file.id, request);
    router.replace(fileRoutes.details(file.id));
  }
  function retry() {
    if (!fileId) return;
    setError(null);
    void Promise.all([loadFile(fileId), loadCourses()]).then(([loaded]) => setFile(loaded)).catch((reason) => setError(getApiErrorMessage(reason)));
  }
  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} title="Edit file" />{!file && !error ? <LoadingState label="Loading file..." /> : null}{error && !file ? <ErrorState message={error} onRetry={retry} /> : null}{file ? <FileMetadataForm courses={courses} initialCourseId={file.courseId} initialDisplayName={file.displayName} onSubmit={submit} /> : null}</SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 } });
