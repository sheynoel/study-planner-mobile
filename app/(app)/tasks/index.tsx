import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { TaskFilterSheet } from '@/components/tasks/task-filter-sheet';
import { TaskGroupSection } from '@/components/tasks/task-group-section';
import { TaskSortSheet } from '@/components/tasks/task-sort-sheet';
import { TaskSummaryCard } from '@/components/tasks/task-summary-card';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { EmptyState, ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { useDashboard } from '@/contexts/dashboard-context';
import { useTasks } from '@/contexts/task-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import { isTaskOverdue } from '@/lib/tasks/task-display';
import { activeTaskFilterCount, DEFAULT_TASK_FILTERS, filterTasksLocally, groupTasks, hasActiveTaskFilters, sortTasks, type TaskFilterState, type TaskSortOption, type TaskTimeView, toTaskApiFilters } from '@/lib/tasks/task-filters';
import { taskRoutes } from '@/lib/tasks/routes';

const TIME_VIEWS: readonly { label: string; value: TaskTimeView }[] = [{ label: 'Today', value: 'today' }, { label: 'Upcoming', value: 'upcoming' }, { label: 'All', value: 'all' }, { label: 'Completed', value: 'completed' }];
const SORT_LABELS: Record<TaskSortOption, string> = { due: 'Due date', priority: 'Priority', created: 'Recent', course: 'Course', alphabetical: 'A–Z' };

export default function TaskListScreen() {
  const { colors } = useAppearance();
  const { courses, getCachedCourse, listError: courseError, listStatus: courseStatus, loadCourses } = useCourses();
  const { listError, listStatus, loadTasks, tasks } = useTasks();
  const dashboard = useDashboard();
  const refreshDashboard = dashboard.refresh;
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_TASK_FILTERS);
  const [sort, setSort] = useState<TaskSortOption>('due');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const { courseId, due, priority, status, timeView } = filters;
  const apiFilters = useMemo(() => toTaskApiFilters({ courseId, due, priority, status, timeView, search: '' }), [courseId, due, priority, status, timeView]);
  const courseName = useCallback((courseId: string) => getCachedCourse(courseId)?.name, [getCachedCourse]);
  const visibleTasks = useMemo(() => sortTasks(filterTasksLocally(tasks, filters, courseName), sort, courseName), [courseName, filters, sort, tasks]);
  const groups = useMemo(() => groupTasks(visibleTasks), [visibleTasks]);
  const refresh = useCallback(async () => { await Promise.all([loadCourses(), loadTasks(apiFilters)]); }, [apiFilters, loadCourses, loadTasks]);

  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); void refreshDashboard(); }, [refresh, refreshDashboard]));

  async function handleComplete(id: string) {
    if (completingIds.has(id)) return;
    setActionError(null); setCompletingIds((current) => new Set(current).add(id));
    try { await dashboard.completeTask(id); }
    catch (error) { setActionError(getApiErrorMessage(error)); }
    finally { setCompletingIds((current) => { const next = new Set(current); next.delete(id); return next; }); }
  }

  const loading = listStatus === 'idle' || listStatus === 'loading' || courseStatus === 'idle' || courseStatus === 'loading';
  const error = listStatus === 'error' ? listError : courseStatus === 'error' ? courseError : null;
  const todayRange = todayBounds();
  const dueToday = dashboard.tasks.filter((task) => task.status !== 'COMPLETED' && task.dueAt && Date.parse(task.dueAt) >= todayRange.start && Date.parse(task.dueAt) <= todayRange.end).length;
  const overdue = dashboard.tasks.filter(isTaskOverdue).length;
  const activeCount = activeTaskFilterCount(filters);

  return <AppScreen footer={<AppSectionTabs active="tasks" />}>
    <AppHeader onRightAction={() => router.push(taskRoutes.add)} rightActionLabel="Add Task" subtitle="Focused views for the work that matters next." title="Tasks" />
    <ErrorBanner message={actionError} />
    {loading ? <LoadingSkeleton rows={4} /> : null}
    {!loading && error ? <ErrorState message={error} onRetry={() => void refresh().catch(() => undefined)} /> : null}
    {!loading && !error ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.summary}><TaskSummaryCard kind="today" label="Due Today" value={dueToday} /><TaskSummaryCard kind="overdue" label="Overdue" value={overdue} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeViews}>{TIME_VIEWS.map((view) => <ChoiceChip key={view.value} label={view.label} selected={filters.timeView === view.value} onPress={() => setFilters((current) => ({ ...current, timeView: view.value, due: 'any', status: undefined }))} />)}</ScrollView>
      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceVariant }]}><Ionicons color={colors.textSecondary} name="search" size={DesignTokens.icon.md} /><TextInput accessibilityLabel="Search tasks" onChangeText={(search) => setFilters((current) => ({ ...current, search }))} placeholder="Search tasks or courses" placeholderTextColor={colors.textSecondary} style={[styles.search, { color: colors.textPrimary }]} value={filters.search} /></View>
      <View style={styles.toolbar}><ToolbarButton icon="options-outline" label={activeCount ? `Filters (${activeCount})` : 'Filters'} onPress={() => setFiltersVisible(true)} /><ToolbarButton icon="swap-vertical-outline" label={`Sort: ${SORT_LABELS[sort]}`} onPress={() => setSortVisible(true)} /></View>
      {visibleTasks.length === 0 ? <EmptyState actionLabel={hasActiveTaskFilters(filters) ? 'Reset filters' : 'Add Task'} description={hasActiveTaskFilters(filters) ? 'No tasks match this combination of filters.' : 'Create your first personal or course task.'} onAction={() => hasActiveTaskFilters(filters) ? setFilters(DEFAULT_TASK_FILTERS) : router.push(taskRoutes.add)} title={hasActiveTaskFilters(filters) ? 'No matching tasks' : 'No tasks yet'} /> : null}
      {groups.map((group) => <TaskGroupSection completingIds={completingIds} courseName={courseName} key={group.key} onComplete={(id) => void handleComplete(id)} onOpen={(id) => router.push(taskRoutes.details(id))} tasks={group.tasks} title={group.title} />)}
    </ScrollView> : null}
    <TaskFilterSheet courses={courses} onApply={setFilters} onClose={() => setFiltersVisible(false)} value={filters} visible={filtersVisible} />
    <TaskSortSheet onChange={setSort} onClose={() => setSortVisible(false)} value={sort} visible={sortVisible} />
  </AppScreen>;
}

function ToolbarButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) { const { colors } = useAppearance(); return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.toolbarButton, { backgroundColor: colors.surface, borderColor: colors.outline }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name={icon} size={DesignTokens.icon.md} /><ThemedText type="defaultSemiBold">{label}</ThemedText></Pressable>; }
function todayBounds(): { end: number; start: number } { const now = new Date(); return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(), end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime() }; }

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, paddingBottom: 132 }, summary: { flexDirection: 'row', gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding }, timeViews: { gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding }, searchWrap: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, flexDirection: 'row', gap: DesignTokens.spacing.sm, marginHorizontal: DesignTokens.layout.screenPadding, minHeight: DesignTokens.size.inputHeight, paddingHorizontal: DesignTokens.spacing.md }, search: { flex: 1, fontSize: 16, minHeight: DesignTokens.size.inputHeight }, toolbar: { flexDirection: 'row', gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding }, toolbarButton: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flex: 1, flexDirection: 'row', gap: DesignTokens.spacing.sm, justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.sm }, pressed: { opacity: 0.7 } });
