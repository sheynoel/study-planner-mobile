import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  const { colors } = useAppearance();
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { duration: DesignTokens.motion.slow, toValue: 0.85, useNativeDriver: true }),
      Animated.timing(opacity, { duration: DesignTokens.motion.slow, toValue: 0.45, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return <View accessibilityLabel="Loading content" style={styles.container}>{Array.from({ length: rows }, (_, index) => <Animated.View key={index} style={[styles.card, { backgroundColor: colors.surfaceVariant, opacity }]}><SkeletonLine color={colors.outline} width="55%" /><SkeletonLine color={colors.outline} width="82%" /><SkeletonLine color={colors.outline} width="38%" /></Animated.View>)}</View>;
}

function SkeletonLine({ color, width }: { color: string; width: ViewStyle['width'] }) { return <View style={[styles.line, { backgroundColor: color, width }]} />; }
const styles = StyleSheet.create({ container: { gap: DesignTokens.spacing.md, padding: DesignTokens.layout.screenPadding }, card: { borderRadius: DesignTokens.radius.lg, gap: DesignTokens.spacing.md, minHeight: 112, padding: DesignTokens.layout.cardPadding }, line: { borderRadius: DesignTokens.radius.pill, height: 12, opacity: 0.35 } });
