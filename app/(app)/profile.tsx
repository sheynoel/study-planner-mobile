import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { StudentProfileCard } from '@/components/settings/student-profile-card';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colors } = useAppearance();
  return <AppScreen edges={['top', 'bottom']}><AppHeader compactTitle onBack={() => router.back()} title="Student Profile" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><StudentProfileCard email={user?.email ?? 'Email unavailable'} name={user?.name ?? 'Student'} /><View style={[styles.note, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}><ThemedText style={styles.noteTitle}>About your profile</ThemedText><ThemedText style={[styles.noteText, { color: colors.textSecondary }]}>This screen is only for student and account identity. App appearance, behavior, and notifications live in Settings.</ThemedText></View></ScrollView></AppScreen>;
}

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.xl, padding: DesignTokens.layout.screenPadding, paddingBottom: 48 }, note: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, gap: 3, padding: DesignTokens.spacing.md }, noteTitle: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, noteText: { fontSize: 10, lineHeight: 14 } });
