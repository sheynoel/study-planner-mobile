import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/app-button';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  const { colors } = useAppearance();
  return (
    <View style={styles.stateContainer}>
      <ActivityIndicator color={colors.primary} size="large" />
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { colors } = useAppearance();
  return (
    <View style={styles.stateContainer}>
      <ThemedView style={[styles.errorBox, { backgroundColor: colors.dangerSurface }]}>
        <ThemedText type="subtitle" style={{ color: colors.dangerText }}>
          Something went wrong
        </ThemedText>
        <ThemedText style={[styles.centeredText, { color: colors.dangerText }]}>
          {message}
        </ThemedText>
      </ThemedView>
      <ActionButton label="Retry" onPress={onRetry} />
    </View>
  );
}

export function EmptyState({
  actionLabel,
  description,
  onAction,
  title,
}: {
  actionLabel: string;
  description: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <View style={styles.stateContainer}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={styles.centeredText}>{description}</ThemedText>
      <ActionButton label={actionLabel} onPress={onAction} />
    </View>
  );
}

export function ActionButton({
  disabled = false,
  label,
  onPress,
  variant = 'primary',
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
}) {
  return (
    <AppButton disabled={disabled} label={label} onPress={onPress} style={styles.actionButton} variant={variant} />
  );
}

const styles = StyleSheet.create({
  stateContainer: {
    alignItems: 'center',
    flex: 1,
    gap: DesignTokens.spacing.lg,
    justifyContent: 'center',
    padding: DesignTokens.layout.screenPadding,
  },
  centeredText: {
    textAlign: 'center',
  },
  errorBox: {
    alignItems: 'center',
    borderRadius: DesignTokens.radius.lg,
    gap: DesignTokens.spacing.sm,
    maxWidth: 520,
    padding: DesignTokens.spacing.xl,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    minWidth: 120,
  },
});
