import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { DesignTokens, Shadows } from '@/constants/theme';
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
  return <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
    <View style={styles.overlay}><Pressable accessibilityLabel="Close filters" accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <View style={[styles.handle, { backgroundColor: colors.outline }]} />
        <View style={styles.header}><View><ThemedText style={styles.title}>Filter Tasks</ThemedText><ThemedText style={[styles.selectionCount, { color: colors.textSecondary }]}>{activeTaskFilterCount(draft)} selected</ThemedText></View><AppButton label="Reset" onPress={reset} variant="ghost" /></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <FilterSection label="Status">{STATUS_OPTIONS.map((option) => <FilterPill key={option.label} label={option.label} onPress={() => setDraft({ ...draft, status: option.value })} selected={draft.status === option.value} />)}</FilterSection>
          <FilterSection label="Priority">{PRIORITY_OPTIONS.map((option) => <FilterPill key={option.label} label={option.label} onPress={() => setDraft({ ...draft, priority: option.value })} selected={draft.priority === option.value} />)}</FilterSection>
          <FilterSection label="Due">{DUE_OPTIONS.map((option) => <FilterPill key={option.value} label={option.label} onPress={() => setDraft({ ...draft, due: option.value })} selected={draft.due === option.value} />)}</FilterSection>
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: colors.outline }]}><AppButton label="Apply" onPress={apply} /></View>
      </SafeAreaView>
    </View>
  </Modal>;
}

function FilterSection({ children, label }: { children: React.ReactNode; label: string }) { return <View style={styles.section}><ThemedText style={styles.sectionLabel}>{label}</ThemedText><View style={styles.choices}>{children}</View></View>; }
function FilterPill({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.pill, { backgroundColor: selected ? colors.primaryContainer : colors.surfaceSubtle, borderColor: selected ? colors.primary : colors.border }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.pillText, { color: selected ? colors.primary : colors.textSecondary }]}>{label}</ThemedText></Pressable>;
}

const styles = StyleSheet.create({ overlay: { backgroundColor: 'rgba(0,0,0,0.34)', flex: 1, justifyContent: 'flex-end' }, sheet: { borderTopLeftRadius: DesignTokens.radius.xxl, borderTopRightRadius: DesignTokens.radius.xxl, borderWidth: StyleSheet.hairlineWidth, maxHeight: '72%', paddingTop: DesignTokens.spacing.sm, ...Shadows }, handle: { alignSelf: 'center', borderRadius: DesignTokens.radius.pill, height: 4, opacity: 0.48, width: 40 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: DesignTokens.layout.screenPadding, paddingVertical: DesignTokens.spacing.md }, title: { fontSize: 18, fontWeight: '800', lineHeight: 23 }, selectionCount: { fontSize: 10, lineHeight: 14, marginTop: 1 }, content: { gap: DesignTokens.spacing.lg, paddingBottom: DesignTokens.spacing.lg, paddingHorizontal: DesignTokens.layout.screenPadding }, section: { gap: DesignTokens.spacing.sm }, sectionLabel: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, pill: { borderRadius: DesignTokens.radius.pill, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 34, paddingHorizontal: 12, paddingVertical: 6 }, pillText: { fontSize: 11, fontWeight: '600', lineHeight: 15 }, footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: DesignTokens.layout.screenPadding, paddingVertical: DesignTokens.spacing.md }, pressed: { opacity: 0.66 } });
