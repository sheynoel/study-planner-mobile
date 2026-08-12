export type NotificationPreferences = {
  enabled: boolean;
  taskReminders: boolean;
  eventReminders: boolean;
  noteReminders: boolean;
  classReminders: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
  taskReminders: true,
  eventReminders: true,
  noteReminders: true,
  classReminders: true,
};

export function normalizeNotificationPreferences(value: unknown): NotificationPreferences {
  if (!value || typeof value !== 'object') return DEFAULT_NOTIFICATION_PREFERENCES;
  const candidate = value as Partial<NotificationPreferences>;
  return {
    enabled: booleanOr(candidate.enabled, DEFAULT_NOTIFICATION_PREFERENCES.enabled),
    taskReminders: booleanOr(candidate.taskReminders, DEFAULT_NOTIFICATION_PREFERENCES.taskReminders),
    eventReminders: booleanOr(candidate.eventReminders, DEFAULT_NOTIFICATION_PREFERENCES.eventReminders),
    noteReminders: booleanOr(candidate.noteReminders, DEFAULT_NOTIFICATION_PREFERENCES.noteReminders),
    classReminders: booleanOr(candidate.classReminders, DEFAULT_NOTIFICATION_PREFERENCES.classReminders),
  };
}

function booleanOr(value: unknown, fallback: boolean): boolean { return typeof value === 'boolean' ? value : fallback; }
