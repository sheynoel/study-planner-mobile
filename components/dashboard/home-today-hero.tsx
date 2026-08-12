import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { formatLocalTime } from '@/lib/calendar/calendar-date';
import type { HomeTodayHero } from '@/lib/dashboard/home-dashboard';

export function HomeTodayHeroCard({ accentColor, data, now, onOpenNext }: { accentColor?: string | null; data: HomeTodayHero; now: Date; onOpenNext?: () => void }) {
  const { colors } = useAppearance();
  const accent = accentColor ?? data.nextItem?.color ?? colors.primary;
  const nextTitle = data.nextItem?.courseCode || data.nextItem?.title || data.nextTask?.title;
  const markerPosition = dayProgress(now);
  const content = <>
    <View accessibilityLabel={`Day flow, 8 AM to 5 PM, current position ${Math.round(markerPosition)} percent`} style={styles.timelineRow}>
      <ThemedText style={[styles.endpoint, { color: colors.textSecondary }]}>08</ThemedText>
      <View style={styles.timeline}>
        <View style={[styles.track, { backgroundColor: colors.border }]} />
        <View style={[styles.elapsed, { backgroundColor: accent, width: `${markerPosition}%` }]} />
        <View style={[styles.marker, { backgroundColor: accent, borderColor: colors.surfaceAccent, left: `${markerPosition}%` }]} />
        <ThemedText style={[styles.nowLabel, { color: accent, left: `${markerPosition}%` }]}>NOW</ThemedText>
      </View>
      <ThemedText style={[styles.endpoint, { color: colors.textSecondary }]}>17</ThemedText>
    </View>
    {nextTitle ? <View style={styles.nextBlock}>
      <ThemedText style={[styles.nextLabel, { color: colors.textSecondary }]}>{data.nextState === 'current' ? 'Now' : data.nextState === 'due' ? 'Due today' : 'Next up'}</ThemedText>
      <View style={styles.nextRow}>
        <ThemedText numberOfLines={1} style={styles.nextTitle}>{nextTitle}</ThemedText>
        {data.nextItem && data.nextState !== 'current' ? <ThemedText style={[styles.time, { color: accent }]}>{formatLocalTime(data.nextItem.startAt)}</ThemedText> : null}
      </View>
    </View> : <ThemedText style={styles.clear}>You&apos;re clear for the rest of today.</ThemedText>}
    {data.tasksDueToday ? <ThemedText style={[styles.due, { color: colors.textSecondary }]}>{data.tasksDueToday} {data.tasksDueToday === 1 ? 'thing' : 'things'} due</ThemedText> : null}
  </>;
  const surfaceStyle = [styles.card, { backgroundColor: colors.surfaceAccent, borderColor: colors.border }];
  return onOpenNext && nextTitle ? <Pressable accessibilityLabel={`Open ${nextTitle}`} accessibilityRole="button" onPress={onOpenNext} style={({ pressed }) => [surfaceStyle, pressed ? styles.pressed : undefined]}>{content}</Pressable> : <View style={surfaceStyle}>{content}</View>;
}

function dayProgress(now: Date): number {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, Math.min(100, ((minutes - 8 * 60) / (9 * 60)) * 100));
}

const styles = StyleSheet.create({
  card: { borderRadius: DesignTokens.radius.xl, borderWidth: StyleSheet.hairlineWidth, minHeight: 150, overflow: 'hidden', padding: DesignTokens.spacing.lg, ...Shadows },
  timelineRow: { alignItems: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.sm },
  timeline: { flex: 1, height: 32, position: 'relative' },
  endpoint: { fontSize: 10, fontWeight: '800', lineHeight: 15 },
  track: { borderRadius: DesignTokens.radius.pill, height: 2, left: 0, position: 'absolute', right: 0, top: 7 },
  elapsed: { borderRadius: DesignTokens.radius.pill, height: 2, left: 0, position: 'absolute', top: 7 },
  marker: { borderRadius: DesignTokens.radius.pill, borderWidth: 3, height: 13, position: 'absolute', top: 1.5, transform: [{ translateX: -6.5 }], width: 13 },
  nowLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.6, lineHeight: 11, position: 'absolute', top: 17, transform: [{ translateX: -14 }] },
  nextBlock: { gap: 2, marginTop: DesignTokens.spacing.sm },
  nextLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, lineHeight: 14 },
  nextRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md },
  nextTitle: { flex: 1, fontSize: 17, fontWeight: '800', lineHeight: 22, minWidth: 0 },
  time: { fontSize: 13, fontWeight: '800', lineHeight: 18 },
  clear: { fontSize: 14, fontWeight: '700', lineHeight: 19, marginTop: DesignTokens.spacing.sm },
  due: { fontSize: 11, fontWeight: '700', lineHeight: 15, marginTop: 'auto', paddingTop: DesignTokens.spacing.sm },
  pressed: { opacity: 0.76, transform: [{ scale: 0.995 }] },
});
