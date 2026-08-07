import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { BentoCard } from '@/components/ui/bento-card';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { useNotes } from '@/contexts/note-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Note } from '@/lib/api/note.types';
import { noteRoutes } from '@/lib/notes/routes';

export default function NoteDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>(); const id = Array.isArray(params.id) ? params.id[0] : params.id; const { colors } = useAppearance(); const { courses, loadCourses } = useCourses(); const { deleteNote, getCachedNote, loadNote } = useNotes(); const [note, setNote] = useState<Note | null>(() => id ? getCachedNote(id) ?? null : null); const [error, setError] = useState<string | null>(null); const [deleting, setDeleting] = useState(false);
  const refresh = useCallback(async () => { if (!id) { setError('This note link is invalid.'); return; } setError(null); try { const loaded = await loadNote(id); setNote(loaded); await loadCourses().catch(() => undefined); } catch (reason) { setError(getApiErrorMessage(reason)); } }, [id, loadCourses, loadNote]); useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  function confirmDelete() { if (!id) return; showDestructiveConfirmation({ title: 'Delete note?', message: 'This permanently removes the note.', onConfirm: () => { setDeleting(true); void deleteNote(id).then(() => router.back()).catch((reason) => { setError(getApiErrorMessage(reason)); setDeleting(false); }); } }); }
  const course = note?.courseId ? courses.find((item) => item.id === note.courseId) : null;
  return <AppScreen edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} onRightAction={note && id ? () => router.push(noteRoutes.edit(id)) : undefined} rightActionLabel={note ? 'Edit' : undefined} title="Note" />{!note && !error ? <LoadingState label="Loading note..." /> : null}{error && !note ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}{note ? <ScrollView contentContainerStyle={styles.content}><BentoCard style={styles.hero} tone={note.isPinned ? 'accent' : 'surface'}><ThemedText style={styles.title}>{note.title}</ThemedText>{note.content ? <ThemedText>{note.content}</ThemedText> : null}</BentoCard><BentoCard style={styles.details}><Detail label="Course" value={course?.name ?? 'Personal'} muted={colors.textSecondary} /><Detail label="Relevant" value={note.relevantAt ? new Date(note.relevantAt).toLocaleString() : 'No date'} muted={colors.textSecondary} /><Detail label="Reminder" value={note.reminderAt ? new Date(note.reminderAt).toLocaleString() : 'No reminder'} muted={colors.textSecondary} /><Detail label="Pinned" value={note.isPinned ? 'Yes' : 'No'} muted={colors.textSecondary} /></BentoCard><ErrorBanner message={error} /><AppButton label={deleting ? 'Deleting note...' : 'Delete note'} loading={deleting} onPress={confirmDelete} variant="danger" /></ScrollView> : null}</AppScreen>;
}
function Detail({ label, muted, value }: { label: string; muted: string; value: string }) { return <View><ThemedText style={[styles.label, { color: muted }]}>{label}</ThemedText><ThemedText>{value}</ThemedText></View>; }
const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, padding: DesignTokens.layout.screenPadding }, hero: { gap: DesignTokens.spacing.sm }, title: { fontSize: 22, fontWeight: '700', lineHeight: 28 }, details: { gap: DesignTokens.spacing.md }, label: { fontSize: 11, fontWeight: '700', lineHeight: 15 } });
