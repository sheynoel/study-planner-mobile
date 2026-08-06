import { Pressable, StyleSheet, View } from 'react-native';

import { DashboardSection, DashboardSectionEmpty, DashboardSectionError } from '@/components/dashboard/dashboard-section';
import { scheduleTime } from '@/components/dashboard/next-schedule-card';
import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import type { CalendarItem } from '@/lib/api/calendar-event.types';

export function TodayScheduleSection({
  error,
  items,
  onOpen,
  onRetry,
  onViewAll,
}: {
  error?: string;
  items: CalendarItem[];
  onOpen: (item: CalendarItem) => void;
  onRetry: () => void;
  onViewAll: () => void;
}) {
  return (
    <DashboardSection actionLabel="View Calendar" onAction={onViewAll} title="Today's Schedule">
      {error ? <DashboardSectionError message={error} onRetry={onRetry} /> : null}
      {items.length === 0 && !error ? <DashboardSectionEmpty message="No classes or events scheduled today." /> : null}
      {items.slice(0, 5).map((item) => (
        <AppCard key={item.id} padded={false} style={styles.card}>
          <Pressable accessibilityRole="button" onPress={() => onOpen(item)} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
            <View style={styles.row}>
              <ThemedText type="defaultSemiBold" style={styles.title}>{item.sourceType === 'class_schedule' ? 'CLASS' : 'EVENT'} · {item.title}</ThemedText>
              <ThemedText>{scheduleTime(item)}</ThemedText>
            </View>
            <ThemedText numberOfLines={1}>{[item.courseName, item.location].filter(Boolean).join(' · ') || (item.sourceType === 'event' ? 'Personal event' : 'Room not specified')}</ThemedText>
          </Pressable>
        </AppCard>
      ))}
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: DesignTokens.radius.lg },
  content: { gap: DesignTokens.spacing.xs, padding: DesignTokens.layout.cardPadding },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  title: { flex: 1 },
  pressed: { opacity: 0.72 },
});
