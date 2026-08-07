import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { CollapsibleHomeSection } from '@/components/dashboard/collapsible-home-section';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { HomeMonthCalendar } from '@/components/dashboard/home-month-calendar';
import { HomeTaskFilterSheet } from '@/components/dashboard/home-task-filter-sheet';
import { HomeTaskList } from '@/components/dashboard/home-task-list';
import { SelectedDateSummary } from '@/components/dashboard/selected-date-summary';
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
import { addMonths, getMonthRange, toLocalDateKey } from '@/lib/calendar/calendar-date';
import { calendarRoutes } from '@/lib/calendar/routes';
import { courseRoutes } from '@/lib/courses/routes';
import { activeHomeTaskFilterCount, countSelectedDateItems, DEFAULT_HOME_TASK_FILTERS, filterHomeTasks, getClassNotes, getClassTimeState, getTodayClasses, type HomeTaskFilters } from '@/lib/dashboard/home-dashboard';
import { taskRoutes } from '@/lib/tasks/routes';

export default function HomeDashboardScreen() {
  const { user } = useAuth();
  const dashboard = useDashboard();
  const calendar = useCalendar();
  const { expanded, toggleSection } = useHome();
  const { listError: noteError, loadNotes, notes } = useNotes();
  const { width: screenWidth } = useWindowDimensions();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));
  const [now, setNow] = useState(() => new Date());
  const [taskFilters, setTaskFilters] = useState<HomeTaskFilters>(DEFAULT_HOME_TASK_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);
  const range = useMemo(() => getMonthRange(month), [month]);
  const refreshDashboard = dashboard.refresh;
  const loadCalendarRange = calendar.loadRange;

  useFocusEffect(useCallback(() => {
    setNow(new Date());
    void refreshDashboard();
    void loadNotes().catch(() => undefined);
  }, [loadNotes, refreshDashboard]));

  useFocusEffect(useCallback(() => {
    void loadCalendarRange(range).catch(() => undefined);
  }, [loadCalendarRange, range]));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const courseById = useMemo(() => new Map(dashboard.courses.map((course) => [course.id, course])), [dashboard.courses]);
  const courseColors = useMemo(() => new Map(dashboard.courses.map((course) => [course.id, course.color])), [dashboard.courses]);
  const todayClasses = useMemo(() => getTodayClasses(dashboard.todaySchedule, now), [dashboard.todaySchedule, now]);
  const visibleTasks = useMemo(() => filterHomeTasks(dashboard.tasks, taskFilters, now), [dashboard.tasks, now, taskFilters]);
  const selectedCounts = useMemo(() => countSelectedDateItems(calendar.items, selectedDate), [calendar.items, selectedDate]);
  const classCardWidth = Math.min(165, Math.max(135, (screenWidth - 56) * 0.47));
  const filterCount = activeHomeTaskFilterCount(taskFilters);

  function changeMonth(amount: number) {
    const next = addMonths(month, amount);
    setMonth(next);
    setSelectedDate(toLocalDateKey(next));
  }

  async function refreshAll() {
    await Promise.allSettled([dashboard.refresh(), calendar.loadRange(range), loadNotes()]);
  }

  return <AppScreen footer={<AppSectionTabs active="home" />}>
    <DashboardHeader name={user?.name ?? 'Student'} onOpenSettings={() => router.push('/profile')} />
    {dashboard.isLoading && !dashboard.hasLoaded ? <View style={styles.padded}><LoadingSkeleton rows={4} /></View> : null}
    {dashboard.hasLoaded ? <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl onRefresh={() => void refreshAll()} refreshing={dashboard.isRefreshing} />}>
      <CollapsibleHomeSection expanded={expanded.classes} onToggle={() => toggleSection('classes')} title="Classes Today">
        {dashboard.errors.schedules || dashboard.errors.courses || noteError ? <ErrorBanner message={dashboard.errors.schedules ?? dashboard.errors.courses ?? noteError ?? null} /> : null}
        {todayClasses.length ? <ScrollView contentContainerStyle={styles.classRow} horizontal showsHorizontalScrollIndicator={false}>{todayClasses.map((item) => {
          const course = item.courseId ? courseById.get(item.courseId) : undefined;
          return <TodayClassCard courseCode={course?.code || course?.name || 'Class'} item={item} key={item.id} notes={getClassNotes(notes, item.courseId, now)} onPress={() => { if (item.courseId) router.push(courseRoutes.details(item.courseId)); }} state={getClassTimeState(item, now)} width={classCardWidth} />;
        })}</ScrollView> : <CalmEmptyState label="No classes today" />}
      </CollapsibleHomeSection>

      <CollapsibleHomeSection expanded={expanded.calendar} onToggle={() => toggleSection('calendar')} title="Calendar">
        {calendar.listStatus === 'loading' || calendar.listStatus === 'idle' ? <LoadingSkeleton rows={2} /> : null}
        {calendar.listStatus === 'error' ? <ErrorBanner message={calendar.listError} /> : null}
        {calendar.listStatus === 'success' ? <><HomeMonthCalendar courseColors={courseColors} items={calendar.items} month={month} onNextMonth={() => changeMonth(1)} onPreviousMonth={() => changeMonth(-1)} onSelectDate={setSelectedDate} selectedDate={selectedDate} /><SelectedDateSummary classes={selectedCounts.classes} events={selectedCounts.events} onPress={() => router.push(calendarRoutes.list)} selectedDate={selectedDate} tasks={selectedCounts.tasks} /></> : null}
      </CollapsibleHomeSection>

      <CollapsibleHomeSection action={<FilterButton count={filterCount} onPress={() => setFilterVisible(true)} />} expanded={expanded.tasks} onToggle={() => toggleSection('tasks')} title="Tasks">
        {dashboard.errors.tasks ? <ErrorBanner message={dashboard.errors.tasks} /> : null}
        <HomeTaskList courses={dashboard.courses} onOpenTask={(task) => router.push(taskRoutes.details(task.id))} tasks={visibleTasks} />
      </CollapsibleHomeSection>
    </ScrollView> : null}
    <HomeTaskFilterSheet courses={dashboard.courses} onApply={setTaskFilters} onClose={() => setFilterVisible(false)} value={taskFilters} visible={filterVisible} />
  </AppScreen>;
}

function FilterButton({ count, onPress }: { count: number; onPress: () => void }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityLabel={`Filter tasks${count ? `, ${count} active` : ''}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.filter, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name="options-outline" size={15} /><ThemedText style={[styles.filterLabel, { color: colors.primary }]}>Filter{count ? ` (${count})` : ''}</ThemedText></Pressable>;
}

function CalmEmptyState({ label }: { label: string }) {
  const { colors } = useAppearance();
  return <View style={[styles.empty, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}><ThemedText style={[styles.emptyLabel, { color: colors.textSecondary }]}>{label}</ThemedText></View>;
}

const styles = StyleSheet.create({
  content: { gap: DesignTokens.spacing.lg, paddingBottom: 128, paddingHorizontal: DesignTokens.layout.screenPadding },
  padded: { paddingHorizontal: DesignTokens.layout.screenPadding },
  classRow: { gap: DesignTokens.spacing.sm, paddingRight: DesignTokens.layout.screenPadding },
  filter: { alignItems: 'center', flexDirection: 'row', gap: 4, minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.xs },
  filterLabel: { fontSize: 11, fontWeight: '700', lineHeight: 15 },
  empty: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: DesignTokens.spacing.md },
  emptyLabel: { fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.58 },
});
