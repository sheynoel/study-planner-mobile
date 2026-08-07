import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Task } from '@/lib/api/task.types';
import { getTaskDeadline } from '@/lib/tasks/task-deadline';

export function HomeTaskCard({ courseLabel, onPress, task }: { courseLabel: string; onPress: () => void; task: Task }) {
  const { colors } = useAppearance();
  const deadline = getTaskDeadline(task);
  const completed = task.status === 'COMPLETED';
  const deadlineColor = deadline.tone === 'danger' ? colors.overdue : deadline.tone === 'success' ? colors.completed : deadline.tone === 'primary' ? colors.primary : colors.textSecondary;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: completed ? 0.7 : 1 }, pressed ? styles.pressed : undefined]}>
    <View style={[styles.statusIcon, { borderColor: completed ? colors.completed : task.status === 'IN_PROGRESS' ? colors.primary : colors.outline, backgroundColor: completed ? colors.completedContainer : colors.surface }]}>
      <Ionicons color={completed ? colors.completed : task.status === 'IN_PROGRESS' ? colors.primary : colors.textSecondary} name={completed ? 'checkmark' : task.status === 'IN_PROGRESS' ? 'time-outline' : 'square-outline'} size={16} />
    </View>
    <View style={styles.content}>
      <View style={styles.titleRow}><ThemedText numberOfLines={1} style={[styles.title, completed ? styles.completedTitle : undefined]}>{task.title}</ThemedText><ThemedText style={[styles.priority, { color: priorityColor(task.priority, colors) }]}>{task.priority}</ThemedText></View>
      <View style={styles.metaRow}><ThemedText numberOfLines={1} style={[styles.course, { color: colors.textSecondary }]}>{courseLabel}</ThemedText><ThemedText numberOfLines={1} style={[styles.deadline, { color: deadlineColor }]}>{deadline.label}</ThemedText></View>
    </View>
  </Pressable>;
}

function priorityColor(priority: Task['priority'], colors: ReturnType<typeof useAppearance>['colors']): string {
  if (priority === 'HIGH') return colors.danger;
  if (priority === 'MEDIUM') return colors.warning;
  return colors.textSecondary;
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 62, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: DesignTokens.spacing.sm },
  statusIcon: { alignItems: 'center', borderRadius: DesignTokens.radius.sm, borderWidth: 1, height: 30, justifyContent: 'center', width: 30 },
  content: { flex: 1, gap: 3, minWidth: 0 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm },
  title: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  completedTitle: { textDecorationLine: 'line-through' },
  priority: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, lineHeight: 13 },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm },
  course: { flex: 1, fontSize: 11, lineHeight: 15 },
  deadline: { flexShrink: 1, fontSize: 11, fontWeight: '600', lineHeight: 15, textAlign: 'right' },
  pressed: { opacity: 0.68 },
});
