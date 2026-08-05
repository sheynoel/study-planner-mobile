import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ClassScheduleForm } from '@/components/class-schedules/class-schedule-form';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import { emptyClassScheduleForm, toCreateScheduleRequest, type ClassScheduleFormValues } from '@/lib/class-schedules/class-schedule-form';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';

export default function AddClassScheduleScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { createSchedule } = useClassSchedules();
  const { getCachedCourse, loadCourse } = useCourses();
  const [course, setCourse] = useState<Course | null>(() => courseId ? getCachedCourse(courseId) ?? null : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) { setError('This course link is invalid.'); return; }
    void loadCourse(courseId).then(setCourse).catch((reason) => setError(getApiErrorMessage(reason)));
  }, [courseId, loadCourse]);

  async function submit(values: ClassScheduleFormValues) {
    if (!courseId) throw new Error('This course link is invalid.');
    const schedule = await createSchedule(toCreateScheduleRequest(courseId, values));
    router.replace(classScheduleRoutes.details(schedule.id));
  }

  function retry() {
    if (!courseId) return;
    setError(null);
    void loadCourse(courseId).then(setCourse).catch((reason) => setError(getApiErrorMessage(reason)));
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} title="Add class" />{!course && !error ? <LoadingState label="Loading course..." /> : null}{error && !course ? <ErrorState message={error} onRetry={retry} /> : null}{course ? <ClassScheduleForm course={course} initialValues={emptyClassScheduleForm()} loadingLabel="Adding class..." onSubmit={submit} submitLabel="Add Class" /> : null}</SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 } });
