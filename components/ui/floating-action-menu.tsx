import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export type FloatingActionMenuAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accessibilityLabel?: string;
  onPress?: () => void;
  children?: FloatingActionMenuAction[];
};

export function FloatingActionMenu({ aboveBottomBar = true, actions }: { aboveBottomBar?: boolean; actions: FloatingActionMenuAction[] }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { colors } = useAppearance();
  const [visible, setVisible] = useState(false);
  const [activeActions, setActiveActions] = useState<FloatingActionMenuAction[] | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const bottom = (aboveBottomBar ? DesignTokens.size.bottomBar : DesignTokens.spacing.lg) + insets.bottom;

  useEffect(() => { setVisible(false); setActiveActions(null); progress.setValue(0); }, [pathname, progress]);

  function open() {
    setActiveActions(actions);
    setVisible(true);
    progress.setValue(0);
    Animated.spring(progress, { damping: 20, stiffness: 260, toValue: 1, useNativeDriver: true }).start();
  }

  function close(afterClose?: () => void) {
    Animated.timing(progress, { duration: DesignTokens.motion.fast, toValue: 0, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) return;
      setVisible(false);
      setActiveActions(null);
      afterClose?.();
    });
  }

  function choose(action: FloatingActionMenuAction) {
    if (action.children?.length) {
      setActiveActions(action.children);
      return;
    }
    close(action.onPress);
  }

  const popupTransform = [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }];
  return <>
    <Fab bottom={bottom} colors={colors} expanded={false} onPress={open} />
    <Modal animationType="none" onRequestClose={() => close()} statusBarTranslucent transparent visible={visible}>
      <View onTouchMove={() => close()} style={styles.overlay}>
        <Pressable accessibilityLabel="Close quick add" accessibilityRole="button" onPress={() => close()} style={StyleSheet.absoluteFill} />
        <Animated.View accessibilityLabel="Quick add options" style={[styles.popup, { backgroundColor: colors.surface, borderColor: colors.border, bottom: bottom + 58, opacity: progress, transform: popupTransform }, Shadows]}>
          {(activeActions ?? actions).map((action) => <Pressable accessibilityLabel={action.accessibilityLabel ?? action.label} accessibilityRole="button" key={action.label} onPress={() => choose(action)} style={({ pressed }) => [styles.option, pressed ? { backgroundColor: colors.surfaceSubtle } : undefined]}><Ionicons color={colors.primary} name={action.icon} size={17} /><ThemedText numberOfLines={1} style={styles.optionLabel}>{action.label}</ThemedText>{action.children?.length ? <Ionicons color={colors.textSecondary} name="chevron-forward" size={14} /> : null}</Pressable>)}
        </Animated.View>
        <Pressable accessibilityLabel="Close quick add" accessibilityRole="button" accessibilityState={{ expanded: true }} onPress={() => close()} style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary, bottom }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primaryText} name="add" size={25} /></Pressable>
      </View>
    </Modal>
  </>;
}

function Fab({ bottom, colors, expanded, onPress }: { bottom: number; colors: ReturnType<typeof useAppearance>['colors']; expanded: boolean; onPress: () => void }) {
  return <Pressable accessibilityLabel={expanded ? 'Close quick add' : 'Open quick add'} accessibilityRole="button" accessibilityState={{ expanded }} onPress={onPress} style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary, bottom }, pressed ? styles.pressed : undefined]}><Ionicons color={colors.primaryText} name="add" size={25} /></Pressable>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  popup: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, minWidth: 154, overflow: 'hidden', position: 'absolute', right: DesignTokens.layout.screenPadding },
  option: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: DesignTokens.size.touchTarget, paddingHorizontal: DesignTokens.spacing.md },
  optionLabel: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 16 },
  fab: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, height: 50, justifyContent: 'center', position: 'absolute', right: DesignTokens.layout.screenPadding, width: 50, zIndex: 30, ...Shadows },
  pressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
});
