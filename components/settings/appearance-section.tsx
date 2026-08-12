import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ColorPicker, { HueSlider, Panel1, type ColorFormatsObject } from 'reanimated-color-picker';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens, ThemePackList, type AppearanceMode, type ThemePack } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

const MODES: readonly { icon: keyof typeof Ionicons.glyphMap; label: string; value: AppearanceMode }[] = [
  { icon: 'phone-portrait-outline', label: 'System', value: 'system' },
  { icon: 'sunny-outline', label: 'Light', value: 'light' },
  { icon: 'moon-outline', label: 'Dark', value: 'dark' },
];

export const ACCENT_COLORS = ['#64806A', '#7D6DA8', '#A56577', '#B16D62', '#B57858', '#C28A45', '#91824F', '#4F7659', '#4D8A73', '#437E86', '#507FAB', '#6579B2', '#865F9E', '#A15F8C', '#A85E5E', '#6F7882', '#4F5A60', '#896E58', '#7B6B61', '#384047'] as const;

export function AppearanceSection() {
  const { accentColor, colors, mode, resolvedMode, setAccentColor, setMode, setThemePack, themePack, themePackId } = useAppearance();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [custom, setCustom] = useState(accentColor ?? themePack.colors.light.primary);
  useEffect(() => { if (pickerVisible) setCustom(accentColor ?? colors.primary); }, [accentColor, colors.primary, pickerVisible]);

  return <View style={styles.section}>
    <SettingLabel label="MODE" />
    <View style={[styles.modeGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>{MODES.map((option) => {
      const selected = mode === option.value;
      return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={option.value} onPress={() => setMode(option.value)} style={({ pressed }) => [styles.mode, { backgroundColor: selected ? colors.primaryContainer : 'transparent', borderColor: selected ? colors.primary : 'transparent' }, pressed ? styles.pressed : undefined]}><Ionicons color={selected ? colors.primary : colors.textSecondary} name={option.icon} size={17} /><ThemedText style={[styles.modeLabel, { color: selected ? colors.primary : colors.text }]}>{option.label}</ThemedText></Pressable>;
    })}</View>

    <View style={styles.heading}><SettingLabel label="SIMPLE THEMES" /><ThemedText style={[styles.helper, { color: colors.textSecondary }]}>Coordinated surfaces and accents. Course colors stay unchanged.</ThemedText></View>
    <View style={styles.themeGrid}>{ThemePackList.map((pack) => <ThemeOption key={pack.id} onPress={() => setThemePack(pack.id)} pack={pack} selected={themePackId === pack.id} />)}</View>

    <View style={styles.heading}><SettingLabel label="ACCENT COLOR" /><ThemedText style={[styles.helper, { color: colors.textSecondary }]}>Override the theme accent without recoloring Courses.</ThemedText></View>
    <View style={[styles.accentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.swatches}>
        <AccentOption color={themePack.colors[resolvedMode].primary} label="Use theme accent" onPress={() => setAccentColor(null)} selected={accentColor === null} />
        {ACCENT_COLORS.map((color) => <AccentOption color={color} key={color} label={`Use accent ${color}`} onPress={() => setAccentColor(color)} selected={accentColor?.toUpperCase() === color} />)}
        <Pressable accessibilityLabel="Choose custom accent color" accessibilityRole="button" onPress={() => setPickerVisible(true)} style={({ pressed }) => [styles.custom, { backgroundColor: colors.surfaceSubtle, borderColor: accentColor && !ACCENT_COLORS.includes(accentColor as typeof ACCENT_COLORS[number]) ? colors.primary : colors.border }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name="add" size={19} /></Pressable>
      </View>
    </View>

    <AppBottomSheet expandable footer={<View style={styles.footer}><Pressable onPress={() => setPickerVisible(false)} style={styles.footerButton}><ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</ThemedText></Pressable><Pressable onPress={() => { setAccentColor(custom); setPickerVisible(false); }} style={[styles.useColor, { backgroundColor: colors.primary }]}><ThemedText style={{ color: colors.primaryText, fontWeight: '700' }}>Use color</ThemedText></Pressable></View>} initialSnap={0.68} onClose={() => setPickerVisible(false)} title="Custom accent" visible={pickerVisible}>
      <View style={styles.pickerContent}><ThemedText style={[styles.helper, { color: colors.textSecondary }]}>Drag through the spectrum. No hex entry is required.</ThemedText><View style={[styles.customPreview, { backgroundColor: custom, borderColor: colors.border }]} /><ColorPicker boundedThumb onChangeJS={({ hex }: ColorFormatsObject) => setCustom(hex.toUpperCase())} sliderThickness={24} style={styles.picker} thumbSize={24} value={custom}><Panel1 style={styles.panel} /><HueSlider style={styles.hue} /></ColorPicker></View>
    </AppBottomSheet>
  </View>;
}

function SettingLabel({ label }: { label: string }) { const { colors } = useAppearance(); return <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>{label}</ThemedText>; }

function ThemeOption({ onPress, pack, selected }: { onPress: () => void; pack: ThemePack; selected: boolean }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.theme, { backgroundColor: colors.surface, borderColor: selected ? colors.primary : colors.border, borderWidth: selected ? 2 : StyleSheet.hairlineWidth }, pressed ? styles.pressed : undefined]}><View style={[styles.themePreview, { backgroundColor: pack.colors.light.background }]}><View style={[styles.previewSurface, { backgroundColor: pack.colors.light.surface }]} /><View style={[styles.previewAccent, { backgroundColor: pack.colors.light.primary }]} /></View><ThemedText numberOfLines={1} style={styles.themeName}>{pack.name}</ThemedText></Pressable>;
}

function AccentOption({ color, label, onPress, selected }: { color: string; label: string; onPress: () => void; selected: boolean }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityLabel={label} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.accentOption, { borderColor: selected ? colors.text : 'transparent' }, pressed ? styles.pressed : undefined]}><View style={[styles.accentSwatch, { backgroundColor: color }]} /></Pressable>;
}

const styles = StyleSheet.create({
  section: { gap: DesignTokens.spacing.md },
  heading: { gap: 3, marginTop: DesignTokens.spacing.sm },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, lineHeight: 14 },
  helper: { fontSize: 11, lineHeight: 15 },
  modeGroup: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 4, padding: 4 },
  mode: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: 1.5, flex: 1, flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 44, minWidth: 0, paddingHorizontal: 4 },
  modeLabel: { fontSize: 11, fontWeight: '700', lineHeight: 15 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm },
  theme: { borderRadius: DesignTokens.radius.md, flexBasis: '47%', flexGrow: 1, gap: 7, minHeight: 84, minWidth: 130, padding: 9 },
  themePreview: { borderRadius: DesignTokens.radius.sm, height: 42, overflow: 'hidden', padding: 7 },
  previewSurface: { borderRadius: 4, height: 27, width: '72%' },
  previewAccent: { borderRadius: DesignTokens.radius.pill, bottom: 7, height: 12, position: 'absolute', right: 7, width: 12 },
  themeName: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  accentCard: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: DesignTokens.spacing.md },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accentOption: { alignItems: 'center', borderRadius: 20, borderWidth: 2, height: 40, justifyContent: 'center', width: 40 },
  accentSwatch: { borderRadius: 15, height: 30, width: 30 },
  custom: { alignItems: 'center', borderRadius: 19, borderStyle: 'dashed', borderWidth: 1.5, height: 38, justifyContent: 'center', width: 38 },
  pickerContent: { flex: 1, gap: DesignTokens.spacing.md, paddingHorizontal: DesignTokens.layout.screenPadding },
  customPreview: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, height: 50 },
  picker: { gap: DesignTokens.spacing.lg },
  panel: { borderRadius: DesignTokens.radius.md, height: 190 },
  hue: { borderRadius: DesignTokens.radius.pill, height: 26 },
  footer: { flexDirection: 'row', gap: DesignTokens.spacing.sm },
  footerButton: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 },
  useColor: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, justifyContent: 'center', minHeight: 44 },
  pressed: { opacity: 0.68 },
});
