import { ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AppearanceProvider, useAppearance } from '@/contexts/appearance-context';

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  return <AppearanceProvider><ThemedRoot /></AppearanceProvider>;
}

function ThemedRoot() {
  const { colors, resolvedMode } = useAppearance();
  const navigationTheme: Theme = {
    dark: resolvedMode === 'dark',
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '800' },
    },
  };

  return (
    <AuthProvider>
      <ThemeProvider value={navigationTheme}>
        <RootNavigator />
        <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { accessToken, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  const isAuthenticated = Boolean(accessToken && user);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
