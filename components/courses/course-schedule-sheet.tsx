import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { formatScheduleTime } from '@/components/ui/time-picker-field';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import { formatWeekdays, groupClassSchedules } from '@/lib/class-schedules/schedule-groups';

export function CourseScheduleSheet({ onClose, onEdit, schedules, visible }: { onClose: () => void; onEdit: () => void; schedules: ClassSchedule[]; visible: boolean }) {
  const { colors } = useAppearance();
  const groups = groupClassSchedules(schedules);
  return <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}><View style={styles.overlay}><Pressable accessibilityLabel="Close schedule" onPress={onClose} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.handle, { backgroundColor: colors.border }]} /><View style={styles.header}><ThemedText style={styles.title}>Class Schedule</ThemedText><Pressable accessibilityLabel="Close" onPress={onClose} style={styles.close}><Ionicons color={colors.textSecondary} name="close" size={21} /></Pressable></View><ScrollView contentContainerStyle={styles.content}>{groups.length ? groups.map((group) => <View key={`${group.startTime}-${group.endTime}-${group.room}-${group.weekdays.join()}`} style={[styles.meeting, { backgroundColor: colors.surfaceSubtle }]}><ThemedText style={styles.days}>{formatWeekdays(group.weekdays)}</ThemedText><ThemedText style={styles.time}>{formatScheduleTime(group.startTime)}–{formatScheduleTime(group.endTime)}</ThemedText>{group.room ? <ThemedText numberOfLines={1} style={[styles.room, { color: colors.textSecondary }]}>{group.room}</ThemedText> : null}</View>) : <ThemedText style={[styles.empty, { color: colors.textSecondary }]}>No class schedules have been added.</ThemedText>}<AppButton label="Edit schedules" onPress={() => { onClose(); onEdit(); }} variant="secondary" /></ScrollView></SafeAreaView></View></Modal>;
}

const styles = StyleSheet.create({ overlay: { backgroundColor: 'rgba(0,0,0,0.38)', flex: 1, justifyContent: 'flex-end' }, sheet: { borderTopLeftRadius: DesignTokens.radius.xxl, borderTopRightRadius: DesignTokens.radius.xxl, borderWidth: StyleSheet.hairlineWidth, maxHeight: '72%', paddingTop: DesignTokens.spacing.sm, ...Shadows }, handle: { alignSelf: 'center', borderRadius: 999, height: 4, opacity: 0.5, width: 42 }, header: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: DesignTokens.layout.screenPadding, paddingVertical: DesignTokens.spacing.sm }, title: { flex: 1, fontSize: 18, fontWeight: '800' }, close: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 }, content: { gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.layout.screenPadding, paddingBottom: DesignTokens.spacing.xl }, meeting: { borderRadius: DesignTokens.radius.md, gap: 2, padding: DesignTokens.spacing.md }, days: { fontSize: 13, fontWeight: '800', lineHeight: 18 }, time: { fontSize: 13, fontWeight: '600', lineHeight: 18 }, room: { fontSize: 11, lineHeight: 15 }, empty: { fontSize: 13, lineHeight: 18, paddingVertical: DesignTokens.spacing.md } });
