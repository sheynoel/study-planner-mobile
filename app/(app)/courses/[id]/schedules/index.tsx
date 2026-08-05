import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ClassScheduleCard } from '@/components/class-schedules/class-schedule-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-state';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';

export default function CourseScheduleListScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { listError, listStatus, loadCourseSchedules, schedules } = useClassSchedules();
  const { getCachedCourse, loadCourse } = useCourses();
  const [course, setCourse] = useState<Course | null>(() => courseId ? getCachedCourse(courseId) ?? null : null);
  const [courseError, setCourseError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!courseId) { setCourseError('This course link is invalid.'); return; }
    setCourseError(null);
    try {
      const [loaded] = await Promise.all([loadCourse(courseId), loadCourseSchedules(courseId)]);
      setCourse(loaded);
    } catch (error) { setCourseError(getApiErrorMessage(error)); }
  }, [courseId, loadCourse, loadCourseSchedules]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const error = listError ?? courseError;
  const loading = listStatus === 'idle' || listStatus === 'loading';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader onBack={() => router.back()} onRightAction={courseId ? () => router.push(classScheduleRoutes.add(courseId)) : undefined} rightActionLabel={courseId ? 'Add' : undefined} subtitle={course?.name} title="Class schedule" />
        {loading && !course ? <LoadingState label="Loading class schedule..." /> : null}
        {error && !course ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
        {listStatus === 'error' && course && schedules.length === 0 ? <ErrorState message={error ?? 'Class schedule could not be loaded.'} onRetry={() => void refresh()} /> : null}
        {listStatus === 'success' && course ? (
          schedules.length === 0 ? <EmptyState actionLabel="Add Class" description="Add this course's first weekly meeting." onAction={() => router.push(classScheduleRoutes.add(course.id))} title="No class meetings" /> :
          <ScrollView contentContainerStyle={styles.content}>{schedules.map((schedule) => <ClassScheduleCard course={course} key={schedule.id} onPress={() => router.push(classScheduleRoutes.details(schedule.id))} schedule={schedule} />)}</ScrollView>
        ) : null}
        {listStatus === 'success' && schedules.length > 0 && courseId ? <View style={styles.addContainer}><Pressable accessibilityRole="button" onPress={() => router.push(classScheduleRoutes.add(courseId))} style={({ pressed }) => [styles.addButton, pressed ? styles.pressed : undefined]}><ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">+ Add Class</ThemedText></Pressable></View> : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 }, content: { gap: 12, padding: 20, paddingBottom: 100 }, addContainer: { bottom: 24, position: 'absolute', right: 20 }, addButton: { backgroundColor: '#0a7ea4', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14 }, pressed: { opacity: 0.75 } });
