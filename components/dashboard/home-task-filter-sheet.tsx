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
import { activeHomeTaskFilterCount, DEFAULT_HOME_TASK_FILTERS, type HomeTaskFilters, type HomeTaskTime } from '@/lib/dashboard/home-dashboard';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/lib/tasks/task-display';

const STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITIES: readonly TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
const TIMES: readonly { label: string; value: HomeTaskTime }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'this_week' },
  { label: 'This month', value: 'this_month' },
  { label: 'Any time', value: 'any' },
];

export function HomeTaskFilterSheet({ courses, onApply, onClose, value, visible }: { courses: Course[]; onApply: (filters: HomeTaskFilters) => void; onClose: () => void; value: HomeTaskFilters; visible: boolean }) {
  const { colors } = useAppearance();
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (visible) setDraft(value); }, [value, visible]);
  function apply() { onApply(draft); onClose(); }
  return <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
    <View style={styles.overlay}>
      <Pressable accessibilityLabel="Close task filters" accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.handle, { backgroundColor: colors.outline }]} />
        <View style={styles.header}><View><ThemedText style={styles.title}>Filter tasks</ThemedText><ThemedText style={[styles.count, { color: colors.textSecondary }]}>{activeHomeTaskFilterCount(draft)} active</ThemedText></View><AppButton label="Reset" onPress={() => setDraft(DEFAULT_HOME_TASK_FILTERS)} variant="ghost" /></View>
        <ScrollView contentContainerStyle={styles.content}>
          <FilterSection label="Status">{STATUSES.map((status) => <ChoiceChip key={status} label={TASK_STATUS_LABELS[status]} onPress={() => setDraft({ ...draft, status })} selected={draft.status === status} />)}</FilterSection>
          <FilterSection label="Time">{TIMES.map((time) => <ChoiceChip key={time.value} label={time.label} onPress={() => setDraft({ ...draft, time: time.value })} selected={draft.time === time.value} />)}</FilterSection>
          <FilterSection label="Course"><ChoiceChip label="All" onPress={() => setDraft({ ...draft, courseId: undefined })} selected={!draft.courseId} />{courses.map((course) => <ChoiceChip key={course.id} label={course.code || course.name} onPress={() => setDraft({ ...draft, courseId: course.id })} selected={draft.courseId === course.id} />)}<ChoiceChip label="Personal" onPress={() => setDraft({ ...draft, courseId: 'personal' })} selected={draft.courseId === 'personal'} /></FilterSection>
          <FilterSection label="Priority">{PRIORITIES.map((priority) => <ChoiceChip key={priority} label={TASK_PRIORITY_LABELS[priority]} onPress={() => setDraft({ ...draft, priority })} selected={draft.priority === priority} />)}</FilterSection>
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: colors.border }]}><AppButton label="Apply" onPress={apply} /></View>
      </SafeAreaView>
    </View>
  </Modal>;
}

function FilterSection({ children, label }: { children: React.ReactNode; label: string }) { return <View style={styles.section}><ThemedText style={styles.sectionLabel}>{label}</ThemedText><View style={styles.choices}>{children}</View></View>; }

const styles = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(0,0,0,0.38)', flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: DesignTokens.radius.xxl, borderTopRightRadius: DesignTokens.radius.xxl, borderWidth: StyleSheet.hairlineWidth, maxHeight: '88%', paddingTop: DesignTokens.spacing.sm, ...Shadows },
  handle: { alignSelf: 'center', borderRadius: DesignTokens.radius.pill, height: 4, opacity: 0.45, width: 42 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: DesignTokens.layout.screenPadding, paddingVertical: DesignTokens.spacing.sm },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 23 },
  count: { fontSize: 11, lineHeight: 15 },
  content: { gap: DesignTokens.spacing.lg, paddingBottom: DesignTokens.spacing.xl, paddingHorizontal: DesignTokens.layout.screenPadding },
  section: { gap: DesignTokens.spacing.sm },
  sectionLabel: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, padding: DesignTokens.layout.screenPadding },
});
