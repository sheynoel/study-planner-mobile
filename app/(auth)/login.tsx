import { Link } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AuthScreen,
  authFormStyles,
  ErrorBanner,
  FormField,
  SubmitButton,
} from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import type { LoginRequest } from '@/lib/api/auth.types';
import { type FieldErrors, type LoginField, validateLogin } from '@/lib/auth/validation';

const INITIAL_FORM: LoginRequest = { email: '', password: '' };

export default function LoginScreen() {
  const { login, sessionError } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors<LoginField>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: LoginField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const nextErrors = validateLogin(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setApiError(null);
    setIsSubmitting(true);

    try {
      await login(form);
    } catch (error) {
      setApiError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue to your study planner."
      footer={
        <ThemedText style={authFormStyles.footerText}>
          New here?{' '}
          <Link href="./register" disabled={isSubmitting}>
            <ThemedText type="link">Create an account</ThemedText>
          </Link>
        </ThemedText>
      }>
      <View style={authFormStyles.form}>
        <ErrorBanner message={apiError ?? sessionError} />
        <FormField
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          inputMode="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => updateField('email', value)}
          placeholder="student@example.com"
          returnKeyType="next"
          value={form.email}
        />
        <FormField
          autoCapitalize="none"
          autoComplete="current-password"
          error={errors.password}
          label="Password"
          onChangeText={(value) => updateField('password', value)}
          onSubmitEditing={() => void handleSubmit()}
          placeholder="Enter your password"
          returnKeyType="done"
          secureTextEntry
          value={form.password}
        />
        <SubmitButton
          disabled={isSubmitting}
          label="Sign in"
          loadingLabel="Signing in..."
          onPress={() => void handleSubmit()}
        />
      </View>
    </AuthScreen>
  );
}
