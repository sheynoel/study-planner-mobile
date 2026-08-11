import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ErrorBanner } from '@/components/auth/auth-form';
import { NoteForm } from '@/components/notes/note-form';
import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { useNotes } from '@/contexts/note-context';
import { parseLocalDate } from '@/lib/calendar/calendar-date';
import { createNoteForm, type NoteFormValues, toCreateNoteRequest } from '@/lib/notes/note-form';

export default function AddNoteScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[]; date?: string | string[] }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const requestedDate = Array.isArray(params.date) ? params.date[0] : params.date;
  const { colors } = useAppearance();
  const navigation = useNavigation();
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const { createNote } = useNotes();
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const allowClose = useRef(false);
  const initialValues = useMemo(() => ({ ...createNoteForm(courseId ?? null), relevantDate: requestedDate && parseLocalDate(requestedDate) ? requestedDate : '' }), [courseId, requestedDate]);
  const refresh = useCallback(() => loadCourses(), [loadCourses]);
  useEffect(() => { void refresh().catch(() => undefined); }, [refresh]);
  usePreventRemove(dirty && !allowClose.current, ({ data }) => { Alert.alert('Discard this note?', 'Your unsaved note will be lost.', [{ text: 'Keep writing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) }]); });
  const close = useCallback(() => { if (!submitting) router.back(); }, [submitting]);
  async function handleCreate(values: NoteFormValues) { await createNote(toCreateNoteRequest(values)); allowClose.current = true; setDirty(false); router.back(); }

  return <AppBottomSheet expandable expandedSnap={0.96} initialSnap={0.68} modal={false} onClose={close} title="Add Note">
    {listStatus === 'idle' || listStatus === 'loading' ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /><ThemedText style={{ color: colors.textSecondary }}>Loading courses…</ThemedText></View> : null}
    {listStatus === 'error' ? <View style={styles.error}><ErrorBanner message={listError ?? 'Courses could not be loaded.'} /><Pressable onPress={() => void refresh().catch(() => undefined)} style={styles.retry}><ThemedText style={{ color: colors.primary, fontWeight: '700' }}>Retry</ThemedText></Pressable></View> : null}
    {listStatus === 'success' ? <NoteForm autoFocusBody courses={courses} initialValues={initialValues} loadingLabel="Saving…" lockCourse={Boolean(courseId)} onDirtyChange={setDirty} onSubmit={handleCreate} onSubmittingChange={setSubmitting} submitLabel="Save" /> : null}
  </AppBottomSheet>;
}

const styles = StyleSheet.create({ loading: { alignItems: 'center', flex: 1, gap: DesignTokens.spacing.sm, justifyContent: 'center' }, error: { flex: 1, gap: DesignTokens.spacing.sm, justifyContent: 'center', paddingHorizontal: DesignTokens.layout.screenPadding }, retry: { alignItems: 'center', minHeight: DesignTokens.size.touchTarget, justifyContent: 'center' } });
