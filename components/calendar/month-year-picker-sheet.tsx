import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MonthYearPickerSheet({ month, onClose, onGo, visible }: { month: Date; onClose: () => void; onGo: (month: Date) => void; visible: boolean }) {
  const { colors } = useAppearance();
  const [draftMonth, setDraftMonth] = useState(month.getMonth());
  const [draftYear, setDraftYear] = useState(month.getFullYear());
  useEffect(() => { if (visible) { setDraftMonth(month.getMonth()); setDraftYear(month.getFullYear()); } }, [month, visible]);
  return <AppBottomSheet initialSnap={0.62} onClose={onClose} title="Choose month" visible={visible} footer={<View style={styles.footer}><AppButton label="Cancel" onPress={onClose} variant="ghost" /><View style={styles.footerButton}><AppButton label="Go" onPress={() => { onGo(new Date(draftYear, draftMonth, 1)); onClose(); }} /></View></View>}>
    <View style={styles.content}>
      <View style={styles.yearRow}><YearButton icon="chevron-back" label="Previous year" onPress={() => setDraftYear((year) => year - 1)} /><ThemedText accessibilityLabel={`Selected year ${draftYear}`} style={styles.year}>{draftYear}</ThemedText><YearButton icon="chevron-forward" label="Next year" onPress={() => setDraftYear((year) => year + 1)} /></View>
      <View style={styles.grid}>{MONTHS.map((label, index) => { const selected = index === draftMonth; return <Pressable accessibilityRole="button" accessibilityState={{ selected }} key={label} onPress={() => setDraftMonth(index)} style={({ pressed }) => [styles.month, { backgroundColor: selected ? colors.primaryContainer : colors.surfaceSubtle, borderColor: selected ? colors.primary : colors.border }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.monthLabel, { color: selected ? colors.primary : colors.text }]}>{label}</ThemedText></Pressable>; })}</View>
    </View>
  </AppBottomSheet>;
}

function YearButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) { const { colors } = useAppearance(); return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.yearButton}><Ionicons color={colors.primary} name={icon} size={20} /></Pressable>; }
const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, paddingHorizontal: DesignTokens.layout.screenPadding }, yearRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }, yearButton: { alignItems: 'center', height: DesignTokens.size.touchTarget, justifyContent: 'center', width: DesignTokens.size.touchTarget }, year: { fontSize: 18, fontWeight: '800', minWidth: 92, textAlign: 'center' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm }, month: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: 1, justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, width: '30.8%' }, monthLabel: { fontSize: 12, fontWeight: '700' }, footer: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm }, footerButton: { flex: 1 }, pressed: { opacity: 0.66 } });
