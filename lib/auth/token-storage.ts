import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'study-planner.access-token';

function getWebStorage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

export async function getStoredAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveAccessToken(accessToken: string): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage();

    if (!storage) {
      throw new Error('Secure token storage is unavailable in this browser.');
    }

    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function deleteStoredAccessToken(): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
