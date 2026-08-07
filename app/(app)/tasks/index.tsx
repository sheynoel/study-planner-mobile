import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { AcademicTaskCard } from '@/components/tasks/academic-task-card';
import { CourseTaskTabs } from '@/components/tasks/course-task-tabs';
import { TaskFilterSheet } from '@/components/tasks/task-filter-sheet';
import { TaskSortSheet } from '@/components/tasks/task-sort-sheet';
import { WeeklyDateStrip } from '@/components/tasks/weekly-date-strip';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { EmptyState, ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import { monthTitle } from '@/lib/calendar/calendar-date';
import { activeTaskFilterCount, DEFAULT_TASK_FILTERS, filterTasksLocally, hasActiveTaskFilters, sortTasks, type TaskCourseSelection, type TaskFilterState, type TaskSortOption, toTaskApiFilters } from '@/lib/tasks/task-filters';
import { taskRoutes } from '@/lib/tasks/routes';
import { addTaskDays, shiftTaskDate, startOfTaskWeek } from '@/lib/tasks/task-week';

export default function TaskListScreen() {
  const { colors } = useAppearance();
  const { courses, getCachedCourse, listError: courseError, listStatus: courseStatus, loadCourses } = useCourses();
  const { listError, listStatus, loadTasks, tasks } = useTasks();
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_TASK_FILTERS);
  const [sort, setSort] = useState<TaskSortOption>('deadline_soonest');
  const [weekAnchor, setWeekAnchor] = useState(() => startOfTaskWeek(new Date()));
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const apiFilters = useMemo(() => toTaskApiFilters(filters), [filters]);
  const courseName = useCallback((courseId: string) => getCachedCourse(courseId)?.name, [getCachedCourse]);
  const visibleTasks = useMemo(() => sortTasks(filterTasksLocally(tasks, filters, courseName), sort), [courseName, filters, sort, tasks]);
  const refresh = useCallback(async () => { await Promise.all([loadCourses(), loadTasks(apiFilters)]); }, [apiFilters, loadCourses, loadTasks]);

  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));

  useEffect(() => {
    if (filters.courseId && filters.courseId !== 'personal' && courseStatus === 'success' && !courses.some((course) => course.id === filters.courseId)) {
      setFilters((current) => ({ ...current, courseId: undefined }));
    }
  }, [courseStatus, courses, filters.courseId]);

  const initialLoading = (listStatus === 'idle' || listStatus === 'loading' || courseStatus === 'idle' || courseStatus === 'loading') && tasks.length === 0;
  const error = listStatus === 'error' ? listError : courseStatus === 'error' ? courseError : null;
  const activeCount = activeTaskFilterCount(filters);

  const selectCourse = (courseId: TaskCourseSelection) => setFilters((current) => ({ ...current, courseId }));
  const selectDate = (selectedDate: string | null) => setFilters((current) => ({ ...current, selectedDate }));
  const shiftWeek = (amount: number) => {
    setWeekAnchor((current) => addTaskDays(current, amount));
    setFilters((current) => ({ ...current, selectedDate: current.selectedDate ? shiftTaskDate(current.selectedDate, amount) : null }));
  };
  const onRefresh = async () => { setRefreshing(true); try { await refresh(); } catch { /* The shared state exposes the retry message. */ } finally { setRefreshing(false); } };
  const resetAll = () => setFilters(DEFAULT_TASK_FILTERS);

  return <AppScreen footer={<AppSectionTabs active="tasks" />}>
    <AppHeader onRightAction={() => router.push(taskRoutes.add)} rightActionLabel="Add Task" title="Tasks" />
    {initialLoading ? <LoadingSkeleton rows={5} /> : null}
    {!initialLoading && error && tasks.length === 0 ? <ErrorState message={error} onRetry={() => void refresh().catch(() => undefined)} /> : null}
    {!initialLoading && !(error && tasks.length === 0) ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl colors={[colors.primary]} onRefresh={() => void onRefresh()} refreshing={refreshing} tintColor={colors.primary} />}>
      {error ? <View style={styles.banner}><ErrorBanner message={error} /></View> : null}
      <View style={styles.monthSummary}><ThemedText type="defaultSemiBold">{monthTitle(new Date())}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</ThemedText></View>
      <WeeklyDateStrip anchor={weekAnchor} onNextWeek={() => shiftWeek(7)} onPreviousWeek={() => shiftWeek(-7)} onSelectDate={selectDate} selectedDate={filters.selectedDate} />
      <CourseTaskTabs courses={courses} onChange={selectCourse} value={filters.courseId} />
      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceVariant }]}><Ionicons color={colors.textSecondary} name="search" size={DesignTokens.icon.md} /><TextInput accessibilityLabel="Search tasks" onChangeText={(search) => setFilters((current) => ({ ...current, search }))} placeholder="Search tasks or courses" placeholderTextColor={colors.textSecondary} style={[styles.search, { color: colors.textPrimary }]} value={filters.search} /></View>
      <View style={styles.toolbar}><ToolbarButton icon="options-outline" label={activeCount ? `Filter (${activeCount})` : 'Filter'} onPress={() => setFiltersVisible(true)} /><ToolbarButton icon="swap-vertical-outline" label="Sort" onPress={() => setSortVisible(true)} /></View>
      {visibleTasks.length === 0 ? <View style={styles.empty}><EmptyState actionLabel={hasActiveTaskFilters(filters) ? 'Clear selections' : 'Add Task'} description={hasActiveTaskFilters(filters) ? 'Try another date, course, search, or filter combination.' : 'Create your first personal or course task.'} onAction={() => hasActiveTaskFilters(filters) ? resetAll() : router.push(taskRoutes.add)} title={hasActiveTaskFilters(filters) ? 'No matching tasks' : 'No tasks yet'} /></View> : null}
      {visibleTasks.length > 0 ? <View style={styles.taskList}>{visibleTasks.map((task) => <AcademicTaskCard course={task.courseId ? getCachedCourse(task.courseId) : undefined} key={task.id} onPress={() => router.push(taskRoutes.details(task.id))} task={task} />)}</View> : null}
    </ScrollView> : null}
    <TaskFilterSheet onApply={setFilters} onClose={() => setFiltersVisible(false)} value={filters} visible={filtersVisible} />
    <TaskSortSheet onChange={setSort} onClose={() => setSortVisible(false)} value={sort} visible={sortVisible} />
  </AppScreen>;
}

function ToolbarButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.toolbarButton, { backgroundColor: colors.surface, borderColor: colors.outline }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name={icon} size={DesignTokens.icon.md} /><ThemedText numberOfLines={1} style={styles.toolbarLabel}>{label}</ThemedText></Pressable>;
}

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.md, paddingBottom: 132, paddingTop: DesignTokens.spacing.md }, banner: { paddingHorizontal: DesignTokens.layout.screenPadding }, monthSummary: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: DesignTokens.layout.screenPadding }, searchWrap: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, flexDirection: 'row', gap: DesignTokens.spacing.sm, marginHorizontal: DesignTokens.layout.screenPadding, minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.md }, search: { flex: 1, fontSize: 14, minHeight: DesignTokens.size.touchTarget }, toolbar: { flexDirection: 'row', gap: DesignTokens.spacing.sm, justifyContent: 'flex-end', paddingHorizontal: DesignTokens.layout.screenPadding }, toolbarButton: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.xs, justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.md }, toolbarLabel: { fontSize: 13, fontWeight: '600' }, taskList: { gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding }, empty: { paddingHorizontal: DesignTokens.layout.screenPadding }, pressed: { opacity: 0.7 } });
