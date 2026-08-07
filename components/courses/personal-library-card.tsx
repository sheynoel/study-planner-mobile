import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function PersonalLibraryCard({ fileCount, onPress }: { fileCount: number; onPress: () => void }) {
  const { colors } = useAppearance();
  return <BentoCard onPress={onPress} style={styles.card} tone="accent"><View style={[styles.icon, { backgroundColor: colors.surface }]}><Ionicons color={colors.primary} name="library-outline" size={20} /></View><View style={styles.text}><ThemedText numberOfLines={1} style={styles.title}>Personal Library</ThemedText><ThemedText numberOfLines={1} style={[styles.subtitle, { color: colors.textSecondary }]}>Unassigned study materials</ThemedText></View><ThemedText style={[styles.count, { color: colors.primary }]}>{fileCount}</ThemedText><Ionicons color={colors.primary} name="chevron-forward" size={18} /></BentoCard>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 78, padding: DesignTokens.spacing.md }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 40, justifyContent: 'center', width: 40 }, text: { flex: 1, gap: 2, minWidth: 0 }, title: { fontSize: 16, fontWeight: '700', lineHeight: 20 }, subtitle: { fontSize: 12, lineHeight: 16 }, count: { fontSize: 13, fontWeight: '700' } });
