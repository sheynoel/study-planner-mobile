import { StyleSheet, View } from 'react-native';

import { HomeTaskCard } from '@/components/dashboard/home-task-card';
import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import type { Task } from '@/lib/api/task.types';

export function HomeTaskList({ courses, onOpenTask, tasks }: { courses: Course[]; onOpenTask: (task: Task) => void; tasks: Task[] }) {
  const { colors } = useAppearance();
  const courseLabels = new Map(courses.map((course) => [course.id, course.code || course.name]));
  if (!tasks.length) return <View style={[styles.empty, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}><ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>You&apos;re clear for now.</ThemedText></View>;
  return <View style={styles.list}>{tasks.map((task) => <HomeTaskCard courseLabel={task.courseId ? courseLabels.get(task.courseId) ?? 'Course unavailable' : 'Personal'} key={task.id} onPress={() => onOpenTask(task)} task={task} />)}</View>;
}

const styles = StyleSheet.create({
  list: { gap: DesignTokens.spacing.xs },
  empty: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, padding: DesignTokens.spacing.md },
  emptyText: { fontSize: 12, lineHeight: 17 },
});
