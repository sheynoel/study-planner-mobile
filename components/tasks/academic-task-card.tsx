import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { TaskPriorityChip, TaskStatusChip } from '@/components/tasks/task-chips';
import { TaskDeadlineLabel } from '@/components/tasks/task-deadline-label';
import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import type { Task } from '@/lib/api/task.types';

export function AcademicTaskCard({ course, onPress, task }: { course?: Course; onPress: () => void; task: Task }) {
  const { colors } = useAppearance();
  const accent = course?.color ?? colors.primary;
  const label = course?.name ?? 'Personal';
  const completed = task.status === 'COMPLETED';
  return <BentoCard onPress={onPress} style={[styles.card, { borderLeftColor: accent }, completed ? styles.completed : undefined]}>
    <View style={styles.topRow}>
      <View style={[styles.courseLabel, { backgroundColor: translucent(accent, colors.surfaceVariant) }]}><View style={[styles.dot, { backgroundColor: accent }]} /><ThemedText numberOfLines={1} style={[styles.courseText, { color: colors.textPrimary }]}>{label}</ThemedText></View>
      <TaskStatusChip compact status={task.status} />
    </View>
    <ThemedText numberOfLines={2} style={[styles.title, completed ? styles.completedTitle : undefined]}>{task.title}</ThemedText>
    <View style={styles.bottomRow}>{task.dueAt || completed ? <TaskDeadlineLabel task={task} /> : <View />}<View style={styles.trailing}><TaskPriorityChip compact priority={task.priority} /><Ionicons color={colors.textSecondary} name="chevron-forward" size={DesignTokens.icon.sm} /></View></View>
  </BentoCard>;
}

function translucent(color: string, fallback: string): string { return /^#[0-9a-fA-F]{6}$/.test(color) ? `${color}1F` : fallback; }

const styles = StyleSheet.create({ card: { borderLeftWidth: 4, borderRadius: DesignTokens.radius.lg, gap: 6, paddingHorizontal: DesignTokens.spacing.lg, paddingVertical: DesignTokens.spacing.md }, topRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm, justifyContent: 'space-between' }, courseLabel: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, flexDirection: 'row', gap: 5, maxWidth: '58%', paddingHorizontal: DesignTokens.spacing.sm, paddingVertical: 2 }, dot: { borderRadius: DesignTokens.radius.pill, height: 6, width: 6 }, courseText: { fontSize: 11, fontWeight: '700', lineHeight: 15 }, title: { fontSize: 15, fontWeight: '600', lineHeight: 19 }, bottomRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm, justifyContent: 'space-between', minHeight: 20 }, trailing: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.xs }, completed: { opacity: 0.76 }, completedTitle: { textDecorationLine: 'line-through' } });
