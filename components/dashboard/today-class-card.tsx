import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { Task } from '@/lib/api/task.types';
import { formatLocalTime } from '@/lib/calendar/calendar-date';
import type { ClassTimeState } from '@/lib/dashboard/home-dashboard';

export function TodayClassCard({ courseCode, item, onPress, reminders, state, width }: { courseCode: string; item: CalendarItem; onPress: () => void; reminders: Task[]; state: ClassTimeState; width: number }) {
  const { colors } = useAppearance();
  const accent = item.color ?? colors.primary;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: state === 'current' ? colors.primaryContainer : colors.surface, borderColor: colors.border, borderLeftColor: accent, opacity: state === 'past' ? 0.62 : 1, width }, pressed ? styles.pressed : undefined]}>
    <View style={styles.topRow}>
      <ThemedText numberOfLines={1} style={[styles.code, { color: accent }]}>{courseCode}</ThemedText>
      {state === 'current' ? <View style={[styles.now, { backgroundColor: colors.primary }]}><ThemedText style={[styles.nowText, { color: colors.primaryText }]}>Now</ThemedText></View> : null}
    </View>
    <ThemedText numberOfLines={1} style={styles.courseName}>{item.courseName ?? item.title}</ThemedText>
    {reminders.length ? <View style={styles.reminders}>{reminders.map((task) => <ThemedText key={task.id} numberOfLines={1} style={[styles.reminder, { color: colors.textSecondary }]}>• {task.title}</ThemedText>)}</View> : null}
    <View style={styles.meta}>
      <Ionicons color={colors.textSecondary} name="time-outline" size={14} />
      <ThemedText numberOfLines={1} style={[styles.metaText, { color: colors.textSecondary }]}>{formatLocalTime(item.startAt)}–{formatLocalTime(item.endAt ?? item.startAt)}</ThemedText>
    </View>
    {item.location ? <View style={styles.meta}><Ionicons color={colors.textSecondary} name="location-outline" size={14} /><ThemedText numberOfLines={1} style={[styles.metaText, { color: colors.textSecondary }]}>{item.location}</ThemedText></View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 4, borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: 5, minHeight: 142, padding: DesignTokens.spacing.md, ...Shadows },
  topRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm },
  code: { flex: 1, fontSize: 12, fontWeight: '800', letterSpacing: 0.7, lineHeight: 16 },
  courseName: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  now: { borderRadius: DesignTokens.radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  nowText: { fontSize: 9, fontWeight: '800', lineHeight: 12, textTransform: 'uppercase' },
  reminders: { gap: 1, minHeight: 17 },
  reminder: { fontSize: 11, lineHeight: 15 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  metaText: { flexShrink: 1, fontSize: 11, lineHeight: 15 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
