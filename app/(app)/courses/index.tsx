import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { CourseFolderCard } from '@/components/courses/course-folder-card';
import { PersonalLibraryCard } from '@/components/courses/personal-library-card';
import { AppScreen } from '@/components/ui/app-screen';
import { EmptyState, ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useCourses } from '@/contexts/course-context';
import { useDashboard } from '@/contexts/dashboard-context';
import { courseRoutes } from '@/lib/courses/routes';
import { fileRoutes } from '@/lib/files/routes';
import { getCourseListView } from '@/lib/courses/course-list-state';

export default function CourseListScreen() {
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const dashboard = useDashboard();
  const { width: viewportWidth } = useWindowDimensions();
  const refreshDashboard = dashboard.refresh;
  const taskCounts = useMemo(() => countByCourse(dashboard.tasks.filter((task) => task.status !== 'COMPLETED')), [dashboard.tasks]);
  const cardWidth = (viewportWidth - DesignTokens.layout.screenPadding * 2 - DesignTokens.spacing.sm) / 2;
  const refresh = useCallback(async () => { await Promise.all([loadCourses(), refreshDashboard()]); }, [loadCourses, refreshDashboard]);
  const listView = getCourseListView(listStatus, courses.length);
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));

  return <AppScreen footer={<AppSectionTabs active="courses" />}>
    <AppHeader onRightAction={() => router.push(courseRoutes.add)} rightActionIcon="add" rightActionLabel="Add Course" title="Courses" />
    {listView === 'loading' ? <LoadingSkeleton rows={4} /> : null}
    {listView === 'error' ? <ErrorState message={listError ?? 'Your courses could not be loaded.'} onRetry={() => void refresh().catch(() => undefined)} /> : null}
    {listView === 'empty' || listView === 'populated' ? <ScrollView contentContainerStyle={styles.content}>
      <PersonalLibraryCard onPress={() => router.push(fileRoutes.personal)} />
      {listView === 'populated' ? <View style={styles.grid}>{courses.map((course) => <CourseFolderCard course={course} key={course.id} onPress={() => router.push(courseRoutes.details(course.id))} taskCount={taskCounts.get(course.id) ?? 0} width={cardWidth} />)}</View> : <EmptyState actionLabel="Add Course" description="Create your first course to organize your semester." onAction={() => router.push(courseRoutes.add)} title="No courses yet" />}
    </ScrollView> : null}
  </AppScreen>;
}

function countByCourse(items: { courseId: string | null }[]): Map<string, number> { const result = new Map<string, number>(); for (const item of items) if (item.courseId) result.set(item.courseId, (result.get(item.courseId) ?? 0) + 1); return result; }
const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.md, padding: DesignTokens.layout.screenPadding, paddingBottom: 132 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm } });
