import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/app-header';
import { ErrorBanner, FormField } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { useAuth } from '@/contexts/auth-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import { addSemesterHoliday, createSemester, getSemesters, updateSemester, type Semester } from '@/lib/api/semesters';

export default function SemestersScreen() {
  const { accessToken } = useAuth(); const [semesters, setSemesters] = useState<Semester[]>([]); const [title, setTitle] = useState(''); const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState(''); const [holidayDate, setHolidayDate] = useState(''); const [holidayTitle, setHolidayTitle] = useState(''); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const refresh = useCallback(async () => { if (!accessToken) return; try { setSemesters(await getSemesters(accessToken)); } catch (reason) { setError(getApiErrorMessage(reason)); } }, [accessToken]);
  useEffect(() => { void refresh(); }, [refresh]);
  async function saveSemester() { if (!accessToken || saving) return; setSaving(true); setError(null); try { await createSemester(accessToken, { title: title.trim(), startDate, endDate, isActive: true }); setTitle(''); await refresh(); } catch (reason) { setError(getApiErrorMessage(reason)); } finally { setSaving(false); } }
  async function activate(semester: Semester) { if (!accessToken) return; setError(null); try { await updateSemester(accessToken, semester.id, { title: semester.title, startDate: semester.startDate, endDate: semester.endDate, isActive: true }); await refresh(); } catch (reason) { setError(getApiErrorMessage(reason)); } }
  async function addHoliday() { const active = semesters.find((item) => item.isActive); if (!accessToken || !active) return; setError(null); try { await addSemesterHoliday(accessToken, active.id, { date: holidayDate, title: holidayTitle.trim() }); setHolidayTitle(''); await refresh(); } catch (reason) { setError(getApiErrorMessage(reason)); } }
  const active = semesters.find((item) => item.isActive);
  return <AppScreen edges={['top', 'bottom']}><AppHeader compactTitle onBack={() => router.back()} title="Semesters" /><ScrollView contentContainerStyle={styles.content}><ErrorBanner message={error} />{semesters.map((semester) => <AppCard key={semester.id} style={styles.card}><View style={styles.row}><View style={styles.flex}><ThemedText type="defaultSemiBold">{semester.title}</ThemedText><ThemedText>{semester.startDate} – {semester.endDate}</ThemedText></View>{semester.isActive ? <ThemedText>Active</ThemedText> : <AppButton label="Make active" onPress={() => void activate(semester)} variant="secondary" />}</View>{semester.holidays.map((holiday) => <ThemedText key={holiday.id}>{holiday.date} · {holiday.title}</ThemedText>)}</AppCard>)}<AppCard style={styles.card}><ThemedText type="subtitle">New active semester</ThemedText><FormField label="Semester title" onChangeText={setTitle} value={title} /><View style={styles.row}><DatePickerField label="Starts" onChange={setStartDate} value={startDate} /><DatePickerField label="Ends" onChange={setEndDate} value={endDate} /></View><AppButton label={saving ? 'Saving…' : 'Create semester'} loading={saving} onPress={() => void saveSemester()} /></AppCard>{active ? <AppCard style={styles.card}><ThemedText type="subtitle">Add no-class date</ThemedText><DatePickerField label="Holiday date" onChange={setHolidayDate} value={holidayDate} /><FormField label="Holiday name" onChangeText={setHolidayTitle} value={holidayTitle} /><AppButton label="Add holiday" onPress={() => void addHoliday()} variant="secondary" /></AppCard> : null}</ScrollView></AppScreen>;
}
const styles = StyleSheet.create({ content: { gap: 14, padding: 20, paddingBottom: 40 }, card: { gap: 12 }, row: { alignItems: 'center', flexDirection: 'row', gap: 10 }, flex: { flex: 1, gap: 3 } });
