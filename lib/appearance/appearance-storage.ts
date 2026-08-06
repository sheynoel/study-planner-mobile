import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AppearanceMode, ThemePackId } from '@/constants/theme';

const APPEARANCE_KEY = 'study-planner.appearance';

export type AppearancePreferences = { mode: AppearanceMode; themePack: ThemePackId };

export async function getStoredAppearance(): Promise<AppearancePreferences | null> {
  const value = Platform.OS === 'web'
    ? (typeof localStorage === 'undefined' ? null : localStorage.getItem(APPEARANCE_KEY))
    : await SecureStore.getItemAsync(APPEARANCE_KEY);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<AppearancePreferences>;
    if (!isAppearanceMode(parsed.mode) || !isThemePack(parsed.themePack)) return null;
    return { mode: parsed.mode, themePack: parsed.themePack };
  } catch {
    return null;
  }
}

export async function saveAppearance(preferences: AppearancePreferences): Promise<void> {
  const value = JSON.stringify(preferences);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(APPEARANCE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(APPEARANCE_KEY, value);
}

function isAppearanceMode(value: unknown): value is AppearanceMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isThemePack(value: unknown): value is ThemePackId {
  return value === 'sage' || value === 'latte' || value === 'sky' || value === 'lavender' || value === 'academia';
}
