import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { FileUploadForm } from '@/components/files/file-upload-form';
import { ThemedView } from '@/components/themed-view';
import { useCourses } from '@/contexts/course-context';
import { useFiles } from '@/contexts/file-context';
import type { UploadFileRequest } from '@/lib/api/file.types';
import { fileRoutes } from '@/lib/files/routes';

export default function UploadFileScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[]; library?: string | string[] }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const library = Array.isArray(params.library) ? params.library[0] : params.library;
  const { courses, loadCourses } = useCourses();
  const { uploadFile } = useFiles();
  useEffect(() => { void loadCourses().catch(() => undefined); }, [loadCourses]);
  async function submit(request: UploadFileRequest) {
    await uploadFile(request);
    if (courseId || library === 'personal') {
      router.replace(request.courseId ? fileRoutes.forCourse(request.courseId) : fileRoutes.personal);
      return;
    }
    router.replace(fileRoutes.list);
  }
  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} subtitle="PDF, Office documents, text, and images" title="Upload file" /><FileUploadForm courses={courses} initialCourseId={courseId} onSubmit={submit} /></SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 } });
