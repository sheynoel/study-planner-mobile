import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';

export function CourseFolderCard({ course, fileCount = 0, nextClass, onPress, taskCount = 0, width }: { course: Course; fileCount?: number; nextClass?: string; onPress: () => void; taskCount?: number; width?: number | `${number}%` }) {
  const { colors } = useAppearance();
  const initials = (course.code ?? course.name).split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return <BentoCard onPress={onPress} style={[styles.card, width ? { width } : undefined]}><View style={styles.top}><View style={[styles.courseMark, { backgroundColor: `${safeColor(course.color)}20` }]}><ThemedText style={[styles.initials, { color: safeColor(course.color) }]}>{initials}</ThemedText></View><View style={[styles.accent, { backgroundColor: safeColor(course.color) }]} /></View><View style={styles.titleBlock}><ThemedText numberOfLines={2} style={styles.title}>{course.name}</ThemedText><ThemedText numberOfLines={1} style={[styles.code, { color: colors.textSecondary }]}>{course.code ?? 'No course code'}</ThemedText></View>{nextClass ? <View style={styles.nextRow}><Ionicons color={colors.primary} name="time-outline" size={14} /><ThemedText numberOfLines={1} style={[styles.nextClass, { color: colors.primary }]}>Next {nextClass}</ThemedText></View> : null}<ThemedText numberOfLines={1} style={[styles.metric, { color: colors.textMuted }]}>{taskCount} pending · {fileCount} materials</ThemedText></BentoCard>;
}

function safeColor(color: string): string { return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#64806a'; }
const styles = StyleSheet.create({ card: { gap: DesignTokens.spacing.sm, minHeight: 164, minWidth: 0, padding: DesignTokens.spacing.md }, top: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }, courseMark: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 38, justifyContent: 'center', width: 38 }, initials: { fontSize: 12, fontWeight: '800', lineHeight: 15 }, accent: { borderRadius: DesignTokens.radius.pill, height: 8, width: 8 }, titleBlock: { gap: 2, minWidth: 0 }, title: { fontSize: 16, fontWeight: '700', lineHeight: 20 }, code: { fontSize: 12, lineHeight: 16 }, nextRow: { alignItems: 'center', flexDirection: 'row', gap: 4, minWidth: 0 }, nextClass: { flex: 1, fontSize: 11, fontWeight: '600', lineHeight: 15 }, metric: { fontSize: 11, lineHeight: 15, marginTop: 'auto' } });
