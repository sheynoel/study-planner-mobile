import { Pressable, StyleSheet, View } from 'react-native';

import { TaskPriorityChip, TaskStatusChip } from '@/components/tasks/task-chips';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
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
  const { colors } = useAppearance();
  const overdue = isTaskOverdue(task);
  const completed = task.status === 'COMPLETED';

  return (
    <AppCard
      padded={false}
      style={[styles.card, completed ? styles.completedCard : undefined]}
      >
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
          style={overdue ? { color: colors.overdue } : undefined}>
          {overdue ? `Overdue · ${formatTaskDate(task.dueAt)}` : formatTaskDate(task.dueAt)}
        </ThemedText>
        <TaskStatusChip status={task.status} />
      </Pressable>

      {!completed ? (
        <AppButton label={isCompleting ? 'Completing...' : 'Mark complete'} loading={isCompleting} onPress={onComplete} style={styles.completeButton} />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignTokens.radius.lg,
    overflow: 'hidden',
  },
  completedCard: {
    opacity: 0.72,
  },
  content: {
    gap: 8,
    padding: DesignTokens.layout.cardPadding,
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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  pressed: {
    opacity: 0.75,
  },
});
