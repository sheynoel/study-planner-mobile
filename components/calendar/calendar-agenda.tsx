import { StyleSheet, View } from 'react-native';

import { TimelineItem } from '@/components/calendar/timeline-item';
import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { SectionHeader } from '@/components/ui/section-header';
import { DesignTokens } from '@/constants/theme';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { formatLocalDate } from '@/lib/calendar/calendar-date';

export function CalendarAgenda({ items, onOpenItem, selectedDate }: { items: CalendarItem[]; onOpenItem: (item: CalendarItem) => void; selectedDate: string }) {
  return <View style={styles.container}><SectionHeader title={formatLocalDate(selectedDate)} />{items.length === 0 ? <BentoCard tone="subtle"><ThemedText>Your day is open. Add an event or give a task a due date.</ThemedText></BentoCard> : items.map((item, index) => <TimelineItem item={item} key={item.id} last={index === items.length - 1} onPress={() => onOpenItem(item)} />)}</View>;
}
const styles = StyleSheet.create({ container: { gap: DesignTokens.spacing.md, paddingHorizontal: DesignTokens.layout.screenPadding } });
