import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_CALENDAR_DISPLAY, type CalendarDisplayPreferences } from '@/lib/calendar/calendar-display';
import { getStoredCalendarDisplay, saveCalendarDisplay } from '@/lib/calendar/calendar-display-storage';

export function useCalendarDisplayPreferences() {
  const [preferences, setPreferencesState] = useState(DEFAULT_CALENDAR_DISPLAY);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { let active = true; void getStoredCalendarDisplay().then((value) => { if (active) setPreferencesState(value); }).finally(() => { if (active) setLoaded(true); }); return () => { active = false; }; }, []);
  const setPreferences = useCallback((value: CalendarDisplayPreferences | ((current: CalendarDisplayPreferences) => CalendarDisplayPreferences)) => {
    setPreferencesState((current) => {
      const next = typeof value === 'function' ? value(current) : value;
      void saveCalendarDisplay(next).catch(() => undefined);
      return next;
    });
  }, []);
  return { loaded, preferences, setPreferences };
}
