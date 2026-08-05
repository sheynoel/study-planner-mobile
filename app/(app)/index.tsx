import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { CourseCard } from '@/components/courses/course-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-state';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useCourses } from '@/contexts/course-context';
import { courseRoutes } from '@/lib/courses/routes';

export default function CourseListScreen() {
  const { logout, user } = useAuth();
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void loadCourses().catch(() => undefined);
    }, [loadCourses]),
  );

  const openAddCourse = useCallback(() => {
    router.push(courseRoutes.add);
  }, []);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      setLogoutError(getAuthErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          onRightAction={() => void handleLogout()}
          rightActionLabel={isLoggingOut ? 'Signing out...' : 'Sign out'}
          subtitle={`Welcome, ${user?.name ?? 'Student'}`}
          title="Courses"
        />
        <AppSectionTabs active="courses" />
        <ErrorBanner message={logoutError} />

        {listStatus === 'idle' || listStatus === 'loading' ? (
          <LoadingState label="Loading your courses..." />
        ) : null}

        {listStatus === 'error' ? (
          <ErrorState
            message={listError ?? 'Your courses could not be loaded.'}
            onRetry={() => void loadCourses().catch(() => undefined)}
          />
        ) : null}

        {listStatus === 'success' && courses.length === 0 ? (
          <EmptyState
            actionLabel="Add Course"
            description="Create your first course to organize academic work."
            onAction={openAddCourse}
            title="No courses yet"
          />
        ) : null}

        {listStatus === 'success' && courses.length > 0 ? (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={courses}
            keyExtractor={(course) => course.id}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                onPress={() => router.push(courseRoutes.details(item.id))}
              />
            )}
          />
        ) : null}

        {listStatus === 'success' && courses.length > 0 ? (
          <View style={styles.addButtonContainer}>
            <Pressable
              accessibilityRole="button"
              onPress={openAddCourse}
              style={({ pressed }) => [
                styles.addButton,
                pressed ? styles.addButtonPressed : undefined,
              ]}>
              <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
                + Add Course
              </ThemedText>
            </Pressable>
          </View>
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
  listContent: {
    gap: 14,
    padding: 20,
    paddingBottom: 104,
  },
  addButtonContainer: {
    bottom: 24,
    position: 'absolute',
    right: 20,
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
});
