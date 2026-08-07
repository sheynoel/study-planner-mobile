import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { taskWeekDays } from '@/lib/tasks/task-week';

export function WeeklyDateStrip({ anchor, onNextWeek, onPreviousWeek, onSelectDate, selectedDate }: { anchor: Date; onNextWeek: () => void; onPreviousWeek: () => void; onSelectDate: (date: string | null) => void; selectedDate: string | null }) {
  const { colors } = useAppearance();
  const days = taskWeekDays(anchor);
  return <View style={styles.container}>
    <View style={styles.controls}>
      <Pressable accessibilityLabel="Previous week" accessibilityRole="button" hitSlop={8} onPress={onPreviousWeek} style={styles.arrow}><Ionicons color={colors.textSecondary} name="chevron-back" size={DesignTokens.icon.md} /></Pressable>
      <ThemedText style={[styles.range, { color: colors.textSecondary }]}>{formatWeekRange(days[0].date, days[6].date)}</ThemedText>
      <Pressable accessibilityLabel="Next week" accessibilityRole="button" hitSlop={8} onPress={onNextWeek} style={styles.arrow}><Ionicons color={colors.textSecondary} name="chevron-forward" size={DesignTokens.icon.md} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: selectedDate === null }} onPress={() => onSelectDate(null)} style={styles.allDates}><ThemedText style={{ color: selectedDate === null ? colors.primary : colors.textSecondary, fontWeight: '600' }}>All dates</ThemedText></Pressable>
    </View>
    <View style={styles.days}>{days.map((day) => {
      const selected = day.date === selectedDate;
      return <Pressable accessibilityLabel={`${day.weekday} ${day.dayNumber}`} accessibilityRole="button" accessibilityState={{ selected }} key={day.date} onPress={() => onSelectDate(selected ? null : day.date)} style={({ pressed }) => [styles.day, selected ? { backgroundColor: colors.primary } : undefined, day.isToday && !selected ? { borderColor: colors.primary, borderWidth: 1 } : undefined, pressed ? styles.pressed : undefined]}>
        <ThemedText style={[styles.weekday, { color: selected ? colors.primaryText : colors.textSecondary }]}>{day.weekday}</ThemedText>
        <ThemedText type="defaultSemiBold" style={{ color: selected ? colors.primaryText : colors.textPrimary }}>{day.dayNumber}</ThemedText>
      </Pressable>;
    })}</View>
  </View>;
}

function formatWeekRange(first: string, last: string): string {
  const [firstYear, firstMonth, firstDay] = first.split('-').map(Number);
  const [lastYear, lastMonth, lastDay] = last.split('-').map(Number);
  const start = new Date(firstYear, firstMonth - 1, firstDay);
  const end = new Date(lastYear, lastMonth - 1, lastDay);
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

const styles = StyleSheet.create({ container: { gap: DesignTokens.spacing.xs, paddingHorizontal: DesignTokens.layout.screenPadding }, controls: { alignItems: 'center', flexDirection: 'row', minHeight: DesignTokens.size.touchTarget }, arrow: { alignItems: 'center', height: DesignTokens.size.touchTarget, justifyContent: 'center', width: 32 }, range: { fontSize: 12, flex: 1 }, allDates: { justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, paddingLeft: DesignTokens.spacing.sm }, days: { flexDirection: 'row', gap: DesignTokens.spacing.xs }, day: { alignItems: 'center', borderColor: 'transparent', borderRadius: DesignTokens.radius.md, flex: 1, gap: 1, justifyContent: 'center', minHeight: 48 }, weekday: { fontSize: 10.5, fontWeight: '600', textTransform: 'uppercase' }, pressed: { opacity: 0.72 } });
