import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { SectionHeader } from '@/components/ui/section-header';
import { DesignTokens, ThemePackList, type AppearanceMode, type ThemePack } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

const MODES: readonly { label: string; value: AppearanceMode }[] = [
  { label: 'Follow system', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function AppearanceSection() {
  const { colors, mode, setMode, setThemePack, themePackId } = useAppearance();
  return (
    <View style={styles.section}>
      <SectionHeader title="Appearance" />
      <AppCard style={styles.card}>
        <View style={styles.group}>
          <ThemedText type="defaultSemiBold">Display mode</ThemedText>
          <View style={styles.choices}>
            {MODES.map((option) => <ChoiceChip key={option.value} label={option.label} onPress={() => setMode(option.value)} selected={mode === option.value} />)}
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.group}>
          <ThemedText type="defaultSemiBold">Theme pack</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>Choose the atmosphere that helps you settle in and study.</ThemedText>
          <View style={styles.packs}>
            {ThemePackList.map((pack) => <ThemePackOption key={pack.id} pack={pack} selected={themePackId === pack.id} onPress={() => setThemePack(pack.id)} />)}
          </View>
        </View>
      </AppCard>
    </View>
  );
}

function ThemePackOption({ onPress, pack, selected }: { onPress: () => void; pack: ThemePack; selected: boolean }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.pack, selected ? styles.selectedPack : undefined, pressed ? styles.pressed : undefined]}>
      <View style={styles.swatches}>
        <View style={[styles.swatch, { backgroundColor: pack.colors.light.background }]} />
        <View style={[styles.swatch, { backgroundColor: pack.colors.light.primary }]} />
        <View style={[styles.swatch, { backgroundColor: pack.colors.dark.surface }]} />
      </View>
      <View style={styles.packText}>
        <ThemedText type="defaultSemiBold">{selected ? '✓ ' : ''}{pack.name}</ThemedText>
        <ThemedText style={styles.description}>{pack.description}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: DesignTokens.spacing.md },
  card: { gap: DesignTokens.spacing.lg },
  group: { gap: DesignTokens.spacing.md },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm },
  divider: { backgroundColor: 'rgba(127,127,127,0.45)', height: StyleSheet.hairlineWidth },
  packs: { gap: DesignTokens.spacing.sm },
  pack: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: 68, padding: DesignTokens.spacing.md },
  selectedPack: { backgroundColor: 'rgba(127, 127, 127, 0.12)' },
  pressed: { opacity: 0.72 },
  swatches: { flexDirection: 'row' },
  swatch: { borderColor: 'rgba(0,0,0,0.12)', borderRadius: DesignTokens.radius.pill, borderWidth: 1, height: 28, marginRight: -7, width: 28 },
  packText: { flex: 1, gap: 2 },
  description: { fontSize: 14, lineHeight: 20 },
});
