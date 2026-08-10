import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { parseLocalDate, toLocalDateKey } from '@/lib/calendar/calendar-date';

export function DatePickerField({ allowClear = false, displayFormat = 'medium', error, hideLabel = false, label, onChange, pickerTitle, placeholder = 'Set date', value }: { allowClear?: boolean; displayFormat?: 'compact' | 'medium'; error?: string; hideLabel?: boolean; label: string; onChange: (value: string) => void; pickerTitle?: string; placeholder?: string; value: string }) {
  const { colors } = useAppearance();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(value);
  const [currentMonth, setCurrentMonth] = useState(value || toLocalDateKey(new Date()));
  useEffect(() => { if (visible) { const next = value || toLocalDateKey(new Date()); setDraft(next); setCurrentMonth(next); } }, [value, visible]);
  const parsed = parseLocalDate(value);
  const labelValue = parsed?.toLocaleDateString(undefined, displayFormat === 'compact' ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' }) ?? placeholder;
  const markedDates = useMemo(() => draft ? { [draft]: { selected: true, selectedColor: colors.primary, selectedTextColor: colors.primaryText } } : {}, [colors.primary, colors.primaryText, draft]);
  const chooseToday = () => { const today = toLocalDateKey(new Date()); setDraft(today); setCurrentMonth(today); };

  return <View style={styles.field}>
    {!hideLabel ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
    <Pressable accessibilityLabel={`${label}, ${labelValue}`} accessibilityRole="button" onPress={() => setVisible(true)} style={({ pressed }) => [styles.trigger, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }, pressed ? styles.pressed : undefined]}><ThemedText numberOfLines={1} style={[styles.value, !parsed ? { color: colors.textMuted } : undefined]}>{labelValue}</ThemedText><Ionicons color={colors.primary} name="calendar-outline" size={17} /></Pressable>
    {error ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{error}</ThemedText> : null}
    <AppBottomSheet expandable initialSnap={0.68} onClose={() => setVisible(false)} title={pickerTitle ?? `Select ${label.toLowerCase()}`} visible={visible} footer={<View style={styles.footer}><Pressable onPress={() => setVisible(false)} style={styles.footerAction}><ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</ThemedText></Pressable><Pressable onPress={() => { onChange(draft); setVisible(false); }} style={[styles.done, { backgroundColor: colors.primary }]}><ThemedText style={{ color: colors.primaryText, fontWeight: '700' }}>Done</ThemedText></Pressable></View>}>
      <View style={styles.calendarWrap}><Calendar current={currentMonth} enableSwipeMonths firstDay={0} markedDates={markedDates} onDayPress={(day: DateData) => setDraft(day.dateString)} onMonthChange={(month: DateData) => setCurrentMonth(month.dateString)} style={{ backgroundColor: colors.surface }} theme={{ arrowColor: colors.primary, backgroundColor: colors.surface, calendarBackground: colors.surface, dayTextColor: colors.text, monthTextColor: colors.text, selectedDayBackgroundColor: colors.primary, selectedDayTextColor: colors.primaryText, textDayFontSize: 12, textDayHeaderFontSize: 10, textDayHeaderFontWeight: '700', textDayFontWeight: '500', textDisabledColor: colors.textMuted, textMonthFontSize: 15, textMonthFontWeight: '700', todayTextColor: colors.primary }} />
        <View style={styles.quickRow}><QuickAction label="Today" onPress={chooseToday} />{allowClear ? <QuickAction label="Clear" onPress={() => setDraft('')} /> : null}</View>
      </View>
    </AppBottomSheet>
  </View>;
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) { const { colors } = useAppearance(); return <Pressable onPress={onPress} style={({ pressed }) => [styles.quick, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.quickLabel, { color: colors.primary }]}>{label}</ThemedText></Pressable>; }
const styles = StyleSheet.create({ field: { flex: 1, gap: 7, minWidth: 0 }, label: { fontSize: 12, fontWeight: '600', lineHeight: 17 }, trigger: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: 1, flexDirection: 'row', gap: 6, minHeight: 44, paddingHorizontal: 10 }, value: { flex: 1, fontSize: 12, fontWeight: '600' }, error: { fontSize: 11, lineHeight: 15 }, calendarWrap: { flex: 1, paddingHorizontal: DesignTokens.spacing.sm }, quickRow: { flexDirection: 'row', gap: DesignTokens.spacing.sm, paddingHorizontal: DesignTokens.spacing.sm, paddingTop: DesignTokens.spacing.sm }, quick: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 36, paddingHorizontal: DesignTokens.spacing.md }, quickLabel: { fontSize: 11, fontWeight: '700' }, footer: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, footerAction: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 }, done: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, justifyContent: 'center', minHeight: 44 }, pressed: { opacity: 0.68 } });
