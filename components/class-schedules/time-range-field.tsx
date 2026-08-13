import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { dateToStoredTime, formatScheduleTime, storedTimeToDate } from '@/components/ui/time-picker-field';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

type ActivePicker = 'start' | 'end' | null;

export function TimeRangeField({ endError, endTime, onEndChange, onStartChange, startError, startTime }: {
  endError?: string; endTime: string; onEndChange: (value: string) => void;
  onStartChange: (value: string) => void; startError?: string; startTime: string;
}) {
  const { colors, resolvedMode } = useAppearance();
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [draft, setDraft] = useState(() => storedTimeToDate(startTime) ?? new Date());
  const activeValue = activePicker === 'end' ? endTime : startTime;

  useEffect(() => {
    if (activePicker) setDraft(storedTimeToDate(activeValue) ?? roundedNow());
  }, [activePicker, activeValue]);

  function open(which: Exclude<ActivePicker, null>) { setActivePicker(which); }
  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (event.type !== 'dismissed' && selected) setDraft(selected);
  }
  function commit() {
    const value = dateToStoredTime(draft);
    if (activePicker === 'start') onStartChange(value);
    if (activePicker === 'end') onEndChange(value);
    setActivePicker(null);
  }

  return <View style={styles.row}>
    <TimeTrigger error={startError} label="Start time" onPress={() => open('start')} value={startTime} />
    <TimeTrigger error={endError} label="End time" onPress={() => open('end')} value={endTime} />
    <AppBottomSheet
      footer={<View style={styles.footer}><Pressable onPress={() => setActivePicker(null)} style={styles.footerAction}><ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</ThemedText></Pressable><Pressable onPress={commit} style={[styles.done, { backgroundColor: colors.primary }]}><ThemedText style={{ color: colors.primaryText, fontWeight: '700' }}>Set time</ThemedText></Pressable></View>}
      initialSnap={Platform.OS === 'ios' ? 0.58 : 0.5}
      onClose={() => setActivePicker(null)}
      title={`Choose ${activePicker ?? 'start'} time`}
      visible={activePicker !== null}>
      <View style={styles.pickerContent}>
        <ThemedText style={[styles.preview, { color: colors.primary }]}>{draft.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true, minute: '2-digit' })}</ThemedText>
        <DateTimePicker display={Platform.OS === 'ios' ? 'spinner' : 'default'} is24Hour={false} minuteInterval={5} mode="time" onChange={handleChange} themeVariant={resolvedMode} value={draft} />
      </View>
    </AppBottomSheet>
  </View>;
}

function TimeTrigger({ error, label, onPress, value }: { error?: string; label: string; onPress: () => void; value: string }) {
  const { colors } = useAppearance();
  const displayValue = value ? formatScheduleTime(value) : 'Set time';
  return <View style={styles.field}><ThemedText style={styles.label}>{label}</ThemedText><Pressable accessibilityLabel={`${label}, ${displayValue}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.trigger, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }, pressed ? styles.pressed : undefined]}><ThemedText numberOfLines={1} style={styles.value}>{displayValue}</ThemedText><Ionicons color={colors.primary} name="time-outline" size={18} /></Pressable>{error ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{error}</ThemedText> : null}</View>;
}

function roundedNow() { const value = new Date(); value.setSeconds(0, 0); value.setMinutes(Math.ceil(value.getMinutes() / 5) * 5); return value; }

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 }, field: { flex: 1, gap: 7, minWidth: 0 }, label: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  trigger: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 10 },
  value: { flex: 1, fontSize: 12, fontWeight: '600' }, error: { fontSize: 11, lineHeight: 15 }, pressed: { opacity: 0.68 },
  pickerContent: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: DesignTokens.layout.screenPadding }, preview: { fontSize: 25, fontWeight: '700', lineHeight: 32, marginBottom: DesignTokens.spacing.md },
  footer: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, footerAction: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 }, done: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, justifyContent: 'center', minHeight: 44 },
});
