import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import { formatLocalDate } from '@/lib/calendar/calendar-date';
import { formatWeekdays, type ScheduleGroup } from '@/lib/class-schedules/schedule-groups';

export function ClassScheduleCard({ course, group, onPress }: { course: Course; group: ScheduleGroup; onPress: () => void }) {
  const { colors } = useAppearance();
  return <AppCard padded={false} style={styles.card}><View style={[styles.bar, { backgroundColor: course.color }]} /><Pressable accessibilityHint="Opens class schedule details" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}><ThemedText type="subtitle">{formatWeekdays(group.weekdays)}</ThemedText><ThemedText type="defaultSemiBold">{group.startTime} – {group.endTime}</ThemedText><ThemedText>{group.room ?? 'No room'}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{formatLocalDate(group.startDate)} – {formatLocalDate(group.endDate)}</ThemedText></Pressable></AppCard>;
}

export function titleCase(value: string): string { return value.charAt(0) + value.slice(1).toLowerCase(); }
const styles = StyleSheet.create({ card: { borderRadius: DesignTokens.radius.lg, flexDirection: 'row', overflow: 'hidden' }, bar: { width: 6 }, content: { flex: 1, gap: DesignTokens.spacing.xs, minHeight: DesignTokens.size.touchTarget, padding: DesignTokens.layout.cardPadding }, pressed: { opacity: 0.7 } });
