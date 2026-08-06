import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function StudentProfileCard({ activeCourses, name, taskMetricLabel = 'Tasks this week', tasksThisWeek }: { activeCourses: number; name: string; taskMetricLabel?: string; tasksThisWeek: number }) {
  const { colors, themePack } = useAppearance();
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ST';
  return (
    <AppCard style={[styles.card, { backgroundColor: colors.surfaceAccent, borderColor: colors.primary }]}>
      <View style={[styles.patternLarge, { borderColor: colors.primary }]} /><View style={[styles.patternSmall, { backgroundColor: colors.primary }]} />
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}><ThemedText type="subtitle" style={{ color: colors.primaryText }}>{initials}</ThemedText></View>
        <View style={styles.identity}>
          <ThemedText type="title" numberOfLines={2} style={styles.name}>{name}</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ color: colors.primary }}>STUDENT · STUDY PLANNER</ThemedText>
        </View>
      </View>
      <View style={[styles.rule, { backgroundColor: colors.primary }]} />
      <View style={styles.stats}>
        <Stat label="Active courses" value={String(activeCourses)} />
        <Stat label={taskMetricLabel} value={String(tasksThisWeek)} />
        <View style={styles.stat}>
          <View style={[styles.accentDot, { backgroundColor: colors.primary }]} />
          <ThemedText type="defaultSemiBold" numberOfLines={1}>{themePack.name}</ThemedText>
          <ThemedText style={styles.statLabel}>Theme accent</ThemedText>
        </View>
      </View>
    </AppCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><ThemedText type="subtitle">{value}</ThemedText><ThemedText style={styles.statLabel}>{label}</ThemedText></View>;
}

const styles = StyleSheet.create({
  card: { gap: DesignTokens.spacing.lg, overflow: 'hidden', padding: DesignTokens.spacing.xl },
  topRow: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.lg },
  avatar: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, height: 64, justifyContent: 'center', width: 64 },
  identity: { flex: 1, gap: DesignTokens.spacing.xs },
  name: { fontSize: 26, lineHeight: 31 },
  rule: { height: 2, opacity: 0.35 },
  stats: { flexDirection: 'row', gap: DesignTokens.spacing.md },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontSize: 12, lineHeight: 16 },
  accentDot: { borderRadius: DesignTokens.radius.pill, height: 18, width: 18 },
  patternLarge: { borderRadius: 90, borderWidth: 18, height: 150, opacity: 0.08, position: 'absolute', right: -54, top: -62, width: 150 },
  patternSmall: { borderRadius: 30, bottom: -18, height: 60, left: -16, opacity: 0.08, position: 'absolute', width: 60 },
});
