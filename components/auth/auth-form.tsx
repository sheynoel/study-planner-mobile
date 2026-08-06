import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export function AuthScreen({
  children,
  footer,
  subtitle,
  title,
}: PropsWithChildren<{ footer: ReactNode; subtitle: string; title: string }>) {
  const { colors } = useAppearance();
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.brandMark, { backgroundColor: colors.primaryContainer }]}>
              <ThemedText style={[styles.brandMarkText, { color: colors.primary }]}>SP</ThemedText>
            </View>
            <View style={styles.heading}>
              <ThemedText style={[styles.eyebrow, { color: colors.primary }]}>STUDY PLANNER</ThemedText>
              <ThemedText type="title">{title}</ThemedText>
              <ThemedText style={{ color: colors.textSecondary }}>{subtitle}</ThemedText>
            </View>
            <AppCard style={styles.card}>
              {children}
            </AppCard>
            <View style={styles.footer}>{footer}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

export function FormField({
  error,
  label,
  style,
  ...inputProps
}: TextInputProps & { error?: string; label: string }) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const placeholderTextColor = useThemeColor({}, 'textMuted');
  const { colors } = useAppearance();

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={placeholderTextColor}
        style={[
          styles.input,
          { backgroundColor, borderColor, color: textColor },
          error ? { borderColor: colors.danger } : undefined,
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <ThemedText style={[styles.fieldError, { color: colors.dangerText }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  const { colors } = useAppearance();
  if (!message) {
    return null;
  }

  return (
    <ThemedView style={[styles.errorBanner, { backgroundColor: colors.dangerSurface }]} accessibilityRole="alert">
      <ThemedText type="defaultSemiBold" style={{ color: colors.dangerText }}>
        Error
      </ThemedText>
      <ThemedText style={{ color: colors.dangerText }}>
        {message}
      </ThemedText>
    </ThemedView>
  );
}

export function SubmitButton({
  disabled,
  label,
  loadingLabel,
  onPress,
}: {
  disabled: boolean;
  label: string;
  loadingLabel: string;
  onPress: () => void;
}) {
  return (
    <AppButton disabled={disabled} label={disabled ? loadingLabel : label} loading={disabled} onPress={onPress} />
  );
}

export const authFormStyles = StyleSheet.create({
  form: {
    gap: DesignTokens.spacing.lg,
  },
  footerText: {
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: DesignTokens.layout.sectionGap,
    padding: DesignTokens.layout.screenPadding,
  },
  heading: {
    gap: DesignTokens.spacing.sm,
  },
  brandMark: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, height: 54, justifyContent: 'center', width: 54 },
  brandMarkText: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  card: {
    borderRadius: DesignTokens.radius.xl,
  },
  footer: {
    alignItems: 'center',
  },
  field: {
    gap: DesignTokens.spacing.sm,
  },
  input: {
    borderRadius: DesignTokens.radius.md,
    borderWidth: 1,
    fontSize: 16,
    minHeight: DesignTokens.size.inputHeight,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldError: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    borderRadius: DesignTokens.radius.md,
    gap: DesignTokens.spacing.xs,
    padding: DesignTokens.spacing.md,
  },
});
