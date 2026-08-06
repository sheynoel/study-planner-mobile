import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { TaskPriority, TaskStatus } from '@/lib/api/task.types';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/lib/tasks/task-display';

export function TaskStatusChip({ status }: { status: TaskStatus }) {
  const { colors: palette } = useAppearance();
  const colors = status === 'COMPLETED'
    ? { background: palette.completedContainer, text: palette.completed }
    : status === 'IN_PROGRESS'
      ? { background: palette.primaryContainer, text: palette.primary }
      : { background: palette.surfaceVariant, text: palette.textSecondary };
  return (
    <View accessibilityLabel={`Status: ${TASK_STATUS_LABELS[status]}`} style={[styles.chip, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.label, { color: colors.text }]}>{STATUS_ICONS[status]} {TASK_STATUS_LABELS[status]}</ThemedText>
    </View>
  );
}

export function TaskPriorityChip({ priority }: { priority: TaskPriority }) {
  const { colors: palette } = useAppearance();
  const colors = priority === 'HIGH'
    ? { background: palette.dangerSurface, text: palette.dangerText }
    : priority === 'MEDIUM'
      ? { background: palette.warningSurface, text: palette.warning }
      : { background: palette.surfaceVariant, text: palette.textSecondary };
  return (
    <View accessibilityLabel={`Priority: ${TASK_PRIORITY_LABELS[priority]}`} style={[styles.chip, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.label, { color: colors.text }]}>{PRIORITY_ICONS[priority]} {TASK_PRIORITY_LABELS[priority]}</ThemedText>
    </View>
  );
}

export const StatusChip = TaskStatusChip;
export const PriorityChip = TaskPriorityChip;

const STATUS_ICONS: Record<TaskStatus, string> = { TODO: '\u25cb', IN_PROGRESS: '\u25d0', COMPLETED: '\u2713' };
const PRIORITY_ICONS: Record<TaskPriority, string> = { LOW: '\u2193', MEDIUM: '\u2013', HIGH: '\u2191' };

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', borderRadius: DesignTokens.radius.pill, paddingHorizontal: DesignTokens.spacing.sm, paddingVertical: DesignTokens.spacing.xs },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
