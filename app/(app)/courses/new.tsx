import { router } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CourseForm } from '@/components/courses/course-form';
import { ThemedView } from '@/components/themed-view';
import { useCourses } from '@/contexts/course-context';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import {
  EMPTY_COURSE_FORM,
  type CourseFormValues,
  toCreateCourseRequest,
} from '@/lib/courses/course-form';
import { courseRoutes } from '@/lib/courses/routes';
import { toCreateScheduleRequest, type ClassScheduleFormValues } from '@/lib/class-schedules/class-schedule-form';
import { getApiErrorMessage } from '@/lib/api/api-client';
import { createCourseWithSchedules } from '@/lib/courses/course-creation';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';

export default function AddCourseScreen() {
  const { createCourse } = useCourses();
  const { createSchedule } = useClassSchedules();

  function closeCourseCreation() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(courseRoutes.list);
  }

  async function handleCreate(values: CourseFormValues, schedules: ClassScheduleFormValues[]) {
    const result = await createCourseWithSchedules(
      () => createCourse(toCreateCourseRequest(values)),
      schedules,
      (courseId, schedule) => createSchedule(toCreateScheduleRequest(courseId, schedule)),
    );
    if (result.scheduleError) {
      Alert.alert('Course created; schedule needs attention', `${result.createdScheduleCount} of ${schedules.length} class meetings were added. The course is safe. Review its schedules to add the remaining meeting.\n\n${getApiErrorMessage(result.scheduleError)}`);
      router.replace(classScheduleRoutes.courseList(result.course.id));
      return;
    }
    router.replace(courseRoutes.details(result.course.id));
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <CourseForm
          initialValues={EMPTY_COURSE_FORM}
          loadingLabel="Creating course..."
          modalHeader={{ actionLabel: 'Create', onCancel: closeCourseCreation, title: 'New Course' }}
          onSubmit={handleCreate}
          submitLabel="Create course"
          withSchedules
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
