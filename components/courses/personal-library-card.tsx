import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function PersonalLibraryCard({ onPress }: { fileCount?: number; onPress: () => void }) {
  const { colors } = useAppearance();
  return <BentoCard onPress={onPress} style={[styles.card, { backgroundColor: colors.surfaceAccent }]}><View style={[styles.icon, { backgroundColor: colors.surface }]}><Ionicons color={colors.primary} name="library-outline" size={17} /></View><ThemedText numberOfLines={2} style={styles.title}>Personal Library</ThemedText><Ionicons color={colors.primary} name="chevron-forward" size={15} /></BentoCard>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 62, padding: DesignTokens.spacing.sm, width: 176 }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 36, justifyContent: 'center', width: 36 }, title: { flex: 1, fontSize: 12, fontWeight: '800', lineHeight: 16 } });
