import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { WEEKDAYS, type Weekday } from '@/lib/api/class-schedule.types';

const LABELS: Record<Weekday, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

export function WeekdayPicker({ onChange, value }: { onChange: (value: Weekday) => void; value: Weekday }) {
  const { colors } = useAppearance();
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
              style={({ pressed }) => [styles.option, { borderColor: colors.outline }, selected ? { backgroundColor: colors.primary, borderColor: colors.primary } : undefined, pressed ? styles.pressed : undefined]}>
              <ThemedText style={selected ? { color: colors.primaryText } : undefined}>{LABELS[weekday]}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: DesignTokens.spacing.sm },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm },
  option: { borderRadius: DesignTokens.radius.pill, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 14, paddingVertical: 8 },
  pressed: { opacity: 0.7 },
});
