import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import { formatLocalDate } from '@/lib/calendar/calendar-date';

export function ClassScheduleCard({ course, onPress, schedule }: { course: Course; onPress: () => void; schedule: ClassSchedule }) {
  const { colors } = useAppearance();
  return <AppCard padded={false} style={styles.card}>
    <View style={[styles.bar, { backgroundColor: course.color }]} />
    <Pressable accessibilityHint="Opens class schedule details" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
      <ThemedText type="subtitle">{titleCase(schedule.weekday)}</ThemedText>
      <ThemedText type="defaultSemiBold">{schedule.startTime} – {schedule.endTime}</ThemedText>
      <ThemedText>{schedule.room ?? 'No room'}</ThemedText>
      <ThemedText style={{ color: colors.textSecondary }}>{formatLocalDate(schedule.startDate)} – {formatLocalDate(schedule.endDate)}</ThemedText>
    </Pressable>
  </AppCard>;
}

export function titleCase(value: string): string { return value.charAt(0) + value.slice(1).toLowerCase(); }

const styles = StyleSheet.create({ card: { borderRadius: DesignTokens.radius.lg, flexDirection: 'row', overflow: 'hidden' }, bar: { width: 6 }, content: { flex: 1, gap: DesignTokens.spacing.xs, minHeight: DesignTokens.size.touchTarget, padding: DesignTokens.layout.cardPadding }, pressed: { opacity: 0.7 } });
