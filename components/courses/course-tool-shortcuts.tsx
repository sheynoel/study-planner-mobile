import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

const TOOLS = [{ key: 'materials', icon: 'folder-open-outline', label: 'Materials' }, { key: 'notes', icon: 'document-text-outline', label: 'Notes' }, { key: 'calendar', icon: 'calendar-outline', label: 'Calendar' }] as const;
export function CourseToolShortcuts({ onCalendar, onMaterials, onNotes }: { onCalendar: () => void; onMaterials: () => void; onNotes: () => void }) {
  const { colors } = useAppearance(); const handlers = { materials: onMaterials, notes: onNotes, calendar: onCalendar };
  return <View style={styles.row}>{TOOLS.map((tool) => <Pressable accessibilityRole="button" key={tool.key} onPress={handlers[tool.key]} style={({ pressed }) => [styles.tool, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name={tool.icon} size={18} /><ThemedText numberOfLines={1} style={styles.label}>{tool.label}</ThemedText></Pressable>)}</View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, tool: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flex: 1, gap: 5, justifyContent: 'center', minHeight: 66, minWidth: 0, paddingHorizontal: 4 }, label: { fontSize: 11, fontWeight: '700', lineHeight: 15 }, pressed: { opacity: 0.65 } });
