import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { CourseFolderCard } from '@/components/courses/course-folder-card';
import { PersonalLibraryCard } from '@/components/courses/personal-library-card';
import { AppScreen } from '@/components/ui/app-screen';
import { EmptyState, ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { SectionHeader } from '@/components/ui/section-header';
import { DesignTokens } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useCourses } from '@/contexts/course-context';
import { useDashboard } from '@/contexts/dashboard-context';
import { formatLocalTime } from '@/lib/calendar/calendar-date';
import { courseRoutes } from '@/lib/courses/routes';
import { fileRoutes } from '@/lib/files/routes';

export default function CourseListScreen() {
  const { user } = useAuth();
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const dashboard = useDashboard();
  const refreshDashboard = dashboard.refresh;
  const taskCounts = useMemo(() => countByCourse(dashboard.tasks.filter((task) => task.status !== 'COMPLETED')), [dashboard.tasks]);
  const fileCounts = useMemo(() => countByCourse(dashboard.files), [dashboard.files]);
  const nextClasses = useMemo(() => { const result = new Map<string, string>(); for (const item of dashboard.todaySchedule) if (item.sourceType === 'class_schedule' && item.courseId && !result.has(item.courseId)) result.set(item.courseId, formatLocalTime(item.startAt)); return result; }, [dashboard.todaySchedule]);
  const personalFiles = dashboard.files.filter((file) => file.courseId === null).length;
  const refresh = useCallback(async () => { await Promise.all([loadCourses(), refreshDashboard()]); }, [loadCourses, refreshDashboard]);
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));

  return <AppScreen footer={<AppSectionTabs active="courses" />}>
    <AppHeader onRightAction={() => router.push(courseRoutes.add)} rightActionLabel="Add Course" subtitle={`${user?.name ?? 'Student'}’s semester workspace`} title="Courses" />
    {listStatus === 'idle' || listStatus === 'loading' ? <LoadingSkeleton rows={4} /> : null}
    {listStatus === 'error' ? <ErrorState message={listError ?? 'Your courses could not be loaded.'} onRetry={() => void refresh().catch(() => undefined)} /> : null}
    {listStatus === 'success' ? <ScrollView contentContainerStyle={styles.content}>
      <SectionHeader title="Course folders" />
      {courses.length ? <View style={styles.grid}>{courses.map((course) => <CourseFolderCard course={course} fileCount={fileCounts.get(course.id) ?? 0} key={course.id} nextClass={nextClasses.get(course.id)} onPress={() => router.push(courseRoutes.details(course.id))} taskCount={taskCounts.get(course.id) ?? 0} width="47%" />)}</View> : <EmptyState actionLabel="Add Course" description="Create your first course folder to organize academic work." onAction={() => router.push(courseRoutes.add)} title="Your semester starts here" />}
      <PersonalLibraryCard fileCount={personalFiles} onPress={() => router.push(fileRoutes.personal)} />
    </ScrollView> : null}
  </AppScreen>;
}

function countByCourse(items: { courseId: string | null }[]): Map<string, number> { const result = new Map<string, number>(); for (const item of items) if (item.courseId) result.set(item.courseId, (result.get(item.courseId) ?? 0) + 1); return result; }
const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, padding: DesignTokens.layout.screenPadding, paddingBottom: 132 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.md } });
