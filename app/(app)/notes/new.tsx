import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { NoteForm } from '@/components/notes/note-form';
import { ThemedView } from '@/components/themed-view';
import { LoadingState } from '@/components/ui/async-state';
import { DesignTokens } from '@/constants/theme';
import { useCourses } from '@/contexts/course-context';
import { useNotes } from '@/contexts/note-context';
import { createNoteForm, type NoteFormValues, toCreateNoteRequest } from '@/lib/notes/note-form';
import { noteRoutes } from '@/lib/notes/routes';

export default function AddNoteScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[] }>(); const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const { courses, listError, listStatus, loadCourses } = useCourses(); const { createNote } = useNotes(); const refresh = useCallback(() => loadCourses(), [loadCourses]);
  useEffect(() => { void refresh().catch(() => undefined); }, [refresh]);
  async function handleCreate(values: NoteFormValues) { const note = await createNote(toCreateNoteRequest(values)); router.replace(noteRoutes.details(note.id)); }
  return <ThemedView style={styles.screen}><SafeAreaView edges={['top', 'bottom']} style={styles.screen}><AppHeader onBack={() => router.back()} subtitle="Save something worth remembering." title="New note" />{listStatus === 'idle' || listStatus === 'loading' ? <LoadingState label="Loading courses..." /> : null}{listStatus === 'error' ? <View style={styles.error}><ErrorBanner message={`${listError ?? 'Courses could not be loaded.'} You can still save a Personal note.`} /></View> : null}{listStatus === 'success' || listStatus === 'error' ? <NoteForm courses={courses} initialValues={createNoteForm(courseId ?? null)} loadingLabel="Saving note..." onSubmit={handleCreate} submitLabel="Save note" /> : null}</SafeAreaView></ThemedView>;
}
const styles = StyleSheet.create({ screen: { flex: 1 }, error: { paddingHorizontal: DesignTokens.layout.screenPadding } });
