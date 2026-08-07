import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens, PlannerColors } from '@/constants/theme';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { formatLocalTime } from '@/lib/calendar/calendar-date';

export function NextScheduleCard({ item, onPress }: { item: CalendarItem; onPress: () => void }) {
  const isClass = item.sourceType === 'class_schedule';
  return (
    <AppCard padded={false} style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
        <View style={styles.heading}>
          <View style={[styles.badge, { backgroundColor: isClass ? PlannerColors.classSchedule : PlannerColors.event }]}>
            <ThemedText style={styles.badgeText}>{isClass ? 'CLASS' : 'EVENT'}</ThemedText>
          </View>
          <ThemedText type="subtitle" numberOfLines={2} style={styles.title}>{item.title}</ThemedText>
        </View>
        <ThemedText>{scheduleTime(item)}</ThemedText>
        {item.courseName ? <ThemedText numberOfLines={1}>{item.courseName}</ThemedText> : null}
        {item.location ? <ThemedText numberOfLines={1}>{item.location}</ThemedText> : null}
      </Pressable>
    </AppCard>
  );
}

export function scheduleTime(item: CalendarItem): string {
  const today = new Date();
  const itemDate = new Date(item.startAt);
  const datePrefix = itemDate.toDateString() === today.toDateString() ? '' : `${itemDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · `;
  if (item.isAllDay) return `${datePrefix}All day`;
  const start = formatLocalTime(item.startAt);
  return `${datePrefix}${item.endAt ? `${start} – ${formatLocalTime(item.endAt)}` : start}`;
}

const styles = StyleSheet.create({
  card: { borderRadius: DesignTokens.radius.lg },
  content: { gap: DesignTokens.spacing.xs, padding: DesignTokens.layout.cardPadding },
  heading: { alignItems: 'flex-start', flexDirection: 'row', gap: 9 },
  title: { flex: 1 },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '800', lineHeight: 14 },
  pressed: { opacity: 0.72 },
});
