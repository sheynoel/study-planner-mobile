import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export function AuthScreen({
  children,
  footer,
  subtitle,
  title,
}: PropsWithChildren<{ footer: ReactNode; subtitle: string; title: string }>) {
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <View style={styles.heading}>
              <ThemedText type="title">{title}</ThemedText>
              <ThemedText>{subtitle}</ThemedText>
            </View>
            <ThemedView style={styles.card} lightColor="#f8fafc" darkColor="#1e293b">
              {children}
            </ThemedView>
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
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#0f172a' }, 'background');

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#64748b"
        style={[
          styles.input,
          { backgroundColor, color: textColor },
          error ? styles.inputError : undefined,
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <ThemedText lightColor="#b91c1c" darkColor="#fecaca" style={styles.fieldError}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <ThemedView style={styles.errorBanner} lightColor="#fef2f2" darkColor="#450a0a">
      <ThemedText lightColor="#991b1b" darkColor="#fecaca">
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
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.submitButton,
        disabled ? styles.submitButtonDisabled : undefined,
        pressed && !disabled ? styles.submitButtonPressed : undefined,
      ]}>
      {disabled ? <ActivityIndicator color="#ffffff" /> : null}
      <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
        {disabled ? loadingLabel : label}
      </ThemedText>
    </Pressable>
  );
}

export const authFormStyles = StyleSheet.create({
  form: {
    gap: 16,
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
    gap: 24,
    padding: 24,
  },
  heading: {
    gap: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  footer: {
    alignItems: 'center',
  },
  field: {
    gap: 6,
  },
  input: {
    borderColor: '#94a3b8',
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  fieldError: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    borderRadius: 12,
    padding: 14,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonPressed: {
    opacity: 0.82,
  },
});
