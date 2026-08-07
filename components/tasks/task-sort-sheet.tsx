import { BottomActionSheet, type SheetAction } from '@/components/ui/bottom-action-sheet';
import type { TaskSortOption } from '@/lib/tasks/task-filters';

const OPTIONS: readonly { label: string; value: TaskSortOption }[] = [
  { label: 'Deadline soonest', value: 'deadline_soonest' },
  { label: 'Deadline latest', value: 'deadline_latest' },
  { label: 'Priority', value: 'priority' },
  { label: 'Recently added', value: 'created' },
  { label: 'Alphabetical', value: 'alphabetical' },
];

export function TaskSortSheet({ onChange, onClose, value, visible }: { onChange: (value: TaskSortOption) => void; onClose: () => void; value: TaskSortOption; visible: boolean }) {
  const actions: SheetAction[] = OPTIONS.map((option) => ({ icon: option.value === value ? 'checkmark-circle' : 'ellipse-outline', label: option.label, onPress: () => onChange(option.value) }));
  return <BottomActionSheet actions={actions} compact onClose={onClose} title="Sort tasks" visible={visible} />;
}
