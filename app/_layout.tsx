import { ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AppearanceProvider, useAppearance } from '@/contexts/appearance-context';
import { ThemedText } from '@/components/themed-text';

export const unstable_settings = {
  anchor: '(app)',
};

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><AppearanceProvider><ThemedRoot /></AppearanceProvider></GestureHandlerRootView>;
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
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'initializing') void SplashScreen.hideAsync();
  }, [status]);

  if (status === 'initializing') {
    return <AuthLoadingScreen />;
  }

  const isAuthenticated = status === 'authenticated' || status === 'authenticated-offline';

  return (
    <View style={styles.root}>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
    {status === 'authenticated-offline' ? (
      <View accessibilityLiveRegion="polite" pointerEvents="none" style={styles.offlineBanner}>
        <ThemedText style={styles.offlineText}>Offline — using your saved session</ThemedText>
      </View>
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  offlineBanner: {
    alignSelf: 'center',
    backgroundColor: '#7C2D12',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    position: 'absolute',
    top: 54,
  },
  offlineText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
