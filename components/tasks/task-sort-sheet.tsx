import { BottomActionSheet, type SheetAction } from '@/components/ui/bottom-action-sheet';
import type { TaskSortOption } from '@/lib/tasks/task-filters';

const OPTIONS: readonly { label: string; value: TaskSortOption }[] = [
  { label: 'Due date', value: 'due' },
  { label: 'Priority', value: 'priority' },
  { label: 'Recently created', value: 'created' },
  { label: 'Course', value: 'course' },
  { label: 'Alphabetical', value: 'alphabetical' },
];

export function TaskSortSheet({ onChange, onClose, value, visible }: { onChange: (value: TaskSortOption) => void; onClose: () => void; value: TaskSortOption; visible: boolean }) {
  const actions: SheetAction[] = OPTIONS.map((option) => ({ icon: option.value === value ? 'checkmark-circle' : 'ellipse-outline', label: option.label, description: option.value === value ? 'Currently selected' : undefined, onPress: () => onChange(option.value) }));
  return <BottomActionSheet actions={actions} onClose={onClose} title="Sort tasks" visible={visible} />;
}
