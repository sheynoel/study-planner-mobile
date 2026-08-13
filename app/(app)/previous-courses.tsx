import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { useAuth } from '@/contexts/auth-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import { getCourses } from '@/lib/api/courses';

export default function PreviousCoursesScreen() {
  const { accessToken } = useAuth(); const { setCourseArchived } = useCourses(); const [courses, setCourses] = useState<Course[]>([]); const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { if (!accessToken) return; try { const response = await getCourses(accessToken, true); setCourses(response.data.courses.filter((course) => course.archivedAt)); } catch (reason) { setError(getApiErrorMessage(reason)); } }, [accessToken]);
  useEffect(() => { void refresh(); }, [refresh]);
  return <AppScreen edges={['top', 'bottom']}><AppHeader compactTitle onBack={() => router.back()} title="Previous Courses" /><ScrollView contentContainerStyle={styles.content}>{error ? <ThemedText>{error}</ThemedText> : null}{courses.length ? courses.map((course) => <AppCard key={course.id} style={styles.card}><ThemedText type="subtitle">{course.name}</ThemedText><ThemedText>{course.code ?? 'No course code'}</ThemedText><AppButton label="Restore course" onPress={() => void setCourseArchived(course.id, false).then(refresh)} variant="secondary" /></AppCard>) : <ThemedText>No archived courses.</ThemedText>}</ScrollView></AppScreen>;
}
const styles = StyleSheet.create({ content: { gap: 12, padding: 20 }, card: { gap: 8 } });
