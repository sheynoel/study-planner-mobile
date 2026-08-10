import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { CourseForm } from '@/components/courses/course-form';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { DesignTokens } from '@/constants/theme';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import {
  courseToFormValues,
  type CourseFormValues,
  toUpdateCourseRequest,
} from '@/lib/courses/course-form';
import { courseRoutes } from '@/lib/courses/routes';

export default function EditCourseScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { deleteCourse, loadCourse, updateCourse } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshCourse = useCallback(async () => {
    if (!courseId) {
      setLoadError('This course link is invalid.');
      setIsLoading(false);
      return;
    }

    setLoadError(null);
    setIsLoading(true);

    try {
      setCourse(await loadCourse(courseId));
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, loadCourse]);

  useEffect(() => {
    void refreshCourse();
  }, [refreshCourse]);

  async function handleUpdate(values: CourseFormValues) {
    if (!courseId) {
      throw new Error('This course link is invalid.');
    }

    await updateCourse(courseId, toUpdateCourseRequest(values));

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(courseRoutes.details(courseId));
    }
  }

  async function performDelete() {
    if (!courseId || isDeleting) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteCourse(courseId);
      router.replace(courseRoutes.list);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
      setIsDeleting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader
          onBack={() => router.back()}
          subtitle="Update the details shown for this course."
          title="Edit course"
        />

        {isLoading && !course ? <LoadingState label="Loading course..." /> : null}
        {loadError && !course ? (
          <ErrorState message={loadError} onRetry={() => void refreshCourse()} />
        ) : null}
        {course ? (
          <CourseForm
            afterSubmit={<AppCard style={styles.danger}><ThemedText style={styles.dangerLabel}>DANGER ZONE</ThemedText><ThemedText style={styles.dangerCopy}>Permanently remove this course. Related records follow the existing backend behavior.</ThemedText><ErrorBanner message={deleteError} /><AppButton label={isDeleting ? 'Deleting course…' : 'Delete course'} loading={isDeleting} onPress={() => showDestructiveConfirmation({ title: 'Delete course?', message: 'This removes the course permanently. Tasks, notes, and files are preserved as personal items by the backend.', onConfirm: () => void performDelete() })} variant="danger" /></AppCard>}
            initialValues={courseToFormValues(course)}
            loadingLabel="Saving changes..."
            onSubmit={handleUpdate}
            submitLabel="Save changes"
          />
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  danger: {
    gap: DesignTokens.spacing.sm,
    marginTop: DesignTokens.spacing.md,
  },
  dangerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dangerCopy: {
    fontSize: 11,
    lineHeight: 16,
  },
});
