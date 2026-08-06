import { Pressable, StyleSheet, View } from 'react-native';

import { TaskPriorityChip } from '@/components/tasks/task-chips';
import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Task } from '@/lib/api/task.types';
import { formatTaskDate } from '@/lib/tasks/task-display';

export function UpcomingDeadlineCard({ courseName, onPress, task }: { courseName?: string; onPress: () => void; task: Task }) {
  const { colors } = useAppearance();
  return (
    <AppCard padded={false} style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
        <View style={styles.heading}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>{task.title}</ThemedText>
          <TaskPriorityChip priority={task.priority} />
        </View>
        <ThemedText numberOfLines={1}>{courseName ?? 'Personal task'}</ThemedText>
        <ThemedText style={{ color: colors.textMuted }}>Due {formatTaskDate(task.dueAt)}</ThemedText>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({ card: { borderRadius: DesignTokens.radius.lg }, content: { gap: DesignTokens.spacing.xs, padding: DesignTokens.layout.cardPadding }, heading: { alignItems: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.sm }, title: { flex: 1 }, pressed: { opacity: 0.72 } });
