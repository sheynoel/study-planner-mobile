import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { formatLocalDate } from '@/lib/calendar/calendar-date';

export function SelectedDateSummary({ classes, events, onPress, selectedDate, tasks }: { classes: number; events: number; onPress: () => void; selectedDate: string; tasks: number }) {
  const { colors } = useAppearance();
  const summary = [countLabel(classes, 'class'), countLabel(tasks, 'task'), countLabel(events, 'event')].filter((label) => !label.startsWith('0 ')).join(' · ') || 'No activity';
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }, pressed ? styles.pressed : undefined]}>
    <View style={styles.text}><ThemedText numberOfLines={1} style={styles.date}>{formatLocalDate(selectedDate)}</ThemedText><ThemedText numberOfLines={1} style={[styles.summary, { color: colors.textSecondary }]}>{summary}</ThemedText></View>
    <Ionicons color={colors.textSecondary} name="chevron-forward" size={16} />
  </Pressable>;
}

function countLabel(value: number, noun: string): string { return `${value} ${noun}${value === 1 ? '' : noun === 'class' ? 'es' : 's'}`; }

const styles = StyleSheet.create({
  row: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 48, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: DesignTokens.spacing.sm },
  text: { flex: 1, minWidth: 0 },
  date: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  summary: { fontSize: 11, lineHeight: 15 },
  pressed: { opacity: 0.65 },
});
