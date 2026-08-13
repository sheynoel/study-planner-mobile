import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ClassScheduleForm } from '@/components/class-schedules/class-schedule-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useAppearance } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import { scheduleGroupToForm, toCreateScheduleRequest, toScheduleGroupRequest, type CourseScheduleFormValues } from '@/lib/class-schedules/class-schedule-form';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';

export default function EditClassScheduleScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const scheduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors } = useAppearance();
  const { user } = useAuth();
  const { fetchSchedules, getCachedSchedule, loadSchedule, updateGroup, updateSchedule } = useClassSchedules();
  const { getCachedCourse, loadCourse } = useCourses();
  const [schedule, setSchedule] = useState<ClassSchedule | null>(() => scheduleId ? getCachedSchedule(scheduleId) ?? null : null);
  const [groupSchedules, setGroupSchedules] = useState<ClassSchedule[]>([]);
  const [course, setCourse] = useState<Course | null>(() => schedule ? getCachedCourse(schedule.courseId) ?? null : null);
  const [scope, setScope] = useState<'day' | 'group'>('group');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scheduleId) { setError('This class schedule link is invalid.'); return; }
    void loadSchedule(scheduleId).then(async (loaded) => {
      setSchedule(loaded); setCourse(await loadCourse(loaded.courseId));
      const all = await fetchSchedules({ courseId: loaded.courseId });
      setGroupSchedules(loaded.scheduleGroupId ? all.filter((item) => item.scheduleGroupId === loaded.scheduleGroupId) : [loaded]);
    }).catch((reason) => setError(getApiErrorMessage(reason)));
  }, [fetchSchedules, loadCourse, loadSchedule, scheduleId]);

  const initialValues = useMemo(() => scheduleGroupToForm(groupSchedules.length ? groupSchedules : schedule ? [schedule] : []), [groupSchedules, schedule]);

  async function submit(values: CourseScheduleFormValues) {
    if (!schedule) throw new Error('The class schedule is unavailable.');
    if (scope === 'group' && schedule.scheduleGroupId) {
      const timezone = user?.timezone ?? schedule.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      await updateGroup(schedule.scheduleGroupId, toScheduleGroupRequest(schedule.courseId, values, timezone));
    } else {
      await updateSchedule(schedule.id, toCreateScheduleRequest(schedule.courseId, { ...values, weekday: schedule.weekday }));
    }
    if (router.canGoBack()) router.back(); else router.replace(classScheduleRoutes.details(schedule.id));
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} title="Edit class" />
    {!schedule && !error ? <LoadingState label="Loading class schedule..." /> : null}
    {error && !schedule ? <ErrorState message={error} onRetry={() => router.replace(classScheduleRoutes.edit(scheduleId ?? ''))} /> : null}
    {schedule && course ? <>{groupSchedules.length > 1 ? <View style={styles.scope}><ThemedText style={[styles.scopeLabel, { color: colors.textSecondary }]}>Apply changes to</ThemedText><View style={styles.scopeRow}><ScopeChip label="This day only" selected={scope === 'day'} onPress={() => setScope('day')} /><ScopeChip label="All days" selected={scope === 'group'} onPress={() => setScope('group')} /></View></View> : null}<ClassScheduleForm key={`${scope}:${initialValues.weekdays.join()}`} course={course} fixedWeekdays={scope === 'day'} initialValues={scope === 'day' ? { ...initialValues, weekdays: [schedule.weekday] } : initialValues} loadingLabel="Saving changes..." onSubmit={submit} submitLabel="Save Changes" /></> : null}
  </SafeAreaView></ThemedView>;
}

function ScopeChip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) { const { colors } = useAppearance(); return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.surface }]}><ThemedText style={{ color: selected ? colors.primaryText : colors.text, fontWeight: '700' }}>{label}</ThemedText></Pressable>; }
const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 }, scope: { gap: 7, paddingHorizontal: 20, paddingTop: 10 }, scopeLabel: { fontSize: 12, fontWeight: '700' }, scopeRow: { flexDirection: 'row', gap: 8 }, chip: { borderRadius: 999, borderWidth: 1, minHeight: 38, justifyContent: 'center', paddingHorizontal: 14 } });
