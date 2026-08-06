import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppearanceSection } from '@/components/settings/appearance-section';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export default function AppearanceScreen() {
  const { colors, themePack } = useAppearance();
  return <AppScreen edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} subtitle="Tune the workspace to the way you study." title="Appearance" /><ScrollView contentContainerStyle={styles.content}><BentoCard style={styles.preview} tone="accent"><ThemedText type="defaultSemiBold" style={{ color: colors.primary }}>LIVE PREVIEW</ThemedText><ThemedText type="title">{themePack.name}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{themePack.description}</ThemedText><BentoCard><ThemedText type="defaultSemiBold">Study block · 4:00 PM</ThemedText><ThemedText style={{ color: colors.textSecondary }}>Your cards, text, and accents update instantly.</ThemedText></BentoCard></BentoCard><AppearanceSection /></ScrollView></AppScreen>;
}
const styles = StyleSheet.create({ content: { gap: DesignTokens.layout.sectionGap, padding: DesignTokens.layout.screenPadding, paddingBottom: 48 }, preview: { gap: DesignTokens.spacing.md } });
