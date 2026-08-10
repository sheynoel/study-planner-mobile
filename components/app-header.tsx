import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export function AppHeader({ compactTitle = false, onBack, onRightAction, rightActionLabel, subtitle, title }: { compactTitle?: boolean; onBack?: () => void; onRightAction?: () => void; rightActionLabel?: string; subtitle?: string; title: string }) {
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  return <View style={[styles.header, { borderBottomColor: borderColor }]}><View style={styles.row}>{onBack ? <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={8} onPress={onBack} style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : undefined]}><Ionicons color={textColor} name="chevron-back" size={21} /></Pressable> : null}<ThemedText numberOfLines={2} style={[styles.title, compactTitle ? styles.compactTitle : undefined]} type="title">{title}</ThemedText>{onRightAction && rightActionLabel ? <Pressable accessibilityLabel={rightActionLabel} accessibilityRole="button" hitSlop={8} onPress={onRightAction} style={({ pressed }) => [styles.rightAction, pressed ? styles.pressed : undefined]}><ThemedText type="link">{rightActionLabel}</ThemedText></Pressable> : null}</View>{subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}</View>;
}

const styles = StyleSheet.create({ header: { borderBottomWidth: StyleSheet.hairlineWidth, gap: DesignTokens.spacing.xs, minHeight: 68, paddingHorizontal: DesignTokens.layout.screenPadding, paddingVertical: DesignTokens.spacing.sm }, row: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm }, backButton: { alignItems: 'center', height: DesignTokens.size.touchTarget, justifyContent: 'center', marginLeft: -10, width: DesignTokens.size.touchTarget }, title: { flex: 1 }, compactTitle: { fontSize: 26, lineHeight: 32 }, subtitle: { fontSize: 11, lineHeight: 15 }, rightAction: { justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.sm }, pressed: { opacity: 0.6 } });
