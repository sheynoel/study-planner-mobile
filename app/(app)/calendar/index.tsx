import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { CalendarAgenda } from '@/components/calendar/calendar-agenda';
import { CalendarLegend } from '@/components/calendar/calendar-legend';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/async-state';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useCalendar } from '@/contexts/calendar-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { addMonths, getMonthRange, toLocalDateKey } from '@/lib/calendar/calendar-date';
import { itemsForDate } from '@/lib/calendar/calendar-items';
import { calendarRoutes } from '@/lib/calendar/routes';
import { taskRoutes } from '@/lib/tasks/routes';

export default function CalendarScreen() {
  const { logout } = useAuth();
  const { items, listError, listStatus, loadRange } = useCalendar();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const range = useMemo(() => getMonthRange(month), [month]);
  const selectedItems = useMemo(() => itemsForDate(items, selectedDate), [items, selectedDate]);

  const refresh = useCallback(async () => {
    await loadRange(range);
  }, [loadRange, range]);

  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));

  function changeMonth(amount: number) {
    const next = addMonths(month, amount);
    setMonth(next);
    setSelectedDate(toLocalDateKey(next));
  }

  function openItem(item: CalendarItem) {
    router.push(item.sourceType === 'event' ? calendarRoutes.details(item.sourceId) : taskRoutes.details(item.sourceId));
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setActionError(null);
    setIsLoggingOut(true);
    try { await logout(); }
    catch (error) { setActionError(getAuthErrorMessage(error)); }
    finally { setIsLoggingOut(false); }
  }

  const loading = listStatus === 'idle' || listStatus === 'loading';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader onRightAction={() => void handleLogout()} rightActionLabel={isLoggingOut ? 'Signing out...' : 'Sign out'} subtitle="Events and task deadlines together" title="Calendar" />
        <AppSectionTabs active="calendar" />
        <ErrorBanner message={actionError} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <MonthCalendar items={items} month={month} onNextMonth={() => changeMonth(1)} onPreviousMonth={() => changeMonth(-1)} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
          <CalendarLegend />
          {loading ? <LoadingState label="Loading this month..." /> : null}
          {listStatus === 'error' ? <ErrorState message={listError ?? 'Calendar items could not be loaded.'} onRetry={() => void refresh().catch(() => undefined)} /> : null}
          {listStatus === 'success' && items.length === 0 ? <EmptyState actionLabel="Add Event" description="Create an event or add a due date to a task." onAction={() => router.push(calendarRoutes.addForDate(selectedDate))} title="No calendar items this month" /> : null}
          {listStatus === 'success' && items.length > 0 ? <CalendarAgenda items={selectedItems} onOpenItem={openItem} selectedDate={selectedDate} /> : null}
        </ScrollView>
        {listStatus === 'success' && items.length > 0 ? <View style={styles.addButtonContainer}><Pressable accessibilityRole="button" onPress={() => router.push(calendarRoutes.addForDate(selectedDate))} style={({ pressed }) => [styles.addButton, pressed ? styles.pressed : undefined]}><ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">+ Add Event</ThemedText></Pressable></View> : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingTop: 4 },
  addButtonContainer: { bottom: 24, position: 'absolute', right: 20 },
  addButton: { backgroundColor: '#0a7ea4', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14 },
  pressed: { opacity: 0.8 },
});
