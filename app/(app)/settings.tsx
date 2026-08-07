import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { BentoCard } from '@/components/ui/bento-card';
import { SectionHeader } from '@/components/ui/section-header';
import { DesignTokens } from '@/constants/theme';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { fileRoutes } from '@/lib/files/routes';
import { noteRoutes } from '@/lib/notes/routes';

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleLogout() { if (isLoggingOut) return; setError(null); setIsLoggingOut(true); try { await logout(); } catch (reason) { setError(getAuthErrorMessage(reason)); setIsLoggingOut(false); } }
  return <AppScreen footer={<AppSectionTabs active="settings" />}>
    <AppHeader subtitle="Your account, workspace, and app preferences." title="Settings" />
    <ScrollView contentContainerStyle={styles.content}>
      <BentoCard style={styles.account} tone="accent"><ThemedText type="subtitle">Account</ThemedText><ThemedText>{user?.name ?? 'Student'}</ThemedText><ThemedText selectable>{user?.email ?? 'Email unavailable'}</ThemedText></BentoCard>
      <SectionHeader title="Student workspace" />
      <SettingsRow description="Your student card and planner activity" icon="person-outline" label="Profile" onPress={() => router.push('/profile')} />
      <SettingsRow description="Theme pack, light, dark, or system mode" icon="color-palette-outline" label="Appearance" onPress={() => router.push('/appearance')} />
      <SettingsRow description="Browse every course and personal material" icon="library-outline" label="File Library" onPress={() => router.push(fileRoutes.list)} />
      <SettingsRow description="Personal and course information to remember" icon="document-text-outline" label="Notes" onPress={() => router.push(noteRoutes.list)} />
      <SectionHeader title="Preferences" />
      <SettingsRow description="Reminders are not implemented yet" disabled icon="notifications-outline" label="Notifications" trailing="Coming soon" />
      <SettingsRow description="Week start and planner defaults are not implemented" disabled icon="calendar-outline" label="Calendar preferences" trailing="Coming soon" />
      <SectionHeader title="Account actions" />
      <SettingsRow description="View the signed-in account identity" icon="shield-checkmark-outline" label="Account" onPress={() => router.push('/profile')} />
      <ErrorBanner message={error} />
      <AppButton label={isLoggingOut ? 'Signing out...' : 'Sign out'} loading={isLoggingOut} onPress={() => void handleLogout()} variant="danger" />
    </ScrollView>
  </AppScreen>;
}
const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.md, padding: DesignTokens.layout.screenPadding, paddingBottom: 132 }, account: { gap: DesignTokens.spacing.sm } });
