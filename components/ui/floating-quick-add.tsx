import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomActionSheet, type SheetAction } from '@/components/ui/bottom-action-sheet';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { calendarRoutes } from '@/lib/calendar/routes';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';
import { courseRoutes } from '@/lib/courses/routes';
import { fileRoutes } from '@/lib/files/routes';
import { taskRoutes } from '@/lib/tasks/routes';
import { noteRoutes } from '@/lib/notes/routes';

export function FloatingQuickAdd({ calendarDate, calendarOnly = false }: { calendarDate?: string; calendarOnly?: boolean }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [choosingCourse, setChoosingCourse] = useState(false);
  const { colors } = useAppearance();
  const { courses } = useCourses();
  const baseActions: SheetAction[] = [
    { icon: 'checkbox-outline', label: 'Task', description: calendarOnly ? undefined : 'Add personal or course work', onPress: () => router.push(calendarDate ? taskRoutes.addForDate(calendarDate) : taskRoutes.add) },
    { icon: 'calendar-outline', label: 'Event', description: calendarOnly ? undefined : 'Plan a date or study session', onPress: () => router.push(calendarDate ? calendarRoutes.addForDate(calendarDate) : calendarRoutes.add) },
    { icon: 'document-text-outline', label: 'Note', description: calendarOnly ? undefined : 'Remember something without making a task', onPress: () => router.push(calendarDate ? noteRoutes.addForDate(calendarDate) : noteRoutes.add) },
    { icon: 'folder-open-outline', label: 'Course', description: 'Create an academic workspace', onPress: () => router.push(courseRoutes.add) },
    { icon: 'cloud-upload-outline', label: 'Upload file', description: 'Add a study material', onPress: () => router.push(fileRoutes.upload) },
    { icon: 'time-outline', label: 'Class schedule', description: courses.length ? 'Choose a course first' : 'Create a course first', closeOnPress: courses.length === 0, onPress: () => courses.length ? setChoosingCourse(true) : router.push(courseRoutes.add) },
  ];
  const visibleActions = calendarOnly ? baseActions.slice(0, 3) : baseActions;
  const courseActions: SheetAction[] = courses.map((course) => ({ icon: 'book-outline', label: course.name, description: course.code ?? 'No course code', onPress: () => router.push(classScheduleRoutes.add(course.id)) }));
  return <><Pressable accessibilityLabel="Quick add" accessibilityRole="button" onPress={() => { setChoosingCourse(false); setVisible(true); }} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, bottom: 72 + insets.bottom }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primaryText} name="add" size={24} /></Pressable><BottomActionSheet actions={choosingCourse ? courseActions : visibleActions} compact={calendarOnly} onClose={() => setVisible(false)} title={choosingCourse ? 'Choose a course' : 'Quick add'} visible={visible} /></>;
}

const styles = StyleSheet.create({ button: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, height: 50, justifyContent: 'center', position: 'absolute', right: DesignTokens.layout.screenPadding, width: 50, zIndex: 30, ...Shadows }, pressed: { opacity: 0.82, transform: [{ scale: 0.96 }] } });
