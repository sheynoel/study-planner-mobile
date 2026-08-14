import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { CourseEventCard } from '@/components/courses/course-event-card';
import { CourseHero } from '@/components/courses/course-hero';
import { CourseMaterialRow } from '@/components/courses/course-material-row';
import { CourseNoteCard } from '@/components/courses/course-note-card';
import { CourseScheduleSheet } from '@/components/courses/course-schedule-sheet';
import { AcademicTaskCard } from '@/components/tasks/academic-task-card';
import { TaskFilterSheet } from '@/components/tasks/task-filter-sheet';
import { ThemedText } from '@/components/themed-text';
import { FloatingActionMenu, type FloatingActionMenuAction } from '@/components/ui/floating-action-menu';
import { AppScreen } from '@/components/ui/app-screen';
import { ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCalendar } from '@/contexts/calendar-context';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { useCourses } from '@/contexts/course-context';
import { useFiles } from '@/contexts/file-context';
import { useNotes } from '@/contexts/note-context';
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
  const { getCachedCourse, loadCourse } = useCourses();
  const { files, loadFiles, openFile } = useFiles();
  const { loadNotes, notes } = useNotes();
  const { completeTask, loadTasks, tasks } = useTasks();
  const [course, setCourse] = useState<Course | null>(() => courseId ? getCachedCourse(courseId) ?? null : null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(!course);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [taskFilters, setTaskFilters] = useState<TaskFilterState>(() => ({ ...DEFAULT_TASK_FILTERS, courseId }));
  const [completingIds, setCompletingIds] = useState<Set<string>>(() => new Set());
  const courseTasks = useMemo(() => tasks.filter((task) => task.courseId === courseId), [courseId, tasks]);
  const visibleTasks = useMemo(() => sortTasks(filterTasksLocally(courseTasks, { ...taskFilters, courseId }, () => course?.name, new Date()), 'deadline_soonest'), [course?.name, courseId, courseTasks, taskFilters]);
  const courseNotes = useMemo(() => notes.filter((note) => note.courseId === courseId).sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || noteTime(a) - noteTime(b)), [courseId, notes]);
  const upcomingEvents = useMemo(() => events.filter((event) => event.courseId === courseId && Date.parse(event.endAt ?? event.startAt) >= Date.now()).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)), [courseId, events]);
  const recentFiles = useMemo(() => files.filter((file) => file.courseId === courseId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3), [courseId, files]);
  const cardWidth = Math.max(124, (width - DesignTokens.layout.screenPadding * 2 - DesignTokens.spacing.sm) / 2);

  const refresh = useCallback(async () => {
    if (!courseId) { setLoadError('This course link is invalid.'); setIsLoading(false); return; }
    setLoadError(null); setIsLoading(true);
    try { const [loaded, , loadedEvents] = await Promise.all([loadCourse(courseId), loadTasks({ courseId }), loadCourseEvents(courseId), loadCourseSchedules(courseId), loadNotes({ courseId }), loadFiles({ courseId })]); setCourse(loaded); setEvents(loadedEvents); }
    catch (error) { setLoadError(getApiErrorMessage(error)); }
    finally { setIsLoading(false); }
  }, [courseId, loadCourse, loadCourseEvents, loadCourseSchedules, loadFiles, loadNotes, loadTasks]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function handleComplete(id: string) { if (completingIds.has(id)) return; setCompletingIds((current) => new Set(current).add(id)); try { await completeTask(id); } catch (error) { setLoadError(getApiErrorMessage(error)); } finally { setCompletingIds((current) => { const next = new Set(current); next.delete(id); return next; }); } }

  return <AppScreen edges={['top', 'bottom']}>
    <AppHeader compactTitle onBack={() => router.back()} onRightAction={course && courseId ? () => router.push(courseRoutes.edit(courseId)) : undefined} rightActionLabel={course && courseId ? 'Edit' : undefined} title="Course" />
    {isLoading && !course ? <LoadingSkeleton rows={4} /> : null}
    {loadError && !course ? <ErrorState message={loadError} onRetry={() => void refresh()} /> : null}
    {course && courseId ? <ScrollView contentContainerStyle={styles.content}>
      <ErrorBanner message={loadError} />
      <CourseHero course={course} onSchedulePress={() => setScheduleVisible(true)} schedules={schedules} />
      <WorkspaceSection actions={<SectionAction icon="options-outline" label={activeTaskFilterCount(taskFilters) ? `Filter ${activeTaskFilterCount(taskFilters)}` : 'Filter'} onPress={() => setFilterVisible(true)} />} title="Tasks"><View style={styles.list}>{visibleTasks.length ? visibleTasks.map((task) => <AcademicTaskCard course={course} isCompleting={completingIds.has(task.id)} key={task.id} onComplete={() => void handleComplete(task.id)} onPress={() => router.push(taskRoutes.details(task.id))} task={task} />) : <ThemedText style={[styles.empty, { color: colors.textSecondary }]}>{courseTasks.length ? 'No active tasks match this filter.' : 'No active tasks yet.'}</ThemedText>}</View></WorkspaceSection>
      <WorkspaceSection title="Events & Notes">{upcomingEvents.length || courseNotes.length ? <View style={styles.cardGrid}>{courseNotes.filter((note) => note.isPinned).map((note) => <CourseNoteCard accent={course.color} key={note.id} note={note} onPress={() => router.push(noteRoutes.details(note.id))} width={cardWidth} />)}{upcomingEvents.map((event) => <CourseEventCard event={event} key={event.id} onPress={() => router.push(calendarRoutes.details(event.id))} width={cardWidth} />)}{courseNotes.filter((note) => !note.isPinned).map((note) => <CourseNoteCard accent={course.color} key={note.id} note={note} onPress={() => router.push(noteRoutes.details(note.id))} width={cardWidth} />)}</View> : <ThemedText style={[styles.empty, { color: colors.textSecondary }]}>No events or notes yet.</ThemedText>}</WorkspaceSection>
      <WorkspaceSection actions={<SectionAction icon="chevron-forward" label="Open materials" onPress={() => router.push(fileRoutes.forCourse(courseId))} />} title="Materials"><View style={styles.list}>{recentFiles.length ? recentFiles.map((file) => <CourseMaterialRow file={file} key={file.id} onPress={() => void openFile(file).catch((error) => setLoadError(getApiErrorMessage(error)))} />) : <ThemedText style={[styles.empty, { color: colors.textSecondary }]}>No materials yet.</ThemedText>}</View></WorkspaceSection>
    </ScrollView> : null}
    <CourseScheduleSheet onClose={() => setScheduleVisible(false)} onEdit={() => router.push(classScheduleRoutes.courseList(courseId!))} schedules={schedules} visible={scheduleVisible} />
    <TaskFilterSheet onApply={(value) => setTaskFilters({ ...value, courseId })} onClose={() => setFilterVisible(false)} value={{ ...taskFilters, courseId }} visible={filterVisible} />
    {courseId ? <FloatingActionMenu aboveBottomBar={false} actions={courseQuickAddActions(courseId)} /> : null}
  </AppScreen>;
}

function WorkspaceSection({ actions, children, title }: { actions?: React.ReactNode; children: React.ReactNode; title: string }) { return <View style={styles.section}><View style={styles.sectionHeader}><ThemedText style={styles.sectionTitle}>{title}</ThemedText>{actions}</View>{children}</View>; }
function SectionAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) { const { colors } = useAppearance(); return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, pressed ? styles.pressed : undefined]}>{label.startsWith('Filter') ? <ThemedText style={[styles.actionLabel, { color: colors.primary }]}>{label}</ThemedText> : null}<Ionicons color={colors.primary} name={icon} size={18} /></Pressable>; }
function courseQuickAddActions(courseId: string): FloatingActionMenuAction[] { return [
  { icon: 'checkbox-outline', label: 'Task', onPress: () => router.push(taskRoutes.addForCourse(courseId)) },
  { icon: 'calendar-outline', label: 'Event & Note', children: [
    { icon: 'calendar-outline', label: 'Event', onPress: () => router.push(calendarRoutes.addForCourse(courseId)) },
    { icon: 'document-text-outline', label: 'Note', onPress: () => router.push(noteRoutes.addForCourse(courseId)) },
  ] },
  { accessibilityLabel: 'Import course material', icon: 'document-attach-outline', label: 'Materials', onPress: () => router.push(fileRoutes.uploadFromCourseDetails(courseId)) },
]; }
function noteTime(note: { relevantAt: string | null; reminderAt: string | null; updatedAt: string }): number { return Date.parse(note.reminderAt ?? note.relevantAt ?? note.updatedAt); }
const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, padding: DesignTokens.layout.screenPadding, paddingBottom: 104 }, section: { gap: DesignTokens.spacing.sm }, sectionHeader: { alignItems: 'center', flexDirection: 'row', minHeight: 36 }, sectionTitle: { flex: 1, fontSize: 16, fontWeight: '800', lineHeight: 21 }, list: { gap: 6 }, cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm }, empty: { fontSize: 11, lineHeight: 16, paddingVertical: DesignTokens.spacing.xs }, action: { alignItems: 'center', flexDirection: 'row', gap: 3, justifyContent: 'center', minHeight: 44, paddingHorizontal: 6 }, actionLabel: { fontSize: 10, fontWeight: '700' }, pressed: { opacity: 0.64 } });
