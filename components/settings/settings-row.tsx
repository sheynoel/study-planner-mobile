import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function SettingsRow({ danger = false, description, disabled = false, divider = false, grouped = false, icon, label, onPress, trailing }: { danger?: boolean; description?: string; disabled?: boolean; divider?: boolean; grouped?: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; trailing?: string }) {
  const { colors } = useAppearance();
  const actionColor = danger ? colors.dangerText : colors.primary;
  return <Pressable accessibilityRole={onPress && !disabled ? 'button' : undefined} disabled={disabled || !onPress} onPress={onPress} style={({ pressed }) => [styles.row, grouped ? styles.grouped : { backgroundColor: colors.surface, borderColor: colors.outline }, divider ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : undefined, disabled ? styles.disabled : undefined, pressed ? styles.pressed : undefined]}><View style={[styles.icon, { backgroundColor: danger ? colors.dangerSurface : colors.primaryContainer }]}><Ionicons color={actionColor} name={icon} size={18} /></View><View style={styles.text}><ThemedText numberOfLines={1} style={[styles.title, danger ? { color: colors.dangerText } : undefined]}>{label}</ThemedText>{description ? <ThemedText numberOfLines={2} style={[styles.description, { color: colors.textSecondary }]}>{description}</ThemedText> : null}</View>{trailing ? <ThemedText numberOfLines={1} style={[styles.trailing, { color: colors.textSecondary }]}>{trailing}</ThemedText> : onPress ? <Ionicons color={colors.textSecondary} name="chevron-forward" size={17} /> : null}</Pressable>;
}

const styles = StyleSheet.create({ row: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: 64, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: 9 }, grouped: { borderRadius: 0, borderWidth: 0 }, icon: { alignItems: 'center', borderRadius: 10, height: 34, justifyContent: 'center', width: 34 }, text: { flex: 1, gap: 1, minWidth: 0 }, title: { fontSize: 13, fontWeight: '700', lineHeight: 17 }, description: { fontSize: 10, lineHeight: 14 }, trailing: { fontSize: 10, lineHeight: 14, maxWidth: 112 }, disabled: { opacity: 0.5 }, pressed: { opacity: 0.68 } });
