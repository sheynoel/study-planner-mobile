import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { TaskSortOption } from '@/lib/tasks/task-filters';

const GROUPS: readonly { label: string; options: readonly { label: string; value: TaskSortOption }[] }[] = [
  { label: 'Due date', options: [{ label: 'Soonest', value: 'deadline_soonest' }, { label: 'Latest', value: 'deadline_latest' }] },
  { label: 'Created', options: [{ label: 'Newest', value: 'created' }, { label: 'Oldest', value: 'created_oldest' }] },
  { label: 'Other', options: [{ label: 'Priority', value: 'priority' }, { label: 'Course', value: 'course' }, { label: 'A–Z', value: 'alphabetical' }] },
];

export function TaskSortSheet({ onChange, onClose, value, visible }: { onChange: (value: TaskSortOption) => void; onClose: () => void; value: TaskSortOption; visible: boolean }) {
  const { colors } = useAppearance();
  const [draft, setDraft] = useState(value);
  useEffect(() => { if (visible) setDraft(value); }, [value, visible]);
  const apply = () => { onChange(draft); onClose(); };
  return <AppBottomSheet initialSnap={0.52} onClose={onClose} title="Sort Tasks" visible={visible} footer={<AppButton label="Done" onPress={apply} />}><View style={styles.content}>{GROUPS.map((group) => <View key={group.label} style={styles.group}><ThemedText style={[styles.groupLabel, { color: colors.textSecondary }]}>{group.label}</ThemedText><View style={styles.options}>{group.options.map((option) => <SortPill key={option.value} label={option.label} onPress={() => setDraft(option.value)} selected={draft === option.value} />)}</View></View>)}</View></AppBottomSheet>;
}

function SortPill({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) { const { colors } = useAppearance(); return <Pressable accessibilityRole="button" accessibilityState={{ selected }} hitSlop={5} onPress={onPress} style={({ pressed }) => [styles.pill, { backgroundColor: selected ? colors.primaryContainer : colors.surfaceSubtle, borderColor: selected ? colors.primary : colors.border }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.pillText, { color: selected ? colors.primary : colors.textSecondary }]}>{label}</ThemedText></Pressable>; }

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, paddingBottom: DesignTokens.spacing.lg, paddingHorizontal: DesignTokens.layout.screenPadding }, group: { gap: 7 }, groupLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, lineHeight: 14, textTransform: 'uppercase' }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, pill: { borderRadius: DesignTokens.radius.pill, borderWidth: StyleSheet.hairlineWidth, minHeight: 34, paddingHorizontal: 13, paddingVertical: 7 }, pillText: { fontSize: 11, fontWeight: '600', lineHeight: 15 }, pressed: { opacity: 0.66 } });
