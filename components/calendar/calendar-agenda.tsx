import { StyleSheet, View } from 'react-native';

import { CalendarItemCard } from '@/components/calendar/calendar-item-card';
import { ThemedText } from '@/components/themed-text';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { formatLocalDate } from '@/lib/calendar/calendar-date';

export function CalendarAgenda({ items, onOpenItem, selectedDate }: { items: CalendarItem[]; onOpenItem: (item: CalendarItem) => void; selectedDate: string }) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{formatLocalDate(selectedDate)}</ThemedText>
      {items.length === 0 ? (
        <ThemedText lightColor="#64748b" darkColor="#94a3b8">No events or task deadlines on this date.</ThemedText>
      ) : items.map((item) => <CalendarItemCard item={item} key={item.id} onPress={() => onOpenItem(item)} />)}
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: 12, padding: 20, paddingBottom: 110 } });
