import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { TaskPriorityChip, TaskStatusChip } from '@/components/tasks/task-chips';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Course } from '@/lib/api/course.types';
import type { Task } from '@/lib/api/task.types';
import { formatTaskDate, isTaskOverdue } from '@/lib/tasks/task-display';

export function TaskCard({
  course,
  isCompleting,
  onComplete,
  onPress,
  task,
}: {
  course?: Course;
  isCompleting: boolean;
  onComplete: () => void;
  onPress: () => void;
  task: Task;
}) {
  const overdue = isTaskOverdue(task);
  const completed = task.status === 'COMPLETED';

  return (
    <ThemedView
      style={[styles.card, completed ? styles.completedCard : undefined]}
      lightColor="#f8fafc"
      darkColor="#1e293b">
      <Pressable
        accessibilityHint="Opens task details"
        accessibilityLabel={task.title}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
        <View style={styles.headingRow}>
          <ThemedText
            type="subtitle"
            numberOfLines={2}
            style={[styles.title, completed ? styles.completedTitle : undefined]}>
            {task.title}
          </ThemedText>
          <TaskPriorityChip priority={task.priority} />
        </View>
        <ThemedText numberOfLines={1}>
          {course ? `${course.name}${course.code ? ` (${course.code})` : ''}` : 'Personal task'}
        </ThemedText>
        <ThemedText
          type={overdue ? 'defaultSemiBold' : 'default'}
          lightColor={overdue ? '#b91c1c' : undefined}
          darkColor={overdue ? '#fecaca' : undefined}>
          {overdue ? `Overdue · ${formatTaskDate(task.dueAt)}` : formatTaskDate(task.dueAt)}
        </ThemedText>
        <TaskStatusChip status={task.status} />
      </Pressable>

      {!completed ? (
        <Pressable
          accessibilityRole="button"
          disabled={isCompleting}
          onPress={onComplete}
          style={({ pressed }) => [
            styles.completeButton,
            isCompleting ? styles.disabled : undefined,
            pressed && !isCompleting ? styles.pressed : undefined,
          ]}>
          {isCompleting ? <ActivityIndicator color="#ffffff" size="small" /> : null}
          <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
            {isCompleting ? 'Completing...' : 'Mark complete'}
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completedCard: {
    opacity: 0.72,
  },
  content: {
    gap: 8,
    padding: 18,
  },
  headingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  completeButton: {
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.75,
  },
});
