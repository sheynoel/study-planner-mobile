import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function formatScheduleTime(value: string): string { const date = storedTimeToDate(value); return date ? date.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true, minute: '2-digit' }) : 'Choose time'; }
export function storedTimeToDate(value: string, base = new Date()): Date | null { const match = /^(\d{2}):(\d{2})$/.exec(value); if (!match) return null; const hours = Number(match[1]); const minutes = Number(match[2]); if (hours > 23 || minutes > 59) return null; return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0, 0); }
export function dateToStoredTime(value: Date): string { return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`; }

export function TimePickerField({ disabled = false, error, hideLabel = false, label, onChange, pickerTitle, placeholder = 'Set time', value }: { disabled?: boolean; error?: string; hideLabel?: boolean; label: string; onChange: (value: string) => void; pickerTitle?: string; placeholder?: string; value: string }) {
  const { colors, resolvedMode } = useAppearance();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(() => storedTimeToDate(value) ?? defaultTime());
  useEffect(() => { if (visible) setDraft(storedTimeToDate(value) ?? defaultTime()); }, [value, visible]);
  const displayValue = value ? formatScheduleTime(value) : placeholder;
  const handleChange = (event: DateTimePickerEvent, selected?: Date) => { if (event.type === 'dismissed') return; if (selected) setDraft(selected); };

  return <View style={styles.field}>
    {!hideLabel ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
    <Pressable accessibilityLabel={`${label}, ${displayValue}`} accessibilityRole="button" disabled={disabled} onPress={() => setVisible(true)} style={({ pressed }) => [styles.trigger, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }, disabled ? styles.disabled : undefined, pressed ? styles.pressed : undefined]}><ThemedText numberOfLines={1} style={[styles.value, !value ? { color: colors.textMuted } : undefined]}>{displayValue}</ThemedText><Ionicons color={disabled ? colors.textMuted : colors.primary} name="time-outline" size={18} /></Pressable>
    {error ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{error}</ThemedText> : null}
    <AppBottomSheet initialSnap={Platform.OS === 'ios' ? 0.58 : 0.5} onClose={() => setVisible(false)} title={pickerTitle ?? `Choose ${label.toLowerCase()}`} visible={visible} footer={<View style={styles.footer}><Pressable onPress={() => setVisible(false)} style={styles.footerAction}><ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</ThemedText></Pressable><Pressable onPress={() => { onChange(dateToStoredTime(draft)); setVisible(false); }} style={[styles.done, { backgroundColor: colors.primary }]}><ThemedText style={{ color: colors.primaryText, fontWeight: '700' }}>Set time</ThemedText></Pressable></View>}>
      <View style={styles.pickerContent}><ThemedText style={[styles.preview, { color: colors.primary }]}>{draft.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true, minute: '2-digit' })}</ThemedText><DateTimePicker display={Platform.OS === 'ios' ? 'spinner' : 'default'} is24Hour={false} minuteInterval={5} mode="time" onChange={handleChange} themeVariant={resolvedMode} value={draft} /></View>
    </AppBottomSheet>
  </View>;
}

function defaultTime(): Date { const now = new Date(); now.setSeconds(0, 0); now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5); return now; }
const styles = StyleSheet.create({ field: { flex: 1, gap: 7, minWidth: 0 }, label: { fontSize: 12, fontWeight: '600', lineHeight: 17 }, trigger: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 10 }, value: { flex: 1, fontSize: 12, fontWeight: '600' }, error: { fontSize: 11, lineHeight: 15 }, pickerContent: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: DesignTokens.layout.screenPadding }, preview: { fontSize: 25, fontWeight: '700', lineHeight: 32, marginBottom: DesignTokens.spacing.md }, footer: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, footerAction: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 }, done: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, justifyContent: 'center', minHeight: 44 }, disabled: { opacity: 0.5 }, pressed: { opacity: 0.68 } });
