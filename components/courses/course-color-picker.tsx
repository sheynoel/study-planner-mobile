import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { COURSE_COLORS } from '@/lib/courses/course-form';

const HUES = [0, 30, 60, 120, 170, 210, 250, 290, 330] as const;
const SHADES = [{ saturation: 48, lightness: 68 }, { saturation: 62, lightness: 56 }, { saturation: 76, lightness: 46 }, { saturation: 88, lightness: 38 }, { saturation: 38, lightness: 52 }, { saturation: 58, lightness: 40 }] as const;

export function CourseColorPicker({ error, onChange, value }: { error?: string; onChange: (value: string) => void; value: string }) {
  const { colors } = useAppearance();
  const [visible, setVisible] = useState(false);
  const [hue, setHue] = useState(210);
  const [custom, setCustom] = useState(value);
  const visualColors = useMemo(() => SHADES.map((shade) => hslToHex(hue, shade.saturation, shade.lightness)), [hue]);
  useEffect(() => { if (visible) { setCustom(value); setHue(hexToHue(value) ?? 210); } }, [value, visible]);

  return <View style={styles.field}>
    <ThemedText type="defaultSemiBold">Course color</ThemedText>
    <View style={styles.options}>{COURSE_COLORS.map((color) => <ColorOption color={color} key={color} onPress={() => onChange(color)} selected={value.toUpperCase() === color.toUpperCase()} />)}<Pressable accessibilityLabel="Choose a custom color" accessibilityRole="button" onPress={() => setVisible(true)} style={({ pressed }) => [styles.customButton, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name="add" size={19} /></Pressable></View>
    {error ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{error}</ThemedText> : null}
    <Modal animationType="fade" onRequestClose={() => setVisible(false)} transparent visible={visible}><Pressable onPress={() => setVisible(false)} style={styles.backdrop}><Pressable onPress={(event) => event.stopPropagation()} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}><View><ThemedText type="subtitle">Custom color</ThemedText><ThemedText style={[styles.helper, { color: colors.textSecondary }]}>Choose a hue, then a shade.</ThemedText></View><Pressable accessibilityLabel="Close custom color" onPress={() => setVisible(false)} style={styles.close}><Ionicons color={colors.text} name="close" size={21} /></Pressable></View>
      <View style={[styles.preview, { backgroundColor: custom }]} />
      <View style={styles.pickerSection}><ThemedText style={styles.pickerLabel}>Hue</ThemedText><View style={styles.hueRow}>{HUES.map((item) => { const color = hslToHex(item, 80, 50); const selected = hue === item; return <Pressable accessibilityLabel={`Select hue ${item}`} accessibilityRole="button" accessibilityState={{ selected }} key={item} onPress={() => { setHue(item); setCustom(hslToHex(item, 62, 56)); }} style={[styles.hue, { backgroundColor: color }, selected ? { borderColor: colors.text, borderWidth: 3 } : undefined]} />; })}</View></View>
      <View style={styles.pickerSection}><ThemedText style={styles.pickerLabel}>Shade</ThemedText><View style={styles.shadeGrid}>{visualColors.map((color) => <Pressable accessibilityLabel="Select this shade" accessibilityRole="button" accessibilityState={{ selected: custom === color }} key={color} onPress={() => setCustom(color)} style={[styles.shade, { backgroundColor: color }, custom === color ? { borderColor: colors.text, borderWidth: 3 } : undefined]}>{custom === color ? <Ionicons color="#FFFFFF" name="checkmark" size={18} /> : null}</Pressable>)}</View></View>
      <Pressable onPress={() => { onChange(custom); setVisible(false); }} style={({ pressed }) => [styles.save, { backgroundColor: colors.primary }, pressed ? styles.pressed : undefined]}><ThemedText style={{ color: colors.primaryText, fontWeight: '700' }}>Use color</ThemedText></Pressable>
    </Pressable></Pressable></Modal>
  </View>;
}

function ColorOption({ color, onPress, selected }: { color: string; onPress: () => void; selected: boolean }) { const { colors } = useAppearance(); return <Pressable accessibilityLabel={`Select color ${color}`} accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.option, selected ? { borderColor: colors.text } : undefined, pressed ? styles.pressed : undefined]}><View style={[styles.swatch, { backgroundColor: color }]} />{selected ? <Ionicons color="#FFFFFF" name="checkmark" size={15} /> : null}</Pressable>; }
function hslToHex(hue: number, saturation: number, lightness: number): string { const s = saturation / 100; const l = lightness / 100; const c = (1 - Math.abs(2 * l - 1)) * s; const x = c * (1 - Math.abs((hue / 60) % 2 - 1)); const m = l - c / 2; const [r, g, b] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x]; return `#${[r, g, b].map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`; }
function hexToHue(value: string): number | null { if (!/^#[0-9a-fA-F]{6}$/.test(value)) return null; const r = parseInt(value.slice(1, 3), 16) / 255; const g = parseInt(value.slice(3, 5), 16) / 255; const b = parseInt(value.slice(5, 7), 16) / 255; const max = Math.max(r, g, b); const min = Math.min(r, g, b); const delta = max - min; if (!delta) return 210; const raw = max === r ? 60 * (((g - b) / delta) % 6) : max === g ? 60 * ((b - r) / delta + 2) : 60 * ((r - g) / delta + 4); const target = (raw + 360) % 360; return HUES.reduce((closest, item) => Math.abs(item - target) < Math.abs(closest - target) ? item : closest, HUES[0]); }

const styles = StyleSheet.create({ field: { gap: DesignTokens.spacing.sm }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, option: { alignItems: 'center', borderColor: 'transparent', borderRadius: 20, borderWidth: 2, height: 40, justifyContent: 'center', width: 40 }, swatch: { borderRadius: 16, height: 32, position: 'absolute', width: 32 }, customButton: { alignItems: 'center', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, height: 40, justifyContent: 'center', width: 40 }, error: { fontSize: 12, lineHeight: 16 }, pressed: { opacity: 0.65 }, backdrop: { alignItems: 'center', backgroundColor: 'rgba(12, 15, 18, 0.48)', flex: 1, justifyContent: 'center', padding: DesignTokens.layout.screenPadding }, card: { borderRadius: DesignTokens.radius.xxl, borderWidth: StyleSheet.hairlineWidth, gap: DesignTokens.spacing.lg, maxWidth: 380, padding: DesignTokens.spacing.lg, width: '100%', ...Shadows }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, helper: { fontSize: 11, lineHeight: 15 }, close: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }, preview: { borderRadius: DesignTokens.radius.lg, height: 72 }, pickerSection: { gap: DesignTokens.spacing.sm }, pickerLabel: { fontSize: 12, fontWeight: '700' }, hueRow: { flexDirection: 'row', justifyContent: 'space-between' }, hue: { borderColor: 'transparent', borderRadius: 15, height: 30, width: 30 }, shadeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm }, shade: { alignItems: 'center', borderColor: 'transparent', borderRadius: DesignTokens.radius.md, height: 56, justifyContent: 'center', width: '30.8%' }, save: { alignItems: 'center', borderRadius: DesignTokens.radius.md, justifyContent: 'center', minHeight: 46 } });
