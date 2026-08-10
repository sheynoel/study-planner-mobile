import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { DEFAULT_CALENDAR_DISPLAY, sanitizeCalendarDisplay, type CalendarDisplayPreferences } from '@/lib/calendar/calendar-display';

const CALENDAR_DISPLAY_KEY = 'study-planner.calendar-display';

export async function getStoredCalendarDisplay(): Promise<CalendarDisplayPreferences> {
  const value = Platform.OS === 'web'
    ? (typeof localStorage === 'undefined' ? null : localStorage.getItem(CALENDAR_DISPLAY_KEY))
    : await SecureStore.getItemAsync(CALENDAR_DISPLAY_KEY);
  if (!value) return DEFAULT_CALENDAR_DISPLAY;
  try { return sanitizeCalendarDisplay(JSON.parse(value)); } catch { return DEFAULT_CALENDAR_DISPLAY; }
}

export async function saveCalendarDisplay(preferences: CalendarDisplayPreferences): Promise<void> {
  const value = JSON.stringify(preferences);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(CALENDAR_DISPLAY_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(CALENDAR_DISPLAY_KEY, value);
}
