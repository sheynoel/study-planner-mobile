import { StyleSheet, View } from 'react-native';

import { TaskPreviewCard } from '@/components/tasks/task-preview-card';
import { SectionHeader } from '@/components/ui/section-header';
import { DesignTokens } from '@/constants/theme';
import type { Task } from '@/lib/api/task.types';

export function TaskGroupSection({ completingIds, courseName, onComplete, onOpen, tasks, title }: { completingIds: Set<string>; courseName: (courseId: string) => string | undefined; onComplete: (id: string) => void; onOpen: (id: string) => void; tasks: Task[]; title: string }) {
  return <View style={styles.group}><SectionHeader title={title} />{tasks.map((task) => <TaskPreviewCard courseName={task.courseId ? courseName(task.courseId) : undefined} isCompleting={completingIds.has(task.id)} key={task.id} onComplete={() => onComplete(task.id)} onPress={() => onOpen(task.id)} task={task} />)}</View>;
}

const styles = StyleSheet.create({ group: { gap: DesignTokens.spacing.md, paddingHorizontal: DesignTokens.layout.screenPadding } });
