import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getThemeColors, ThemePacks, type AppearanceMode, type ResolvedAppearanceMode, type ThemeColors, type ThemePack, type ThemePackId } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getStoredAppearance, saveAppearance } from '@/lib/appearance/appearance-storage';

type AppearanceContextValue = {
  colors: ThemeColors;
  mode: AppearanceMode;
  resolvedMode: ResolvedAppearanceMode;
  setMode: (mode: AppearanceMode) => void;
  setThemePack: (themePack: ThemePackId) => void;
  themePack: ThemePack;
  themePackId: ThemePackId;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const [mode, setModeState] = useState<AppearanceMode>('system');
  const [themePackId, setThemePackState] = useState<ThemePackId>('sage');

  useEffect(() => {
    let current = true;
    void getStoredAppearance().then((stored) => {
      if (!current || !stored) return;
      setModeState(stored.mode);
      setThemePackState(stored.themePack);
    }).catch(() => undefined);
    return () => { current = false; };
  }, []);

  const persist = useCallback((nextMode: AppearanceMode, nextPack: ThemePackId) => {
    void saveAppearance({ mode: nextMode, themePack: nextPack }).catch(() => undefined);
  }, []);

  const setMode = useCallback((nextMode: AppearanceMode) => {
    setModeState(nextMode);
    persist(nextMode, themePackId);
  }, [persist, themePackId]);

  const setThemePack = useCallback((nextPack: ThemePackId) => {
    setThemePackState(nextPack);
    persist(mode, nextPack);
  }, [mode, persist]);

  const resolvedMode: ResolvedAppearanceMode = mode === 'system' ? systemMode ?? 'light' : mode;
  const value = useMemo<AppearanceContextValue>(() => ({
    colors: getThemeColors(themePackId, resolvedMode),
    mode,
    resolvedMode,
    setMode,
    setThemePack,
    themePack: ThemePacks[themePackId],
    themePackId,
  }), [mode, resolvedMode, setMode, setThemePack, themePackId]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('useAppearance must be used inside AppearanceProvider.');
  return context;
}
