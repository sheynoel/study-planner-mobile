import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function DashboardHeader({ name }: { name: string }) {
  const { colors } = useAppearance();
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = name.trim().split(/\s+/)[0] || 'Student';
  return <View style={styles.header}>
    <View style={styles.titleBlock}>
      <ThemedText numberOfLines={1} style={styles.greeting}>Hello, {firstName}</ThemedText>
      <ThemedText style={[styles.date, { color: colors.textMuted }]}>{date}</ThemedText>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md, marginBottom: DesignTokens.spacing.xl, marginHorizontal: DesignTokens.layout.screenPadding, marginTop: DesignTokens.spacing.md },
  titleBlock: { flex: 1, gap: 1, minWidth: 0 },
  greeting: { fontSize: 25, fontWeight: '700', lineHeight: 31 },
  date: { fontSize: 13, lineHeight: 18 },
});
