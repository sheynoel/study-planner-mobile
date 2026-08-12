import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_NOTIFICATION_PREFERENCES, type NotificationPreferences } from '@/lib/notifications/notification-preferences';
import { getStoredNotificationPreferences, saveNotificationPreferences } from '@/lib/notifications/notification-preferences-storage';

type NotificationPreferenceKey = Exclude<keyof NotificationPreferences, 'enabled'>;
type NotificationPreferencesContextValue = {
  preferences: NotificationPreferences;
  setEnabled: (enabled: boolean) => void;
  setReminder: (key: NotificationPreferenceKey, enabled: boolean) => void;
  deliverySupported: false;
};

const NotificationPreferencesContext = createContext<NotificationPreferencesContextValue | null>(null);

export function NotificationPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES);

  useEffect(() => { let active = true; void getStoredNotificationPreferences().then((stored) => { if (active) setPreferences(stored); }).catch(() => undefined); return () => { active = false; }; }, []);

  const setEnabled = useCallback((enabled: boolean) => { setPreferences((current) => { const next = { ...current, enabled }; void saveNotificationPreferences(next).catch(() => undefined); return next; }); }, []);
  const setReminder = useCallback((key: NotificationPreferenceKey, enabled: boolean) => { setPreferences((current) => { const next = { ...current, [key]: enabled }; void saveNotificationPreferences(next).catch(() => undefined); return next; }); }, []);

  const value = useMemo(() => ({ deliverySupported: false as const, preferences, setEnabled, setReminder }), [preferences, setEnabled, setReminder]);
  return <NotificationPreferencesContext.Provider value={value}>{children}</NotificationPreferencesContext.Provider>;
}

export function useNotificationPreferences(): NotificationPreferencesContextValue {
  const context = useContext(NotificationPreferencesContext);
  if (!context) throw new Error('useNotificationPreferences must be used inside NotificationPreferencesProvider.');
  return context;
}
