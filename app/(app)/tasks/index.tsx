import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskFilters } from '@/components/tasks/task-filters';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-state';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import {
  DEFAULT_TASK_FILTERS,
  hasActiveTaskFilters,
  type TaskFilterState,
  toTaskApiFilters,
} from '@/lib/tasks/task-filters';
import { taskRoutes } from '@/lib/tasks/routes';

export default function TaskListScreen() {
  const { logout } = useAuth();
  const {
    courses,
    getCachedCourse,
    listError: courseError,
    listStatus: courseStatus,
    loadCourses,
  } = useCourses();
  const { completeTask, listError, listStatus, loadTasks, tasks } = useTasks();
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_TASK_FILTERS);
  const [completingIds, setCompletingIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const apiFilters = useMemo(() => toTaskApiFilters(filters), [filters]);

  const refresh = useCallback(async () => {
    await Promise.all([loadCourses(), loadTasks(apiFilters)]);
  }, [apiFilters, loadCourses, loadTasks]);

  useFocusEffect(
    useCallback(() => {
      void refresh().catch(() => undefined);
    }, [refresh]),
  );

  async function handleComplete(id: string) {
    if (completingIds.has(id)) return;
    setActionError(null);
    setCompletingIds((current) => new Set(current).add(id));
    try {
      await completeTask(id);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setCompletingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setActionError(null);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      setActionError(getAuthErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
    }
  }

  const loading = listStatus === 'idle' || listStatus === 'loading' || courseStatus === 'idle' || courseStatus === 'loading';
  const error = listStatus === 'error' ? listError : courseStatus === 'error' ? courseError : null;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          onRightAction={() => void handleLogout()}
          rightActionLabel={isLoggingOut ? 'Signing out...' : 'Sign out'}
          subtitle="Personal and course work in one place"
          title="Tasks"
        />
        <AppSectionTabs active="tasks" />
        <TaskFilters courses={courses} onChange={setFilters} value={filters} />
        <ErrorBanner message={actionError} />

        {loading ? <LoadingState label="Loading your tasks..." /> : null}
        {!loading && error ? (
          <ErrorState message={error} onRetry={() => void refresh().catch(() => undefined)} />
        ) : null}
        {!loading && !error && tasks.length === 0 ? (
          <EmptyState
            actionLabel="Add Task"
            description={hasActiveTaskFilters(filters) ? 'No tasks match these filters.' : 'Create your first personal or course task.'}
            onAction={() => router.push(taskRoutes.add)}
            title={hasActiveTaskFilters(filters) ? 'No matching tasks' : 'No tasks yet'}
          />
        ) : null}
        {!loading && !error && tasks.length > 0 ? (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={tasks}
            keyExtractor={(task) => task.id}
            renderItem={({ item }) => (
              <TaskCard
                course={item.courseId ? getCachedCourse(item.courseId) : undefined}
                isCompleting={completingIds.has(item.id)}
                onComplete={() => void handleComplete(item.id)}
                onPress={() => router.push(taskRoutes.details(item.id))}
                task={item}
              />
            )}
          />
        ) : null}

        {!loading && !error && tasks.length > 0 ? (
          <View style={styles.addButtonContainer}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(taskRoutes.add)}
              style={({ pressed }) => [styles.addButton, pressed ? styles.pressed : undefined]}>
              <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
                + Add Task
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  listContent: { gap: 14, padding: 20, paddingBottom: 104 },
  addButtonContainer: { bottom: 24, position: 'absolute', right: 20 },
  addButton: { backgroundColor: '#0a7ea4', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14 },
  pressed: { opacity: 0.8 },
});
