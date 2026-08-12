import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState, type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppSectionTabs } from '@/components/app-section-tabs';
import { ErrorBanner } from '@/components/auth/auth-form';
import { SettingsRow } from '@/components/settings/settings-row';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useNotificationPreferences } from '@/contexts/notification-preferences-context';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { colors, mode, themePack } = useAppearance();
  const { preferences } = useNotificationPreferences();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleLogout() { if (isLoggingOut) return; setError(null); setIsLoggingOut(true); try { await logout(); } catch (reason) { setError(getAuthErrorMessage(reason)); setIsLoggingOut(false); } }
  const notificationSummary = preferences.enabled ? 'Reminder preferences enabled' : 'Preferences off';
  const modeLabel = mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark';

  return <AppScreen footer={<AppSectionTabs active="settings" />}>
    <AppHeader compactTitle title="Settings" />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SettingSection label="APPEARANCE"><SettingGroup><SettingsRow description={`${themePack.name} · ${modeLabel}`} grouped icon="color-palette-outline" label="Appearance" onPress={() => router.push('/appearance')} /></SettingGroup></SettingSection>
      <SettingSection label="NOTIFICATIONS"><SettingGroup><SettingsRow description={notificationSummary} grouped icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} /></SettingGroup></SettingSection>
      <SettingSection label="ACCOUNT"><SettingGroup><SettingsRow description="Name and signed-in account identity" divider grouped icon="person-outline" label="Student Profile" onPress={() => router.push('/profile')} /><SettingsRow danger description={isLoggingOut ? 'Signing out…' : 'End this session on this device'} disabled={isLoggingOut} grouped icon="log-out-outline" label="Sign out" onPress={() => void handleLogout()} /></SettingGroup></SettingSection>
      {error ? <ErrorBanner message={error} /> : null}
      <SettingSection label="ABOUT"><View style={[styles.version, { borderColor: colors.border }]}><ThemedText style={styles.versionTitle}>Study Planner</ThemedText><ThemedText style={[styles.versionText, { color: colors.textSecondary }]}>Version {Constants.expoConfig?.version ?? '1.0.0'}</ThemedText></View></SettingSection>
    </ScrollView>
  </AppScreen>;
}

function SettingSection({ children, label }: PropsWithChildren<{ label: string }>) { const { colors } = useAppearance(); return <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>{label}</ThemedText>{children}</View>; }
function SettingGroup({ children }: PropsWithChildren) { const { colors } = useAppearance(); return <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>; }

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.xl, padding: DesignTokens.layout.screenPadding, paddingBottom: 132 }, section: { gap: DesignTokens.spacing.sm }, sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, lineHeight: 14, paddingHorizontal: 2 }, group: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' }, version: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, paddingTop: DesignTokens.spacing.md }, versionTitle: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, versionText: { fontSize: 10, lineHeight: 14 } });
