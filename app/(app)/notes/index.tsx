import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { NoteCard } from '@/components/notes/note-card';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { BentoCard } from '@/components/ui/bento-card';
import { ErrorState } from '@/components/ui/async-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { DesignTokens } from '@/constants/theme';
import { useNotes } from '@/contexts/note-context';
import { noteRoutes } from '@/lib/notes/routes';

export default function NotesScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[] }>();
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const { listError, listStatus, loadNotes, notes } = useNotes();
  const refresh = useCallback(() => loadNotes(courseId ? { courseId } : undefined), [courseId, loadNotes]);
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));
  return <AppScreen edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} subtitle={courseId ? 'Notes saved for this course.' : 'Personal and course information worth remembering.'} title={courseId ? 'Course Notes' : 'Notes'} /><ScrollView contentContainerStyle={styles.content}>{listStatus === 'idle' || listStatus === 'loading' ? <LoadingSkeleton rows={3} /> : null}{listStatus === 'error' ? <ErrorState message={listError ?? 'Notes could not be loaded.'} onRetry={() => void refresh().catch(() => undefined)} /> : null}{listStatus === 'success' ? <View style={styles.list}>{notes.length ? notes.map((note) => <NoteCard key={note.id} note={note} onPress={() => router.push(noteRoutes.details(note.id))} />) : <BentoCard tone="subtle"><ThemedText>No notes yet.</ThemedText></BentoCard>}<AppButton label="Add note" onPress={() => router.push(courseId ? noteRoutes.addForCourse(courseId) : noteRoutes.add)} /></View> : null}</ScrollView></AppScreen>;
}
const styles = StyleSheet.create({ content: { padding: DesignTokens.layout.screenPadding }, list: { gap: DesignTokens.spacing.sm } });
