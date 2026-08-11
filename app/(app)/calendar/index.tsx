import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { CalendarAgenda } from '@/components/calendar/calendar-agenda';
import { CalendarDisplaySheet } from '@/components/calendar/calendar-display-sheet';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { MonthYearPickerSheet } from '@/components/calendar/month-year-picker-sheet';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { BottomActionSheet } from '@/components/ui/bottom-action-sheet';
import { ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCalendar } from '@/contexts/calendar-context';
import { useCourses } from '@/contexts/course-context';
import { useNotes } from '@/contexts/note-context';
import { useCalendarDisplayPreferences } from '@/hooks/use-calendar-display-preferences';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { addMonths, getMonthRange, monthTitle, parseLocalDate, toLocalDateKey } from '@/lib/calendar/calendar-date';
import { filterCalendarItems } from '@/lib/calendar/calendar-display';
import { itemsForDate, normalizeCalendarNotes } from '@/lib/calendar/calendar-items';
import { calendarRoutes } from '@/lib/calendar/routes';
import { classScheduleRoutes } from '@/lib/class-schedules/routes';
import { noteRoutes } from '@/lib/notes/routes';
import { taskRoutes } from '@/lib/tasks/routes';

export default function CalendarScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[]; date?: string | string[] }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const requestedDate = Array.isArray(params.date) ? params.date[0] : params.date;
  const initialDate = useMemo(() => requestedDate && parseLocalDate(requestedDate) ? requestedDate : toLocalDateKey(new Date()), [requestedDate]);
  const { width } = useWindowDimensions();
  const { colors } = useAppearance();
  const { items, listError, listStatus, loadRange } = useCalendar();
  const { courses } = useCourses();
  const { listError: noteListError, listStatus: noteListStatus, loadNotes, notes } = useNotes();
  const { preferences, setPreferences } = useCalendarDisplayPreferences();
  const [month, setMonth] = useState(() => parseLocalDate(initialDate) ?? new Date());
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [displayVisible, setDisplayVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const range = useMemo(() => getMonthRange(month), [month]);
  const combinedItems = useMemo(() => [...items, ...normalizeCalendarNotes(notes.filter((note) => note.relevantAt || note.reminderAt), courses).filter((item) => item.date >= range.firstDate && item.date <= range.lastDate)], [courses, items, notes, range.firstDate, range.lastDate]);
  const visibleItems = useMemo(() => filterCalendarItems(courseId ? combinedItems.filter((item) => item.courseId === courseId) : combinedItems, preferences), [combinedItems, courseId, preferences]);
  const selectedItems = useMemo(() => itemsForDate(visibleItems, selectedDate), [selectedDate, visibleItems]);
  const refresh = useCallback(async () => { await Promise.all([loadRange(range), loadNotes()]); }, [loadNotes, loadRange, range]);
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));
  useEffect(() => {
    const parsed = requestedDate ? parseLocalDate(requestedDate) : null;
    if (!requestedDate || !parsed) return;
    setMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    setSelectedDate(requestedDate);
  }, [requestedDate]);

  function selectMonth(next: Date) { setMonth(next); setSelectedDate((current) => validDateInMonth(current, next)); }
  function changeMonth(amount: number) { selectMonth(addMonths(month, amount)); }
  function selectDate(date: string) { const parsed = parseLocalDate(date); if (parsed && (parsed.getMonth() !== month.getMonth() || parsed.getFullYear() !== month.getFullYear())) setMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1)); setSelectedDate(date); }
  function goToday() { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(toLocalDateKey(today)); }
  function openItem(item: CalendarItem) { router.push(item.sourceType === 'event' ? calendarRoutes.details(item.sourceId) : item.sourceType === 'task' ? taskRoutes.details(item.sourceId) : item.sourceType === 'note' ? noteRoutes.details(item.sourceId) : classScheduleRoutes.details(item.sourceId)); }
  const loading = listStatus === 'idle' || listStatus === 'loading';

  return <AppScreen footer={<AppSectionTabs active="calendar" selectedDate={selectedDate} />}>
    <AppHeader compactTitle onBack={courseId ? () => router.back() : undefined} onRightAction={() => setOptionsVisible(true)} rightActionIcon="ellipsis-horizontal" rightActionLabel="Calendar options" title="Calendar" />
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: width < 360 ? DesignTokens.spacing.xl : DesignTokens.spacing.xxl }]} showsVerticalScrollIndicator={false}>
      <View style={styles.toolbar}>
        <View style={styles.monthControls}><ToolbarButton icon="chevron-back" label="Previous month" onPress={() => changeMonth(-1)} /><Pressable accessibilityLabel={`Choose month and year, currently ${monthTitle(month)}`} accessibilityRole="button" onPress={() => setMonthPickerVisible(true)} style={({ pressed }) => [styles.monthLabel, pressed ? styles.pressed : undefined]}><ThemedText numberOfLines={1} style={styles.monthText}>{monthTitle(month)}</ThemedText><Ionicons color={colors.textSecondary} name="chevron-down" size={13} /></Pressable><ToolbarButton icon="chevron-forward" label="Next month" onPress={() => changeMonth(1)} /></View>
      </View>
      <View style={[styles.calendarSurface, { backgroundColor: colors.surface, borderColor: colors.border }]}><MonthCalendar density={preferences.density} items={visibleItems} month={month} onMonthChange={selectMonth} onSelectDate={selectDate} selectedDate={selectedDate} /></View>
      {loading ? <LoadingSkeleton rows={1} /> : null}
      {listStatus === 'error' ? <ErrorState message={listError ?? 'Calendar items could not be loaded.'} onRetry={() => void refresh().catch(() => undefined)} /> : null}
      {listStatus === 'success' && noteListStatus === 'error' ? <View style={styles.banner}><ErrorBanner message={noteListError ?? 'Calendar notes could not be loaded.'} /></View> : null}
      {listStatus === 'success' ? <CalendarAgenda items={selectedItems} onOpenItem={openItem} selectedDate={selectedDate} /> : null}
    </ScrollView>
    <MonthYearPickerSheet month={month} onClose={() => setMonthPickerVisible(false)} onGo={selectMonth} visible={monthPickerVisible} />
    <CalendarDisplaySheet courses={courses} onChange={setPreferences} onClose={() => setDisplayVisible(false)} value={preferences} visible={displayVisible} />
    <BottomActionSheet actions={[{ icon: 'options-outline', label: 'Calendar Display', onPress: () => setDisplayVisible(true) }, { icon: 'calendar-outline', label: 'Jump to month', onPress: () => setMonthPickerVisible(true) }, { icon: 'today-outline', label: 'Today', onPress: goToday }]} compact onClose={() => setOptionsVisible(false)} title="Calendar options" visible={optionsVisible} />
  </AppScreen>;
}

function ToolbarButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) { const { colors } = useAppearance(); return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.toolbarButton, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name={icon} size={20} /></Pressable>; }
function validDateInMonth(current: string, target: Date): string { const parsed = parseLocalDate(current); const preferredDay = parsed?.getDate() ?? 1; const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate(); return toLocalDateKey(new Date(target.getFullYear(), target.getMonth(), Math.min(preferredDay, lastDay))); }
const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.sm, paddingBottom: 132 }, banner: { paddingHorizontal: DesignTokens.layout.screenPadding }, toolbar: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: DesignTokens.layout.screenPadding }, monthControls: { alignItems: 'center', flex: 1, flexDirection: 'row', minWidth: 0 }, toolbarButton: { alignItems: 'center', height: DesignTokens.size.touchTarget, justifyContent: 'center', width: DesignTokens.size.touchTarget }, monthLabel: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 4, justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, minWidth: 0 }, monthText: { fontSize: 18, fontWeight: '800', lineHeight: 23 }, calendarSurface: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, marginHorizontal: DesignTokens.layout.screenPadding, marginTop: DesignTokens.spacing.sm, overflow: 'hidden', paddingHorizontal: 4, paddingVertical: 4 }, pressed: { opacity: 0.62 } });
