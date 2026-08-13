import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ClassScheduleCard } from '@/components/class-schedules/class-schedule-card';
import { ThemedView } from '@/components/themed-view';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-state';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';
import { groupClassSchedules } from '@/lib/class-schedules/schedule-groups';

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
  const groups = groupClassSchedules(schedules);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader onBack={() => router.back()} onRightAction={courseId ? () => router.push(classScheduleRoutes.add(courseId)) : undefined} rightActionLabel={courseId ? 'Add' : undefined} subtitle={course?.name} title="Class schedule" />
        {loading && !course ? <LoadingState label="Loading class schedule..." /> : null}
        {error && !course ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
        {listStatus === 'error' && course && schedules.length === 0 ? <ErrorState message={error ?? 'Class schedule could not be loaded.'} onRetry={() => void refresh()} /> : null}
        {listStatus === 'success' && course ? (
          groups.length === 0 ? <EmptyState actionLabel="Add Class" description="Add this course's first weekly meeting." onAction={() => router.push(classScheduleRoutes.add(course.id))} title="No class meetings" /> :
          <ScrollView contentContainerStyle={styles.content}>{groups.map((group) => <ClassScheduleCard course={course} group={group} key={group.id} onPress={() => router.push(classScheduleRoutes.details(group.schedules[0].id))} />)}</ScrollView>
        ) : null}
        {listStatus === 'success' && schedules.length > 0 && courseId ? <FloatingActionButton bottom={24} label="Add class" onPress={() => router.push(classScheduleRoutes.add(courseId))} /> : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 }, content: { gap: 12, padding: 20, paddingBottom: 100 } });
