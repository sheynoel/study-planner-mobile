import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { FileLibrary } from '@/components/files/file-library';
import { AppScreen } from '@/components/ui/app-screen';
import { DesignTokens } from '@/constants/theme';
import { useCourses } from '@/contexts/course-context';
import { normalizeCourseId } from '@/lib/files/file-filters';
import { fileRoutes } from '@/lib/files/routes';

export default function FileListScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[] }>();
  const courseId = normalizeCourseId(Array.isArray(params.courseId) ? params.courseId[0] : params.courseId);
  const { courses, loadCourses } = useCourses();
  const course = courses.find((candidate) => candidate.id === courseId);
  useEffect(() => { if (courseId) void loadCourses().catch(() => undefined); }, [courseId, loadCourses]);
  const scope = courseId ? { kind: 'course' as const, courseId, courseName: course?.name ?? 'Course' } : { kind: 'all' as const };
  return <AppScreen edges={['top', 'bottom']} footer={courseId ? undefined : <AppSectionTabs active="files" />}><AppHeader compactTitle onBack={courseId ? () => router.back() : undefined} onRightAction={() => router.push(courseId ? fileRoutes.uploadForCourse(courseId) : fileRoutes.upload)} rightActionLabel="Import" title={courseId ? 'Materials' : 'File Library'} /><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><FileLibrary scope={scope} /></ScrollView></AppScreen>;
}

const styles = StyleSheet.create({ content: { padding: DesignTokens.layout.screenPadding, paddingBottom: 48 } });
