import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CourseWorkspaceTab } from '@/lib/courses/routes';

const TABS: readonly { label: string; value: CourseWorkspaceTab }[] = [{ label: 'Overview', value: 'overview' }, { label: 'Tasks', value: 'tasks' }, { label: 'Materials', value: 'materials' }, { label: 'Schedule', value: 'schedule' }, { label: 'Notes', value: 'notes' }];

export function CourseWorkspaceTabs({ onChange, value }: { onChange: (value: CourseWorkspaceTab) => void; value: CourseWorkspaceTab }) {
  const { colors } = useAppearance();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabs, { borderBottomColor: colors.border }]}>{TABS.map((tab) => { const selected = value === tab.value; return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} key={tab.value} onPress={() => onChange(tab.value)} style={styles.tab}><ThemedText style={[styles.label, { color: selected ? colors.primary : colors.textMuted }]}>{tab.label}</ThemedText><View style={[styles.indicator, { backgroundColor: selected ? colors.primary : 'transparent' }]} /></Pressable>; })}</ScrollView>;
}

const styles = StyleSheet.create({ tabs: { borderBottomWidth: StyleSheet.hairlineWidth, gap: DesignTokens.spacing.xs, paddingRight: DesignTokens.spacing.md }, tab: { alignItems: 'center', justifyContent: 'flex-end', minHeight: 44, paddingHorizontal: DesignTokens.spacing.sm }, label: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, indicator: { borderRadius: DesignTokens.radius.pill, height: 3, marginTop: 8, width: '100%' } });
