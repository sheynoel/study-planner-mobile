import { router } from 'expo-router';

import { FloatingActionMenu, type FloatingActionMenuAction } from '@/components/ui/floating-action-menu';
import { calendarRoutes } from '@/lib/calendar/routes';
import { noteRoutes } from '@/lib/notes/routes';
import { taskRoutes } from '@/lib/tasks/routes';

export function FloatingQuickAdd({ selectedDate }: { selectedDate?: string }) {
  const actions: FloatingActionMenuAction[] = [
    { icon: 'checkbox-outline', label: 'Task', onPress: () => router.push(selectedDate ? taskRoutes.addForDate(selectedDate) : taskRoutes.add) },
    { icon: 'calendar-outline', label: 'Event', onPress: () => router.push(selectedDate ? calendarRoutes.addForDate(selectedDate) : calendarRoutes.add) },
    { icon: 'document-text-outline', label: 'Note', onPress: () => router.push(selectedDate ? noteRoutes.addForDate(selectedDate) : noteRoutes.add) },
  ];
  return <FloatingActionMenu actions={actions} />;
}
