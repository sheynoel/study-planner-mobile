import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function ChoiceChip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  const { colors: palette } = useAppearance();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: selected ? palette.primary : palette.border, backgroundColor: selected ? palette.primary : palette.surface },
        pressed ? styles.pressed : undefined,
      ]}>
      <ThemedText type="defaultSemiBold" style={[styles.label, { color: selected ? palette.primaryText : palette.text }]}>
        {selected ? '✓ ' : ''}{label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: DesignTokens.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: DesignTokens.size.touchTarget,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
  },
  label: { fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.72 },
});
