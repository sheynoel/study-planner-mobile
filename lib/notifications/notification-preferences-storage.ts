import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { DEFAULT_NOTIFICATION_PREFERENCES, normalizeNotificationPreferences, type NotificationPreferences } from '@/lib/notifications/notification-preferences';

const NOTIFICATION_PREFERENCES_KEY = 'study-planner.notification-preferences';

export async function getStoredNotificationPreferences(): Promise<NotificationPreferences> {
  const value = Platform.OS === 'web'
    ? (typeof localStorage === 'undefined' ? null : localStorage.getItem(NOTIFICATION_PREFERENCES_KEY))
    : await SecureStore.getItemAsync(NOTIFICATION_PREFERENCES_KEY);
  if (!value) return DEFAULT_NOTIFICATION_PREFERENCES;
  try { return normalizeNotificationPreferences(JSON.parse(value)); } catch { return DEFAULT_NOTIFICATION_PREFERENCES; }
}

export async function saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
  const value = JSON.stringify(preferences);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(NOTIFICATION_PREFERENCES_KEY, value);
}
