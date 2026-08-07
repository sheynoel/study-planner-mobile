import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';

export function CourseHero({ course, scheduleSummary }: { course: Course; scheduleSummary: string }) {
  const { colors } = useAppearance();
  const accent = safeColor(course.color, colors.primary);
  const initials = (course.code ?? course.name).split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return <BentoCard style={styles.hero} tone="accent"><View style={[styles.accent, { backgroundColor: accent }]} /><View style={styles.heading}><View style={[styles.icon, { backgroundColor: `${accent}22` }]}><ThemedText style={[styles.initials, { color: accent }]}>{initials}</ThemedText></View><View style={styles.text}><ThemedText numberOfLines={2} style={styles.title}>{course.name}</ThemedText><ThemedText numberOfLines={1} style={[styles.code, { color: colors.textSecondary }]}>{course.code ?? 'No course code'}</ThemedText><View style={styles.schedule}><Ionicons color={colors.primary} name="time-outline" size={14} /><ThemedText numberOfLines={1} style={[styles.scheduleText, { color: colors.primary }]}>{scheduleSummary}</ThemedText></View></View></View></BentoCard>;
}

function safeColor(color: string, fallback: string): string { return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback; }
const styles = StyleSheet.create({ hero: { overflow: 'hidden', padding: DesignTokens.spacing.md }, accent: { bottom: 0, left: 0, position: 'absolute', top: 0, width: 5 }, heading: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.md, height: 46, justifyContent: 'center', width: 46 }, initials: { fontSize: 14, fontWeight: '800' }, text: { flex: 1, gap: 2, minWidth: 0 }, title: { fontSize: 20, fontWeight: '700', lineHeight: 24 }, code: { fontSize: 12, lineHeight: 16 }, schedule: { alignItems: 'center', flexDirection: 'row', gap: 4, minWidth: 0 }, scheduleText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 16 } });
