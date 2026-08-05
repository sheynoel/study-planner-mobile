import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { TaskForm } from '@/components/tasks/task-form';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Task } from '@/lib/api/task.types';
import { taskToFormValues, type TaskFormValues, toUpdateTaskRequest } from '@/lib/tasks/task-form';
import { taskRoutes } from '@/lib/tasks/routes';

export default function EditTaskScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const taskId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { courses, loadCourses } = useCourses();
  const { loadTask, updateTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  useEffect(() => { void refresh(); }, [refresh]);

  async function handleUpdate(values: TaskFormValues) {
    if (!taskId) throw new Error('This task link is invalid.');
    await updateTask(taskId, toUpdateTaskRequest(values));
    if (router.canGoBack()) router.back();
    else router.replace(taskRoutes.details(taskId));
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader onBack={() => router.back()} subtitle="Update task details, timing, course, or status." title="Edit task" />
        {isLoading && !task ? <LoadingState label="Loading task..." /> : null}
        {loadError && !task ? <ErrorState message={loadError} onRetry={() => void refresh()} /> : null}
        {task ? (
          <TaskForm
            courses={courses}
            initialValues={taskToFormValues(task)}
            loadingLabel="Saving changes..."
            onSubmit={handleUpdate}
            submitLabel="Save changes"
          />
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 } });
