import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { WEEKDAYS, type Weekday } from '@/lib/api/class-schedule.types';

const LABELS: Record<Weekday, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

export function WeekdayPicker({ onChange, value }: { onChange: (value: Weekday) => void; value: Weekday }) {
  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">Weekday</ThemedText>
      <View style={styles.options}>
        {WEEKDAYS.map((weekday) => {
          const selected = weekday === value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={weekday}
              onPress={() => onChange(weekday)}
              style={({ pressed }) => [styles.option, selected ? styles.selected : undefined, pressed ? styles.pressed : undefined]}>
              <ThemedText lightColor={selected ? '#ffffff' : undefined} darkColor={selected ? '#ffffff' : undefined}>{LABELS[weekday]}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderColor: '#0a7ea4', borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  selected: { backgroundColor: '#0a7ea4' },
  pressed: { opacity: 0.7 },
});
