import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren, ReactNode } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function CollapsibleHomeSection({ action, children, expanded, onToggle, title }: PropsWithChildren<{ action?: ReactNode; expanded: boolean; onToggle: () => void; title: string }>) {
  const { colors } = useAppearance();
  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  }
  return <View style={styles.section}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={toggle} style={({ pressed }) => [styles.titleButton, pressed ? styles.pressed : undefined]}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </Pressable>
      {action}
      <Pressable accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${title}`} accessibilityRole="button" onPress={toggle} style={({ pressed }) => [styles.chevron, pressed ? styles.pressed : undefined]}>
        <Ionicons color={colors.textSecondary} name={expanded ? 'chevron-up' : 'chevron-down'} size={18} />
      </Pressable>
    </View>
    {expanded ? children : null}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: DesignTokens.spacing.sm },
  header: { alignItems: 'center', flexDirection: 'row', minHeight: DesignTokens.size.touchTarget },
  titleButton: { flex: 1, justifyContent: 'center', minHeight: DesignTokens.size.touchTarget },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 23 },
  chevron: { alignItems: 'center', justifyContent: 'center', minHeight: DesignTokens.size.touchTarget, width: 36 },
  pressed: { opacity: 0.58 },
});
