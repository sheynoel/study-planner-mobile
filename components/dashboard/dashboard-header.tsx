import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function DashboardHeader({ name, onOpenSettings }: { name: string; onOpenSettings: () => void }) {
  const { colors } = useAppearance();
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = name.trim().split(/\s+/)[0] || 'Student';
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'S';
  return <View style={styles.header}>
    <View style={styles.titleBlock}>
      <ThemedText style={styles.greeting}>Hello, {firstName}!</ThemedText>
      <ThemedText style={[styles.date, { color: colors.textMuted }]}>{date}</ThemedText>
    </View>
    <Pressable accessibilityLabel="Open profile" accessibilityRole="button" onPress={onOpenSettings} style={({ pressed }) => [styles.avatar, { backgroundColor: colors.primaryContainer }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.initials, { color: colors.primary }]}>{initials}</ThemedText></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md, marginBottom: DesignTokens.spacing.sm, marginHorizontal: DesignTokens.layout.screenPadding, marginTop: DesignTokens.spacing.md },
  titleBlock: { flex: 1, gap: 1, minWidth: 0 },
  greeting: { fontSize: 27, fontWeight: '700', lineHeight: 33 },
  date: { fontSize: 13, lineHeight: 18 },
  avatar: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, height: 42, justifyContent: 'center', width: 42 },
  initials: { fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
