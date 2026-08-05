import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { TaskPriority, TaskStatus } from '@/lib/api/task.types';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/lib/tasks/task-display';

export function TaskStatusChip({ status }: { status: TaskStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <View style={[styles.chip, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.label, { color: colors.text }]}>{TASK_STATUS_LABELS[status]}</ThemedText>
    </View>
  );
}

export function TaskPriorityChip({ priority }: { priority: TaskPriority }) {
  const colors = PRIORITY_COLORS[priority];
  return (
    <View style={[styles.chip, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.label, { color: colors.text }]}>
        {TASK_PRIORITY_LABELS[priority]}
      </ThemedText>
    </View>
  );
}

const STATUS_COLORS: Record<TaskStatus, { background: string; text: string }> = {
  TODO: { background: '#e2e8f0', text: '#334155' },
  IN_PROGRESS: { background: '#dbeafe', text: '#1d4ed8' },
  COMPLETED: { background: '#dcfce7', text: '#15803d' },
};

const PRIORITY_COLORS: Record<TaskPriority, { background: string; text: string }> = {
  LOW: { background: '#f1f5f9', text: '#475569' },
  MEDIUM: { background: '#fef3c7', text: '#a16207' },
  HIGH: { background: '#fee2e2', text: '#b91c1c' },
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
