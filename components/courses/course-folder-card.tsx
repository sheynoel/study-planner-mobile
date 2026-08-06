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
  return <BentoCard onPress={onPress} style={[styles.card, width ? { width } : undefined]}><View style={styles.top}><View style={[styles.folderIcon, { backgroundColor: `${safeColor(course.color)}22` }]}><Ionicons color={safeColor(course.color)} name="folder-open" size={28} /><ThemedText style={[styles.initials, { color: safeColor(course.color) }]}>{initials}</ThemedText></View><View style={[styles.accent, { backgroundColor: safeColor(course.color) }]} /></View><ThemedText type="subtitle" numberOfLines={2}>{course.name}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{course.code ?? 'No course code'}</ThemedText>{nextClass ? <ThemedText numberOfLines={1} style={[styles.nextClass, { color: colors.primary }]}>Next class · {nextClass}</ThemedText> : null}<View style={styles.metrics}><ThemedText style={styles.metric}>{taskCount} pending</ThemedText><ThemedText style={styles.metric}>{fileCount} files</ThemedText></View></BentoCard>;
}

function safeColor(color: string): string { return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#64806a'; }
const styles = StyleSheet.create({ card: { gap: DesignTokens.spacing.sm, minHeight: 208 }, top: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }, folderIcon: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, flexDirection: 'row', gap: DesignTokens.spacing.xs, minHeight: 48, paddingHorizontal: DesignTokens.spacing.sm }, initials: { fontSize: 11, fontWeight: '800' }, accent: { borderRadius: DesignTokens.radius.pill, height: 10, width: 10 }, nextClass: { fontSize: 12, fontWeight: '600', lineHeight: 16 }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm, marginTop: 'auto' }, metric: { fontSize: 12, lineHeight: 16 } });
