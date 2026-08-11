import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, PlannerColors } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { toLocalDateKey } from '@/lib/calendar/calendar-date';

export function HomeWeekStrip({ courseColors, items, onOpenDate, today = new Date() }: { courseColors: Map<string, string>; items: CalendarItem[]; onOpenDate: (date: string) => void; today?: Date }) {
  const { colors } = useAppearance();
  const todayKey = toLocalDateKey(today);
  const days = Array.from({ length: 7 }, (_, index) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + index - 3));
  const itemsByDate = new Map<string, CalendarItem[]>();
  for (const item of items) itemsByDate.set(item.date, [...(itemsByDate.get(item.date) ?? []), item]);
  return <View style={[styles.strip, { backgroundColor: colors.surface, borderColor: colors.border }]}>{days.map((day) => {
    const key = toLocalDateKey(day);
    const isToday = key === todayKey;
    const dayItems = itemsByDate.get(key) ?? [];
    const label = day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    return <Pressable accessibilityLabel={`${label}${isToday ? ', today' : ''}${dayItems.length ? `, ${dayItems.length} activities` : ''}`} accessibilityRole="button" accessibilityState={{ selected: isToday }} key={key} onPress={() => onOpenDate(key)} style={({ pressed }) => [styles.day, isToday ? { backgroundColor: colors.primary } : undefined, pressed ? styles.pressed : undefined]}>
      <ThemedText style={[styles.weekday, { color: isToday ? colors.primaryText : colors.textSecondary }]}>{day.toLocaleDateString(undefined, { weekday: 'short' })}</ThemedText>
      <ThemedText style={[styles.date, { color: isToday ? colors.primaryText : colors.text }]}>{day.getDate()}</ThemedText>
      <View style={styles.dots}>{dayItems.slice(0, 3).map((item) => <View key={item.id} style={[styles.dot, { backgroundColor: activityColor(item, courseColors) }]} />)}</View>
    </Pressable>;
  })}</View>;
}

function activityColor(item: CalendarItem, courseColors: Map<string, string>): string {
  if (item.courseId && courseColors.has(item.courseId)) return courseColors.get(item.courseId)!;
  if (item.color) return item.color;
  if (item.sourceType === 'event') return PlannerColors.event;
  if (item.sourceType === 'task') return PlannerColors.task;
  return PlannerColors.classSchedule;
}

const styles = StyleSheet.create({
  strip: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', padding: 4 },
  day: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, minHeight: 58, justifyContent: 'center', minWidth: 0, paddingVertical: 5 },
  weekday: { fontSize: 9, fontWeight: '700', lineHeight: 12 },
  date: { fontSize: 12, fontWeight: '700', lineHeight: 17 },
  dots: { flexDirection: 'row', gap: 2, height: 4, marginTop: 1 },
  dot: { borderRadius: DesignTokens.radius.pill, height: 4, width: 4 },
  pressed: { opacity: 0.58 },
});
