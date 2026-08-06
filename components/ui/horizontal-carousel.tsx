import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { DesignTokens } from '@/constants/theme';

export function HorizontalCarousel({ children }: PropsWithChildren) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>{children}</ScrollView>;
}

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.md, paddingHorizontal: DesignTokens.layout.screenPadding, paddingVertical: DesignTokens.spacing.xs } });
