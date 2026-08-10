import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarEvent } from '@/lib/api/calendar-event.types';

export function CourseEventCard({ event, onPress, width }: { event: CalendarEvent; onPress: () => void; width: number }) {
  const { colors } = useAppearance();
  const accent = event.color && /^#[0-9a-fA-F]{6}$/.test(event.color) ? event.color : colors.primary;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, width }, pressed ? styles.pressed : undefined]}><View style={[styles.accent, { backgroundColor: accent }]} /><ThemedText numberOfLines={2} style={styles.title}>{event.title}</ThemedText><ThemedText numberOfLines={1} style={[styles.date, { color: colors.textSecondary }]}>{formatEventDate(event)}</ThemedText>{event.description ? <ThemedText numberOfLines={1} style={[styles.description, { color: colors.textSecondary }]}>{event.description}</ThemedText> : null}</Pressable>;
}

function formatEventDate(event: CalendarEvent): string { const date = new Date(event.startAt); const day = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); return event.isAllDay ? `${day} · All day` : `${day} · ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`; }
const styles = StyleSheet.create({ card: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, gap: 3, minHeight: 94, overflow: 'hidden', padding: DesignTokens.spacing.sm, paddingTop: DesignTokens.spacing.md }, accent: { height: 4, left: 0, position: 'absolute', right: 0, top: 0 }, title: { fontSize: 13, fontWeight: '800', lineHeight: 17, minHeight: 34 }, date: { fontSize: 10.5, fontWeight: '600', lineHeight: 14 }, description: { fontSize: 10, lineHeight: 14 }, pressed: { opacity: 0.68 } });
