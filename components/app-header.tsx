import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export function AppHeader({
  onBack,
  onRightAction,
  rightActionLabel,
  subtitle,
  title,
}: {
  onBack?: () => void;
  onRightAction?: () => void;
  rightActionLabel?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : undefined]}>
            <ThemedText type="subtitle">‹</ThemedText>
          </Pressable>
        ) : null}
        <ThemedText type="title" numberOfLines={2} style={styles.title}>
          {title}
        </ThemedText>
        {onRightAction && rightActionLabel ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onRightAction}
            style={({ pressed }) => [styles.rightAction, pressed ? styles.pressed : undefined]}>
            <ThemedText type="link">{rightActionLabel}</ThemedText>
          </Pressable>
        ) : null}
      </View>
      {subtitle ? <ThemedText>{subtitle}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 32,
  },
  title: {
    flex: 1,
  },
  rightAction: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.6,
  },
});
