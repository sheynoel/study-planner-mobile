import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { CollapsibleHomeSection } from '@/components/dashboard/collapsible-home-section';
import { CourseEventCard } from '@/components/courses/course-event-card';
import { CourseHero } from '@/components/courses/course-hero';
import { CourseScheduleSheet } from '@/components/courses/course-schedule-sheet';
import { CourseTaskRow } from '@/components/courses/course-task-row';
import { CourseToolShortcuts } from '@/components/courses/course-tool-shortcuts';
import { TaskFilterSheet } from '@/components/tasks/task-filter-sheet';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCalendar } from '@/contexts/calendar-context';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { useCourses } from '@/contexts/course-context';
import { useTasks } from '@/contexts/task-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { CalendarEvent } from '@/lib/api/calendar-event.types';
import type { Course } from '@/lib/api/course.types';
import { calendarRoutes } from '@/lib/calendar/routes';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';
import { courseRoutes } from '@/lib/courses/routes';
import { fileRoutes } from '@/lib/files/routes';
import { noteRoutes } from '@/lib/notes/routes';
import { activeTaskFilterCount, DEFAULT_TASK_FILTERS, filterTasksLocally, sortTasks, type TaskFilterState } from '@/lib/tasks/task-filters';
import { taskRoutes } from '@/lib/tasks/routes';

export default function CourseDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { width } = useWindowDimensions();
  const { colors } = useAppearance();
  const { loadCourseEvents } = useCalendar();
  const { loadCourseSchedules, schedules } = useClassSchedules();
  const { deleteCourse, getCachedCourse, loadCourse } = useCourses();
  const { completeTask, loadTasks, tasks } = useTasks();
  const [course, setCourse] = useState<Course | null>(() => courseId ? getCachedCourse(courseId) ?? null : null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(!course);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const [eventsExpanded, setEventsExpanded] = useState(true);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [taskFilters, setTaskFilters] = useState<TaskFilterState>(() => ({ ...DEFAULT_TASK_FILTERS, courseId }));
  const [completingIds, setCompletingIds] = useState<Set<string>>(() => new Set());
  const courseTasks = useMemo(() => tasks.filter((task) => task.courseId === courseId), [courseId, tasks]);
  const visibleTasks = useMemo(() => sortTasks(filterTasksLocally(courseTasks, { ...taskFilters, courseId }, () => course?.name, new Date()), 'deadline_soonest'), [course?.name, courseId, courseTasks, taskFilters]);
  const upcomingEvents = useMemo(() => events.filter((event) => event.courseId === courseId && Date.parse(event.endAt ?? event.startAt) >= Date.now()).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)), [courseId, events]);
  const eventCardWidth = (width - DesignTokens.layout.screenPadding * 2 - DesignTokens.spacing.sm) / 2;

  const refresh = useCallback(async () => {
    if (!courseId) { setLoadError('This course link is invalid.'); setIsLoading(false); return; }
    setLoadError(null); setIsLoading(true);
    try { const [loaded, , loadedEvents] = await Promise.all([loadCourse(courseId), loadTasks({ courseId }), loadCourseEvents(courseId), loadCourseSchedules(courseId)]); setCourse(loaded); setEvents(loadedEvents); }
    catch (error) { setLoadError(getApiErrorMessage(error)); }
    finally { setIsLoading(false); }
  }, [courseId, loadCourse, loadCourseEvents, loadCourseSchedules, loadTasks]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function handleComplete(id: string) { if (completingIds.has(id)) return; setCompletingIds((current) => new Set(current).add(id)); try { await completeTask(id); } catch (error) { setLoadError(getApiErrorMessage(error)); } finally { setCompletingIds((current) => { const next = new Set(current); next.delete(id); return next; }); } }
  async function performDelete() { if (!courseId || isDeleting) return; setDeleteError(null); setIsDeleting(true); try { await deleteCourse(courseId); router.replace(courseRoutes.list); } catch (error) { setDeleteError(getApiErrorMessage(error)); setIsDeleting(false); } }

  return <AppScreen edges={['top', 'bottom']}>
    <AppHeader onBack={() => router.back()} onRightAction={course && courseId ? () => router.push(courseRoutes.edit(courseId)) : undefined} rightActionLabel={course && courseId ? 'Edit' : undefined} title="Course" />
    {isLoading && !course ? <LoadingSkeleton rows={4} /> : null}
    {loadError && !course ? <ErrorState message={loadError} onRetry={() => void refresh()} /> : null}
    {course && courseId ? <ScrollView contentContainerStyle={styles.content}>
      <CourseHero course={course} onSchedulePress={() => setScheduleVisible(true)} schedules={schedules} />
      <CollapsibleHomeSection action={<SectionActions actions={[{ icon: 'options-outline', label: activeTaskFilterCount(taskFilters) ? `Filter ${activeTaskFilterCount(taskFilters)}` : 'Filter', onPress: () => setFilterVisible(true) }, { icon: 'add', label: 'Add task', onPress: () => router.push(taskRoutes.addForCourse(courseId)) }]} />} expanded={tasksExpanded} onToggle={() => setTasksExpanded((value) => !value)} title="Tasks">
        <View style={styles.list}>{visibleTasks.length ? visibleTasks.map((task) => <CourseTaskRow isCompleting={completingIds.has(task.id)} key={task.id} onComplete={() => void handleComplete(task.id)} onPress={() => router.push(taskRoutes.details(task.id))} task={task} />) : <ThemedText style={[styles.empty, { color: colors.textSecondary }]}>{courseTasks.length ? 'No tasks match this filter.' : 'No tasks for this course yet.'}</ThemedText>}</View>
      </CollapsibleHomeSection>
      <CollapsibleHomeSection action={<SectionActions actions={[{ icon: 'add', label: 'Add event', onPress: () => router.push(calendarRoutes.addForCourse(courseId)) }]} />} expanded={eventsExpanded} onToggle={() => setEventsExpanded((value) => !value)} title="Events">
        {upcomingEvents.length ? <View style={styles.eventGrid}>{upcomingEvents.map((event) => <CourseEventCard event={event} key={event.id} onPress={() => router.push(calendarRoutes.details(event.id))} width={eventCardWidth} />)}</View> : <ThemedText style={[styles.empty, { color: colors.textSecondary }]}>No upcoming events.</ThemedText>}
      </CollapsibleHomeSection>
      <CourseToolShortcuts onCalendar={() => router.push(calendarRoutes.forCourse(courseId))} onMaterials={() => router.push(fileRoutes.forCourse(courseId))} onNotes={() => router.push(noteRoutes.forCourse(courseId))} />
      <ErrorBanner message={deleteError ?? loadError} />
      <AppButton label={isDeleting ? 'Deleting course...' : 'Delete course'} loading={isDeleting} onPress={() => showDestructiveConfirmation({ title: 'Delete course?', message: 'This removes the course permanently. Tasks, notes, and files are preserved as personal items by the backend.', onConfirm: () => void performDelete() })} variant="danger" />
    </ScrollView> : null}
    {courseId ? <CourseScheduleSheet onClose={() => setScheduleVisible(false)} onEdit={() => router.push(classScheduleRoutes.courseList(courseId))} schedules={schedules} visible={scheduleVisible} /> : null}
    <TaskFilterSheet onApply={(value) => setTaskFilters({ ...value, courseId })} onClose={() => setFilterVisible(false)} value={{ ...taskFilters, courseId }} visible={filterVisible} />
  </AppScreen>;
}

function SectionActions({ actions }: { actions: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] }) { const { colors } = useAppearance(); return <View style={styles.actions}>{actions.map((action) => <Pressable accessibilityLabel={action.label} accessibilityRole="button" key={action.label} onPress={action.onPress} style={({ pressed }) => [styles.action, pressed ? styles.pressed : undefined]}>{action.label.startsWith('Filter') ? <ThemedText style={[styles.actionLabel, { color: colors.primary }]}>{action.label}</ThemedText> : null}<Ionicons color={colors.primary} name={action.icon} size={18} /></Pressable>)}</View>; }
const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, padding: DesignTokens.layout.screenPadding, paddingBottom: 48 }, list: { gap: DesignTokens.spacing.xs }, eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm }, empty: { fontSize: 12, lineHeight: 17, paddingVertical: DesignTokens.spacing.xs }, actions: { alignItems: 'center', flexDirection: 'row', gap: 2 }, action: { alignItems: 'center', flexDirection: 'row', gap: 3, justifyContent: 'center', minHeight: 44, paddingHorizontal: 6 }, actionLabel: { fontSize: 11, fontWeight: '700' }, pressed: { opacity: 0.6 } });
