import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { CourseForm } from '@/components/courses/course-form';
import { ThemedView } from '@/components/themed-view';
import { useCourses } from '@/contexts/course-context';
import {
  EMPTY_COURSE_FORM,
  type CourseFormValues,
  toCreateCourseRequest,
} from '@/lib/courses/course-form';
import { courseRoutes } from '@/lib/courses/routes';

export default function AddCourseScreen() {
  const { createCourse } = useCourses();

  async function handleCreate(values: CourseFormValues) {
    const course = await createCourse(toCreateCourseRequest(values));
    router.replace(courseRoutes.details(course.id));
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader
          onBack={() => router.back()}
          subtitle="Add the details you use to recognize this course."
          title="Add course"
        />
        <CourseForm
          initialValues={EMPTY_COURSE_FORM}
          loadingLabel="Creating course..."
          onSubmit={handleCreate}
          submitLabel="Create course"
        />
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
