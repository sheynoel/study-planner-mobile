import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import type { TaskPriority, TaskStatus } from '@/lib/api/task.types';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/lib/tasks/task-display';
import { activeTaskFilterCount, type TaskDueSelection, type TaskFilterState } from '@/lib/tasks/task-filters';

const PRIORITIES: readonly TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
const STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const DUE_OPTIONS: readonly { label: string; value: TaskDueSelection }[] = [{ label: 'Any time', value: 'any' }, { label: 'Today', value: 'today' }, { label: 'This week', value: 'this_week' }, { label: 'Overdue', value: 'overdue' }];

export function TaskFilterSheet({ courses, onApply, onClose, value, visible }: { courses: Course[]; onApply: (value: TaskFilterState) => void; onClose: () => void; value: TaskFilterState; visible: boolean }) {
  const { colors } = useAppearance();
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (visible) setDraft(value); }, [value, visible]);
  const reset = () => setDraft((current) => ({ ...current, courseId: undefined, priority: undefined, status: undefined, due: 'any' }));
  const apply = () => {
    const timeView = draft.status === 'COMPLETED' ? 'completed' : draft.due !== 'any' || draft.timeView === 'completed' ? 'all' : draft.timeView;
    onApply({ ...draft, timeView });
    onClose();
  };
  return <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}><View style={styles.overlay}><Pressable accessibilityLabel="Close filters" accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} /><SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.outline }]}><View style={[styles.handle, { backgroundColor: colors.outline }]} /><View style={styles.header}><View><ThemedText type="subtitle">Filter tasks</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{activeTaskFilterCount(draft)} active selections</ThemedText></View><AppButton label="Reset" onPress={reset} variant="ghost" /></View><ScrollView contentContainerStyle={styles.content}>
    <FilterSection label="Course"><ChoiceChip label="All courses" selected={!draft.courseId} onPress={() => setDraft({ ...draft, courseId: undefined })} /><ChoiceChip label="Personal" selected={draft.courseId === 'personal'} onPress={() => setDraft({ ...draft, courseId: 'personal' })} />{courses.map((course) => <ChoiceChip key={course.id} label={course.code ?? course.name} selected={draft.courseId === course.id} onPress={() => setDraft({ ...draft, courseId: course.id })} />)}</FilterSection>
    <FilterSection label="Priority"><ChoiceChip label="Any priority" selected={!draft.priority} onPress={() => setDraft({ ...draft, priority: undefined })} />{PRIORITIES.map((priority) => <ChoiceChip key={priority} label={TASK_PRIORITY_LABELS[priority]} selected={draft.priority === priority} onPress={() => setDraft({ ...draft, priority })} />)}</FilterSection>
    <FilterSection label="Status"><ChoiceChip label="Any status" selected={!draft.status} onPress={() => setDraft({ ...draft, status: undefined })} />{STATUSES.map((status) => <ChoiceChip key={status} label={TASK_STATUS_LABELS[status]} selected={draft.status === status} onPress={() => setDraft({ ...draft, status })} />)}</FilterSection>
    <FilterSection label="Due">{DUE_OPTIONS.map((option) => <ChoiceChip key={option.value} label={option.label} selected={draft.due === option.value} onPress={() => setDraft({ ...draft, due: option.value })} />)}</FilterSection>
  </ScrollView><View style={[styles.footer, { borderTopColor: colors.outline }]}><AppButton label="Show results" onPress={apply} /></View></SafeAreaView></View></Modal>;
}

function FilterSection({ children, label }: { children: React.ReactNode; label: string }) { return <View style={styles.section}><ThemedText type="defaultSemiBold">{label}</ThemedText><View style={styles.choices}>{children}</View></View>; }

const styles = StyleSheet.create({ overlay: { backgroundColor: 'rgba(0,0,0,0.38)', flex: 1, justifyContent: 'flex-end' }, sheet: { borderTopLeftRadius: DesignTokens.radius.xxl, borderTopRightRadius: DesignTokens.radius.xxl, borderWidth: StyleSheet.hairlineWidth, maxHeight: '88%', paddingTop: DesignTokens.spacing.sm, ...Shadows }, handle: { alignSelf: 'center', borderRadius: DesignTokens.radius.pill, height: 4, opacity: 0.45, width: 42 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: DesignTokens.layout.screenPadding, paddingVertical: DesignTokens.spacing.md }, content: { gap: DesignTokens.spacing.xl, paddingHorizontal: DesignTokens.layout.screenPadding, paddingBottom: DesignTokens.spacing.xl }, section: { gap: DesignTokens.spacing.sm }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm }, footer: { borderTopWidth: StyleSheet.hairlineWidth, padding: DesignTokens.layout.screenPadding } });
