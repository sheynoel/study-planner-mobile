import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export function AppCard({ children, padded = true, style }: PropsWithChildren<{ padded?: boolean; style?: StyleProp<ViewStyle> }>) {
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  return (
    <ThemedView style={[styles.card, { backgroundColor, borderColor }, padded ? styles.padded : undefined, style]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignTokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...Shadows,
  },
  padded: { padding: DesignTokens.layout.cardPadding },
});
