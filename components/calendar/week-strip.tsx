import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { toLocalDateKey } from '@/lib/calendar/calendar-date';

export function WeekStrip({ onSelect, selectedDate }: { onSelect?: (date: string) => void; selectedDate: string }) {
  const { colors } = useAppearance();
  const selected = new Date(`${selectedDate}T12:00:00`);
  const start = new Date(selected);
  start.setDate(selected.getDate() - selected.getDay());
  const days = Array.from({ length: 7 }, (_, index) => { const value = new Date(start); value.setDate(start.getDate() + index); return value; });
  return <View style={[styles.container, { backgroundColor: colors.surface }]}>{days.map((day) => { const key = toLocalDateKey(day); const active = key === selectedDate; return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={key} onPress={() => onSelect?.(key)} style={[styles.day, active ? { backgroundColor: colors.primary } : undefined]}><ThemedText style={[styles.weekday, { color: active ? colors.primaryText : colors.textSecondary }]}>{day.toLocaleDateString(undefined, { weekday: 'narrow' })}</ThemedText><ThemedText type="defaultSemiBold" style={{ color: active ? colors.primaryText : colors.textPrimary }}>{day.getDate()}</ThemedText></Pressable>; })}</View>;
}
const styles = StyleSheet.create({ container: { borderRadius: DesignTokens.radius.lg, flexDirection: 'row', gap: DesignTokens.spacing.xs, padding: DesignTokens.spacing.xs }, day: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, gap: 2, minHeight: 56, justifyContent: 'center' }, weekday: { ...DesignTokens.typography.caption } });
