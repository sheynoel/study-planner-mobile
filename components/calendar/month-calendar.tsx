import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { getMonthDays, monthTitle } from '@/lib/calendar/calendar-date';
import { DesignTokens, PlannerColors } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthCalendar({
  items,
  month,
  onNextMonth,
  onPreviousMonth,
  onSelectDate,
  selectedDate,
}: {
  items: CalendarItem[];
  month: Date;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
}) {
  const { colors } = useAppearance();
  const markers = buildMarkers(items);
  const days = getMonthDays(month);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MonthButton label="Previous month" symbol="‹" onPress={onPreviousMonth} />
        <ThemedText type="subtitle">{monthTitle(month)}</ThemedText>
        <MonthButton label="Next month" symbol="›" onPress={onNextMonth} />
      </View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((weekday) => (
          <ThemedText key={weekday} style={[styles.weekday, { color: colors.textMuted }]}>
            {weekday}
          </ThemedText>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((day) => {
          const marker = markers.get(day.date);
          const selected = day.date === selectedDate;
          return (
            <Pressable
              accessibilityLabel={`${day.date}${marker ? ', has calendar items' : ''}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={day.date}
              onPress={() => onSelectDate(day.date)}
              style={({ pressed }) => [
                styles.day,
                selected ? { backgroundColor: colors.primary } : undefined,
                day.isToday && !selected ? { borderColor: colors.primary, borderWidth: 1 } : undefined,
                pressed ? styles.pressed : undefined,
              ]}>
              <ThemedText style={[styles.dayNumber, { color: selected ? colors.primaryText : day.isCurrentMonth ? colors.text : colors.textMuted }]}>
                {day.dayNumber}
              </ThemedText>
              <View style={styles.markers}>
                {marker?.event ? <View style={[styles.marker, { backgroundColor: PlannerColors.event }]} /> : null}
                {marker?.task ? <View style={[styles.marker, { backgroundColor: PlannerColors.task }]} /> : null}
                {marker?.classSchedule ? <View style={[styles.marker, { backgroundColor: PlannerColors.classSchedule }]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MonthButton({ label, onPress, symbol }: { label: string; onPress: () => void; symbol: string }) {
  const { colors } = useAppearance();
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.monthButton, pressed ? styles.pressed : undefined]}>
      <ThemedText type="title" style={{ color: colors.primary }}>{symbol}</ThemedText>
    </Pressable>
  );
}

function buildMarkers(items: CalendarItem[]): Map<string, { event: boolean; task: boolean; classSchedule: boolean }> {
  const markers = new Map<string, { event: boolean; task: boolean; classSchedule: boolean }>();
  for (const item of items) {
    const marker = markers.get(item.date) ?? { event: false, task: false, classSchedule: false };
    if (item.sourceType === 'class_schedule') marker.classSchedule = true;
    else marker[item.sourceType] = true;
    markers.set(item.date, marker);
  }
  return markers;
}

const styles = StyleSheet.create({
  container: { gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.cardPadding, paddingBottom: DesignTokens.spacing.sm },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  monthButton: { alignItems: 'center', minHeight: 44, minWidth: 44, justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { alignItems: 'center', borderRadius: 10, height: 46, justifyContent: 'center', paddingVertical: 3, width: '14.2857%' },
  dayNumber: { fontSize: 14, lineHeight: 19 },
  markers: { flexDirection: 'row', gap: 3, height: 5 },
  marker: { borderRadius: 999, height: 5, width: 5 },
  pressed: { opacity: 0.65 },
});
