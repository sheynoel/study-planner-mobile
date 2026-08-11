import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export type HomeContextWidgetData = {
  label: string;
  title: string;
  subtitle?: string | null;
  metadata?: string | null;
  color?: string | null;
  accessibilityLabel: string;
};

export function HomeContextWidget({ data, onPress }: { data: HomeContextWidgetData; onPress: () => void }) {
  const { colors } = useAppearance();
  const accent = data.color ?? colors.primary;
  return <Pressable accessibilityLabel={data.accessibilityLabel} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderTopColor: accent }, pressed ? styles.pressed : undefined]}>
    <ThemedText style={[styles.label, { color: accent }]}>{data.label}</ThemedText>
    <ThemedText numberOfLines={1} style={styles.title}>{data.title}</ThemedText>
    {data.subtitle ? <ThemedText numberOfLines={1} style={[styles.subtitle, { color: colors.textSecondary }]}>{data.subtitle}</ThemedText> : <View style={styles.subtitlePlaceholder} />}
    {data.metadata ? <ThemedText numberOfLines={1} style={[styles.metadata, { color: colors.textSecondary }]}>{data.metadata}</ThemedText> : <View style={styles.metadataPlaceholder} />}
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { borderRadius: DesignTokens.radius.lg, borderTopWidth: 3, borderWidth: StyleSheet.hairlineWidth, flex: 1, height: 116, minWidth: 0, padding: DesignTokens.spacing.md, ...Shadows },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 0.7, lineHeight: 12, marginBottom: 5 },
  title: { fontSize: 13, fontWeight: '800', lineHeight: 17 },
  subtitle: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  metadata: { fontSize: 10, fontWeight: '600', lineHeight: 14, marginTop: 'auto' },
  subtitlePlaceholder: { height: 17 },
  metadataPlaceholder: { flex: 1 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
});
