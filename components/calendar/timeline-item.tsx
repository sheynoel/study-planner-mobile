import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, PlannerColors } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { formatLocalTime } from '@/lib/calendar/calendar-date';

export function TimelineItem({ item, last = false, onPress }: { item: CalendarItem; last?: boolean; onPress: () => void }) {
  const { colors } = useAppearance();
  const meta = sourceMeta(item.sourceType);
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.container, pressed ? styles.pressed : undefined]}><View style={styles.rail}><View style={[styles.dot, { backgroundColor: meta.color }]}><Ionicons color="#ffffff" name={meta.icon} size={13} /></View>{!last ? <View style={[styles.line, { backgroundColor: colors.outline }]} /> : null}</View><View style={[styles.content, { backgroundColor: colors.surface }]}><View style={styles.heading}><ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>{item.title}</ThemedText><ThemedText style={[styles.time, { color: colors.textSecondary }]}>{item.isAllDay ? 'All day' : formatLocalTime(item.startAt)}</ThemedText></View><ThemedText numberOfLines={1} style={{ color: colors.textSecondary }}>{meta.label} · {item.courseName ?? (item.sourceType === 'task' ? 'Personal task' : 'Personal')}</ThemedText>{item.location ? <ThemedText numberOfLines={1} style={{ color: colors.textSecondary }}>{item.location}</ThemedText> : null}</View></Pressable>;
}

function sourceMeta(type: CalendarItem['sourceType']): { color: string; icon: keyof typeof Ionicons.glyphMap; label: string } {
  if (type === 'task') return { color: PlannerColors.task, icon: 'checkbox-outline', label: 'Task' };
  if (type === 'class_schedule') return { color: PlannerColors.classSchedule, icon: 'school-outline', label: 'Class' };
  return { color: PlannerColors.event, icon: 'calendar-outline', label: 'Event' };
}
const styles = StyleSheet.create({ container: { flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 72 }, rail: { alignItems: 'center', width: 26 }, dot: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, height: 26, justifyContent: 'center', width: 26, zIndex: 2 }, line: { bottom: -6, opacity: 0.5, position: 'absolute', top: 26, width: StyleSheet.hairlineWidth }, content: { borderRadius: DesignTokens.radius.lg, flex: 1, gap: 2, marginBottom: DesignTokens.spacing.sm, padding: DesignTokens.spacing.sm }, heading: { alignItems: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.sm }, title: { flex: 1 }, time: { ...DesignTokens.typography.caption }, pressed: { opacity: 0.72 } });
