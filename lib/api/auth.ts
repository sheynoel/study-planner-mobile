import { ApiClientError, getApiClient } from '@/lib/api/api-client';
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
} from '@/lib/api/auth.types';
import { normalizeUser } from '@/lib/api/auth-normalization';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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

  const user = data ? normalizeUser(data.user) : null;
  if (!user) {
    return invalidAuthResponse();
  }

  return { data: { user } };
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await getApiClient().post<unknown, LoginRequest>('/auth/login', request);
  const data = readData(response);

  if (
    !data ||
    typeof data.accessToken !== 'string' ||
    data.accessToken.length === 0 ||
    typeof data.refreshToken !== 'string' ||
    data.refreshToken.length === 0 ||
    data.tokenType !== 'Bearer' ||
    !normalizeUser(data.user)
  ) {
    return invalidAuthResponse();
  }

  return {
    data: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenType: data.tokenType,
      user: normalizeUser(data.user)!,
    },
  };
}

export async function getCurrentUser(accessToken: string): Promise<CurrentUserResponse> {
  const response = await getApiClient().get<unknown>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = readData(response);

  const user = data ? normalizeUser(data.user) : null;
  if (!user) {
    return invalidAuthResponse();
  }

  return { data: { user } };
}

export async function updateTimezone(accessToken: string, timezone: string): Promise<CurrentUserResponse> {
  const response = await getApiClient().patch<unknown, { timezone: string }>('/auth/timezone', { timezone }, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = readData(response); const user = data ? normalizeUser(data.user) : null; if (!user) return invalidAuthResponse();
  return { data: { user } };
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  return loginResponse(await getApiClient().post<unknown, { refreshToken: string }>(
    '/auth/refresh', { refreshToken },
  ));
}

function loginResponse(response: unknown): LoginResponse {
  const data = readData(response);
  if (!data || typeof data.accessToken !== 'string' || !data.accessToken ||
    typeof data.refreshToken !== 'string' || !data.refreshToken ||
    data.tokenType !== 'Bearer' || !normalizeUser(data.user)) return invalidAuthResponse();
  return { data: { accessToken: data.accessToken, refreshToken: data.refreshToken, tokenType: 'Bearer', user: normalizeUser(data.user)! } };
}

export async function logout(refreshToken: string): Promise<LogoutResponse> {
  const response = await getApiClient().post<unknown, { refreshToken: string }>('/auth/logout', { refreshToken });
  const data = readData(response);

  if (
    !data ||
    typeof data.message !== 'string' ||
    data.tokenInvalidation !== 'server-revoked'
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
