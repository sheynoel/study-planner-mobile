import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function ChoiceChip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.chip, { backgroundColor: selected ? colors.primaryContainer : colors.surface, borderColor: selected ? colors.primary : colors.border }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.label, { color: selected ? colors.primary : colors.text }]}>{label}</ThemedText></Pressable>;
}
const styles = StyleSheet.create({ chip: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, borderWidth: 1, justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: 6 }, label: { fontSize: 11, fontWeight: '600', lineHeight: 15 }, pressed: { opacity: 0.72 } });
