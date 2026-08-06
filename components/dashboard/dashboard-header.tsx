import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function DashboardHeader({ classesToday, name, onOpenSettings, tasksDueToday }: { classesToday: number; name: string; onOpenSettings: () => void; tasksDueToday: number }) {
  const { colors } = useAppearance();
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <AppCard style={[styles.header, { backgroundColor: colors.surfaceAccent }]}>
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <ThemedText type="defaultSemiBold" style={[styles.eyebrow, { color: colors.primary }]}>MY STUDY DAY</ThemedText>
          <ThemedText type="title">Hello, {name}</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>{date}</ThemedText>
        </View>
        <Pressable accessibilityRole="button" onPress={onOpenSettings} style={({ pressed }) => [styles.profileButton, { backgroundColor: colors.surface }, pressed ? styles.pressed : undefined]}>
          <ThemedText type="defaultSemiBold" style={{ color: colors.primary }}>Profile</ThemedText>
        </Pressable>
      </View>
      <ThemedText type="defaultSemiBold">{countLabel(tasksDueToday, 'task')} due today · {countLabel(classesToday, 'class')} today</ThemedText>
    </AppCard>
  );
}

function countLabel(count: number, noun: string): string {
  const plural = noun === 'class' ? 'classes' : `${noun}s`;
  return `${count} ${count === 1 ? noun : plural}`;
}

const styles = StyleSheet.create({
  header: { gap: DesignTokens.spacing.md, marginHorizontal: DesignTokens.layout.screenPadding, marginBottom: DesignTokens.spacing.sm, marginTop: DesignTokens.spacing.md, padding: DesignTokens.spacing.xl },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.md },
  titleBlock: { flex: 1, gap: DesignTokens.spacing.xs },
  eyebrow: DesignTokens.typography.overline,
  profileButton: { borderRadius: DesignTokens.radius.pill, justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.md },
  pressed: { opacity: 0.72 },
});
