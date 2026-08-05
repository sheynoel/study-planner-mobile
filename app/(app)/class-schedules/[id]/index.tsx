import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { titleCase } from '@/components/class-schedules/class-schedule-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
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
    if (Platform.OS === 'web') { if (typeof window !== 'undefined' && window.confirm('Delete this class meeting?')) void performDelete(); return; }
    Alert.alert('Delete class?', 'This removes the weekly meeting from the course and calendar.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void performDelete() }]);
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} onRightAction={scheduleId ? () => router.push(classScheduleRoutes.edit(scheduleId)) : undefined} rightActionLabel={scheduleId ? 'Edit' : undefined} title="Class details" />{loading && !schedule ? <LoadingState label="Loading class details..." /> : null}{error && !schedule ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}{schedule ? <ScrollView contentContainerStyle={styles.content}><ThemedView style={styles.hero} lightColor="#f0fdfa" darkColor="#134e4a"><View style={[styles.color, { backgroundColor: course?.color ?? '#0f766e' }]} /><View><ThemedText type="title">{course?.name ?? 'Class meeting'}</ThemedText><ThemedText>{course?.code ?? 'No course code'}</ThemedText></View></ThemedView><ThemedView style={styles.card} lightColor="#f8fafc" darkColor="#1e293b"><Row label="Weekday" value={titleCase(schedule.weekday)} /><Row label="Time" value={`${schedule.startTime} – ${schedule.endTime}`} /><Row label="Room" value={schedule.room ?? 'Not provided'} /><Row label="First date" value={formatLocalDate(schedule.startDate)} /><Row label="Last date" value={formatLocalDate(schedule.endDate)} /></ThemedView><ErrorBanner message={error} /><Pressable accessibilityRole="button" disabled={deleting} onPress={confirmDelete} style={({ pressed }) => [styles.delete, deleting ? styles.disabled : undefined, pressed && !deleting ? styles.pressed : undefined]}><ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">{deleting ? 'Deleting class...' : 'Delete class'}</ThemedText></Pressable></ScrollView> : null}</SafeAreaView></ThemedView>;
}

function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><ThemedText type="defaultSemiBold" lightColor="#64748b" darkColor="#94a3b8">{label}</ThemedText><ThemedText selectable>{value}</ThemedText></View>; }
const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 }, content: { gap: 16, padding: 20, paddingBottom: 40 }, hero: { alignItems: 'center', borderRadius: 18, flexDirection: 'row', gap: 14, padding: 20 }, color: { borderRadius: 16, height: 32, width: 32 }, card: { borderRadius: 16, gap: 16, padding: 20 }, row: { gap: 4 }, delete: { alignItems: 'center', backgroundColor: '#b91c1c', borderRadius: 12, minHeight: 50, padding: 14 }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.8 } });
