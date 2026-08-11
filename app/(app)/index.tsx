import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { CollapsibleHomeSection } from '@/components/dashboard/collapsible-home-section';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { HomeContextWidget, type HomeContextWidgetData } from '@/components/dashboard/home-context-widget';
import { HomeTaskList } from '@/components/dashboard/home-task-list';
import { HomeTodayHeroCard } from '@/components/dashboard/home-today-hero';
import { HomeWeekStrip } from '@/components/dashboard/home-week-strip';
import { TodayClassCard } from '@/components/dashboard/today-class-card';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';
import { useCalendar } from '@/contexts/calendar-context';
import { useDashboard } from '@/contexts/dashboard-context';
import { useHome } from '@/contexts/home-context';
import { useNotes } from '@/contexts/note-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { Task } from '@/lib/api/task.types';
import type { CalendarRange } from '@/lib/calendar/calendar-date';
import { formatLocalTime, parseLocalDate, toLocalDateKey } from '@/lib/calendar/calendar-date';
import { normalizeCalendarNotes } from '@/lib/calendar/calendar-items';
import { calendarRoutes } from '@/lib/calendar/routes';
import { courseRoutes } from '@/lib/courses/routes';
import { getClassNotes, getClassTimeState, getHomeReminders, getHomeTodayHero, getImportantHomeTasks, getNextRemainingClass, getNextUpcomingEvent, getTodayClasses, type HomeReminder } from '@/lib/dashboard/home-dashboard';
import { noteRoutes } from '@/lib/notes/routes';
import { getTaskDeadline } from '@/lib/tasks/task-deadline';
import { taskRoutes } from '@/lib/tasks/routes';

export default function HomeDashboardScreen() {
  const { user } = useAuth();
  const { colors } = useAppearance();
  const { width } = useWindowDimensions();
  const dashboard = useDashboard();
  const calendar = useCalendar();
  const { expanded, toggleSection } = useHome();
  const { listError: noteError, loadNotes, notes } = useNotes();
  const [now, setNow] = useState(() => new Date());
  const [completingIds, setCompletingIds] = useState<Set<string>>(() => new Set());
  const [completionError, setCompletionError] = useState<string | null>(null);
  const todayKey = toLocalDateKey(now);
  const weekRange = useMemo(() => getNearbyRange(todayKey), [todayKey]);
  const refreshDashboard = dashboard.refresh;
  const loadCalendarRange = calendar.loadRange;

  useFocusEffect(useCallback(() => {
    setNow(new Date());
    void Promise.allSettled([refreshDashboard(), loadNotes(), loadCalendarRange(weekRange)]);
  }, [loadCalendarRange, loadNotes, refreshDashboard, weekRange]));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const courseById = useMemo(() => new Map(dashboard.courses.map((course) => [course.id, course])), [dashboard.courses]);
  const courseColors = useMemo(() => new Map(dashboard.courses.map((course) => [course.id, course.color])), [dashboard.courses]);
  const todayClasses = useMemo(() => getTodayClasses(dashboard.todaySchedule, now), [dashboard.todaySchedule, now]);
  const classNotes = useMemo(() => new Map(todayClasses.map((item) => [item.id, getClassNotes(notes, item.courseId, now)])), [notes, now, todayClasses]);
  const classNoteIds = useMemo(() => new Set([...classNotes.values()].flat().map((note) => note.id)), [classNotes]);
  const reminders = useMemo(() => getHomeReminders(dashboard.todaySchedule, notes, dashboard.courses, classNoteIds, now), [classNoteIds, dashboard.courses, dashboard.todaySchedule, notes, now]);
  const importantTasks = useMemo(() => getImportantHomeTasks(dashboard.tasks, now, 4), [dashboard.tasks, now]);
  const hero = useMemo(() => getHomeTodayHero(dashboard.todaySchedule, dashboard.tasks, now), [dashboard.tasks, dashboard.todaySchedule, now]);
  const nextClass = useMemo(() => getNextRemainingClass(dashboard.todaySchedule, now), [dashboard.todaySchedule, now]);
  const nextEvent = useMemo(() => getNextUpcomingEvent(dashboard.upcomingSchedule, now), [dashboard.upcomingSchedule, now]);
  const weekItems = useMemo(() => [...calendar.items, ...normalizeCalendarNotes(notes, dashboard.courses).filter((item) => item.date >= weekRange.firstDate && item.date <= weekRange.lastDate)], [calendar.items, dashboard.courses, notes, weekRange.firstDate, weekRange.lastDate]);
  const contextWidgets = useMemo(() => buildContextWidgets(nextClass, reminders, importantTasks, nextEvent, courseById, now), [courseById, importantTasks, nextClass, nextEvent, now, reminders]);
  const stackWidgets = width < 380;
  const reminderError = dashboard.errors.events ?? noteError;

  async function refreshAll() {
    await Promise.allSettled([dashboard.refresh(), calendar.loadRange(weekRange), loadNotes()]);
  }

  async function completeTask(taskId: string) {
    if (completingIds.has(taskId)) return;
    setCompletionError(null);
    setCompletingIds((current) => new Set(current).add(taskId));
    try {
      await dashboard.completeTask(taskId);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (reason) {
      setCompletionError(getApiErrorMessage(reason));
    } finally {
      setCompletingIds((current) => { const next = new Set(current); next.delete(taskId); return next; });
    }
  }

  return <AppScreen footer={<AppSectionTabs active="home" />}>
    <DashboardHeader name={user?.name ?? 'Student'} />
    {dashboard.isLoading && !dashboard.hasLoaded ? <View style={styles.padded}><LoadingSkeleton rows={4} /></View> : null}
    {dashboard.hasLoaded ? <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl colors={[colors.primary]} onRefresh={() => void refreshAll()} refreshing={dashboard.isRefreshing} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
      <View style={styles.heroWrap}><HomeTodayHeroCard accentColor={hero.nextItem?.courseId ? courseColors.get(hero.nextItem.courseId) : hero.nextItem?.color} data={hero} onOpenNext={hero.nextItem ? () => openCalendarItem(hero.nextItem!) : undefined} /></View>
      <View style={styles.weekWrap}><HomeWeekStrip courseColors={courseColors} items={weekItems} onOpenDate={(date) => router.push(calendarRoutes.forDate(date))} today={now} /></View>

      {contextWidgets.length ? <View accessibilityLabel="Today context" style={[styles.widgetRow, stackWidgets ? styles.widgetStack : undefined]}>{contextWidgets.map((widget) => <HomeContextWidget data={widget.data} key={widget.data.label} onPress={widget.onPress} />)}</View> : null}
      {reminderError ? <View style={styles.contextError}><ErrorBanner message={reminderError} /></View> : null}

      <View style={styles.classesSection}><CollapsibleHomeSection action={<SmallAction accessibilityLabel="View today's classes in Calendar" label="See all" onPress={() => router.push(calendarRoutes.forDate(todayKey))} />} expanded={expanded.classes} onToggle={() => toggleSection('classes')} title="Classes Today">
        {dashboard.errors.schedules || dashboard.errors.courses ? <ErrorBanner message={dashboard.errors.schedules ?? dashboard.errors.courses ?? null} /> : null}
        {todayClasses.length ? <ScrollView accessibilityLabel="Classes today" contentContainerStyle={styles.classCarousel} horizontal showsHorizontalScrollIndicator={false}>{todayClasses.map((item) => {
          const course = item.courseId ? courseById.get(item.courseId) : undefined;
          return <TodayClassCard courseCode={course?.code || course?.name || 'Class'} item={item} key={item.id} notes={classNotes.get(item.id) ?? []} onPress={() => { if (item.courseId) router.push(courseRoutes.details(item.courseId)); }} state={getClassTimeState(item, now)} width={152} />;
        })}</ScrollView> : <CalmEmptyState label="No classes today." actionLabel="View Calendar" onAction={() => router.push(calendarRoutes.forDate(todayKey))} />}
      </CollapsibleHomeSection></View>

      <CollapsibleHomeSection action={<SmallAction accessibilityLabel="View all tasks" label="View all" onPress={() => router.push(taskRoutes.list)} />} expanded={expanded.tasks} onToggle={() => toggleSection('tasks')} title="Tasks">
        {dashboard.errors.tasks || completionError ? <ErrorBanner message={completionError ?? dashboard.errors.tasks ?? null} /> : null}
        <HomeTaskList completingIds={completingIds} courses={dashboard.courses} onCompleteTask={(task) => void completeTask(task.id)} onOpenTask={(task) => router.push(taskRoutes.details(task.id))} tasks={importantTasks} />
      </CollapsibleHomeSection>
    </ScrollView> : null}
  </AppScreen>;
}

function SmallAction({ accessibilityLabel, label, onPress }: { accessibilityLabel: string; label: string; onPress: () => void }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" hitSlop={4} onPress={onPress} style={({ pressed }) => [styles.smallAction, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.smallActionLabel, { color: colors.primary }]}>{label}</ThemedText></Pressable>;
}

function CalmEmptyState({ actionLabel, label, onAction }: { actionLabel?: string; label: string; onAction?: () => void }) {
  const { colors } = useAppearance();
  return <View style={[styles.empty, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}><ThemedText style={[styles.emptyLabel, { color: colors.textSecondary }]}>{label}</ThemedText>{actionLabel && onAction ? <Pressable accessibilityRole="button" onPress={onAction} style={styles.emptyAction}><ThemedText style={[styles.emptyActionLabel, { color: colors.primary }]}>{actionLabel}</ThemedText></Pressable> : null}</View>;
}

type WidgetTarget = { data: HomeContextWidgetData; onPress: () => void };

function buildContextWidgets(nextClass: CalendarItem | null, reminders: HomeReminder[], tasks: Task[], nextEvent: CalendarItem | null, courseById: Map<string, { code: string | null; color: string; name: string }>, now: Date): WidgetTarget[] {
  const widgets: WidgetTarget[] = [];
  if (nextClass) widgets.push({
    data: {
      label: 'NEXT CLASS',
      title: nextClass.courseCode || nextClass.title,
      subtitle: nextClass.courseName,
      metadata: [getClassTimeState(nextClass, now) === 'current' ? 'Now' : formatLocalTime(nextClass.startAt), nextClass.location].filter(Boolean).join(' · '),
      color: nextClass.color,
      accessibilityLabel: `Open next class, ${nextClass.title}`,
    },
    onPress: () => { if (nextClass.courseId) router.push(courseRoutes.details(nextClass.courseId)); },
  });
  const reminder = reminders.find((item) => item.sourceType === 'note') ?? reminders[0];
  if (reminder) widgets.push(reminderWidget(reminder, courseById));
  else if (tasks[0]) widgets.push(taskWidget(tasks[0], courseById));
  else if (nextEvent) widgets.push(eventWidget(nextEvent, courseById));
  return widgets;
}

function reminderWidget(reminder: HomeReminder, courseById: Map<string, { color: string }>): WidgetTarget {
  return {
    data: {
      label: "DON'T FORGET",
      title: reminder.title,
      subtitle: reminder.courseLabel,
      metadata: reminder.isOverdue ? 'Overdue reminder' : reminder.isAllDay ? 'Today · All day' : reminder.at ? `Today · ${formatLocalTime(reminder.at)}` : reminder.isPinned ? 'Pinned' : 'Today',
      color: reminder.courseId ? courseById.get(reminder.courseId)?.color : reminder.color,
      accessibilityLabel: `Open reminder, ${reminder.title}`,
    },
    onPress: () => router.push(reminder.sourceType === 'event' ? calendarRoutes.details(reminder.sourceId) : noteRoutes.details(reminder.sourceId)),
  };
}

function taskWidget(task: Task, courseById: Map<string, { code: string | null; color: string; name: string }>): WidgetTarget {
  const course = task.courseId ? courseById.get(task.courseId) : undefined;
  const deadline = getTaskDeadline(task);
  return {
    data: { label: deadline.tone === 'danger' ? "DON'T FORGET" : 'UPCOMING', title: task.title, subtitle: course?.code || course?.name || 'Personal', metadata: deadline.label, color: course?.color, accessibilityLabel: `Open task, ${task.title}` },
    onPress: () => router.push(taskRoutes.details(task.id)),
  };
}

function eventWidget(event: CalendarItem, courseById: Map<string, { color: string }>): WidgetTarget {
  const date = event.date === toLocalDateKey(new Date()) ? 'Today' : new Date(event.startAt).toLocaleDateString(undefined, { weekday: 'long' });
  return {
    data: { label: 'NEXT EVENT', title: event.title, subtitle: event.courseCode || event.courseName || 'Personal', metadata: event.isAllDay ? `${date} · All day` : `${date} · ${formatLocalTime(event.startAt)}`, color: event.courseId ? courseById.get(event.courseId)?.color : event.color, accessibilityLabel: `Open event, ${event.title}` },
    onPress: () => router.push(calendarRoutes.details(event.sourceId)),
  };
}

function openCalendarItem(item: CalendarItem) {
  if (item.sourceType === 'event') router.push(calendarRoutes.details(item.sourceId));
  else if (item.courseId) router.push(courseRoutes.details(item.courseId));
}

function getNearbyRange(todayKey: string): CalendarRange {
  const today = parseLocalDate(todayKey) ?? new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);
  const last = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 23, 59, 59, 999);
  return { from: first.toISOString(), to: last.toISOString(), firstDate: toLocalDateKey(first), lastDate: toLocalDateKey(last) };
}

const styles = StyleSheet.create({
  content: { paddingBottom: 128, paddingHorizontal: DesignTokens.layout.screenPadding },
  padded: { paddingHorizontal: DesignTokens.layout.screenPadding },
  heroWrap: { marginBottom: DesignTokens.spacing.lg },
  weekWrap: { marginBottom: DesignTokens.spacing.xl },
  widgetRow: { flexDirection: 'row', gap: DesignTokens.spacing.sm, marginBottom: DesignTokens.spacing.xxl },
  widgetStack: { flexDirection: 'column' },
  contextError: { marginBottom: DesignTokens.spacing.xl },
  classesSection: { marginBottom: DesignTokens.spacing.xxl },
  classCarousel: { gap: DesignTokens.spacing.sm, paddingRight: DesignTokens.layout.screenPadding },
  smallAction: { justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.xs },
  smallActionLabel: { fontSize: 11, fontWeight: '700', lineHeight: 15 },
  empty: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 46, paddingLeft: DesignTokens.spacing.md },
  emptyLabel: { flex: 1, fontSize: 12, lineHeight: 17, paddingVertical: DesignTokens.spacing.sm },
  emptyAction: { justifyContent: 'center', minHeight: 44, paddingHorizontal: DesignTokens.spacing.md },
  emptyActionLabel: { fontSize: 11, fontWeight: '700', lineHeight: 15 },
  pressed: { opacity: 0.58 },
});
