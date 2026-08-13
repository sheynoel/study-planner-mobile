import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { ApiClientError, getApiErrorMessage, setApiAuthHandlers } from '@/lib/api/api-client';
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refresh as refreshRequest,
  register as registerRequest,
  updateTimezone as updateTimezoneRequest,
} from '@/lib/api/auth';
import type { LoginRequest, RegisterRequest, User } from '@/lib/api/auth.types';
import {
  deleteStoredAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  type StoredAuthSession,
} from '@/lib/auth/token-storage';
import { classifySessionRestorationFailure } from '@/lib/auth/session-restoration';

export type AuthStatus = 'initializing' | 'authenticated' | 'authenticated-offline' | 'unauthenticated';

type AuthContextValue = {
  accessToken: string | null;
  isLoading: boolean;
  status: AuthStatus;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  sessionError: string | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [sessionError, setSessionError] = useState<string | null>(null);

  const publishSession = useCallback((session: StoredAuthSession, nextStatus: AuthStatus = 'authenticated') => {
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus(nextStatus);
    setIsLoading(false);
  }, []);

  const invalidateSession = useCallback(async () => {
    await deleteStoredAuthSession();
    setAccessToken(null);
    setUser(null);
    setSessionError(null);
    setStatus('unauthenticated');
    setIsLoading(false);
  }, []);

  const refreshStoredSession = useCallback(async () => {
    const stored = await getStoredAuthSession();
    if (!stored?.refreshToken) return null;
    const response = await refreshRequest(stored.refreshToken);
    const next: StoredAuthSession = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
    };
    await saveAuthSession(next);
    publishSession(next);
    setSessionError(null);
    return next.accessToken;
  }, [publishSession]);

  useEffect(() => {
    setApiAuthHandlers({ refresh: refreshStoredSession, invalidate: invalidateSession });
    return () => setApiAuthHandlers(null);
  }, [invalidateSession, refreshStoredSession]);

  const validateStoredSession = useCallback(async (stored: StoredAuthSession) => {
    try {
      const response = await getCurrentUser(stored.accessToken);
      let confirmedUser = response.data.user;
      if (!confirmedUser.timezone) {
        const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (deviceTimezone) {
          try { confirmedUser = (await updateTimezoneRequest(stored.accessToken, deviceTimezone)).data.user; }
          catch { /* A timezone sync failure does not invalidate a confirmed session. */ }
        }
      }
      const validated = { ...stored, user: confirmedUser };
      await saveAuthSession(validated);
      publishSession(validated);
      setSessionError(null);
    } catch (error) {
      const decision = error instanceof ApiClientError
        ? classifySessionRestorationFailure(error)
        : 'error';
      if (decision === 'invalidate') {
        await invalidateSession();
        return;
      }
      if (decision === 'offline') {
        publishSession(stored, 'authenticated-offline');
        setSessionError('You are offline. Your saved session will be checked again when the API is reachable.');
        return;
      }
      publishSession(stored, 'authenticated');
      setSessionError(`Your saved session could not be validated. ${getApiErrorMessage(error)}`);
    }
  }, [invalidateSession, publishSession]);

  useEffect(() => {
    let isCurrent = true;

    async function restoreSession() {
      try {
        const stored = await getStoredAuthSession();

        if (!stored) {
          if (isCurrent) {
            setStatus('unauthenticated');
            setIsLoading(false);
          }
          return;
        }
        if (isCurrent) await validateStoredSession(stored);
      } catch (error) {
        if (isCurrent) {
          setSessionError(`Your saved session could not be read. ${getApiErrorMessage(error)}`);
          setStatus('unauthenticated');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isCurrent = false;
    };
  }, [validateStoredSession]);

  useEffect(() => {
    if (status !== 'authenticated-offline') return;
    const retry = () => { void getStoredAuthSession().then((stored) => stored && validateStoredSession(stored)); };
    const interval = setInterval(retry, 30_000);
    const subscription = AppState.addEventListener('change', (next) => { if (next === 'active') retry(); });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [status, validateStoredSession]);

  const establishSession = useCallback(async (request: LoginRequest) => {
    const response = await loginRequest(request);
    const session = { accessToken: response.data.accessToken, refreshToken: response.data.refreshToken, user: response.data.user };
    await saveAuthSession(session);
    publishSession(session);
    setSessionError(null);
    if (!response.data.user.timezone) {
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (deviceTimezone) void updateTimezoneRequest(response.data.accessToken, deviceTimezone)
        .then(async ({ data }) => {
          const updated = { ...session, user: data.user };
          await saveAuthSession(updated); publishSession(updated);
        })
        .catch(() => undefined);
    }
  }, [publishSession]);

  const login = useCallback(
    async (request: LoginRequest) => {
      await establishSession({
        email: request.email.trim().toLowerCase(),
        password: request.password,
      });
    },
    [establishSession],
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      const normalizedRequest = {
        ...request,
        email: request.email.trim().toLowerCase(),
        name: request.name.trim(),
      };

      await registerRequest(normalizedRequest);
      await establishSession({
        email: normalizedRequest.email,
        password: normalizedRequest.password,
      });
    },
    [establishSession],
  );

  const logout = useCallback(async () => {
    let storageError: unknown;

    try {
      const stored = await getStoredAuthSession();
      if (stored?.refreshToken) {
        await logoutRequest(stored.refreshToken);
      }
    } catch {
      // Local cleanup must continue if server-side revocation is unavailable.
    } finally {
      try {
        await deleteStoredAuthSession();
      } catch (error) {
        storageError = error;
      }

      setAccessToken(null);
      setUser(null);
      setSessionError(null);
      setStatus('unauthenticated');
      setIsLoading(false);
    }

    if (storageError) {
      throw storageError;
    }
  }, []);

  const value = useMemo(
    () => ({ accessToken, isLoading, login, logout, register, sessionError, status, user }),
    [accessToken, isLoading, login, logout, register, sessionError, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

export function getAuthErrorMessage(error: unknown): string {
  return getApiErrorMessage(error);
}
