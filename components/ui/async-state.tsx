import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" />
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
  return (
    <View style={styles.stateContainer}>
      <ThemedView style={styles.errorBox} lightColor="#fef2f2" darkColor="#450a0a">
        <ThemedText type="subtitle" lightColor="#991b1b" darkColor="#fecaca">
          Something went wrong
        </ThemedText>
        <ThemedText lightColor="#991b1b" darkColor="#fecaca" style={styles.centeredText}>
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
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === 'danger' ? styles.dangerButton : undefined,
        variant === 'secondary' ? styles.secondaryButton : undefined,
        disabled ? styles.disabledButton : undefined,
        pressed && !disabled ? styles.pressedButton : undefined,
      ]}>
      <ThemedText
        type="defaultSemiBold"
        lightColor={variant === 'secondary' ? '#0a7ea4' : '#ffffff'}
        darkColor={variant === 'secondary' ? '#7dd3fc' : '#ffffff'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stateContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  centeredText: {
    textAlign: 'center',
  },
  errorBox: {
    alignItems: 'center',
    borderRadius: 16,
    gap: 8,
    maxWidth: 520,
    padding: 20,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 46,
    minWidth: 120,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  dangerButton: {
    backgroundColor: '#b91c1c',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#0a7ea4',
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressedButton: {
    opacity: 0.82,
  },
});
