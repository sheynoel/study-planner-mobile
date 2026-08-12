import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getThemeColors, ThemePacks, type AppearanceMode, type ResolvedAppearanceMode, type ThemeColors, type ThemePack, type ThemePackId } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getStoredAppearance, saveAppearance } from '@/lib/appearance/appearance-storage';

type AppearanceContextValue = {
  colors: ThemeColors;
  accentColor: string | null;
  mode: AppearanceMode;
  resolvedMode: ResolvedAppearanceMode;
  setMode: (mode: AppearanceMode) => void;
  setAccentColor: (color: string | null) => void;
  setThemePack: (themePack: ThemePackId) => void;
  themePack: ThemePack;
  themePackId: ThemePackId;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const [mode, setModeState] = useState<AppearanceMode>('system');
  const [themePackId, setThemePackState] = useState<ThemePackId>('default');
  const [accentColor, setAccentColorState] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    void getStoredAppearance().then((stored) => {
      if (!current || !stored) return;
      setModeState(stored.mode);
      setThemePackState(stored.themePack);
      setAccentColorState(stored.accentColor);
    }).catch(() => undefined);
    return () => { current = false; };
  }, []);

  const persist = useCallback((nextMode: AppearanceMode, nextPack: ThemePackId, nextAccent: string | null) => {
    void saveAppearance({ accentColor: nextAccent, mode: nextMode, themePack: nextPack }).catch(() => undefined);
  }, []);

  const setMode = useCallback((nextMode: AppearanceMode) => {
    setModeState(nextMode);
    persist(nextMode, themePackId, accentColor);
  }, [accentColor, persist, themePackId]);

  const setThemePack = useCallback((nextPack: ThemePackId) => {
    setThemePackState(nextPack);
    persist(mode, nextPack, accentColor);
  }, [accentColor, mode, persist]);

  const setAccentColor = useCallback((nextAccent: string | null) => {
    setAccentColorState(nextAccent);
    persist(mode, themePackId, nextAccent);
  }, [mode, persist, themePackId]);

  const resolvedMode: ResolvedAppearanceMode = mode === 'system' ? systemMode ?? 'light' : mode;
  const value = useMemo<AppearanceContextValue>(() => ({
    accentColor,
    colors: getThemeColors(themePackId, resolvedMode, accentColor),
    mode,
    resolvedMode,
    setMode,
    setAccentColor,
    setThemePack,
    themePack: ThemePacks[themePackId],
    themePackId,
  }), [accentColor, mode, resolvedMode, setAccentColor, setMode, setThemePack, themePackId]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('useAppearance must be used inside AppearanceProvider.');
  return context;
}
