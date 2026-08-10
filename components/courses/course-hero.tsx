import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { formatScheduleTime } from '@/components/ui/time-picker-field';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import { formatWeekdays, groupClassSchedules } from '@/lib/class-schedules/schedule-groups';

export function CourseHero({ course, onSchedulePress, schedules }: { course: Course; onSchedulePress: () => void; schedules: ClassSchedule[] }) {
  const { colors } = useAppearance();
  const accent = /^#[0-9a-fA-F]{6}$/.test(course.color) ? course.color : colors.primary;
  const group = groupClassSchedules(schedules)[0];
  return <BentoCard style={[styles.hero, { borderColor: accent }]}>
    <View style={[styles.accent, { backgroundColor: accent }]} />
    <View style={styles.identity}><ThemedText numberOfLines={2} style={styles.title}>{course.name}</ThemedText><ThemedText numberOfLines={1} style={[styles.subtitle, { color: colors.textSecondary }]}>{course.code ?? 'Course'}</ThemedText>{course.instructor ? <ThemedText numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>{course.instructor}</ThemedText> : null}</View>
    <Pressable accessibilityHint="Opens class schedules" accessibilityRole="button" onPress={onSchedulePress} style={({ pressed }) => [styles.schedule, { backgroundColor: colors.surfaceSubtle }, pressed ? styles.pressed : undefined]}><View style={styles.scheduleText}>{group ? <><ThemedText numberOfLines={1} style={styles.days}>{formatWeekdays(group.weekdays)}</ThemedText><ThemedText numberOfLines={1} style={[styles.time, { color: colors.textSecondary }]}>{formatScheduleTime(group.startTime)}–{formatScheduleTime(group.endTime)}{group.room ? ` · ${group.room}` : ''}</ThemedText></> : <ThemedText style={[styles.time, { color: colors.textSecondary }]}>No class schedule yet</ThemedText>}</View><Ionicons color={colors.primary} name="chevron-forward" size={17} /></Pressable>
  </BentoCard>;
}

const styles = StyleSheet.create({ hero: { borderWidth: 1, gap: DesignTokens.spacing.md, overflow: 'hidden', padding: DesignTokens.spacing.md }, accent: { bottom: 0, left: 0, position: 'absolute', top: 0, width: 4 }, identity: { gap: 2, minWidth: 0, paddingLeft: 3 }, title: { fontSize: 20, fontWeight: '800', lineHeight: 24 }, subtitle: { fontSize: 13, fontWeight: '600', lineHeight: 18 }, meta: { fontSize: 11, lineHeight: 15, marginTop: 3 }, schedule: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 54, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: DesignTokens.spacing.sm }, scheduleText: { flex: 1, gap: 1, minWidth: 0 }, days: { fontSize: 12, fontWeight: '800', lineHeight: 16 }, time: { fontSize: 11, lineHeight: 15 }, pressed: { opacity: 0.68 } });
