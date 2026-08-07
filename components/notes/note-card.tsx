import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Note } from '@/lib/api/note.types';

export function NoteCard({ note, onPress }: { note: Note; onPress: () => void }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, pressed ? styles.pressed : undefined]}><View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}><Ionicons color={colors.primary} name={note.isPinned ? 'pin' : 'document-text-outline'} size={16} /></View><View style={styles.content}><ThemedText numberOfLines={1} style={styles.title}>{note.title}</ThemedText><ThemedText numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>{note.relevantAt ? `Relevant ${new Date(note.relevantAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}` : 'No relevant date'}{note.reminderAt ? ' · Reminder set' : ''}</ThemedText></View><Ionicons color={colors.textSecondary} name="chevron-forward" size={16} /></Pressable>;
}
const styles = StyleSheet.create({ card: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 58, padding: DesignTokens.spacing.sm }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.sm, height: 32, justifyContent: 'center', width: 32 }, content: { flex: 1, minWidth: 0 }, title: { fontSize: 13, fontWeight: '700', lineHeight: 18 }, meta: { fontSize: 10, lineHeight: 14 }, pressed: { opacity: 0.68 } });
