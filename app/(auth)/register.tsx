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
import type { RegisterRequest } from '@/lib/api/auth.types';
import {
  type FieldErrors,
  type RegisterField,
  validateRegistration,
} from '@/lib/auth/validation';

const INITIAL_FORM: RegisterRequest = {
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

export default function RegistrationScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: RegisterField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const nextErrors = validateRegistration(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setApiError(null);
    setIsSubmitting(true);

    try {
      await register(form);
    } catch (error) {
      setApiError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Set up your profile, then start planning."
      footer={
        <ThemedText style={authFormStyles.footerText}>
          Already have an account?{' '}
          <Link href="./login" disabled={isSubmitting}>
            <ThemedText type="link">Sign in</ThemedText>
          </Link>
        </ThemedText>
      }>
      <View style={authFormStyles.form}>
        <ErrorBanner message={apiError} />
        <FormField
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
          label="Name"
          onChangeText={(value) => updateField('name', value)}
          placeholder="Student Name"
          returnKeyType="next"
          value={form.name}
        />
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
          autoComplete="new-password"
          error={errors.password}
          label="Password"
          onChangeText={(value) => updateField('password', value)}
          placeholder="At least 8 characters"
          returnKeyType="next"
          secureTextEntry
          value={form.password}
        />
        <FormField
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.passwordConfirmation}
          label="Confirm password"
          onChangeText={(value) => updateField('passwordConfirmation', value)}
          onSubmitEditing={() => void handleSubmit()}
          placeholder="Re-enter your password"
          returnKeyType="done"
          secureTextEntry
          value={form.passwordConfirmation}
        />
        <SubmitButton
          disabled={isSubmitting}
          label="Create account"
          loadingLabel="Creating account..."
          onPress={() => void handleSubmit()}
        />
      </View>
    </AuthScreen>
  );
}
