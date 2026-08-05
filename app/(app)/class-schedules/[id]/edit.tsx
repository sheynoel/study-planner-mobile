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
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import { classScheduleToForm, toCreateScheduleRequest, type ClassScheduleFormValues } from '@/lib/class-schedules/class-schedule-form';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';

export default function EditClassScheduleScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const scheduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getCachedSchedule, loadSchedule, updateSchedule } = useClassSchedules();
  const { getCachedCourse, loadCourse } = useCourses();
  const [schedule, setSchedule] = useState<ClassSchedule | null>(() => scheduleId ? getCachedSchedule(scheduleId) ?? null : null);
  const [course, setCourse] = useState<Course | null>(() => schedule ? getCachedCourse(schedule.courseId) ?? null : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scheduleId) { setError('This class schedule link is invalid.'); return; }
    void loadSchedule(scheduleId).then(async (loaded) => { setSchedule(loaded); setCourse(await loadCourse(loaded.courseId)); }).catch((reason) => setError(getApiErrorMessage(reason)));
  }, [loadCourse, loadSchedule, scheduleId]);

  async function submit(values: ClassScheduleFormValues) {
    if (!schedule) throw new Error('The class schedule is unavailable.');
    const request = toCreateScheduleRequest(schedule.courseId, values);
    await updateSchedule(schedule.id, request);
    router.replace(classScheduleRoutes.details(schedule.id));
  }

  function retry() {
    if (!scheduleId) return;
    setError(null);
    void loadSchedule(scheduleId).then(async (loaded) => { setSchedule(loaded); setCourse(await loadCourse(loaded.courseId)); }).catch((reason) => setError(getApiErrorMessage(reason)));
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} title="Edit class" />{!schedule && !error ? <LoadingState label="Loading class schedule..." /> : null}{error && !schedule ? <ErrorState message={error} onRetry={retry} /> : null}{schedule && course ? <ClassScheduleForm course={course} initialValues={classScheduleToForm(schedule)} loadingLabel="Saving changes..." onSubmit={submit} submitLabel="Save Changes" /> : null}</SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 } });
