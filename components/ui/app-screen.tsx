import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';

export function AppScreen({ children, edges = ['top'], footer, style }: PropsWithChildren<{ edges?: Edge[]; footer?: ReactNode; style?: StyleProp<ViewStyle> }>) {
  return <ThemedView style={styles.screen}><SafeAreaView edges={edges} style={styles.safeArea}><ThemedView style={[styles.content, style]}>{children}</ThemedView>{footer}</SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 }, content: { flex: 1 } });
