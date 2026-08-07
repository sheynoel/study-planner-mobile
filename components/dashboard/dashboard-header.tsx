import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function DashboardHeader({ classesToday, name, onOpenSettings, tasksDueToday }: { classesToday: number; name: string; onOpenSettings: () => void; tasksDueToday: number }) {
  const { colors } = useAppearance();
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = name.trim().split(/\s+/)[0] || 'Student';
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'S';
  return (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <ThemedText type="title">Hello, {firstName}</ThemedText>
        <ThemedText style={[styles.date, { color: colors.textMuted }]}>{date}</ThemedText>
        <ThemedText style={[styles.summary, { color: colors.textSecondary }]}>{countLabel(tasksDueToday, 'task')} due · {countLabel(classesToday, 'class')} today</ThemedText>
      </View>
      <Pressable accessibilityLabel="Open profile" accessibilityRole="button" onPress={onOpenSettings} style={({ pressed }) => [styles.avatar, { backgroundColor: colors.primaryContainer }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.initials, { color: colors.primary }]}>{initials}</ThemedText></Pressable>
    </View>
  );
}

function countLabel(count: number, noun: string): string {
  const plural = noun === 'class' ? 'classes' : `${noun}s`;
  return `${count} ${count === 1 ? noun : plural}`;
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md, marginHorizontal: DesignTokens.layout.screenPadding, marginBottom: DesignTokens.spacing.sm, marginTop: DesignTokens.spacing.md },
  titleBlock: { flex: 1, gap: 1, minWidth: 0 },
  date: { fontSize: 13, lineHeight: 18 },
  summary: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  avatar: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, height: 46, justifyContent: 'center', width: 46 },
  initials: { fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
