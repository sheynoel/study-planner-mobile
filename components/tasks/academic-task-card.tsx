import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { TaskDeadlineLabel } from '@/components/tasks/task-deadline-label';
import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import type { Task } from '@/lib/api/task.types';
import { TASK_PRIORITY_LABELS } from '@/lib/tasks/task-display';

export function AcademicTaskCard({ course, isCompleting = false, onComplete, onPress, task }: { course?: Course; isCompleting?: boolean; onComplete: () => void; onPress: () => void; task: Task }) {
  const { colors } = useAppearance();
  const accent = validColor(course?.color) ? course!.color : course ? colors.primary : colors.textMuted;
  const courseLabel = course?.code?.trim() || course?.name || 'Personal';
  const completed = task.status === 'COMPLETED';
  return <AppCard padded={false} style={[styles.card, { borderLeftColor: accent }]}>
    <View style={styles.row}>
      <Pressable accessibilityLabel={completed ? `${task.title} is completed` : `Complete ${task.title}`} accessibilityRole="checkbox" accessibilityState={{ checked: completed, disabled: isCompleting || completed }} disabled={isCompleting || completed} hitSlop={4} onPress={onComplete} style={({ pressed }) => [styles.checkTarget, pressed ? styles.pressed : undefined]}>
        <View style={[styles.checkbox, { borderColor: accent, backgroundColor: completed ? accent : colors.surface }]}>{isCompleting ? <ActivityIndicator color={accent} size={12} /> : completed ? <Ionicons color={colors.primaryText} name="checkmark" size={13} /> : null}</View>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.body, pressed ? styles.pressed : undefined]}>
        <ThemedText numberOfLines={1} style={[styles.title, completed ? styles.completedTitle : undefined]}>{task.title}</ThemedText>
        <View style={styles.meta}>
          <ThemedText numberOfLines={1} style={[styles.course, { color: colors.textSecondary }]}>{courseLabel}</ThemedText>
          <View style={[styles.metaDot, { backgroundColor: colors.outline }]} />
          <TaskDeadlineLabel compact task={task} />
          <View style={styles.spacer} />
          <View style={[styles.priorityDot, { backgroundColor: priorityColor(task.priority, colors) }]} />
          <ThemedText style={[styles.priority, { color: colors.textSecondary }]}>{TASK_PRIORITY_LABELS[task.priority]}</ThemedText>
        </View>
      </Pressable>
    </View>
  </AppCard>;
}

function validColor(value?: string): value is string { return Boolean(value && (/^#[0-9a-fA-F]{6}$/.test(value) || /^#[0-9a-fA-F]{3}$/.test(value))); }
function priorityColor(priority: Task['priority'], colors: ReturnType<typeof useAppearance>['colors']): string { return priority === 'HIGH' ? colors.overdue : priority === 'MEDIUM' ? colors.warning : colors.textMuted; }

const styles = StyleSheet.create({ card: { borderLeftWidth: 3, borderRadius: DesignTokens.radius.md }, row: { alignItems: 'center', flexDirection: 'row', minHeight: 62 }, checkTarget: { alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center', width: 46 }, checkbox: { alignItems: 'center', borderRadius: 999, borderWidth: 1.5, height: 21, justifyContent: 'center', width: 21 }, body: { flex: 1, gap: 3, justifyContent: 'center', minHeight: 62, paddingRight: DesignTokens.spacing.md, paddingVertical: 8 }, title: { fontSize: 14, fontWeight: '600', lineHeight: 18 }, completedTitle: { opacity: 0.68, textDecorationLine: 'line-through' }, meta: { alignItems: 'center', flexDirection: 'row', gap: 5, minWidth: 0 }, course: { flexShrink: 1, fontSize: 10, fontWeight: '600', lineHeight: 13, maxWidth: '34%' }, metaDot: { borderRadius: 2, height: 3, width: 3 }, spacer: { flex: 1 }, priorityDot: { borderRadius: 3, height: 5, width: 5 }, priority: { fontSize: 9, fontWeight: '600', lineHeight: 12 }, pressed: { opacity: 0.62 } });
