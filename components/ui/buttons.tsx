import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export const PrimaryButton = AppButton;
export function SecondaryButton(props: React.ComponentProps<typeof AppButton>) { return <AppButton {...props} variant="secondary" />; }
export function IconButton({ accessibilityLabel, icon, onPress }: { accessibilityLabel: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" hitSlop={8} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surfaceVariant }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name={icon} size={DesignTokens.icon.lg} /></Pressable>;
}
const styles = StyleSheet.create({ iconButton: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, height: DesignTokens.size.touchTarget, justifyContent: 'center', width: DesignTokens.size.touchTarget }, pressed: { opacity: 0.7 } });
