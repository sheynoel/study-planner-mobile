import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ApiClientError, getApiErrorMessage } from '@/lib/api/api-client';
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/lib/api/auth';
import type { LoginRequest, RegisterRequest, User } from '@/lib/api/auth.types';
import {
  deleteStoredAccessToken,
  getStoredAccessToken,
  saveAccessToken,
} from '@/lib/auth/token-storage';

type AuthContextValue = {
  accessToken: string | null;
  isLoading: boolean;
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
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function restoreSession() {
      try {
        const storedToken = await getStoredAccessToken();

        if (!storedToken) {
          return;
        }

        try {
          const response = await getCurrentUser(storedToken);

          if (isCurrent) {
            setAccessToken(storedToken);
            setUser(response.data.user);
          }
        } catch (error) {
          if (error instanceof ApiClientError && error.status === 401) {
            await deleteStoredAccessToken();
          } else if (isCurrent) {
            setSessionError(
              `Your saved session could not be restored. ${getApiErrorMessage(error)}`,
            );
          }
        }
      } catch (error) {
        if (isCurrent) {
          setSessionError(`Your saved session could not be read. ${getApiErrorMessage(error)}`);
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
  }, []);

  const establishSession = useCallback(async (request: LoginRequest) => {
    const response = await loginRequest(request);
    await saveAccessToken(response.data.accessToken);
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    setSessionError(null);
  }, []);

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
      if (accessToken) {
        await logoutRequest(accessToken);
      }
    } catch {
      // Logout is client-managed, so local cleanup must continue if the API is unavailable.
    } finally {
      try {
        await deleteStoredAccessToken();
      } catch (error) {
        storageError = error;
      }

      setAccessToken(null);
      setUser(null);
      setSessionError(null);
    }

    if (storageError) {
      throw storageError;
    }
  }, [accessToken]);

  const value = useMemo(
    () => ({ accessToken, isLoading, login, logout, register, sessionError, user }),
    [accessToken, isLoading, login, logout, register, sessionError, user],
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
