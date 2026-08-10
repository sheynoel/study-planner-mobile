import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import { toggleHiddenCourse, type CalendarDisplayPreferences } from '@/lib/calendar/calendar-display';

export function CalendarDisplaySheet({ courses, onChange, onClose, value, visible }: { courses: Course[]; onChange: (value: CalendarDisplayPreferences) => void; onClose: () => void; value: CalendarDisplayPreferences; visible: boolean }) {
  return <AppBottomSheet expandable initialSnap={0.72} onClose={onClose} title="Calendar Display" visible={visible}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}><SectionLabel>Show on calendar</SectionLabel><ToggleRow label="Classes" onChange={(showClasses) => onChange({ ...value, showClasses })} value={value.showClasses} /><ToggleRow label="Tasks" onChange={(showTasks) => onChange({ ...value, showTasks })} value={value.showTasks} /><ToggleRow label="Events & Notes" onChange={(showEventsNotes) => onChange({ ...value, showEventsNotes })} value={value.showEventsNotes} /></View>
      <View style={styles.section}><SectionLabel>Month density</SectionLabel><View style={styles.chips}><ChoiceChip label="Compact" onPress={() => onChange({ ...value, density: 'compact' })} selected={value.density === 'compact'} /><ChoiceChip label="Detailed" onPress={() => onChange({ ...value, density: 'detailed' })} selected={value.density === 'detailed'} /></View></View>
      <View style={styles.section}><SectionLabel>Visible courses</SectionLabel>{courses.length ? courses.map((course) => <ToggleRow key={course.id} label={course.code ?? course.name} onChange={(shown) => onChange(toggleHiddenCourse(value, course.id, shown))} subtitle={course.code ? course.name : undefined} value={!value.hiddenCourseIds.includes(course.id)} />) : <ThemedText style={styles.empty}>No courses to manage.</ThemedText>}</View>
    </ScrollView>
  </AppBottomSheet>;
}

function SectionLabel({ children }: { children: React.ReactNode }) { const { colors } = useAppearance(); return <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>{children}</ThemedText>; }
function ToggleRow({ label, onChange, subtitle, value }: { label: string; onChange: (value: boolean) => void; subtitle?: string; value: boolean }) { const { colors } = useAppearance(); return <View style={[styles.row, { borderBottomColor: colors.border }]}><View style={styles.rowText}><ThemedText numberOfLines={1} style={styles.label}>{label}</ThemedText>{subtitle ? <ThemedText numberOfLines={1} style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</ThemedText> : null}</View><Switch accessibilityLabel={`Show ${label} on calendar`} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.primaryContainer }} thumbColor={value ? colors.primary : colors.textMuted} value={value} /></View>; }

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, paddingBottom: DesignTokens.spacing.xl, paddingHorizontal: DesignTokens.layout.screenPadding }, section: { gap: 2 }, sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, lineHeight: 14, marginBottom: 4, textTransform: 'uppercase' }, row: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 52 }, rowText: { flex: 1, minWidth: 0 }, label: { fontSize: 13, fontWeight: '700', lineHeight: 17 }, subtitle: { fontSize: 10, lineHeight: 14 }, chips: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, empty: { fontSize: 11, paddingVertical: DesignTokens.spacing.sm } });
