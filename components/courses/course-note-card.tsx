import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Note } from '@/lib/api/note.types';

export function CourseNoteCard({ accent, note, onPress, width }: { accent: string; note: Note; onPress: () => void; width: number }) {
  const { colors } = useAppearance();
  const date = note.reminderAt ?? note.relevantAt;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderTopColor: accent, width }, pressed ? styles.pressed : undefined]}>{note.isPinned ? <Ionicons color={accent} name="pin" size={13} style={styles.pin} /> : null}<ThemedText numberOfLines={2} style={styles.title}>{note.title}</ThemedText>{note.content && note.content.trim() !== note.title.trim() ? <ThemedText numberOfLines={3} style={[styles.body, { color: colors.textSecondary }]}>{note.content}</ThemedText> : null}<ThemedText numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>{date ? formatNoteDate(date, Boolean(note.reminderAt)) : note.isPinned ? 'Pinned note' : 'Note'}</ThemedText></Pressable>;
}

function formatNoteDate(value: string, reminder: boolean): string { const date = new Date(value); const prefix = reminder ? 'Reminder' : 'Relevant'; return `${prefix} ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true, minute: '2-digit' })}`; }
const styles = StyleSheet.create({ card: { borderRadius: DesignTokens.radius.md, borderTopWidth: 3, borderWidth: StyleSheet.hairlineWidth, gap: 4, minHeight: 92, padding: DesignTokens.spacing.sm }, pin: { position: 'absolute', right: 8, top: 8 }, title: { fontSize: 13, fontWeight: '800', lineHeight: 17, paddingRight: 15 }, body: { fontSize: 11, lineHeight: 15 }, meta: { fontSize: 9.5, lineHeight: 13, marginTop: 'auto' }, pressed: { opacity: 0.68 } });
