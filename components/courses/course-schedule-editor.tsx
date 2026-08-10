import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormField } from '@/components/auth/auth-form';
import { TimeRangeField } from '@/components/class-schedules/time-range-field';
import { MultiWeekdayPicker } from '@/components/class-schedules/weekday-picker';
import { ThemedText } from '@/components/themed-text';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CourseScheduleFormErrors, CourseScheduleFormValues } from '@/lib/class-schedules/class-schedule-form';

export function CourseScheduleEditor({ accentColor, errors, onAdd, onChange, onRemove, schedules }: { accentColor: string; errors: CourseScheduleFormErrors[]; onAdd: () => void; onChange: (index: number, values: CourseScheduleFormValues) => void; onRemove: (index: number) => void; schedules: CourseScheduleFormValues[] }) {
  const { colors } = useAppearance();
  function update<Field extends keyof CourseScheduleFormValues>(index: number, field: Field, value: CourseScheduleFormValues[Field]) { onChange(index, { ...schedules[index], [field]: value }); }
  return <View style={styles.section}>
    <View style={styles.heading}><ThemedText type="defaultSemiBold" style={styles.headingText}>Schedules</ThemedText><Pressable accessibilityRole="button" onPress={onAdd} style={({ pressed }) => [styles.add, { borderColor: colors.border }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name="add" size={16} /><ThemedText style={[styles.addLabel, { color: colors.primary }]}>Add schedule</ThemedText></Pressable></View>
    {schedules.map((schedule, index) => <View key={index} style={[styles.card, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.cardHeading}><ThemedText style={styles.cardTitle}>Schedule {index + 1}</ThemedText><Pressable accessibilityLabel={`Remove schedule ${index + 1}`} accessibilityRole="button" onPress={() => onRemove(index)} style={styles.remove}><Ionicons color={colors.danger} name="trash-outline" size={17} /></Pressable></View>
      <MultiWeekdayPicker error={errors[index]?.weekdays} onChange={(value) => update(index, 'weekdays', value)} value={schedule.weekdays} />
      <TimeRangeField endError={errors[index]?.endTime} endTime={schedule.endTime} onEndChange={(value) => update(index, 'endTime', value)} onStartChange={(value) => update(index, 'startTime', value)} startError={errors[index]?.startTime} startTime={schedule.startTime} />
      <FormField error={errors[index]?.room} label="Room (optional)" onChangeText={(value) => update(index, 'room', value)} placeholder="Room 204" value={schedule.room} />
      <View style={styles.row}><DatePickerField error={errors[index]?.startDate} label="Starts" onChange={(value) => update(index, 'startDate', value)} value={schedule.startDate} /><DatePickerField error={errors[index]?.endDate} label="Ends" onChange={(value) => update(index, 'endDate', value)} value={schedule.endDate} /></View>
    </View>)}
    {!schedules.length ? <ThemedText style={[styles.emptyLabel, { color: colors.textSecondary }]}>No schedules added yet.</ThemedText> : null}
  </View>;
}

const styles = StyleSheet.create({ section: { gap: DesignTokens.spacing.sm }, heading: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm }, headingText: { flex: 1 }, add: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: 1, flexDirection: 'row', gap: 3, minHeight: 38, paddingHorizontal: DesignTokens.spacing.sm }, addLabel: { fontSize: 12, fontWeight: '700' }, card: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, gap: DesignTokens.spacing.md, overflow: 'hidden', padding: DesignTokens.spacing.md, paddingTop: DesignTokens.spacing.lg }, accent: { height: 4, left: 0, position: 'absolute', right: 0, top: 0 }, cardHeading: { alignItems: 'center', flexDirection: 'row' }, cardTitle: { flex: 1, fontSize: 13, fontWeight: '700' }, remove: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 }, row: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, emptyLabel: { fontSize: 12, lineHeight: 17 }, pressed: { opacity: 0.62 } });
