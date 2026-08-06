import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { CalendarAgenda } from '@/components/calendar/calendar-agenda';
import { CalendarLegend } from '@/components/calendar/calendar-legend';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { WeekStrip } from '@/components/calendar/week-strip';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { BentoCard } from '@/components/ui/bento-card';
import { EmptyState, ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCalendar } from '@/contexts/calendar-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { addMonths, getMonthRange, toLocalDateKey } from '@/lib/calendar/calendar-date';
import { itemsForDate } from '@/lib/calendar/calendar-items';
import { calendarRoutes } from '@/lib/calendar/routes';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';
import { taskRoutes } from '@/lib/tasks/routes';

export default function CalendarScreen() {
  const { colors } = useAppearance();
  const { items, listError, listStatus, loadRange } = useCalendar();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));
  const [monthExpanded, setMonthExpanded] = useState(true);
  const range = useMemo(() => getMonthRange(month), [month]);
  const selectedItems = useMemo(() => itemsForDate(items, selectedDate), [items, selectedDate]);
  const refresh = useCallback(async () => { await loadRange(range); }, [loadRange, range]);
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));

  function changeMonth(amount: number) { const next = addMonths(month, amount); setMonth(next); setSelectedDate(toLocalDateKey(next)); }
  function openItem(item: CalendarItem) { router.push(item.sourceType === 'event' ? calendarRoutes.details(item.sourceId) : item.sourceType === 'task' ? taskRoutes.details(item.sourceId) : classScheduleRoutes.details(item.sourceId)); }
  const loading = listStatus === 'idle' || listStatus === 'loading';

  return <AppScreen footer={<AppSectionTabs active="calendar" />}>
    <AppHeader onRightAction={() => router.push('/profile')} rightActionLabel="Profile" subtitle="Your month, week, and day in one planner." title="Calendar" />
    <ScrollView contentContainerStyle={styles.content}>
      <BentoCard style={styles.plannerCard}><Pressable accessibilityRole="button" onPress={() => setMonthExpanded((value) => !value)} style={styles.collapseRow}><View><ThemedText type="defaultSemiBold">Month planner</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{monthExpanded ? 'Tap to collapse' : 'Tap to expand'}</ThemedText></View><Ionicons color={colors.primary} name={monthExpanded ? 'chevron-up' : 'chevron-down'} size={DesignTokens.icon.lg} /></Pressable>{monthExpanded ? <MonthCalendar items={items} month={month} onNextMonth={() => changeMonth(1)} onPreviousMonth={() => changeMonth(-1)} onSelectDate={setSelectedDate} selectedDate={selectedDate} /> : null}<CalendarLegend /></BentoCard>
      <View style={styles.padded}><WeekStrip onSelect={setSelectedDate} selectedDate={selectedDate} /></View>
      {loading ? <LoadingSkeleton rows={2} /> : null}
      {listStatus === 'error' ? <ErrorState message={listError ?? 'Calendar items could not be loaded.'} onRetry={() => void refresh().catch(() => undefined)} /> : null}
      {listStatus === 'success' && items.length === 0 ? <EmptyState actionLabel="Add Event" description="Create an event or add a due date to a task." onAction={() => router.push(calendarRoutes.addForDate(selectedDate))} title="A fresh planner page" /> : null}
      {listStatus === 'success' && items.length > 0 ? <CalendarAgenda items={selectedItems} onOpenItem={openItem} selectedDate={selectedDate} /> : null}
    </ScrollView>
  </AppScreen>;
}

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, paddingBottom: 132 }, plannerCard: { gap: DesignTokens.spacing.sm, marginHorizontal: DesignTokens.layout.screenPadding, paddingHorizontal: 0, paddingBottom: DesignTokens.spacing.sm }, collapseRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.layout.cardPadding }, padded: { paddingHorizontal: DesignTokens.layout.screenPadding } });
