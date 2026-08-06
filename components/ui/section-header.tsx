import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';

export function SectionHeader({ actionLabel, onAction, title }: { actionLabel?: string; onAction?: () => void; title: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction} style={styles.action}>
          <ThemedText type="link">{actionLabel}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ row: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md, justifyContent: 'space-between' }, title: { flex: 1 }, action: { minHeight: DesignTokens.size.touchTarget, justifyContent: 'center' } });
