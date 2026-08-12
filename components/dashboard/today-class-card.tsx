import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { formatLocalTime } from '@/lib/calendar/calendar-date';
import type { ClassTimeState } from '@/lib/dashboard/home-dashboard';

export function TodayClassCard({ courseCode, item, onPress, state, width }: { courseCode: string; item: CalendarItem; onPress: () => void; state: ClassTimeState; width?: number }) {
  const { colors } = useAppearance();
  const accent = item.color ?? colors.primary;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: state === 'current' ? colors.surfaceAccent : colors.surface, borderColor: state === 'current' ? accent : colors.border, borderTopColor: accent, opacity: state === 'past' ? 0.58 : 1 }, width ? { width } : undefined, pressed ? styles.pressed : undefined]}>
    <View style={styles.topRow}>
      <ThemedText style={[styles.time, { color: accent }]}>{formatLocalTime(item.startAt)}</ThemedText>
      {state === 'current' ? <View style={[styles.now, { backgroundColor: colors.primary }]}><ThemedText style={[styles.nowText, { color: colors.primaryText }]}>Now</ThemedText></View> : null}
    </View>
    <ThemedText numberOfLines={1} style={styles.courseName}>{item.courseName ?? item.title}</ThemedText>
    <ThemedText numberOfLines={1} style={[styles.code, { color: colors.textSecondary }]}>{courseCode}</ThemedText>
    {item.location ? <View style={styles.meta}><Ionicons color={colors.textSecondary} name="location-outline" size={13} /><ThemedText numberOfLines={1} style={[styles.metaText, { color: colors.textSecondary }]}>{/^room\b/i.test(item.location) ? item.location : `Room ${item.location}`}</ThemedText></View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { alignSelf: 'stretch', borderRadius: DesignTokens.radius.md, borderTopWidth: 3, borderWidth: StyleSheet.hairlineWidth, gap: 3, height: 104, overflow: 'hidden', paddingHorizontal: DesignTokens.spacing.md, paddingVertical: 9 },
  topRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm },
  time: { flex: 1, fontSize: 12, fontWeight: '900', lineHeight: 16 },
  code: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4, lineHeight: 12 },
  courseName: { fontSize: 13, fontWeight: '800', lineHeight: 17 },
  now: { borderRadius: DesignTokens.radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  nowText: { fontSize: 9, fontWeight: '800', lineHeight: 12, textTransform: 'uppercase' },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  metaText: { flexShrink: 1, fontSize: 10, lineHeight: 14 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
