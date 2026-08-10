import { ThemedText } from '@/components/themed-text';
import { useAppearance } from '@/contexts/appearance-context';
import type { Task } from '@/lib/api/task.types';
import { getTaskDeadline } from '@/lib/tasks/task-deadline';

export function TaskDeadlineLabel({ compact = false, task }: { compact?: boolean; task: Pick<Task, 'completedAt' | 'dueAt' | 'status'> }) {
  const { colors } = useAppearance();
  const deadline = getTaskDeadline(task);
  const color = deadline.tone === 'danger' ? colors.overdue : deadline.tone === 'success' ? colors.completed : deadline.tone === 'primary' ? colors.primary : colors.textSecondary;
  return <ThemedText numberOfLines={1} style={{ color, fontSize: compact ? 10 : 12, fontWeight: deadline.tone === 'danger' ? '700' : '500', lineHeight: compact ? 13 : 16 }}>{deadline.label}</ThemedText>;
}
