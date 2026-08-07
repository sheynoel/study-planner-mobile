import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function MetricCard({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number | string }) {
  const { colors } = useAppearance();
  return <BentoCard style={styles.card} tone="subtle"><View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}><Ionicons color={colors.primary} name={icon} size={DesignTokens.icon.md} /></View><ThemedText style={styles.value}>{value}</ThemedText><ThemedText style={[styles.label, { color: colors.textSecondary }]}>{label}</ThemedText></BentoCard>;
}

const styles = StyleSheet.create({ card: { flex: 1, gap: DesignTokens.spacing.xs, minHeight: 104, padding: DesignTokens.spacing.md }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 32, justifyContent: 'center', width: 32 }, value: { fontSize: 22, fontWeight: '700', lineHeight: 26 }, label: { ...DesignTokens.typography.supporting } });
