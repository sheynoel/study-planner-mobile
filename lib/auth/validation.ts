import type { LoginRequest, RegisterRequest } from '@/lib/api/auth.types';

export type LoginField = keyof LoginRequest;
export type RegisterField = keyof RegisterRequest;
export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | undefined {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return 'Email is required.';
  }

  if (normalizedEmail.length > 320 || !EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Enter a valid email address.';
  }
}

export function validateLogin(request: LoginRequest): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  const emailError = validateEmail(request.email);

  if (emailError) {
    errors.email = emailError;
  }

  if (!request.password) {
    errors.password = 'Password is required.';
  } else if (request.password.length > 128) {
    errors.password = 'Password must be at most 128 characters.';
  }

  return errors;
}

export function validateRegistration(
  request: RegisterRequest,
): FieldErrors<RegisterField> {
  const errors: FieldErrors<RegisterField> = {};
  const trimmedName = request.name.trim();
  const emailError = validateEmail(request.email);

  if (trimmedName.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (trimmedName.length > 100) {
    errors.name = 'Name must be at most 100 characters.';
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (request.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (request.password.length > 128) {
    errors.password = 'Password must be at most 128 characters.';
  }

  if (!request.passwordConfirmation) {
    errors.passwordConfirmation = 'Confirm your password.';
  } else if (request.passwordConfirmation !== request.password) {
    errors.passwordConfirmation = 'Passwords do not match.';
  }

  return errors;
}
