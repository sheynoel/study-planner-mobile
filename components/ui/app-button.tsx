import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function AppButton({
  disabled = false,
  label,
  loading = false,
  onPress,
  style,
  variant = 'primary',
}: {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}) {
  const { colors: palette } = useAppearance();
  const inactive = disabled || loading;
  const backgroundColor = variant === 'primary'
    ? palette.primary
    : variant === 'danger'
      ? palette.danger
      : variant === 'secondary'
        ? palette.surface
        : 'transparent';
  const color = variant === 'primary' || variant === 'danger' ? palette.primaryText : palette.tint;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        variant === 'secondary' ? { borderColor: palette.tint, borderWidth: 1 } : undefined,
        inactive ? styles.disabled : undefined,
        pressed && !inactive ? styles.pressed : undefined,
        style,
      ]}>
      {loading ? <ActivityIndicator color={color} size="small" /> : null}
      <ThemedText type="defaultSemiBold" style={{ color }}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: DesignTokens.radius.md,
    flexDirection: 'row',
    gap: DesignTokens.spacing.sm,
    justifyContent: 'center',
    minHeight: DesignTokens.size.buttonHeight,
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.md,
  },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
});
