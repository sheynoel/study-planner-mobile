import { ScrollView, StyleSheet } from 'react-native';

import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import type { CourseWorkspaceTab } from '@/lib/courses/routes';

const TABS: readonly { label: string; value: CourseWorkspaceTab }[] = [{ label: 'Overview', value: 'overview' }, { label: 'Tasks', value: 'tasks' }, { label: 'Materials', value: 'materials' }, { label: 'Schedule', value: 'schedule' }];

export function CourseWorkspaceTabs({ onChange, value }: { onChange: (value: CourseWorkspaceTab) => void; value: CourseWorkspaceTab }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>{TABS.map((tab) => <ChoiceChip key={tab.value} label={tab.label} selected={value === tab.value} onPress={() => onChange(tab.value)} />)}</ScrollView>;
}

const styles = StyleSheet.create({ tabs: { gap: DesignTokens.spacing.sm, paddingRight: DesignTokens.spacing.md } });
