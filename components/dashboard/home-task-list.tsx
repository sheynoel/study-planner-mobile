import { StyleSheet, View } from 'react-native';

import { AcademicTaskCard } from '@/components/tasks/academic-task-card';
import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import type { Task } from '@/lib/api/task.types';

export function HomeTaskList({ completingIds, courses, onCompleteTask, onOpenTask, tasks }: { completingIds: Set<string>; courses: Course[]; onCompleteTask: (task: Task) => void; onOpenTask: (task: Task) => void; tasks: Task[] }) {
  const { colors } = useAppearance();
  const courseById = new Map(courses.map((course) => [course.id, course]));
  if (!tasks.length) return <View style={[styles.empty, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}><ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>You&apos;re clear for now.</ThemedText></View>;
  return <View style={styles.list}>{tasks.map((task) => <AcademicTaskCard course={task.courseId ? courseById.get(task.courseId) : undefined} isCompleting={completingIds.has(task.id)} key={task.id} onComplete={() => onCompleteTask(task)} onPress={() => onOpenTask(task)} task={task} />)}</View>;
}

const styles = StyleSheet.create({
  list: { gap: DesignTokens.spacing.xs },
  empty: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, padding: DesignTokens.spacing.md },
  emptyText: { fontSize: 12, lineHeight: 17 },
});
