import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { formatLocalTime } from '@/lib/calendar/calendar-date';
import type { HomeTodayHero } from '@/lib/dashboard/home-dashboard';

export function HomeTodayHeroCard({ accentColor, data, onOpenNext }: { accentColor?: string | null; data: HomeTodayHero; onOpenNext?: () => void }) {
  const { colors } = useAppearance();
  const accent = accentColor ?? data.nextItem?.color ?? colors.primary;
  const summary = todaySummary(data.remainingClasses, data.tasksDueToday);
  const content = <>
    <View style={[styles.accent, { backgroundColor: accent }]} />
    <ThemedText style={[styles.label, { color: colors.primary }]}>TODAY</ThemedText>
    <ThemedText style={styles.summary}>{summary}</ThemedText>
    {data.nextItem ? <View style={styles.nextBlock}>
      <ThemedText style={[styles.nextLabel, { color: colors.textSecondary }]}>{data.nextState === 'current' ? 'NOW' : 'NEXT'}</ThemedText>
      <View style={styles.nextRow}>
        <View style={styles.nextText}>
          <ThemedText numberOfLines={1} style={styles.nextTitle}>{data.nextItem.courseCode || data.nextItem.title}</ThemedText>
          {data.nextItem.courseCode && data.nextItem.courseName ? <ThemedText numberOfLines={1} style={[styles.nextCourse, { color: colors.textSecondary }]}>{data.nextItem.courseName}</ThemedText> : null}
        </View>
        <ThemedText style={[styles.time, { color: accent }]}>{data.nextItem.isAllDay ? 'All day' : formatLocalTime(data.nextItem.startAt)}</ThemedText>
      </View>
    </View> : <ThemedText style={[styles.clear, { color: colors.textSecondary }]}>You&apos;re clear for today.</ThemedText>}
  </>;
  const surfaceStyle = [styles.card, { backgroundColor: colors.surfaceAccent, borderColor: colors.border }];
  return onOpenNext && data.nextItem ? <Pressable accessibilityLabel={`Open ${data.nextItem.title}`} accessibilityRole="button" onPress={onOpenNext} style={({ pressed }) => [surfaceStyle, pressed ? styles.pressed : undefined]}>{content}</Pressable> : <View style={surfaceStyle}>{content}</View>;
}

function todaySummary(classes: number, tasks: number): string {
  const parts = [];
  if (classes) parts.push(`${classes} ${classes === 1 ? 'class' : 'classes'} remaining`);
  if (tasks) parts.push(`${tasks} ${tasks === 1 ? 'task' : 'tasks'} due`);
  return parts.length ? parts.join(' · ') : 'A quiet day ahead';
}

const styles = StyleSheet.create({
  card: { borderRadius: DesignTokens.radius.xl, borderWidth: StyleSheet.hairlineWidth, minHeight: 130, overflow: 'hidden', padding: DesignTokens.spacing.lg, ...Shadows },
  accent: { bottom: 0, left: 0, position: 'absolute', top: 0, width: 4 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, lineHeight: 14 },
  summary: { fontSize: 17, fontWeight: '700', lineHeight: 22, marginTop: 2 },
  nextBlock: { gap: 2, marginTop: DesignTokens.spacing.md },
  nextLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, lineHeight: 12 },
  nextRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md },
  nextText: { flex: 1, minWidth: 0 },
  nextTitle: { fontSize: 14, fontWeight: '800', lineHeight: 18 },
  nextCourse: { fontSize: 11, lineHeight: 15 },
  time: { fontSize: 12, fontWeight: '800', lineHeight: 16 },
  clear: { fontSize: 12, lineHeight: 17, marginTop: DesignTokens.spacing.md },
  pressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});
