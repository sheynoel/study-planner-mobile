import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { TaskForm } from '@/components/tasks/task-form';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import {
  EMPTY_TASK_FORM,
  type TaskFormValues,
  toCreateTaskRequest,
} from '@/lib/tasks/task-form';
import { taskRoutes } from '@/lib/tasks/routes';

export default function AddTaskScreen() {
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const { createTask } = useTasks();
  const refreshCourses = useCallback(() => loadCourses(), [loadCourses]);

  useEffect(() => {
    void refreshCourses().catch(() => undefined);
  }, [refreshCourses]);

  async function handleCreate(values: TaskFormValues) {
    const task = await createTask(toCreateTaskRequest(values));
    router.replace(taskRoutes.details(task.id));
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader onBack={() => router.back()} subtitle="Create personal or course-related work." title="Add task" />
        {listStatus === 'idle' || listStatus === 'loading' ? <LoadingState label="Loading courses..." /> : null}
        {listStatus === 'error' ? (
          <ErrorState message={listError ?? 'Courses could not be loaded.'} onRetry={() => void refreshCourses().catch(() => undefined)} />
        ) : null}
        {listStatus === 'success' ? (
          <TaskForm
            courses={courses}
            initialValues={EMPTY_TASK_FORM}
            loadingLabel="Creating task..."
            onSubmit={handleCreate}
            submitLabel="Create task"
          />
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 } });
