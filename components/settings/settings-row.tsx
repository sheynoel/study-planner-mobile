import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function SettingsRow({ description, disabled = false, icon, label, onPress, trailing }: { description: string; disabled?: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; trailing?: string }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityRole={onPress && !disabled ? 'button' : undefined} disabled={disabled || !onPress} onPress={onPress} style={({ pressed }) => [styles.row, { backgroundColor: colors.surface, borderColor: colors.outline }, disabled ? styles.disabled : undefined, pressed ? styles.pressed : undefined]}><View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}><Ionicons color={colors.primary} name={icon} size={DesignTokens.icon.md} /></View><View style={styles.text}><ThemedText type="defaultSemiBold">{label}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{description}</ThemedText></View>{trailing ? <ThemedText style={{ color: colors.textSecondary }}>{trailing}</ThemedText> : <Ionicons color={colors.textSecondary} name={disabled ? 'time-outline' : 'chevron-forward'} size={DesignTokens.icon.md} />}</Pressable>;
}

const styles = StyleSheet.create({ row: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: 76, padding: DesignTokens.spacing.md }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 42, justifyContent: 'center', width: 42 }, text: { flex: 1, gap: 2 }, disabled: { opacity: 0.65 }, pressed: { opacity: 0.72 } });
