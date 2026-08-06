import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { TaskPriorityChip, TaskStatusChip } from '@/components/tasks/task-chips';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { AppButton } from '@/components/ui/app-button';
import { BentoCard } from '@/components/ui/bento-card';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Task } from '@/lib/api/task.types';
import { formatTaskDate, isTaskOverdue } from '@/lib/tasks/task-display';
import { taskRoutes } from '@/lib/tasks/routes';

export default function TaskDetailsScreen() {
  const { colors } = useAppearance();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const taskId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getCachedCourse, loadCourses } = useCourses();
  const { completeTask, deleteTask, getCachedTask, loadTask } = useTasks();
  const [task, setTask] = useState<Task | null>(() => taskId ? (getCachedTask(taskId) ?? null) : null);
  const [isLoading, setIsLoading] = useState(!task);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    if (!taskId) {
      setLoadError('This task link is invalid.');
      setIsLoading(false);
      return;
    }

    setLoadError(null);
    setIsLoading(true);
    try {
      const [nextTask] = await Promise.all([loadTask(taskId), loadCourses()]);
      setTask(nextTask);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [loadCourses, loadTask, taskId]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function handleComplete() {
    if (!taskId || isCompleting || task?.status === 'COMPLETED') return;
    setActionError(null);
    setIsCompleting(true);
    try {
      setTask(await completeTask(taskId));
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setIsCompleting(false);
    }
  }

  async function performDelete() {
    if (!taskId || isDeleting) return;
    setActionError(null);
    setIsDeleting(true);
    try {
      await deleteTask(taskId);
      router.replace(taskRoutes.list);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
      setIsDeleting(false);
    }
  }

  function confirmDelete() {
    showDestructiveConfirmation({ title: 'Delete task?', message: 'This action cannot be undone.', onConfirm: () => void performDelete() });
  }

  const course = task?.courseId ? getCachedCourse(task.courseId) : undefined;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader
          onBack={() => router.back()}
          onRightAction={task && taskId ? () => router.push(taskRoutes.edit(taskId)) : undefined}
          rightActionLabel={task && taskId ? 'Edit' : undefined}
          title={task?.title ?? 'Task details'}
        />

        {isLoading && !task ? <LoadingState label="Loading task..." /> : null}
        {loadError && !task ? <ErrorState message={loadError} onRetry={() => void refresh()} /> : null}

        {task ? (
          <ScrollView contentContainerStyle={styles.content}>
            <BentoCard style={[styles.hero, { borderLeftColor: colors.primary }]} tone="accent">
              <ThemedText type="title" style={task.status === 'COMPLETED' ? styles.completedTitle : undefined}>
                {task.title}
              </ThemedText>
              <View style={styles.chipRow}>
                <TaskStatusChip status={task.status} />
                <TaskPriorityChip priority={task.priority} />
              </View>
              {isTaskOverdue(task) ? (
                <ThemedText type="defaultSemiBold" style={{ color: colors.overdue }}>
                  ! Overdue
                </ThemedText>
              ) : null}
            </BentoCard>

            <BentoCard style={styles.detailsCard}>
              <DetailRow label="Description" mutedColor={colors.textSecondary} value={task.description ?? 'Not provided'} />
              <Divider color={colors.border} />
              <DetailRow label="Course" mutedColor={colors.textSecondary} value={course ? `${course.name}${course.code ? ` (${course.code})` : ''}` : task.courseId ? 'Course unavailable' : 'Personal task'} />
              <Divider color={colors.border} />
              <DetailRow label="Due" mutedColor={colors.textSecondary} value={formatTaskDate(task.dueAt)} />
              <Divider color={colors.border} />
              <DetailRow label="Completed" mutedColor={colors.textSecondary} value={task.completedAt ? formatTaskDate(task.completedAt) : 'Not completed'} />
            </BentoCard>

            <ErrorBanner message={actionError ?? loadError} />
            {task.status !== 'COMPLETED' ? (
              <AppButton label={isCompleting ? 'Completing task...' : 'Mark complete'} loading={isCompleting} onPress={() => void handleComplete()} />
            ) : null}
            <AppButton label={isDeleting ? 'Deleting task...' : 'Delete task'} loading={isDeleting} onPress={confirmDelete} variant="danger" />
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function DetailRow({ label, mutedColor, value }: { label: string; mutedColor: string; value: string }) {
  return <View style={styles.detailRow}><ThemedText type="defaultSemiBold" style={{ color: mutedColor }}>{label}</ThemedText><ThemedText selectable>{value}</ThemedText></View>;
}

function Divider({ color }: { color: string }) { return <View style={[styles.divider, { backgroundColor: color }]} />; }

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: { gap: 16, padding: 20, paddingBottom: 40 },
  hero: { borderLeftWidth: 4, gap: 12, padding: 24 },
  completedTitle: { textDecorationLine: 'line-through' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailsCard: { borderRadius: 16, gap: 14, padding: 20 },
  detailRow: { gap: 4 },
  divider: { height: StyleSheet.hairlineWidth },
});
