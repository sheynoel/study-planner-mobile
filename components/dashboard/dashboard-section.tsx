import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionHeader } from '@/components/ui/section-header';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function DashboardSection({
  actionLabel,
  children,
  onAction,
  title,
}: PropsWithChildren<{ actionLabel?: string; onAction?: () => void; title: string }>) {
  return (
    <View style={styles.section}>
      <SectionHeader actionLabel={actionLabel} onAction={onAction} title={title} />
      {children}
    </View>
  );
}

export function DashboardSectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors } = useAppearance();
  return (
    <ThemedView style={[styles.error, { backgroundColor: colors.dangerSurface }]}>
      <ThemedText type="defaultSemiBold" style={{ color: colors.dangerText }}>
        This section could not be updated.
      </ThemedText>
      <ThemedText style={{ color: colors.dangerText }}>{message}</ThemedText>
      <Pressable accessibilityRole="button" onPress={onRetry}>
        <ThemedText type="link">Retry</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

export function DashboardSectionEmpty({ message }: { message: string }) {
  const { colors } = useAppearance();
  return (
    <AppCard style={styles.empty}>
      <ThemedText style={{ color: colors.textMuted }}>{message}</ThemedText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  section: { gap: DesignTokens.spacing.md },
  error: { borderRadius: 14, gap: 7, padding: 14 },
  empty: { borderRadius: DesignTokens.radius.lg },
});
