import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { ClassScheduleCard } from '@/components/class-schedules/class-schedule-card';
import { CourseHero } from '@/components/courses/course-hero';
import { CourseMetricCard } from '@/components/courses/course-metric-card';
import { CourseWorkspaceTabs } from '@/components/courses/course-workspace-tabs';
import { FileLibrary } from '@/components/files/file-library';
import { FilePreviewCard } from '@/components/files/file-preview-card';
import { TaskPreviewCard } from '@/components/tasks/task-preview-card';
import { NoteCard } from '@/components/notes/note-card';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { BentoCard } from '@/components/ui/bento-card';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { ErrorState } from '@/components/ui/async-state';
import { HorizontalCarousel } from '@/components/ui/horizontal-carousel';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { SectionHeader } from '@/components/ui/section-header';
import { DesignTokens } from '@/constants/theme';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { useCourses } from '@/contexts/course-context';
import { useFiles } from '@/contexts/file-context';
import { useTasks } from '@/contexts/task-context';
import { useNotes } from '@/contexts/note-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { Course } from '@/lib/api/course.types';
import type { FileRecord } from '@/lib/api/file.types';
import type { Task } from '@/lib/api/task.types';
import { formatLocalDateTime } from '@/lib/calendar/calendar-date';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';
import { findNextClassOccurrence, formatScheduleSummary } from '@/lib/class-schedules/next-class';
import { courseRoutes, type CourseWorkspaceTab } from '@/lib/courses/routes';
import { fileRoutes } from '@/lib/files/routes';
import { formatTaskDate } from '@/lib/tasks/task-display';
import { taskRoutes } from '@/lib/tasks/routes';
import { noteRoutes } from '@/lib/notes/routes';

const WORKSPACE_TABS: readonly CourseWorkspaceTab[] = ['overview', 'tasks', 'materials', 'schedule', 'notes'];

export default function CourseDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; tab?: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const routeTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const { deleteCourse, getCachedCourse, loadCourse } = useCourses();
  const { loadCourseSchedules, schedules } = useClassSchedules();
  const { loadFiles } = useFiles();
  const { completeTask, loadTasks, tasks } = useTasks();
  const { loadNotes, notes } = useNotes();
  const [course, setCourse] = useState<Course | null>(() => courseId ? getCachedCourse(courseId) ?? null : null);
  const [courseFiles, setCourseFiles] = useState<FileRecord[]>([]);
  const [tab, setTab] = useState<CourseWorkspaceTab>(() => isWorkspaceTab(routeTab) ? routeTab : 'overview');
  const [isLoading, setIsLoading] = useState(!course);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(() => new Set());
  const courseTasks = useMemo(() => tasks.filter((task) => task.courseId === courseId), [courseId, tasks]);
  const courseNotes = useMemo(() => notes.filter((note) => note.courseId === courseId), [courseId, notes]);
  const pendingTasks = useMemo(() => courseTasks.filter((task) => task.status !== 'COMPLETED').sort((a, b) => dueTime(a) - dueTime(b)), [courseTasks]);
  const nextClass = useMemo(() => course ? findNextClassOccurrence(schedules, [course]) : null, [course, schedules]);
  const scheduleSummary = useMemo(() => formatScheduleSummary(schedules.length, nextClass), [nextClass, schedules.length]);

  useEffect(() => { if (isWorkspaceTab(routeTab)) setTab(routeTab); }, [routeTab]);

  const refresh = useCallback(async () => {
    if (!courseId) { setLoadError('This course link is invalid.'); setIsLoading(false); return; }
    setLoadError(null); setIsLoading(true);
    try {
      const [loaded, , loadedFiles] = await Promise.all([loadCourse(courseId), loadTasks({ courseId }), loadFiles({ courseId }), loadCourseSchedules(courseId), loadNotes({ courseId })]);
      setCourse(loaded);
      setCourseFiles(loadedFiles.filter((file) => file.courseId === courseId));
    } catch (error) { setLoadError(getApiErrorMessage(error)); }
    finally { setIsLoading(false); }
  }, [courseId, loadCourse, loadCourseSchedules, loadFiles, loadNotes, loadTasks]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function handleComplete(id: string) {
    if (completingIds.has(id)) return;
    setCompletingIds((current) => new Set(current).add(id));
    try { await completeTask(id); }
    catch (error) { setLoadError(getApiErrorMessage(error)); }
    finally { setCompletingIds((current) => { const next = new Set(current); next.delete(id); return next; }); }
  }

  async function performDelete() {
    if (!courseId || isDeleting) return;
    setDeleteError(null); setIsDeleting(true);
    try { await deleteCourse(courseId); router.replace(courseRoutes.list); }
    catch (error) { setDeleteError(getApiErrorMessage(error)); setIsDeleting(false); }
  }

  return <AppScreen edges={['top', 'bottom']}>
    <AppHeader onBack={() => router.back()} onRightAction={course && courseId ? () => router.push(courseRoutes.edit(courseId)) : undefined} rightActionLabel={course && courseId ? 'Edit' : undefined} title="Course" />
    {isLoading && !course ? <LoadingSkeleton rows={4} /> : null}
    {loadError && !course ? <ErrorState message={loadError} onRetry={() => void refresh()} /> : null}
    {course ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <CourseHero course={course} scheduleSummary={scheduleSummary} />
      <View style={styles.metrics}><CourseMetricCard icon="checkbox-outline" label="Tasks" value={pendingTasks.length} /><CourseMetricCard icon="documents-outline" label="Materials" value={courseFiles.length} /><CourseMetricCard icon="time-outline" label="Classes" value={schedules.length} /></View>
      <CourseWorkspaceTabs onChange={setTab} value={tab} />
      {tab === 'overview' ? <OverviewTab course={course} files={courseFiles} nextClass={nextClass} onSelectTab={setTab} pendingTasks={pendingTasks} schedules={schedules} /> : null}
      {tab === 'tasks' ? <View style={styles.section}><SectionHeader title="Course tasks" />{courseTasks.length ? courseTasks.map((task) => <TaskPreviewCard courseName={course.name} isCompleting={completingIds.has(task.id)} key={task.id} onComplete={() => void handleComplete(task.id)} onPress={() => router.push(taskRoutes.details(task.id))} task={task} />) : <BentoCard tone="subtle"><ThemedText>No tasks belong to this course yet.</ThemedText></BentoCard>}</View> : null}
      {tab === 'materials' ? <FileLibrary scope={{ kind: 'course', courseId: course.id, courseName: course.name }} /> : null}
      {tab === 'schedule' ? <View style={styles.section}><SectionHeader actionLabel="Add class" onAction={() => router.push(classScheduleRoutes.add(course.id))} title="Weekly schedule" />{schedules.length ? schedules.map((schedule) => <ClassScheduleCard course={course} key={schedule.id} onPress={() => router.push(classScheduleRoutes.details(schedule.id))} schedule={schedule} />) : <BentoCard tone="subtle"><ThemedText>No weekly class meetings have been added.</ThemedText></BentoCard>}</View> : null}
      {tab === 'notes' ? <View style={styles.section}><SectionHeader actionLabel="Add note" onAction={() => router.push(noteRoutes.addForCourse(course.id))} title="Course notes" />{courseNotes.length ? courseNotes.map((note) => <NoteCard key={note.id} note={note} onPress={() => router.push(noteRoutes.details(note.id))} />) : <BentoCard tone="subtle"><ThemedText>No notes belong to this course yet.</ThemedText></BentoCard>}</View> : null}
      <ErrorBanner message={deleteError ?? loadError} />
      <AppButton label={isDeleting ? 'Deleting course...' : 'Delete course'} loading={isDeleting} onPress={() => showDestructiveConfirmation({ title: 'Delete course?', message: 'This removes the course permanently. Tasks, notes, and files are preserved as personal items by the backend.', onConfirm: () => void performDelete() })} variant="danger" />
    </ScrollView> : null}
  </AppScreen>;
}

function OverviewTab({ course, files, nextClass, onSelectTab, pendingTasks, schedules }: { course: Course; files: ReturnType<typeof useFiles>['files']; nextClass: CalendarItem | null; onSelectTab: (tab: CourseWorkspaceTab) => void; pendingTasks: Task[]; schedules: ReturnType<typeof useClassSchedules>['schedules'] }) {
  return <View style={styles.overview}>
    <View style={styles.overviewSection}><SectionHeader title="Course information" /><BentoCard style={styles.infoCard}><ThemedText>{course.description ?? 'No course description added.'}</ThemedText><ThemedText style={DesignTokens.typography.supporting}>{course.instructor ?? 'Instructor not added'} · {course.room ?? 'Room not added'}</ThemedText></BentoCard></View>
    <View style={styles.overviewSection}><SectionHeader title="Up next" /><View style={styles.twoColumn}><BentoCard style={styles.flexCard} tone="accent"><ThemedText type="defaultSemiBold">Next class</ThemedText><ThemedText>{nextClass ? formatLocalDateTime(nextClass.startAt) : 'No class in the next two weeks'}</ThemedText>{nextClass?.location ? <ThemedText>{nextClass.location}</ThemedText> : null}</BentoCard><BentoCard style={styles.flexCard}><ThemedText type="defaultSemiBold">Nearest deadline</ThemedText><ThemedText>{pendingTasks[0]?.title ?? 'No pending deadline'}</ThemedText>{pendingTasks[0] ? <ThemedText>{formatTaskDate(pendingTasks[0].dueAt)}</ThemedText> : null}</BentoCard></View></View>
    <View style={styles.edgeSection}><View style={styles.edgeHeading}><SectionHeader actionLabel="Materials tab" onAction={() => onSelectTab('materials')} title="Recent materials" /></View>{files.length ? <HorizontalCarousel>{files.slice(0, 5).map((file) => <FilePreviewCard file={file} key={file.id} onPress={() => router.push(fileRoutes.details(file.id))} />)}</HorizontalCarousel> : <View style={styles.edgeHeading}><BentoCard tone="subtle"><ThemedText>No files have been added to this course.</ThemedText></BentoCard></View>}</View>
    <View style={styles.overviewSection}><SectionHeader actionLabel="Schedule tab" onAction={() => onSelectTab('schedule')} title="Schedule preview" />{schedules.slice(0, 2).map((schedule) => <ClassScheduleCard course={course} key={schedule.id} onPress={() => router.push(classScheduleRoutes.details(schedule.id))} schedule={schedule} />)}{schedules.length === 0 ? <BentoCard tone="subtle"><ThemedText>No weekly class meeting has been added.</ThemedText></BentoCard> : null}</View>
  </View>;
}

function dueTime(task: Task): number { return task.dueAt ? Date.parse(task.dueAt) : Number.MAX_SAFE_INTEGER; }
function isWorkspaceTab(value: string | undefined): value is CourseWorkspaceTab { return Boolean(value && WORKSPACE_TABS.includes(value as CourseWorkspaceTab)); }

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, padding: DesignTokens.layout.screenPadding, paddingBottom: 48 }, metrics: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, overview: { gap: DesignTokens.layout.sectionGap, marginHorizontal: -DesignTokens.layout.screenPadding }, section: { gap: DesignTokens.spacing.md }, overviewSection: { gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding }, infoCard: { gap: DesignTokens.spacing.xs, padding: DesignTokens.spacing.md }, twoColumn: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, flexCard: { flex: 1, gap: DesignTokens.spacing.xs, minHeight: 108, padding: DesignTokens.spacing.md }, edgeSection: { gap: DesignTokens.spacing.sm }, edgeHeading: { paddingHorizontal: DesignTokens.layout.screenPadding } });
