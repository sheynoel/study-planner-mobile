import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User } from '@/lib/api/auth.types';

const ACCESS_TOKEN_KEY = 'study-planner.access-token';
const SESSION_KEY = 'study-planner.auth-session';

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string | null;
  user: User | null;
};

function getWebStorage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

async function readValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage();

    if (!storage) {
      throw new Error('Secure token storage is unavailable in this browser.');
    }

    storage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getStoredAuthSession(): Promise<StoredAuthSession | null> {
  const serialized = await readValue(SESSION_KEY);
  if (serialized) {
    try {
      const value = JSON.parse(serialized) as Partial<StoredAuthSession>;
      if (typeof value.accessToken === 'string' && value.accessToken) {
        return {
          accessToken: value.accessToken,
          refreshToken: typeof value.refreshToken === 'string' ? value.refreshToken : null,
          user: value.user && typeof value.user.id === 'string' ? value.user as User : null,
        };
      }
    } catch {
      await deleteValue(SESSION_KEY);
    }
  }

  const legacyAccessToken = await readValue(ACCESS_TOKEN_KEY);
  return legacyAccessToken ? { accessToken: legacyAccessToken, refreshToken: null, user: null } : null;
}

export async function saveAuthSession(session: StoredAuthSession): Promise<void> {
  await writeValue(SESSION_KEY, JSON.stringify(session));
  await deleteValue(ACCESS_TOKEN_KEY);
}

export async function deleteStoredAuthSession(): Promise<void> {
  await Promise.all([deleteValue(SESSION_KEY), deleteValue(ACCESS_TOKEN_KEY)]);
}
