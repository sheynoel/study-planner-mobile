import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ErrorBanner } from '@/components/auth/auth-form';
import { TaskCreateSheetForm } from '@/components/tasks/task-create-sheet-form';
import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import { parseLocalDate } from '@/lib/calendar/calendar-date';
import { EMPTY_TASK_FORM, type TaskFormValues, toCreateTaskRequest } from '@/lib/tasks/task-form';

export default function AddTaskScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[]; date?: string | string[] }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const requestedDate = Array.isArray(params.date) ? params.date[0] : params.date;
  const { colors } = useAppearance();
  const navigation = useNavigation();
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const { createTask } = useTasks();
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const allowClose = useRef(false);
  const initialValues = useMemo(() => ({ ...EMPTY_TASK_FORM, courseId: courseId ?? null, dueDate: requestedDate && parseLocalDate(requestedDate) ? requestedDate : '' }), [courseId, requestedDate]);
  const hasUsableCourses = courses.length > 0;
  const canRenderForm = listStatus === 'success' || hasUsableCourses || (listStatus === 'error' && !courseId);
  const selectedCourseUnavailable = listStatus === 'success' && Boolean(courseId) && !courses.some((course) => course.id === courseId);
  const refreshCourses = useCallback(() => loadCourses(), [loadCourses]);
  useEffect(() => { void refreshCourses().catch(() => undefined); }, [refreshCourses]);

  usePreventRemove(dirty && !allowClose.current, ({ data }) => { Alert.alert('Discard this task?', 'Your unsaved task will be lost.', [{ text: 'Keep editing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) }]); });
  const close = useCallback(() => { if (!submitting) router.back(); }, [submitting]);
  const handleCreate = async (values: TaskFormValues) => { await createTask(toCreateTaskRequest({ ...values, status: 'TODO' })); allowClose.current = true; setDirty(false); router.back(); };

  return <AppBottomSheet expandable expandedSnap={0.96} initialSnap={0.75} modal={false} onClose={close} title="New Task">
    {(listStatus === 'idle' || listStatus === 'loading') && !hasUsableCourses ? <LoadingCourses color={colors.primary} label="Loading courses…" /> : null}
    {listStatus === 'error' && !canRenderForm ? <View style={styles.loading}><ThemedText style={[styles.error, { color: colors.dangerText }]}>{listError ?? 'Courses could not be loaded.'}</ThemedText><Pressable onPress={() => void refreshCourses().catch(() => undefined)} style={styles.retry}><ThemedText style={{ color: colors.primary, fontWeight: '700' }}>Retry</ThemedText></Pressable></View> : null}
    {selectedCourseUnavailable ? <View style={styles.loading}><ThemedText style={[styles.error, { color: colors.dangerText }]}>The selected course is no longer available.</ThemedText><Pressable onPress={close} style={styles.retry}><ThemedText style={{ color: colors.primary, fontWeight: '700' }}>Close</ThemedText></Pressable></View> : null}
    {canRenderForm && !selectedCourseUnavailable ? <View style={styles.form}><ErrorBanner message={listStatus === 'error' ? listError : null} /><TaskCreateSheetForm courses={courses} initialValues={initialValues} onDirtyChange={setDirty} onSubmit={handleCreate} onSubmittingChange={setSubmitting} /></View> : null}
  </AppBottomSheet>;
}

function LoadingCourses({ color, label }: { color: string; label: string }) { return <View style={styles.loading}><ActivityIndicator color={color} /><ThemedText>{label}</ThemedText></View>; }
const styles = StyleSheet.create({ form: { flex: 1, gap: DesignTokens.spacing.xs, paddingTop: DesignTokens.spacing.xs }, loading: { alignItems: 'center', flex: 1, gap: DesignTokens.spacing.sm, justifyContent: 'center', padding: DesignTokens.layout.screenPadding }, error: { fontSize: 12, lineHeight: 17, textAlign: 'center' }, retry: { alignItems: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: DesignTokens.spacing.lg } });
