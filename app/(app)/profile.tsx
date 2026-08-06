import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { StudentProfileCard } from '@/components/settings/student-profile-card';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';
import { useDashboard } from '@/contexts/dashboard-context';

export default function ProfileScreen() {
  const { user } = useAuth();
  const dashboard = useDashboard();
  const refreshDashboard = dashboard.refresh;
  const completedThisWeek = useMemo(() => { const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6); return dashboard.tasks.filter((task) => task.completedAt && Date.parse(task.completedAt) >= start.getTime()).length; }, [dashboard.tasks]);
  useFocusEffect(useCallback(() => { void refreshDashboard(); }, [refreshDashboard]));
  return <AppScreen edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} onRightAction={() => router.push('/settings')} rightActionLabel="Settings" subtitle="Your personal corner of the workspace." title="Student Profile" /><ScrollView contentContainerStyle={styles.content}><StudentProfileCard activeCourses={dashboard.courses.length} name={user?.name ?? 'Student'} taskMetricLabel="Completed this week" tasksThisWeek={completedThisWeek} /><View style={styles.links}><ProfileLink description="Choose light, dark, and study themes" icon="color-palette-outline" label="Appearance" onPress={() => router.push('/appearance')} /><ProfileLink description="Account details and sign out" icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} /></View><BentoCard tone="subtle"><ThemedText type="defaultSemiBold">Built for your semester</ThemedText><ThemedText>Your card uses planner activity only. No student ID, school, program, or QR code is required.</ThemedText></BentoCard></ScrollView></AppScreen>;
}

function ProfileLink({ description, icon, label, onPress }: { description: string; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) { const { colors } = useAppearance(); return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.link, { backgroundColor: colors.surface }, pressed ? styles.pressed : undefined]}><View style={[styles.linkIcon, { backgroundColor: colors.primaryContainer }]}><Ionicons color={colors.primary} name={icon} size={DesignTokens.icon.lg} /></View><View style={styles.linkText}><ThemedText type="defaultSemiBold">{label}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{description}</ThemedText></View><Ionicons color={colors.textSecondary} name="chevron-forward" size={DesignTokens.icon.md} /></Pressable>; }
const styles = StyleSheet.create({ content: { gap: DesignTokens.layout.sectionGap, padding: DesignTokens.layout.screenPadding, paddingBottom: 48 }, links: { gap: DesignTokens.spacing.md }, link: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: 76, padding: DesignTokens.spacing.md }, linkIcon: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 44, justifyContent: 'center', width: 44 }, linkText: { flex: 1, gap: 2 }, pressed: { opacity: 0.72 } });
