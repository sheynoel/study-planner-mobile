import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
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
  return <AppBottomSheet expandable initialSnap={0.74} onClose={onClose} title="Filter Tasks" visible={visible} footer={<AppButton label="Apply" onPress={apply} />}>
        <View style={styles.header}><ThemedText style={[styles.count, { color: colors.textSecondary }]}>{activeHomeTaskFilterCount(draft)} active</ThemedText><AppButton label="Reset" onPress={() => setDraft(DEFAULT_HOME_TASK_FILTERS)} variant="ghost" /></View>
        <ScrollView contentContainerStyle={styles.content}>
          <FilterSection label="Status">{STATUSES.map((status) => <ChoiceChip key={status} label={TASK_STATUS_LABELS[status]} onPress={() => setDraft({ ...draft, status })} selected={draft.status === status} />)}</FilterSection>
          <FilterSection label="Time">{TIMES.map((time) => <ChoiceChip key={time.value} label={time.label} onPress={() => setDraft({ ...draft, time: time.value })} selected={draft.time === time.value} />)}</FilterSection>
          <FilterSection label="Course"><ChoiceChip label="All" onPress={() => setDraft({ ...draft, courseId: undefined })} selected={!draft.courseId} />{courses.map((course) => <ChoiceChip key={course.id} label={course.code || course.name} onPress={() => setDraft({ ...draft, courseId: course.id })} selected={draft.courseId === course.id} />)}<ChoiceChip label="Personal" onPress={() => setDraft({ ...draft, courseId: 'personal' })} selected={draft.courseId === 'personal'} /></FilterSection>
          <FilterSection label="Priority">{PRIORITIES.map((priority) => <ChoiceChip key={priority} label={TASK_PRIORITY_LABELS[priority]} onPress={() => setDraft({ ...draft, priority })} selected={draft.priority === priority} />)}</FilterSection>
        </ScrollView>
  </AppBottomSheet>;
}

function FilterSection({ children, label }: { children: React.ReactNode; label: string }) { return <View style={styles.section}><ThemedText style={styles.sectionLabel}>{label}</ThemedText><View style={styles.choices}>{children}</View></View>; }

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: DesignTokens.layout.screenPadding, paddingBottom: DesignTokens.spacing.sm },
  count: { fontSize: 11, lineHeight: 15 },
  content: { gap: DesignTokens.spacing.lg, paddingBottom: DesignTokens.spacing.xl, paddingHorizontal: DesignTokens.layout.screenPadding },
  section: { gap: DesignTokens.spacing.sm },
  sectionLabel: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm },
});
