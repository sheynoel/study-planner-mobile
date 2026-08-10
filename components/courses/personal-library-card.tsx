import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function PersonalLibraryCard({ onPress }: { fileCount?: number; onPress: () => void }) {
  const { colors } = useAppearance();
  return <BentoCard onPress={onPress} style={[styles.card, { backgroundColor: colors.surfaceAccent }]}><View style={[styles.icon, { backgroundColor: colors.surface }]}><Ionicons color={colors.primary} name="library-outline" size={19} /></View><View style={styles.text}><ThemedText numberOfLines={1} style={styles.title}>Personal Library</ThemedText><ThemedText numberOfLines={1} style={[styles.subtitle, { color: colors.textSecondary }]}>Your unassigned study materials</ThemedText></View><Ionicons color={colors.primary} name="chevron-forward" size={17} /></BentoCard>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 66, padding: DesignTokens.spacing.sm }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 40, justifyContent: 'center', width: 40 }, text: { flex: 1, gap: 1, minWidth: 0 }, title: { fontSize: 14, fontWeight: '800', lineHeight: 18 }, subtitle: { fontSize: 11, lineHeight: 15 } });
