import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { TaskPriorityChip, TaskStatusChip } from '@/components/tasks/task-chips';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Task } from '@/lib/api/task.types';
import { formatTaskDate, isTaskOverdue } from '@/lib/tasks/task-display';
import { taskRoutes } from '@/lib/tasks/routes';

export default function TaskDetailsScreen() {
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
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Delete this task permanently?')) void performDelete();
      return;
    }

    Alert.alert('Delete task?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void performDelete() },
    ]);
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
            <ThemedView style={styles.hero} lightColor="#e0f2fe" darkColor="#0c4a6e">
              <ThemedText type="title" style={task.status === 'COMPLETED' ? styles.completedTitle : undefined}>
                {task.title}
              </ThemedText>
              <View style={styles.chipRow}>
                <TaskStatusChip status={task.status} />
                <TaskPriorityChip priority={task.priority} />
              </View>
              {isTaskOverdue(task) ? (
                <ThemedText type="defaultSemiBold" lightColor="#b91c1c" darkColor="#fecaca">
                  Overdue
                </ThemedText>
              ) : null}
            </ThemedView>

            <ThemedView style={styles.detailsCard} lightColor="#f8fafc" darkColor="#1e293b">
              <DetailRow label="Description" value={task.description ?? 'Not provided'} />
              <Divider />
              <DetailRow label="Course" value={course ? `${course.name}${course.code ? ` (${course.code})` : ''}` : task.courseId ? 'Course unavailable' : 'Personal task'} />
              <Divider />
              <DetailRow label="Due" value={formatTaskDate(task.dueAt)} />
              <Divider />
              <DetailRow label="Completed" value={task.completedAt ? formatTaskDate(task.completedAt) : 'Not completed'} />
            </ThemedView>

            <ErrorBanner message={actionError ?? loadError} />
            {task.status !== 'COMPLETED' ? (
              <Pressable
                accessibilityRole="button"
                disabled={isCompleting}
                onPress={() => void handleComplete()}
                style={({ pressed }) => [styles.completeButton, isCompleting ? styles.disabled : undefined, pressed && !isCompleting ? styles.pressed : undefined]}>
                <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
                  {isCompleting ? 'Completing task...' : 'Mark complete'}
                </ThemedText>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={isDeleting}
              onPress={confirmDelete}
              style={({ pressed }) => [styles.deleteButton, isDeleting ? styles.disabled : undefined, pressed && !isDeleting ? styles.pressed : undefined]}>
              <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
                {isDeleting ? 'Deleting task...' : 'Delete task'}
              </ThemedText>
            </Pressable>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><ThemedText type="defaultSemiBold" style={styles.detailLabel}>{label}</ThemedText><ThemedText selectable>{value}</ThemedText></View>;
}

function Divider() { return <View style={styles.divider} />; }

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: { gap: 16, padding: 20, paddingBottom: 40 },
  hero: { borderRadius: 20, gap: 12, padding: 24 },
  completedTitle: { textDecorationLine: 'line-through' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailsCard: { borderRadius: 16, gap: 14, padding: 20 },
  detailRow: { gap: 4 },
  detailLabel: { color: '#64748b' },
  divider: { backgroundColor: '#94a3b8', height: StyleSheet.hairlineWidth, opacity: 0.45 },
  completeButton: { alignItems: 'center', backgroundColor: '#0a7ea4', borderRadius: 12, minHeight: 50, padding: 13 },
  deleteButton: { alignItems: 'center', backgroundColor: '#b91c1c', borderRadius: 12, minHeight: 50, padding: 13 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
});
