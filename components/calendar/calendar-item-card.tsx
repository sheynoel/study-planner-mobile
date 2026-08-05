import { Pressable, StyleSheet, View } from 'react-native';

import { TaskPriorityChip, TaskStatusChip } from '@/components/tasks/task-chips';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import { formatLocalTime } from '@/lib/calendar/calendar-date';
import { isCalendarTaskOverdue } from '@/lib/calendar/calendar-items';

export function CalendarItemCard({ item, onPress }: { item: CalendarItem; onPress: () => void }) {
  const isTask = item.sourceType === 'task';
  const isClass = item.sourceType === 'class_schedule';
  const completed = item.status === 'COMPLETED';
  const overdue = isCalendarTaskOverdue(item);

  return (
    <ThemedView style={[styles.card, completed ? styles.completed : undefined]} lightColor="#f8fafc" darkColor="#1e293b">
      <View style={[styles.sourceBar, { backgroundColor: safeColor(item) }]} />
      <Pressable accessibilityHint={`Opens ${isTask ? 'task' : isClass ? 'class schedule' : 'event'} details`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
        <View style={styles.heading}>
          <View style={[styles.sourceBadge, isTask ? styles.taskBadge : isClass ? styles.classBadge : styles.eventBadge]}>
            <ThemedText style={styles.sourceText}>{isTask ? 'TASK' : isClass ? 'CLASS' : 'EVENT'}</ThemedText>
          </View>
          <ThemedText type="subtitle" numberOfLines={2} style={[styles.title, completed ? styles.completedTitle : undefined]}>{item.title}</ThemedText>
        </View>
        <ThemedText numberOfLines={1}>{item.courseName ?? (isTask ? 'Personal task' : 'Personal event')}</ThemedText>
        {isTask && item.priority && item.status ? (
          <View style={styles.chips}><TaskPriorityChip priority={item.priority} /><TaskStatusChip status={item.status} /></View>
        ) : (
          <ThemedText>{item.isAllDay ? 'All day' : eventTime(item)}{item.location ? ` · ${item.location}` : ''}</ThemedText>
        )}
        {overdue ? <ThemedText type="defaultSemiBold" lightColor="#b91c1c" darkColor="#fecaca">Overdue deadline</ThemedText> : null}
      </Pressable>
    </ThemedView>
  );
}

function eventTime(item: CalendarItem): string {
  const start = formatLocalTime(item.startAt);
  return item.endAt ? `${start} – ${formatLocalTime(item.endAt)}` : start;
}

function safeColor(item: CalendarItem): string {
  if (item.color && /^#[0-9a-fA-F]{6}$/.test(item.color)) return item.color;
  if (item.sourceType === 'task') return '#ea580c';
  return item.sourceType === 'class_schedule' ? '#0f766e' : '#7c3aed';
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, flexDirection: 'row', overflow: 'hidden' },
  sourceBar: { width: 6 },
  content: { flex: 1, gap: 7, padding: 15 },
  heading: { alignItems: 'flex-start', flexDirection: 'row', gap: 9 },
  title: { flex: 1 },
  sourceBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  eventBadge: { backgroundColor: '#7c3aed' },
  taskBadge: { backgroundColor: '#ea580c' },
  classBadge: { backgroundColor: '#0f766e' },
  sourceText: { color: '#ffffff', fontSize: 10, fontWeight: '800', lineHeight: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  completed: { opacity: 0.68 },
  completedTitle: { textDecorationLine: 'line-through' },
  pressed: { opacity: 0.72 },
});
