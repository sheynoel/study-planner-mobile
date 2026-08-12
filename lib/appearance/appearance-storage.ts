import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { isHexColor, type AppearanceMode, type ThemePackId } from '@/constants/theme';

const APPEARANCE_KEY = 'study-planner.appearance';

export type AppearancePreferences = { accentColor: string | null; mode: AppearanceMode; themePack: ThemePackId };

export async function getStoredAppearance(): Promise<AppearancePreferences | null> {
  const value = Platform.OS === 'web'
    ? (typeof localStorage === 'undefined' ? null : localStorage.getItem(APPEARANCE_KEY))
    : await SecureStore.getItemAsync(APPEARANCE_KEY);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<AppearancePreferences>;
    const themePack = normalizeThemePack(parsed.themePack);
    if (!isAppearanceMode(parsed.mode) || !themePack) return null;
    const accentColor = typeof parsed.accentColor === 'string' && isHexColor(parsed.accentColor) ? parsed.accentColor.toUpperCase() : null;
    return { accentColor, mode: parsed.mode, themePack };
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

function normalizeThemePack(value: unknown): ThemePackId | null {
  if (value === 'sage') return 'default';
  if (value === 'latte') return 'peach';
  if (value === 'academia') return 'mono';
  return value === 'default' || value === 'lavender' || value === 'rose' || value === 'ocean' || value === 'forest' || value === 'sunset' || value === 'peach' || value === 'mint' || value === 'sky' || value === 'mono' ? value : null;
}
