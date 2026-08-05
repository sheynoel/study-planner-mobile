import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { getMonthDays, monthTitle } from '@/lib/calendar/calendar-date';

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
          <ThemedText key={weekday} style={styles.weekday} lightColor="#64748b" darkColor="#94a3b8">
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
                selected ? styles.selectedDay : undefined,
                day.isToday && !selected ? styles.today : undefined,
                pressed ? styles.pressed : undefined,
              ]}>
              <ThemedText
                style={styles.dayNumber}
                lightColor={selected ? '#ffffff' : day.isCurrentMonth ? '#0f172a' : '#94a3b8'}
                darkColor={selected ? '#ffffff' : day.isCurrentMonth ? '#f8fafc' : '#64748b'}>
                {day.dayNumber}
              </ThemedText>
              <View style={styles.markers}>
                {marker?.event ? <View style={[styles.marker, styles.eventMarker]} /> : null}
                {marker?.task ? <View style={[styles.marker, styles.taskMarker]} /> : null}
                {marker?.classSchedule ? <View style={[styles.marker, styles.classScheduleMarker]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MonthButton({ label, onPress, symbol }: { label: string; onPress: () => void; symbol: string }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.monthButton, pressed ? styles.pressed : undefined]}>
      <ThemedText type="title" lightColor="#0a7ea4" darkColor="#7dd3fc">{symbol}</ThemedText>
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
  container: { gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  monthButton: { alignItems: 'center', minHeight: 44, minWidth: 44, justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { alignItems: 'center', borderRadius: 10, height: 46, justifyContent: 'center', paddingVertical: 3, width: '14.2857%' },
  selectedDay: { backgroundColor: '#0a7ea4' },
  today: { borderColor: '#0a7ea4', borderWidth: 1 },
  dayNumber: { fontSize: 14, lineHeight: 19 },
  markers: { flexDirection: 'row', gap: 3, height: 5 },
  marker: { borderRadius: 999, height: 5, width: 5 },
  eventMarker: { backgroundColor: '#7c3aed' },
  taskMarker: { backgroundColor: '#ea580c' },
  classScheduleMarker: { backgroundColor: '#0f766e' },
  pressed: { opacity: 0.65 },
});
