import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { TaskDeadlineLabel } from '@/components/tasks/task-deadline-label';
import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Task } from '@/lib/api/task.types';

export function CourseTaskRow({ isCompleting, onComplete, onPress, task }: { isCompleting: boolean; onComplete: () => void; onPress: () => void; task: Task }) {
  const { colors } = useAppearance();
  const completed = task.status === 'COMPLETED';
  const statusColor = completed ? colors.completed : task.status === 'IN_PROGRESS' ? colors.primary : colors.outline;
  const priorityColor = task.priority === 'HIGH' ? colors.danger : task.priority === 'MEDIUM' ? colors.warning : colors.textMuted;
  return <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }, completed ? styles.completed : undefined]}><Pressable accessibilityLabel={completed ? `${task.title} completed` : `Complete ${task.title}`} accessibilityRole="checkbox" accessibilityState={{ checked: completed, busy: isCompleting }} disabled={completed || isCompleting} onPress={onComplete} style={[styles.status, { backgroundColor: completed ? statusColor : colors.surface, borderColor: statusColor }]}>{completed ? <Ionicons color={colors.primaryText} name="checkmark" size={14} /> : isCompleting ? <Ionicons color={colors.primary} name="ellipsis-horizontal" size={14} /> : null}</Pressable><Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}><ThemedText numberOfLines={1} style={[styles.title, completed ? styles.completedTitle : undefined]}>{task.title}</ThemedText><TaskDeadlineLabel task={task} /></Pressable><View accessibilityLabel={`${task.priority} priority`} style={[styles.priority, { backgroundColor: priorityColor }]} /></View>;
}

const styles = StyleSheet.create({ row: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 58, paddingHorizontal: DesignTokens.spacing.sm, paddingVertical: 7 }, status: { alignItems: 'center', borderRadius: 10, borderWidth: 2, height: 22, justifyContent: 'center', width: 22 }, content: { flex: 1, justifyContent: 'center', minHeight: 42, minWidth: 0 }, title: { fontSize: 13, fontWeight: '700', lineHeight: 18 }, priority: { borderRadius: 2, height: 20, width: 3 }, completed: { opacity: 0.68 }, completedTitle: { textDecorationLine: 'line-through' }, pressed: { opacity: 0.65 } });
