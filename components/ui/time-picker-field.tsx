import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);

export function formatScheduleTime(value: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return 'Choose time';
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return 'Choose time';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
}

export function TimePickerField({ disabled = false, error, hideLabel = false, label, onChange, pickerTitle, placeholder = 'Set time', value }: { disabled?: boolean; error?: string; hideLabel?: boolean; label: string; onChange: (value: string) => void; pickerTitle?: string; placeholder?: string; value: string }) {
  const { colors } = useAppearance();
  const initial = useMemo(() => parseTime(value), [value]);
  const [visible, setVisible] = useState(false);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);
  const minuteOptions = useMemo(() => [...new Set([...MINUTES, minute])].sort((a, b) => a - b), [minute]);
  useEffect(() => { if (!visible) { const next = parseTime(value); setHour(next.hour); setMinute(next.minute); setPeriod(next.period); } }, [value, visible]);

  function save() {
    const hour24 = period === 'AM' ? hour % 12 : (hour % 12) + 12;
    onChange(`${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    setVisible(false);
  }

  return <View style={styles.field}>
    {!hideLabel ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
    <Pressable accessibilityLabel={`${label}, ${value ? formatScheduleTime(value) : placeholder}`} accessibilityRole="button" disabled={disabled} onPress={() => setVisible(true)} style={({ pressed }) => [styles.trigger, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }, disabled ? styles.disabled : undefined, pressed ? styles.pressed : undefined]}>
      <ThemedText style={[styles.value, !value ? { color: colors.textMuted } : undefined]}>{value ? formatScheduleTime(value) : placeholder}</ThemedText><Ionicons color={disabled ? colors.textMuted : colors.primary} name="time-outline" size={18} />
    </Pressable>
    {error ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{error}</ThemedText> : null}
    <Modal animationType="slide" onRequestClose={() => setVisible(false)} transparent visible={visible}>
      <View style={styles.overlay}><Pressable accessibilityLabel="Close time picker" onPress={() => setVisible(false)} style={StyleSheet.absoluteFill} />
        <SafeAreaView edges={['bottom']} style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.modalHeader}><ThemedText style={styles.modalTitle}>{pickerTitle ?? `Select ${label.toLowerCase()}`}</ThemedText></View>
          <ThemedText style={[styles.preview, { color: colors.primary }]}>{hour}:{String(minute).padStart(2, '0')} {period}</ThemedText>
          <PickerGroup label="Hour">{HOURS.map((item) => <PickerChip key={item} label={String(item)} onPress={() => setHour(item)} selected={item === hour} />)}</PickerGroup>
          <PickerGroup label="Minutes">{minuteOptions.map((item) => <PickerChip key={item} label={String(item).padStart(2, '0')} onPress={() => setMinute(item)} selected={item === minute} />)}</PickerGroup>
          <View style={styles.periodRow}>{(['AM', 'PM'] as const).map((item) => <PickerChip key={item} label={item} onPress={() => setPeriod(item)} selected={item === period} wide />)}</View>
          <View style={[styles.footer, { borderTopColor: colors.border }]}><Pressable onPress={() => setVisible(false)} style={styles.cancel}><ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</ThemedText></Pressable><Pressable onPress={save} style={({ pressed }) => [styles.done, { backgroundColor: colors.primary }, pressed ? styles.pressed : undefined]}><ThemedText style={{ color: colors.primaryText, fontWeight: '700' }}>Done</ThemedText></Pressable></View>
        </SafeAreaView>
      </View>
    </Modal>
  </View>;
}

function PickerGroup({ children, label }: React.PropsWithChildren<{ label: string }>) { return <View style={styles.group}><ThemedText style={styles.groupLabel}>{label}</ThemedText><View style={styles.chips}>{children}</View></View>; }
function PickerChip({ label, onPress, selected, wide = false }: { label: string; onPress: () => void; selected: boolean; wide?: boolean }) { const { colors } = useAppearance(); return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.chip, wide ? styles.wideChip : undefined, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primaryContainer : colors.surfaceSubtle }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.chipLabel, selected ? { color: colors.primary } : undefined]}>{label}</ThemedText></Pressable>; }
function parseTime(value: string) { const match = /^(\d{2}):(\d{2})$/.exec(value); const hours = match ? Number(match[1]) : 9; const minute = match ? Number(match[2]) : 0; return { hour: hours % 12 || 12, minute: Math.min(59, minute), period: (hours >= 12 ? 'PM' : 'AM') as 'AM' | 'PM' }; }

const styles = StyleSheet.create({
  field: { flex: 1, gap: 7, minWidth: 0 }, label: { fontSize: 13, fontWeight: '600', lineHeight: 18 }, trigger: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 12 }, value: { fontSize: 13, fontWeight: '600' }, error: { fontSize: 11, lineHeight: 15 }, pressed: { opacity: 0.68 }, disabled: { opacity: 0.5 }, overlay: { backgroundColor: 'rgba(12, 15, 18, 0.42)', flex: 1, justifyContent: 'flex-end' }, modalCard: { borderTopLeftRadius: DesignTokens.radius.xxl, borderTopRightRadius: DesignTokens.radius.xxl, borderWidth: StyleSheet.hairlineWidth, gap: DesignTokens.spacing.md, padding: DesignTokens.spacing.lg, paddingTop: DesignTokens.spacing.sm, ...Shadows }, handle: { alignSelf: 'center', borderRadius: 999, height: 4, opacity: 0.5, width: 42 }, modalHeader: { paddingTop: DesignTokens.spacing.sm }, modalTitle: { fontSize: 17, fontWeight: '800', lineHeight: 22 }, preview: { fontSize: 28, fontWeight: '700', lineHeight: 34, textAlign: 'center' }, group: { gap: 7 }, groupLabel: { fontSize: 12, fontWeight: '700' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, chip: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, borderWidth: 1, justifyContent: 'center', minHeight: 34, width: '14.8%' }, wideChip: { flex: 1, width: undefined }, chipLabel: { fontSize: 12, fontWeight: '700' }, periodRow: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, footer: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.sm, paddingTop: DesignTokens.spacing.md }, cancel: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 }, done: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, justifyContent: 'center', minHeight: 44 },
});
