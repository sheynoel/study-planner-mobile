import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { AppearanceSection } from '@/components/settings/appearance-section';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export default function AppearanceScreen() {
  const { colors, themePack } = useAppearance();
  return <AppScreen edges={['top', 'bottom']}><AppHeader compactTitle onBack={() => router.back()} title="Appearance" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.previewBlock}><ThemedText style={[styles.label, { color: colors.textSecondary }]}>THEME PREVIEW</ThemedText><View style={[styles.preview, { backgroundColor: colors.surfaceAccent, borderColor: colors.border }]}><View style={styles.previewText}><ThemedText numberOfLines={1} style={styles.previewTitle}>{themePack.name}</ThemedText><ThemedText numberOfLines={1} style={[styles.previewDescription, { color: colors.textSecondary }]}>Sample card and action</ThemedText></View><View style={[styles.sampleAction, { backgroundColor: colors.primary }]} /></View></View>
    <AppearanceSection />
  </ScrollView></AppScreen>;
}

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.xl, padding: DesignTokens.layout.screenPadding, paddingBottom: 48 }, previewBlock: { gap: DesignTokens.spacing.sm }, label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, lineHeight: 14 }, preview: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: 72, padding: DesignTokens.spacing.md }, previewText: { flex: 1, minWidth: 0 }, previewTitle: { fontSize: 14, fontWeight: '800', lineHeight: 19 }, previewDescription: { fontSize: 11, lineHeight: 15 }, sampleAction: { borderRadius: DesignTokens.radius.pill, height: 28, width: 28 } });
