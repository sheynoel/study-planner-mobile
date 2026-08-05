import type { TaskFilters, TaskPriority } from '@/lib/api/task.types';

export type TaskFilterPreset = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export type TaskFilterState = {
  preset: TaskFilterPreset;
  courseId?: string;
  priority?: TaskPriority;
};

export const DEFAULT_TASK_FILTERS: TaskFilterState = { preset: 'all' };

export function toTaskApiFilters(state: TaskFilterState): TaskFilters {
  return {
    courseId: state.courseId,
    priority: state.priority,
    status: state.preset === 'completed' ? 'COMPLETED' : undefined,
    due:
      state.preset === 'today' || state.preset === 'upcoming' || state.preset === 'overdue'
        ? state.preset
        : undefined,
  };
}

export function hasActiveTaskFilters(state: TaskFilterState): boolean {
  return state.preset !== 'all' || Boolean(state.courseId || state.priority);
}
