import { StyleSheet, View } from 'react-native';

import { TimelineItem } from '@/components/calendar/timeline-item';
import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { formatLocalDate } from '@/lib/calendar/calendar-date';

export function CalendarAgenda({ items, onOpenItem, selectedDate }: { items: CalendarItem[]; onOpenItem: (item: CalendarItem) => void; selectedDate: string }) {
  const sorted = [...items].sort((left, right) => Number(right.isAllDay) - Number(left.isAllDay) || Date.parse(left.startAt) - Date.parse(right.startAt));
  return <View style={styles.container}><ThemedText style={styles.date}>{formatLocalDate(selectedDate)}</ThemedText>{sorted.length ? <View>{sorted.map((item) => <TimelineItem item={item} key={item.id} onPress={() => onOpenItem(item)} />)}</View> : <ThemedText style={styles.empty}>Your day is clear.</ThemedText>}</View>;
}
const styles = StyleSheet.create({ container: { gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding }, date: { fontSize: 15, fontWeight: '800', lineHeight: 20 }, empty: { fontSize: 11, lineHeight: 16, paddingVertical: DesignTokens.spacing.sm } });
