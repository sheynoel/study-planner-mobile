import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { NoteForm } from '@/components/notes/note-form';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCourses } from '@/contexts/course-context';
import { useNotes } from '@/contexts/note-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Note } from '@/lib/api/note.types';
import { noteToForm, type NoteFormValues, toUpdateNoteRequest } from '@/lib/notes/note-form';
import { noteRoutes } from '@/lib/notes/routes';

export default function EditNoteScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>(); const id = Array.isArray(params.id) ? params.id[0] : params.id; const { courses, loadCourses } = useCourses(); const { loadNote, updateNote } = useNotes(); const [note, setNote] = useState<Note | null>(null); const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { if (!id) { setError('This note link is invalid.'); return; } try { const loaded = await loadNote(id); setNote(loaded); await loadCourses().catch(() => undefined); } catch (reason) { setError(getApiErrorMessage(reason)); } }, [id, loadCourses, loadNote]);
  useEffect(() => { void refresh(); }, [refresh]);
  async function save(values: NoteFormValues) { if (!id) return; await updateNote(id, toUpdateNoteRequest(values)); if (router.canGoBack()) router.back(); else router.replace(noteRoutes.details(id)); }
  return <ThemedView style={styles.screen}><SafeAreaView edges={['top', 'bottom']} style={styles.screen}><AppHeader onBack={() => router.back()} subtitle="Update what you want to remember." title="Edit note" />{!note && !error ? <LoadingState label="Loading note..." /> : null}{error && !note ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}{note ? <NoteForm courses={courses} initialValues={noteToForm(note)} loadingLabel="Saving changes..." onSubmit={save} submitLabel="Save changes" /> : null}</SafeAreaView></ThemedView>;
}
const styles = StyleSheet.create({ screen: { flex: 1 } });
