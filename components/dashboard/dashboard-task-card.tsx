import { Pressable, StyleSheet, View } from 'react-native';

import { TaskPriorityChip } from '@/components/tasks/task-chips';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Task } from '@/lib/api/task.types';

export function DashboardTaskCard({
  courseName,
  isCompleting,
  onComplete,
  onPress,
  task,
}: {
  courseName?: string;
  isCompleting: boolean;
  onComplete: () => void;
  onPress: () => void;
  task: Task;
}) {
  const { colors } = useAppearance();
  return (
    <AppCard padded={false} style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
        <View style={styles.heading}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>{task.title}</ThemedText>
          <TaskPriorityChip priority={task.priority} />
        </View>
        <ThemedText numberOfLines={1}>{courseName ?? 'Personal task'}</ThemedText>
        {task.dueAt ? <ThemedText style={{ color: colors.textMuted }}>Due {new Date(task.dueAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</ThemedText> : null}
      </Pressable>
      <AppButton label={isCompleting ? 'Completing...' : 'Complete'} loading={isCompleting} onPress={onComplete} style={styles.complete} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: DesignTokens.radius.lg, overflow: 'hidden' },
  content: { gap: DesignTokens.spacing.xs, padding: DesignTokens.layout.cardPadding },
  heading: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  title: { flex: 1 },
  complete: { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  pressed: { opacity: 0.72 },
});
