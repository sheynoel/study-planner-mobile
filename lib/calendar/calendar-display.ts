import type { CalendarItem } from '@/lib/api/calendar-event.types';

export type CalendarDensity = 'compact' | 'detailed';
export type CalendarDisplayPreferences = {
  showClasses: boolean;
  showTasks: boolean;
  showEventsNotes: boolean;
  hiddenCourseIds: string[];
  density: CalendarDensity;
};

export const DEFAULT_CALENDAR_DISPLAY: CalendarDisplayPreferences = {
  showClasses: true,
  showTasks: true,
  showEventsNotes: true,
  hiddenCourseIds: [],
  density: 'compact',
};

export function sanitizeCalendarDisplay(value: unknown): CalendarDisplayPreferences {
  if (!value || typeof value !== 'object') return DEFAULT_CALENDAR_DISPLAY;
  const candidate = value as Partial<CalendarDisplayPreferences>;
  return {
    showClasses: typeof candidate.showClasses === 'boolean' ? candidate.showClasses : true,
    showTasks: typeof candidate.showTasks === 'boolean' ? candidate.showTasks : true,
    showEventsNotes: typeof candidate.showEventsNotes === 'boolean' ? candidate.showEventsNotes : true,
    hiddenCourseIds: Array.isArray(candidate.hiddenCourseIds) ? [...new Set(candidate.hiddenCourseIds.filter((id): id is string => typeof id === 'string' && id.length > 0))] : [],
    density: candidate.density === 'detailed' ? 'detailed' : 'compact',
  };
}

export function filterCalendarItems(items: CalendarItem[], preferences: CalendarDisplayPreferences): CalendarItem[] {
  const hidden = new Set(preferences.hiddenCourseIds);
  return items.filter((item) => {
    if (item.courseId && hidden.has(item.courseId)) return false;
    if (item.sourceType === 'class_schedule') return preferences.showClasses;
    if (item.sourceType === 'task') return preferences.showTasks;
    return preferences.showEventsNotes;
  });
}

export function toggleHiddenCourse(preferences: CalendarDisplayPreferences, courseId: string, visible: boolean): CalendarDisplayPreferences {
  const hidden = new Set(preferences.hiddenCourseIds);
  if (visible) hidden.delete(courseId); else hidden.add(courseId);
  return { ...preferences, hiddenCourseIds: [...hidden] };
}
