import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function PersonalLibraryCard({ fileCount, onPress }: { fileCount: number; onPress: () => void }) {
  const { colors } = useAppearance();
  return <BentoCard onPress={onPress} style={styles.card} tone="accent"><View style={[styles.icon, { backgroundColor: colors.surface }]}><Ionicons color={colors.primary} name="library-outline" size={DesignTokens.icon.lg} /></View><View style={styles.text}><ThemedText type="subtitle">Personal Library</ThemedText><ThemedText style={{ color: colors.textSecondary }}>Unassigned notes, references, and study files</ThemedText><ThemedText type="defaultSemiBold">{fileCount} {fileCount === 1 ? 'material' : 'materials'}</ThemedText></View><Ionicons color={colors.primary} name="chevron-forward" size={DesignTokens.icon.md} /></BentoCard>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: 112 }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, height: 52, justifyContent: 'center', width: 52 }, text: { flex: 1, gap: DesignTokens.spacing.xs } });
