import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { TaskPriority, TaskStatus } from '@/lib/api/task.types';
import { activeTaskFilterCount, type TaskDueSelection, type TaskFilterState } from '@/lib/tasks/task-filters';

const STATUS_OPTIONS: readonly { label: string; value?: TaskStatus }[] = [{ label: 'Active' }, { label: 'Assigned', value: 'TODO' }, { label: 'In progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }];
const PRIORITY_OPTIONS: readonly { label: string; value?: TaskPriority }[] = [{ label: 'Any' }, { label: 'High', value: 'HIGH' }, { label: 'Medium', value: 'MEDIUM' }, { label: 'Low', value: 'LOW' }];
const DUE_OPTIONS: readonly { label: string; value: TaskDueSelection }[] = [{ label: 'Any', value: 'any' }, { label: 'Today', value: 'today' }, { label: 'This week', value: 'this_week' }, { label: 'This month', value: 'this_month' }, { label: 'Overdue', value: 'overdue' }];

export function TaskFilterSheet({ onApply, onClose, value, visible }: { onApply: (value: TaskFilterState) => void; onClose: () => void; value: TaskFilterState; visible: boolean }) {
  const { colors } = useAppearance();
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (visible) setDraft(value); }, [value, visible]);
  const reset = () => setDraft((current) => ({ ...current, priority: undefined, status: undefined, due: 'any' }));
  const apply = () => { onApply(draft); onClose(); };
  return <AppBottomSheet expandable initialSnap={0.7} onClose={onClose} title="Filter Tasks" visible={visible} footer={<AppButton label="Apply" onPress={apply} />}>
        <View style={styles.header}><ThemedText style={[styles.selectionCount, { color: colors.textSecondary }]}>{activeTaskFilterCount(draft)} selected</ThemedText><AppButton label="Reset" onPress={reset} variant="ghost" /></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <FilterSection label="Status">{STATUS_OPTIONS.map((option) => <FilterPill key={option.label} label={option.label} onPress={() => setDraft({ ...draft, status: option.value })} selected={draft.status === option.value} />)}</FilterSection>
          <FilterSection label="Priority">{PRIORITY_OPTIONS.map((option) => <FilterPill key={option.label} label={option.label} onPress={() => setDraft({ ...draft, priority: option.value })} selected={draft.priority === option.value} />)}</FilterSection>
          <FilterSection label="Due">{DUE_OPTIONS.map((option) => <FilterPill key={option.value} label={option.label} onPress={() => setDraft({ ...draft, due: option.value })} selected={draft.due === option.value} />)}</FilterSection>
        </ScrollView>
  </AppBottomSheet>;
}

function FilterSection({ children, label }: { children: React.ReactNode; label: string }) { return <View style={styles.section}><ThemedText style={styles.sectionLabel}>{label}</ThemedText><View style={styles.choices}>{children}</View></View>; }
function FilterPill({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} hitSlop={5} onPress={onPress} style={({ pressed }) => [styles.pill, { backgroundColor: selected ? colors.primaryContainer : colors.surfaceSubtle, borderColor: selected ? colors.primary : colors.border }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.pillText, { color: selected ? colors.primary : colors.textSecondary }]}>{label}</ThemedText></Pressable>;
}

const styles = StyleSheet.create({ header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: DesignTokens.layout.screenPadding, paddingBottom: DesignTokens.spacing.sm }, selectionCount: { fontSize: 10, lineHeight: 14 }, content: { gap: DesignTokens.spacing.lg, paddingBottom: DesignTokens.spacing.lg, paddingHorizontal: DesignTokens.layout.screenPadding }, section: { gap: DesignTokens.spacing.sm }, sectionLabel: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, pill: { borderRadius: DesignTokens.radius.pill, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 34, paddingHorizontal: 12, paddingVertical: 6 }, pillText: { fontSize: 11, fontWeight: '600', lineHeight: 15 }, pressed: { opacity: 0.66 } });
