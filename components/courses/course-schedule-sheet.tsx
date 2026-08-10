import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { AppButton } from '@/components/ui/app-button';
import { formatScheduleTime } from '@/components/ui/time-picker-field';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import { formatWeekdays, groupClassSchedules } from '@/lib/class-schedules/schedule-groups';

export function CourseScheduleSheet({ onClose, onEdit, schedules, visible }: { onClose: () => void; onEdit: () => void; schedules: ClassSchedule[]; visible: boolean }) {
  const { colors } = useAppearance();
  const groups = groupClassSchedules(schedules);
  return <AppBottomSheet expandable initialSnap={0.68} onClose={onClose} title="Class Schedule" visible={visible}><ScrollView contentContainerStyle={styles.content}>{groups.length ? groups.map((group) => <View key={`${group.startTime}-${group.endTime}-${group.room}-${group.weekdays.join()}`} style={[styles.meeting, { backgroundColor: colors.surfaceSubtle }]}><ThemedText style={styles.days}>{formatWeekdays(group.weekdays)}</ThemedText><ThemedText style={styles.time}>{formatScheduleTime(group.startTime)}–{formatScheduleTime(group.endTime)}</ThemedText>{group.room ? <ThemedText numberOfLines={1} style={[styles.room, { color: colors.textSecondary }]}>{group.room}</ThemedText> : null}</View>) : <ThemedText style={[styles.empty, { color: colors.textSecondary }]}>No class schedules have been added.</ThemedText>}<AppButton label="Edit schedules" onPress={() => { onClose(); onEdit(); }} variant="secondary" /></ScrollView></AppBottomSheet>;
}

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.sm, paddingBottom: DesignTokens.spacing.xl, paddingHorizontal: DesignTokens.layout.screenPadding }, meeting: { borderRadius: DesignTokens.radius.md, gap: 2, padding: DesignTokens.spacing.md }, days: { fontSize: 13, fontWeight: '800', lineHeight: 18 }, time: { fontSize: 13, fontWeight: '600', lineHeight: 18 }, room: { fontSize: 11, lineHeight: 15 }, empty: { fontSize: 13, lineHeight: 18, paddingVertical: DesignTokens.spacing.md } });
