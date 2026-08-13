import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { FormField } from '@/components/auth/auth-form';
import { TimeRangeField } from '@/components/class-schedules/time-range-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/app-button';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { useAppearance } from '@/contexts/appearance-context';
import { useClassSchedules } from '@/contexts/class-schedule-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';

export default function ClassOccurrenceExceptionScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors } = useAppearance();
  const { loadSchedule, upsertException } = useClassSchedules();
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [mode, setMode] = useState<'cancel' | 'change'>('cancel');
  const [date, setDate] = useState(''); const [startTime, setStartTime] = useState(''); const [endTime, setEndTime] = useState(''); const [room, setRoom] = useState('');
  const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);

  useEffect(() => { if (!id) { setError('This schedule link is invalid.'); return; } void loadSchedule(id).then((value) => { setSchedule(value); setDate(nextOccurrenceDate(value)); setStartTime(value.startTime); setEndTime(value.endTime); setRoom(value.room ?? ''); }).catch((reason) => setError(getApiErrorMessage(reason))); }, [id, loadSchedule]);

  async function save() {
    if (!id || saving) return; setSaving(true); setError(null);
    try { await upsertException(id, mode === 'cancel' ? { date, cancelled: true } : { date, cancelled: false, startTimeOverride: startTime, endTimeOverride: endTime, roomOverride: room.trim() || null }); router.back(); }
    catch (reason) { setError(getApiErrorMessage(reason)); setSaving(false); }
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.screen} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} title="Adjust one class" />{schedule ? <ScrollView contentContainerStyle={styles.content}><ThemedText style={{ color: colors.textSecondary }}>This change applies to one date only. The weekly schedule remains intact.</ThemedText><View style={styles.options}><Choice label="Cancel class" selected={mode === 'cancel'} onPress={() => setMode('cancel')} /><Choice label="Change time or room" selected={mode === 'change'} onPress={() => setMode('change')} /></View><DatePickerField label="Occurrence date" onChange={setDate} value={date} />{mode === 'change' ? <><TimeRangeField startTime={startTime} endTime={endTime} onStartChange={setStartTime} onEndChange={setEndTime} /><FormField label="Room for this date" onChangeText={setRoom} value={room} /></> : null}{error ? <ThemedText style={{ color: colors.dangerText }}>{error}</ThemedText> : null}<AppButton label={saving ? 'Saving…' : mode === 'cancel' ? 'Cancel this class' : 'Save one-time change'} loading={saving} onPress={() => void save()} variant={mode === 'cancel' ? 'danger' : 'primary'} /></ScrollView> : <ThemedText style={styles.content}>{error ?? 'Loading schedule…'}</ThemedText>}</SafeAreaView></ThemedView>;
}

function Choice({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) { const { colors } = useAppearance(); return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.surface }]}><ThemedText style={{ color: selected ? colors.primaryText : colors.text, fontWeight: '700' }}>{label}</ThemedText></Pressable>; }
function nextOccurrenceDate(schedule: ClassSchedule) { const start = new Date(`${schedule.startDate}T00:00:00Z`); const today = new Date(); const cursor = new Date(Math.max(start.getTime(), Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))); const target = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].indexOf(schedule.weekday); cursor.setUTCDate(cursor.getUTCDate() + (target - cursor.getUTCDay() + 7) % 7); return cursor.toISOString().slice(0, 10); }
const styles = StyleSheet.create({ screen: { flex: 1 }, content: { gap: 18, padding: 20, paddingBottom: 40 }, options: { flexDirection: 'row', gap: 8 }, choice: { borderRadius: 999, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 12 } });
