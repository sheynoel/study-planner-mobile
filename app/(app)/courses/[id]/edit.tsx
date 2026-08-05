import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { CourseForm } from '@/components/courses/course-form';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
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
  const { loadCourse, updateCourse } = useCourses();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
});
