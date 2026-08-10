import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { formatLocalTime } from '@/lib/calendar/calendar-date';
import { isCalendarTaskOverdue } from '@/lib/calendar/calendar-items';

export function TimelineItem({ item, onPress }: { item: CalendarItem; last?: boolean; onPress: () => void }) {
  const { colors } = useAppearance();
  const course = item.courseCode ?? item.courseName ?? 'Personal';
  const metadata = item.sourceType === 'class_schedule'
    ? [course, item.location].filter(Boolean).join(' · ')
    : item.sourceType === 'task'
      ? `${course} · ${taskStatus(item)}`
      : `${course} · ${sourceLabel(item.sourceType)}`;
  return <Pressable accessibilityHint={`Opens ${sourceLabel(item.sourceType).toLowerCase()} details`} accessibilityLabel={`${item.isAllDay ? 'Anytime' : formatLocalTime(item.startAt)}, ${item.title}, ${metadata}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border }, pressed ? styles.pressed : undefined]}>
    <ThemedText numberOfLines={1} style={[styles.time, { color: colors.textSecondary }]}>{item.isAllDay ? 'Anytime' : formatLocalTime(item.startAt)}</ThemedText>
    <View style={[styles.accent, { backgroundColor: item.color ?? colors.primary }]} />
    <View style={styles.content}><ThemedText numberOfLines={1} style={styles.title}>{item.title}</ThemedText><ThemedText numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>{metadata}</ThemedText></View>
  </Pressable>;
}

function sourceLabel(type: CalendarItem['sourceType']): string { if (type === 'class_schedule') return 'Class'; if (type === 'task') return 'Task'; if (type === 'note') return 'Note'; return 'Event'; }
function taskStatus(item: CalendarItem): string { if (item.status === 'COMPLETED') return 'Completed'; if (isCalendarTaskOverdue(item)) return 'Overdue'; return 'Due today'; }
const styles = StyleSheet.create({ row: { alignItems: 'stretch', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 58, paddingVertical: 8 }, time: { fontSize: 10, fontWeight: '700', lineHeight: 15, paddingRight: DesignTokens.spacing.sm, width: 68 }, accent: { borderRadius: 2, marginRight: DesignTokens.spacing.sm, width: 3 }, content: { flex: 1, justifyContent: 'center', minWidth: 0 }, title: { fontSize: 13, fontWeight: '700', lineHeight: 17 }, meta: { fontSize: 10, lineHeight: 14 }, pressed: { opacity: 0.62 } });
