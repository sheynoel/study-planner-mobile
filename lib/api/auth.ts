import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/lib/api/auth.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUser(value: unknown): value is User {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.updatedAt))
  );
}

function readData(value: unknown): Record<string, unknown> | null {
  return isRecord(value) && isRecord(value.data) ? value.data : null;
}

function invalidAuthResponse(): never {
  throw new ApiClientError(
    'The API returned an unexpected authentication response. Check that the mobile and backend versions match.',
    'invalid-response',
  );
}

export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  const response = await getApiClient().post<unknown, RegisterRequest>('/auth/register', request, {
    acceptedStatuses: [201],
  });
  const data = readData(response);

  if (!data || !isUser(data.user)) {
    return invalidAuthResponse();
  }

  return { data: { user: data.user } };
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await getApiClient().post<unknown, LoginRequest>('/auth/login', request);
  const data = readData(response);

  if (
    !data ||
    typeof data.accessToken !== 'string' ||
    data.accessToken.length === 0 ||
    data.tokenType !== 'Bearer' ||
    !isUser(data.user)
  ) {
    return invalidAuthResponse();
  }

  return {
    data: {
      accessToken: data.accessToken,
      tokenType: data.tokenType,
      user: data.user,
    },
  };
}

export async function getCurrentUser(accessToken: string): Promise<CurrentUserResponse> {
  const response = await getApiClient().get<unknown>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = readData(response);

  if (!data || !isUser(data.user)) {
    return invalidAuthResponse();
  }

  return { data: { user: data.user } };
}

export async function logout(accessToken: string): Promise<LogoutResponse> {
  const response = await getApiClient().post<unknown>('/auth/logout', undefined, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = readData(response);

  if (
    !data ||
    typeof data.message !== 'string' ||
    data.tokenInvalidation !== 'client-managed'
  ) {
    return invalidAuthResponse();
  }

  return {
    data: {
      message: data.message,
      tokenInvalidation: data.tokenInvalidation,
    },
  };
}
