import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { titleCase } from '@/components/class-schedules/class-schedule-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { AppButton } from '@/components/ui/app-button';
import { BentoCard } from '@/components/ui/bento-card';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { useAppearance } from '@/contexts/appearance-context';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import { formatLocalDate } from '@/lib/calendar/calendar-date';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';

export default function ClassScheduleDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const scheduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors } = useAppearance();
  const { deleteSchedule, getCachedSchedule, loadSchedule } = useClassSchedules();
  const { getCachedCourse, loadCourse } = useCourses();
  const [schedule, setSchedule] = useState<ClassSchedule | null>(() => scheduleId ? getCachedSchedule(scheduleId) ?? null : null);
  const [course, setCourse] = useState<Course | null>(() => schedule ? getCachedCourse(schedule.courseId) ?? null : null);
  const [loading, setLoading] = useState(!schedule);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    if (!scheduleId) { setError('This class schedule link is invalid.'); setLoading(false); return; }
    setLoading(true); setError(null);
    try { const loaded = await loadSchedule(scheduleId); setSchedule(loaded); setCourse(await loadCourse(loaded.courseId)); }
    catch (reason) { setError(getApiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [loadCourse, loadSchedule, scheduleId]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function performDelete() {
    if (!schedule || deleting) return;
    setDeleting(true); setError(null);
    try { await deleteSchedule(schedule.id); router.replace(classScheduleRoutes.courseList(schedule.courseId)); }
    catch (reason) { setError(getApiErrorMessage(reason)); setDeleting(false); }
  }

  function confirmDelete() {
    showDestructiveConfirmation({ title: 'Delete class?', message: 'This removes the weekly meeting from the course and calendar.', onConfirm: () => void performDelete() });
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <AppHeader onBack={() => router.back()} onRightAction={scheduleId ? () => router.push(classScheduleRoutes.edit(scheduleId)) : undefined} rightActionLabel={scheduleId ? 'Edit' : undefined} title="Class details" />
    {loading && !schedule ? <LoadingState label="Loading class details..." /> : null}
    {error && !schedule ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
    {schedule ? <ScrollView contentContainerStyle={styles.content}>
      <BentoCard style={styles.hero} tone="accent"><View style={[styles.color, { backgroundColor: course?.color ?? colors.primary }]} /><View style={styles.flex}><ThemedText type="title">{course?.name ?? 'Class meeting'}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{course?.code ?? 'No course code'}</ThemedText></View></BentoCard>
      <BentoCard style={styles.card}>
        <Row color={colors.textSecondary} label="Weekday" value={titleCase(schedule.weekday)} />
        <Row color={colors.textSecondary} label="Time" value={`${schedule.startTime} – ${schedule.endTime}`} />
        <Row color={colors.textSecondary} label="Room" value={schedule.room ?? 'Not provided'} />
        <Row color={colors.textSecondary} label="First date" value={formatLocalDate(schedule.startDate)} />
        <Row color={colors.textSecondary} label="Last date" value={formatLocalDate(schedule.endDate)} />
      </BentoCard>
      <ErrorBanner message={error} />
      <AppButton label={deleting ? 'Deleting class...' : 'Delete class'} loading={deleting} onPress={confirmDelete} variant="danger" />
    </ScrollView> : null}
  </SafeAreaView></ThemedView>;
}

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.row}><ThemedText type="defaultSemiBold" style={{ color }}>{label}</ThemedText><ThemedText selectable>{value}</ThemedText></View>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 }, content: { gap: 16, padding: 20, paddingBottom: 40 }, hero: { alignItems: 'center', flexDirection: 'row', gap: 14, padding: 20 }, color: { borderRadius: 16, height: 32, width: 32 }, flex: { flex: 1, gap: 3 }, card: { gap: 16, padding: 20 }, row: { gap: 4 } });
