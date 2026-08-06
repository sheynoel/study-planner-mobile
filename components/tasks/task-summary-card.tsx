import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function TaskSummaryCard({ kind, label, value }: { kind: 'today' | 'overdue'; label: string; value: number }) {
  const { colors } = useAppearance();
  const accent = kind === 'overdue' ? colors.overdue : colors.primary;
  return <BentoCard style={styles.card} tone={kind === 'overdue' && value > 0 ? 'surface' : 'subtle'}>
    <View style={[styles.icon, { backgroundColor: kind === 'overdue' ? colors.overdueContainer : colors.primaryContainer }]}><Ionicons color={accent} name={kind === 'overdue' ? 'alert-circle-outline' : 'today-outline'} size={DesignTokens.icon.lg} /></View>
    <View><ThemedText type="title" style={{ color: accent }}>{value}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{label}</ThemedText></View>
  </BentoCard>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: 96, padding: DesignTokens.spacing.md }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 42, justifyContent: 'center', width: 42 } });
