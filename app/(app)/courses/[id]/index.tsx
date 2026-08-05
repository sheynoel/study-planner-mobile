import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import { courseRoutes } from '@/lib/courses/routes';

function displayValue(value: string | null): string {
  return value ?? 'Not provided';
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="defaultSemiBold" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText selectable style={styles.detailValue}>
        {displayValue(value)}
      </ThemedText>
    </View>
  );
}

function FutureSection({ description, title }: { description: string; title: string }) {
  return (
    <ThemedView style={styles.futureSection} lightColor="#f8fafc" darkColor="#1e293b">
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText>{description}</ThemedText>
      <ThemedText lightColor="#64748b" darkColor="#94a3b8">
        Coming in a future phase
      </ThemedText>
    </ThemedView>
  );
}

export default function CourseDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { deleteCourse, getCachedCourse, loadCourse } = useCourses();
  const [course, setCourse] = useState<Course | null>(() =>
    courseId ? (getCachedCourse(courseId) ?? null) : null,
  );
  const [isLoading, setIsLoading] = useState(!course);
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

  useFocusEffect(
    useCallback(() => {
      void refreshCourse();
    }, [refreshCourse]),
  );

  async function performDelete() {
    if (!courseId || isDeleting) {
      return;
    }

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

  function confirmDelete() {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Delete this course permanently?')) {
        void performDelete();
      }
      return;
    }

    Alert.alert(
      'Delete course?',
      'This removes the course permanently. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void performDelete() },
      ],
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader
          onBack={() => router.back()}
          onRightAction={
            course && courseId ? () => router.push(courseRoutes.edit(courseId)) : undefined
          }
          rightActionLabel={course && courseId ? 'Edit' : undefined}
          title={course?.name ?? 'Course details'}
        />

        {isLoading && !course ? <LoadingState label="Loading course..." /> : null}

        {loadError && !course ? (
          <ErrorState message={loadError} onRetry={() => void refreshCourse()} />
        ) : null}

        {course ? (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.colorHero, { backgroundColor: course.color }]}>
              <ThemedText type="title" lightColor="#ffffff" darkColor="#ffffff">
                {course.name}
              </ThemedText>
              <ThemedText lightColor="#ffffff" darkColor="#ffffff">
                {course.code ?? 'No course code'}
              </ThemedText>
            </View>

            <ThemedView style={styles.detailsCard} lightColor="#f8fafc" darkColor="#1e293b">
              <DetailRow label="Description" value={course.description} />
              <View style={styles.divider} />
              <DetailRow label="Instructor" value={course.instructor} />
              <View style={styles.divider} />
              <DetailRow label="Room" value={course.room} />
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <ThemedText type="defaultSemiBold" style={styles.detailLabel}>
                  Color
                </ThemedText>
                <View style={styles.colorValue}>
                  <View style={[styles.colorDot, { backgroundColor: course.color }]} />
                  <ThemedText selectable>{course.color}</ThemedText>
                </View>
              </View>
            </ThemedView>

            <FutureSection
              description="Course-related assignments and study work will appear here."
              title="Tasks"
            />
            <FutureSection
              description="Recurring class meetings will appear here."
              title="Schedules"
            />
            <FutureSection
              description="Course documents and uploads will appear here."
              title="Files"
            />

            <ErrorBanner message={deleteError ?? loadError} />
            <Pressable
              accessibilityRole="button"
              disabled={isDeleting}
              onPress={confirmDelete}
              style={({ pressed }) => [
                styles.deleteButton,
                isDeleting ? styles.disabledButton : undefined,
                pressed && !isDeleting ? styles.pressedButton : undefined,
              ]}>
              <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
                {isDeleting ? 'Deleting course...' : 'Delete course'}
              </ThemedText>
            </Pressable>
          </ScrollView>
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
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 40,
  },
  colorHero: {
    borderRadius: 20,
    gap: 8,
    padding: 24,
  },
  detailsCard: {
    borderRadius: 16,
    gap: 14,
    padding: 20,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: '#64748b',
  },
  detailValue: {
    flex: 1,
  },
  divider: {
    backgroundColor: '#94a3b8',
    height: StyleSheet.hairlineWidth,
    opacity: 0.45,
  },
  colorValue: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  colorDot: {
    borderRadius: 10,
    height: 20,
    width: 20,
  },
  futureSection: {
    borderRadius: 16,
    gap: 6,
    padding: 20,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#b91c1c',
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressedButton: {
    opacity: 0.8,
  },
});
