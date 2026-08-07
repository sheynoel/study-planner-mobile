import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { TimelineItem } from '@/components/calendar/timeline-item';
import { WeekStrip } from '@/components/calendar/week-strip';
import { CourseFolderCard } from '@/components/courses/course-folder-card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { NextScheduleCard } from '@/components/dashboard/next-schedule-card';
import { FilePreviewCard } from '@/components/files/file-preview-card';
import { TaskPreviewCard } from '@/components/tasks/task-preview-card';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { BentoCard } from '@/components/ui/bento-card';
import { SecondaryButton } from '@/components/ui/buttons';
import { HorizontalCarousel } from '@/components/ui/horizontal-carousel';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { MetricCard } from '@/components/ui/metric-card';
import { SectionHeader } from '@/components/ui/section-header';
import { DesignTokens } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useDashboard } from '@/contexts/dashboard-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { toLocalDateKey } from '@/lib/calendar/calendar-date';
import { calendarRoutes } from '@/lib/calendar/routes';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';
import { formatNextClassLabel } from '@/lib/class-schedules/next-class';
import { courseRoutes } from '@/lib/courses/routes';
import { fileRoutes } from '@/lib/files/routes';
import { taskRoutes } from '@/lib/tasks/routes';

export default function HomeDashboardScreen() {
  const { user } = useAuth();
  const dashboard = useDashboard();
  const refreshDashboard = dashboard.refresh;
  const [completingIds, setCompletingIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const courseNames = useMemo(() => new Map(dashboard.courses.map((course) => [course.id, course.name])), [dashboard.courses]);
  const focusTasks = useMemo(() => [...dashboard.tasksDueToday, ...dashboard.upcomingDeadlines].slice(0, 3), [dashboard.tasksDueToday, dashboard.upcomingDeadlines]);
  const dashboardError = Array.from(new Set(Object.values(dashboard.errors))).filter(Boolean).join(' ');
  const courseTaskCounts = useMemo(() => countByCourse(dashboard.tasks.filter((task) => task.status !== 'COMPLETED')), [dashboard.tasks]);
  const courseFileCounts = useMemo(() => countByCourse(dashboard.files), [dashboard.files]);
  const courseNextClasses = useMemo(() => { const result = new Map<string, string>(); for (const item of dashboard.upcomingSchedule) if (item.sourceType === 'class_schedule' && item.courseId && !result.has(item.courseId)) result.set(item.courseId, formatNextClassLabel(item)); return result; }, [dashboard.upcomingSchedule]);

  useFocusEffect(useCallback(() => { void refreshDashboard(); }, [refreshDashboard]));

  async function handleComplete(id: string) {
    if (completingIds.has(id)) return;
    setActionError(null);
    setCompletingIds((current) => new Set(current).add(id));
    try { await dashboard.completeTask(id); }
    catch (error) { setActionError(getApiErrorMessage(error)); }
    finally { setCompletingIds((current) => { const next = new Set(current); next.delete(id); return next; }); }
  }

  function openScheduleItem(item: CalendarItem) {
    router.push(item.sourceType === 'class_schedule' ? classScheduleRoutes.details(item.sourceId) : item.sourceType === 'task' ? taskRoutes.details(item.sourceId) : calendarRoutes.details(item.sourceId));
  }

  return <AppScreen footer={<AppSectionTabs active="home" />}>
    <DashboardHeader classesToday={dashboard.classesTodayCount} name={user?.name ?? 'Student'} onOpenSettings={() => router.push('/profile')} tasksDueToday={dashboard.allTasksDueTodayCount} />
    <ErrorBanner message={actionError} />
    {dashboard.isLoading && !dashboard.hasLoaded ? <LoadingSkeleton rows={4} /> : null}
    {dashboard.hasLoaded ? <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl onRefresh={() => void dashboard.refresh()} refreshing={dashboard.isRefreshing} />}>
      {dashboardError ? <View style={styles.section}><BentoCard><ErrorBanner message={dashboardError} /><SecondaryButton label="Retry dashboard data" onPress={() => void dashboard.refresh()} /></BentoCard></View> : null}
      <View style={styles.section}><SectionHeader actionLabel="Calendar" onAction={() => router.push(calendarRoutes.list)} title="Up next" />{dashboard.nextScheduleItem ? <NextScheduleCard item={dashboard.nextScheduleItem} onPress={() => openScheduleItem(dashboard.nextScheduleItem!)} /> : <BentoCard tone="accent"><ThemedText type="subtitle">Your schedule is clear</ThemedText><ThemedText>No class or event is scheduled in the next two weeks.</ThemedText></BentoCard>}</View>

      <WeekStrip onSelect={() => router.push(calendarRoutes.list)} selectedDate={toLocalDateKey(new Date())} />
      <View style={styles.metrics}><MetricCard icon="checkbox-outline" label="Due today" value={dashboard.allTasksDueTodayCount} /><MetricCard icon="calendar-outline" label="This week" value={dashboard.tasksThisWeekCount} /><MetricCard icon="school-outline" label="Classes today" value={dashboard.classesTodayCount} /></View>

      <View style={styles.section}><SectionHeader actionLabel="Full day" onAction={() => router.push(calendarRoutes.list)} title="Today" />{dashboard.todaySchedule.slice(0, 5).map((item, index, visible) => <TimelineItem item={item} key={item.id} last={index === visible.length - 1} onPress={() => openScheduleItem(item)} />)}{dashboard.todaySchedule.length === 0 ? <BentoCard tone="subtle"><ThemedText>Your timeline is open today.</ThemedText></BentoCard> : null}</View>

      <View style={styles.section}><SectionHeader actionLabel="All tasks" onAction={() => router.push(taskRoutes.list)} title="Tasks to focus on" />{focusTasks.length ? focusTasks.map((task) => <TaskPreviewCard courseName={task.courseId ? courseNames.get(task.courseId) : undefined} isCompleting={completingIds.has(task.id)} key={task.id} onComplete={() => void handleComplete(task.id)} onPress={() => router.push(taskRoutes.details(task.id))} task={task} />) : <BentoCard tone="subtle"><ThemedText type="defaultSemiBold">You’re caught up.</ThemedText><ThemedText>No incomplete deadline needs attention right now.</ThemedText></BentoCard>}</View>

      <View style={styles.edgeSection}><View style={styles.edgeHeading}><SectionHeader actionLabel="View all" onAction={() => router.push(courseRoutes.list)} title="Courses" /></View>{dashboard.courses.length ? <HorizontalCarousel>{dashboard.courses.slice(0, 6).map((course) => <CourseFolderCard course={course} fileCount={courseFileCounts.get(course.id) ?? 0} key={course.id} nextClass={courseNextClasses.get(course.id)} onPress={() => router.push(courseRoutes.details(course.id))} taskCount={courseTaskCounts.get(course.id) ?? 0} width={210} />)}</HorizontalCarousel> : <View style={styles.edgeHeading}><BentoCard tone="subtle"><ThemedText>No courses yet. Create one to organize your semester.</ThemedText></BentoCard></View>}</View>

      <View style={styles.edgeSection}><View style={styles.edgeHeading}><SectionHeader actionLabel="All files" onAction={() => router.push(fileRoutes.list)} title="Recent materials" /></View>{dashboard.recentFiles.length ? <HorizontalCarousel>{dashboard.recentFiles.map((file) => <FilePreviewCard file={file} key={file.id} onPress={() => router.push(fileRoutes.details(file.id))} width={168} />)}</HorizontalCarousel> : <View style={styles.edgeHeading}><BentoCard tone="subtle"><ThemedText>Your recently uploaded study materials will appear here.</ThemedText></BentoCard></View>}</View>
    </ScrollView> : null}
  </AppScreen>;
}

function countByCourse(items: { courseId: string | null }[]): Map<string, number> { const result = new Map<string, number>(); for (const item of items) if (item.courseId) result.set(item.courseId, (result.get(item.courseId) ?? 0) + 1); return result; }
const styles = StyleSheet.create({ content: { gap: DesignTokens.layout.sectionGap, paddingBottom: 120 }, metrics: { flexDirection: 'row', gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding }, section: { gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding }, edgeSection: { gap: DesignTokens.spacing.sm }, edgeHeading: { paddingHorizontal: DesignTokens.layout.screenPadding } });
