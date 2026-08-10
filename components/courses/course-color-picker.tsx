import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ColorPicker, { HueSlider, Panel1, type ColorFormatsObject } from 'reanimated-color-picker';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { COURSE_COLORS } from '@/lib/courses/course-form';

export function CourseColorPicker({ error, onChange, value }: { error?: string; onChange: (value: string) => void; value: string }) {
  const { colors } = useAppearance();
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(value);
  useEffect(() => { if (visible) setCustom(value); }, [value, visible]);
  const updateCustom = ({ hex }: ColorFormatsObject) => setCustom(hex.toUpperCase());

  return <View style={styles.field}>
    <ThemedText style={styles.label}>Course color</ThemedText>
    <View style={styles.options}>{COURSE_COLORS.map((color) => <ColorOption color={color} key={color} onPress={() => onChange(color)} selected={value.toUpperCase() === color.toUpperCase()} />)}<Pressable accessibilityLabel="Choose a custom color" accessibilityRole="button" onPress={() => setVisible(true)} style={({ pressed }) => [styles.customButton, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primary} name="add" size={19} /></Pressable></View>
    {error ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{error}</ThemedText> : null}
    <AppBottomSheet expandable initialSnap={0.68} onClose={() => setVisible(false)} title="Custom color" visible={visible} footer={<View style={styles.footer}><Pressable onPress={() => setVisible(false)} style={styles.footerAction}><ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</ThemedText></Pressable><Pressable onPress={() => { onChange(custom); setVisible(false); }} style={[styles.done, { backgroundColor: colors.primary }]}><ThemedText style={{ color: colors.primaryText, fontWeight: '700' }}>Use Color</ThemedText></Pressable></View>}>
      <View style={styles.pickerContent}><ThemedText style={[styles.helper, { color: colors.textSecondary }]}>Drag through the spectrum to create a course color.</ThemedText><View style={[styles.preview, { backgroundColor: custom, borderColor: colors.border }]} /><ColorPicker boundedThumb onChangeJS={updateCustom} sliderThickness={24} style={styles.picker} thumbSize={24} value={custom}><Panel1 style={styles.panel} /><HueSlider style={styles.hue} /></ColorPicker></View>
    </AppBottomSheet>
  </View>;
}

function ColorOption({ color, onPress, selected }: { color: string; onPress: () => void; selected: boolean }) { const { colors } = useAppearance(); return <Pressable accessibilityLabel={`Select color ${color}`} accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.option, { borderColor: selected ? colors.text : 'transparent', transform: [{ scale: selected ? 1.08 : 1 }] }, pressed ? styles.pressed : undefined]}><View style={[styles.swatch, { backgroundColor: color }]} /></Pressable>; }
const styles = StyleSheet.create({ field: { gap: DesignTokens.spacing.sm }, label: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, option: { alignItems: 'center', borderRadius: 21, borderWidth: 2, height: 42, justifyContent: 'center', width: 42 }, swatch: { borderRadius: 16, height: 32, width: 32 }, customButton: { alignItems: 'center', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, height: 40, justifyContent: 'center', width: 40 }, error: { fontSize: 11, lineHeight: 15 }, pickerContent: { flex: 1, gap: DesignTokens.spacing.md, paddingHorizontal: DesignTokens.layout.screenPadding }, helper: { fontSize: 11, lineHeight: 15 }, preview: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, height: 54 }, picker: { gap: DesignTokens.spacing.lg }, panel: { borderRadius: DesignTokens.radius.md, height: 190 }, hue: { borderRadius: DesignTokens.radius.pill, height: 26 }, footer: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, footerAction: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 }, done: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, justifyContent: 'center', minHeight: 44 }, pressed: { opacity: 0.65 } });
