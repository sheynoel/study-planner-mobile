import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function BentoCard({ children, onPress, style, tone = 'surface' }: PropsWithChildren<{ onPress?: () => void; style?: StyleProp<ViewStyle>; tone?: 'accent' | 'subtle' | 'surface' }>) {
  const { colors } = useAppearance();
  const backgroundColor = tone === 'accent' ? colors.primaryContainer : tone === 'subtle' ? colors.surfaceVariant : colors.surface;
  const card = <AppCard style={[styles.card, { backgroundColor }, style]}>{children}</AppCard>;
  if (!onPress) return card;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed ? styles.pressed : undefined}>{card}</Pressable>;
}

const styles = StyleSheet.create({ card: { borderRadius: DesignTokens.radius.xl }, pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] } });
