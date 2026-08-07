import { ThemedText } from '@/components/themed-text';
import { useAppearance } from '@/contexts/appearance-context';
import type { Task } from '@/lib/api/task.types';
import { getTaskDeadline } from '@/lib/tasks/task-deadline';

export function TaskDeadlineLabel({ task }: { task: Pick<Task, 'completedAt' | 'dueAt' | 'status'> }) {
  const { colors } = useAppearance();
  const deadline = getTaskDeadline(task);
  const color = deadline.tone === 'danger' ? colors.overdue : deadline.tone === 'success' ? colors.completed : deadline.tone === 'primary' ? colors.primary : colors.textSecondary;
  return <ThemedText style={{ color, fontSize: 12, fontWeight: deadline.tone === 'danger' ? '700' : '500', lineHeight: 16 }}>{deadline.label}</ThemedText>;
}
