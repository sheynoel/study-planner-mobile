import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { Note } from '@/lib/api/note.types';
import { formatLocalTime } from '@/lib/calendar/calendar-date';
import type { ClassTimeState } from '@/lib/dashboard/home-dashboard';

export function TodayClassCard({ courseCode, item, notes, onPress, state, width }: { courseCode: string; item: CalendarItem; notes: Note[]; onPress: () => void; state: ClassTimeState; width: number }) {
  const { colors } = useAppearance();
  const accent = item.color ?? colors.primary;
  const visibleNotes = notes.slice(0, 2);
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: state === 'current' ? accent : colors.border, borderLeftColor: accent, opacity: state === 'past' ? 0.62 : 1, width }, pressed ? styles.pressed : undefined]}>
    <View style={styles.topRow}>
      <ThemedText numberOfLines={1} style={[styles.code, { color: accent }]}>{courseCode}</ThemedText>
      {state === 'current' ? <View style={[styles.now, { backgroundColor: colors.primary }]}><ThemedText style={[styles.nowText, { color: colors.primaryText }]}>Now</ThemedText></View> : null}
    </View>
    <ThemedText numberOfLines={1} style={styles.courseName}>{item.courseName ?? item.title}</ThemedText>
    <View style={styles.meta}>
      <Ionicons color={colors.textSecondary} name="time-outline" size={14} />
      <ThemedText numberOfLines={1} style={[styles.metaText, { color: colors.textSecondary }]}>{formatLocalTime(item.startAt)}–{formatLocalTime(item.endAt ?? item.startAt)}</ThemedText>
    </View>
    {item.location ? <View style={styles.meta}><Ionicons color={colors.textSecondary} name="location-outline" size={14} /><ThemedText numberOfLines={1} style={[styles.metaText, { color: colors.textSecondary }]}>{/^room\b/i.test(item.location) ? item.location : `Room ${item.location}`}</ThemedText></View> : null}
    {visibleNotes.length ? <View style={[styles.notes, { borderTopColor: colors.border }]}>{visibleNotes.map((note) => <View key={note.id} style={styles.noteRow}><Ionicons color={colors.primary} name="document-text-outline" size={12} /><ThemedText numberOfLines={1} style={[styles.noteText, { color: colors.textSecondary }]}>{note.title}</ThemedText></View>)}{notes.length > 2 ? <ThemedText style={[styles.more, { color: colors.primary }]}>+{notes.length - 2} more</ThemedText> : null}</View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { alignSelf: 'flex-start', borderLeftWidth: 3, borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, gap: 3, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: 10 },
  topRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm },
  code: { flex: 1, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, lineHeight: 15 },
  courseName: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  now: { borderRadius: DesignTokens.radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  nowText: { fontSize: 9, fontWeight: '800', lineHeight: 12, textTransform: 'uppercase' },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  metaText: { flexShrink: 1, fontSize: 10, lineHeight: 14 },
  notes: { borderTopWidth: StyleSheet.hairlineWidth, gap: 2, marginTop: 4, paddingTop: 5 },
  noteRow: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  noteText: { flex: 1, fontSize: 10, lineHeight: 14 },
  more: { fontSize: 10, fontWeight: '700', lineHeight: 14 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
