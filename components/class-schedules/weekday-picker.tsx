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

export function MultiWeekdayPicker({ error, onChange, value }: { error?: string; onChange: (value: Weekday[]) => void; value: Weekday[] }) {
  const { colors } = useAppearance();
  function toggle(weekday: Weekday) {
    onChange(value.includes(weekday) ? value.filter((item) => item !== weekday) : WEEKDAYS.filter((item) => item === weekday || value.includes(item)));
  }
  return <View style={styles.field}>
    <ThemedText type="defaultSemiBold">Days</ThemedText>
    <View style={styles.compactOptions}>{WEEKDAYS.map((weekday) => {
      const selected = value.includes(weekday);
      return <Pressable accessibilityLabel={LABELS[weekday]} accessibilityRole="button" accessibilityState={{ selected }} key={weekday} onPress={() => toggle(weekday)} style={({ pressed }) => [styles.compactOption, { borderColor: colors.outline }, selected ? { backgroundColor: colors.primary, borderColor: colors.primary } : undefined, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.compactLabel, selected ? { color: colors.primaryText } : undefined]}>{LABELS[weekday]}</ThemedText></Pressable>;
    })}</View>
    {error ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{error}</ThemedText> : null}
  </View>;
}

const styles = StyleSheet.create({
  field: { gap: DesignTokens.spacing.sm },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm },
  compactOptions: { flexDirection: 'row', gap: 4 },
  option: { borderRadius: DesignTokens.radius.pill, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 14, paddingVertical: 8 },
  compactOption: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 36, minWidth: 0 },
  compactLabel: { fontSize: 11, fontWeight: '700', lineHeight: 15 },
  error: { fontSize: 12, lineHeight: 16 },
  pressed: { opacity: 0.7 },
});
