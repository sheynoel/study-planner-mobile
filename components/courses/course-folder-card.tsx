import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';

export function CourseFolderCard({ course, onPress, taskCount = 0, width }: { course: Course; onPress: () => void; taskCount?: number; width?: number | `${number}%` }) {
  const { colors } = useAppearance();
  const accent = safeColor(course.color);
  return <BentoCard onPress={onPress} style={[styles.card, { width }, { backgroundColor: colors.surface }]}>
    <View style={[styles.folderHeader, { backgroundColor: accent }]}><View style={styles.folderTab} />{taskCount > 0 ? <View style={[styles.badge, { backgroundColor: colors.surface }]}><ThemedText style={[styles.badgeText, { color: accent }]}>{taskCount > 99 ? '99+' : taskCount}</ThemedText></View> : null}</View>
    <View style={styles.textBlock}><ThemedText numberOfLines={2} ellipsizeMode="tail" style={styles.title}>{course.name}</ThemedText><ThemedText numberOfLines={1} ellipsizeMode="tail" style={[styles.subtitle, { color: colors.textSecondary }]}>{course.code ?? 'Course'}</ThemedText></View>
  </BentoCard>;
}

function safeColor(color: string): string { return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#64806A'; }
const styles = StyleSheet.create({ card: { height: 132, minWidth: 0, overflow: 'hidden', padding: 0 }, folderHeader: { height: 38, justifyContent: 'center', paddingHorizontal: DesignTokens.spacing.sm }, folderTab: { backgroundColor: 'rgba(255,255,255,0.23)', borderBottomRightRadius: 7, height: 8, left: 0, position: 'absolute', top: 0, width: 58 }, badge: { alignItems: 'center', alignSelf: 'flex-end', borderRadius: DesignTokens.radius.pill, justifyContent: 'center', minHeight: 22, minWidth: 22, paddingHorizontal: 6 }, badgeText: { fontSize: 10, fontWeight: '800', lineHeight: 13 }, textBlock: { flex: 1, gap: 3, justifyContent: 'flex-end', minWidth: 0, padding: DesignTokens.spacing.md }, title: { fontSize: 15, fontWeight: '800', lineHeight: 19, minHeight: 38 }, subtitle: { fontSize: 11, lineHeight: 15 } });
