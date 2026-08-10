import { Ionicons } from '@expo/vector-icons';
import { type PropsWithChildren, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, LayoutAnimation, Modal, PanResponder, Pressable, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export type AppBottomSheetProps = PropsWithChildren<{
  accessibilityLabel?: string;
  contentStyle?: StyleProp<ViewStyle>;
  expandable?: boolean;
  expandedSnap?: number;
  footer?: ReactNode;
  initialSnap?: number;
  keyboardAware?: boolean;
  modal?: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  title?: string;
  visible?: boolean;
}>;

export function AppBottomSheet({ accessibilityLabel, children, contentStyle, expandable = false, expandedSnap = 0.96, footer, initialSnap = 0.68, keyboardAware = true, modal = true, onClose, showCloseButton = true, title, visible = true }: AppBottomSheetProps) {
  const content = <SheetSurface accessibilityLabel={accessibilityLabel ?? title ?? 'Bottom sheet'} contentStyle={contentStyle} expandable={expandable} expandedSnap={expandedSnap} footer={footer} initialSnap={initialSnap} keyboardAware={keyboardAware} modal={modal} onClose={onClose} showCloseButton={showCloseButton} title={title} visible={visible}>{children}</SheetSurface>;
  if (!modal) return visible ? content : null;
  return <Modal animationType="none" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>{content}</Modal>;
}

function SheetSurface({ accessibilityLabel, children, contentStyle, expandable, expandedSnap, footer, initialSnap, keyboardAware, modal, onClose, showCloseButton, title, visible }: Required<Pick<AppBottomSheetProps, 'expandable' | 'expandedSnap' | 'initialSnap' | 'keyboardAware' | 'modal' | 'onClose' | 'showCloseButton' | 'visible'>> & Pick<AppBottomSheetProps, 'accessibilityLabel' | 'contentStyle' | 'footer' | 'title'> & PropsWithChildren) {
  const { colors } = useAppearance();
  const { height } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;
  const sheetHeight = Math.round(height * (expanded ? expandedSnap : initialSnap));

  const settle = useCallback((nextExpanded: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(nextExpanded);
    Animated.spring(translateY, { damping: 24, stiffness: 260, toValue: 0, useNativeDriver: true }).start();
  }, [translateY]);
  const requestClose = useCallback(() => {
    if (!modal) { onClose(); return; }
    Animated.timing(translateY, { duration: DesignTokens.motion.fast, toValue: sheetHeight, useNativeDriver: true }).start(({ finished }) => { if (finished) onClose(); });
  }, [modal, onClose, sheetHeight, translateY]);

  useEffect(() => { if (!visible) return; setExpanded(false); translateY.setValue(height); Animated.spring(translateY, { damping: 25, stiffness: 240, toValue: 0, useNativeDriver: true }).start(); }, [height, translateY, visible]);
  useEffect(() => {
    if (!keyboardAware) return;
    const listener = Keyboard.addListener('keyboardDidShow', () => { if (expandable) settle(true); });
    return () => listener.remove();
  }, [expandable, keyboardAware, settle]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dy) > 7 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_event, gesture) => translateY.setValue(Math.max(expandable ? -44 : 0, gesture.dy)),
    onPanResponderRelease: (_event, gesture) => {
      if (expandable && (gesture.dy < -44 || gesture.vy < -0.8)) { settle(true); return; }
      if (expanded && (gesture.dy > 48 || gesture.vy > 0.85)) { settle(false); return; }
      if (!expanded && (gesture.dy > 100 || gesture.vy > 1.2)) { requestClose(); return; }
      settle(expanded);
    },
  }), [expandable, expanded, requestClose, settle, translateY]);

  return <View accessibilityLabel={accessibilityLabel} accessibilityViewIsModal style={styles.overlay}>
    <Pressable accessibilityLabel="Close sheet" accessibilityRole="button" onPress={requestClose} style={StyleSheet.absoluteFill} />
    <Animated.View onAccessibilityEscape={requestClose} style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border, height: sheetHeight, transform: [{ translateY }] }, Shadows]}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <Pressable accessibilityHint={expandable ? expanded ? 'Collapses the sheet' : 'Expands the sheet' : 'Drag down to close'} accessibilityLabel="Sheet handle" accessibilityRole="button" onPress={() => expandable ? settle(!expanded) : undefined} {...panResponder.panHandlers} style={styles.dragArea}><View style={[styles.handle, { backgroundColor: colors.border }]} /></Pressable>
        {title || showCloseButton ? <View style={styles.header}><ThemedText numberOfLines={1} style={styles.title}>{title}</ThemedText>{showCloseButton ? <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={requestClose} style={styles.close}><Ionicons color={colors.textSecondary} name="close" size={20} /></Pressable> : null}</View> : null}
        <View style={[styles.content, contentStyle]}>{children}</View>
        {footer ? <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>{footer}</View> : null}
      </SafeAreaView>
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({ overlay: { backgroundColor: 'rgba(12,15,18,0.34)', flex: 1, justifyContent: 'flex-end' }, sheet: { borderTopLeftRadius: DesignTokens.radius.xxl, borderTopRightRadius: DesignTokens.radius.xxl, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' }, safeArea: { flex: 1 }, dragArea: { alignItems: 'center', height: 24, justifyContent: 'center' }, handle: { borderRadius: DesignTokens.radius.pill, height: 4, opacity: 0.58, width: 42 }, header: { alignItems: 'center', flexDirection: 'row', minHeight: 42, paddingHorizontal: DesignTokens.layout.screenPadding }, title: { flex: 1, fontSize: 18, fontWeight: '800', lineHeight: 23 }, close: { alignItems: 'center', height: DesignTokens.size.touchTarget, justifyContent: 'center', width: DesignTokens.size.touchTarget }, content: { flex: 1, minHeight: 0 }, footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: DesignTokens.layout.screenPadding, paddingVertical: DesignTokens.spacing.sm } });
