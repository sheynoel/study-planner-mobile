import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, PlannerColors } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { getMonthDays, monthTitle } from '@/lib/calendar/calendar-date';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HomeMonthCalendar({ courseColors, items, month, onNextMonth, onPreviousMonth, onSelectDate, selectedDate }: { courseColors: Map<string, string>; items: CalendarItem[]; month: Date; onNextMonth: () => void; onPreviousMonth: () => void; onSelectDate: (date: string) => void; selectedDate: string }) {
  const { colors } = useAppearance();
  const itemsByDate = groupByDate(items);
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={styles.monthHeader}>
      <MonthControl direction="back" onPress={onPreviousMonth} />
      <ThemedText style={styles.monthTitle}>{monthTitle(month)}</ThemedText>
      <MonthControl direction="forward" onPress={onNextMonth} />
    </View>
    <View style={styles.weekRow}>{WEEKDAYS.map((day) => <ThemedText key={day} style={[styles.weekday, { color: colors.textSecondary }]}>{day}</ThemedText>)}</View>
    <View style={styles.grid}>{getMonthDays(month).map((day) => {
      const dayItems = itemsByDate.get(day.date) ?? [];
      const selected = selectedDate === day.date;
      return <Pressable accessibilityLabel={`${day.date}${dayItems.length ? `, ${dayItems.length} activities` : ''}`} accessibilityRole="button" accessibilityState={{ selected }} key={day.date} onPress={() => onSelectDate(day.date)} style={({ pressed }) => [styles.day, selected ? { backgroundColor: colors.primaryContainer } : undefined, day.isToday && !selected ? { borderColor: colors.primary, borderWidth: 1 } : undefined, pressed ? styles.pressed : undefined]}>
        <ThemedText style={[styles.dayNumber, { color: selected ? colors.primary : day.isCurrentMonth ? colors.text : colors.textMuted }]}>{day.dayNumber}</ThemedText>
        <CalendarActivityDots courseColors={courseColors} items={dayItems} />
      </Pressable>;
    })}</View>
  </View>;
}

export function CalendarActivityDots({ courseColors, items }: { courseColors: Map<string, string>; items: CalendarItem[] }) {
  return <View style={styles.dots}>{items.slice(0, 3).map((item) => <View key={item.id} style={[styles.dot, { backgroundColor: markerColor(item, courseColors) }]} />)}</View>;
}

function MonthControl({ direction, onPress }: { direction: 'back' | 'forward'; onPress: () => void }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityLabel={`${direction === 'back' ? 'Previous' : 'Next'} month`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.monthControl, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name={`chevron-${direction}`} size={19} /></Pressable>;
}

function groupByDate(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const result = new Map<string, CalendarItem[]>();
  for (const item of items) result.set(item.date, [...(result.get(item.date) ?? []), item]);
  return result;
}

function markerColor(item: CalendarItem, courseColors: Map<string, string>): string {
  if (item.color) return item.color;
  if (item.courseId && courseColors.has(item.courseId)) return courseColors.get(item.courseId)!;
  if (item.sourceType === 'event') return PlannerColors.event;
  if (item.sourceType === 'task') return PlannerColors.task;
  return PlannerColors.classSchedule;
}

const styles = StyleSheet.create({
  card: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingBottom: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.spacing.sm },
  monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 44 },
  monthTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  monthControl: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, fontSize: 10, fontWeight: '700', lineHeight: 14, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { alignItems: 'center', borderRadius: DesignTokens.radius.sm, height: 40, justifyContent: 'center', paddingTop: 2, width: '14.2857%' },
  dayNumber: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  dots: { flexDirection: 'row', gap: 2, height: 4, marginTop: 1 },
  dot: { borderRadius: DesignTokens.radius.pill, height: 4, width: 4 },
  pressed: { opacity: 0.58 },
});
