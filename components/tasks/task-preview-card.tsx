import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { TaskPriorityChip } from '@/components/tasks/task-chips';
import { TaskDeadlineLabel } from '@/components/tasks/task-deadline-label';
import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Task } from '@/lib/api/task.types';
import { isTaskOverdue } from '@/lib/tasks/task-display';

export function TaskPreviewCard({ courseName, isCompleting = false, onComplete, onPress, task }: { courseName?: string; isCompleting?: boolean; onComplete?: () => void; onPress: () => void; task: Task }) {
  const { colors } = useAppearance();
  const completed = task.status === 'COMPLETED';
  const overdue = isTaskOverdue(task);
  return <BentoCard style={[styles.card, completed ? styles.completed : undefined]}><View style={styles.row}>{onComplete && !completed ? <Pressable accessibilityLabel={`Complete ${task.title}`} accessibilityRole="checkbox" accessibilityState={{ checked: false, busy: isCompleting }} disabled={isCompleting} onPress={onComplete} style={[styles.checkbox, { borderColor: overdue ? colors.overdue : colors.primary }]}>{isCompleting ? <Ionicons color={colors.primary} name="ellipsis-horizontal" size={16} /> : null}</Pressable> : <View style={[styles.checkbox, { backgroundColor: completed ? colors.completed : colors.surface, borderColor: completed ? colors.completed : colors.outline }]}>{completed ? <Ionicons color={colors.primaryText} name="checkmark" size={16} /> : null}</View>}<Pressable accessibilityRole="button" onPress={onPress} style={styles.content}><View style={styles.titleRow}><ThemedText type="defaultSemiBold" numberOfLines={2} style={[styles.title, completed ? styles.completedTitle : undefined]}>{task.title}</ThemedText><TaskPriorityChip priority={task.priority} /></View><ThemedText numberOfLines={1} style={{ color: colors.textSecondary }}>{courseName ?? 'Personal task'}</ThemedText><TaskDeadlineLabel task={task} /></Pressable></View></BentoCard>;
}

const styles = StyleSheet.create({ card: { padding: DesignTokens.spacing.md }, row: { alignItems: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.md }, checkbox: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, borderWidth: 2, height: 26, justifyContent: 'center', marginTop: 2, width: 26 }, content: { flex: 1, gap: DesignTokens.spacing.xs, minHeight: DesignTokens.size.touchTarget }, titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.sm }, title: { flex: 1 }, completed: { opacity: 0.72 }, completedTitle: { textDecorationLine: 'line-through' } });
