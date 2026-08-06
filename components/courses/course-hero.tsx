import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';

export function CourseHero({ course }: { course: Course }) {
  const { colors } = useAppearance();
  const accent = safeColor(course.color, colors.primary);
  return <BentoCard style={styles.hero} tone="accent"><View style={[styles.accent, { backgroundColor: accent }]} /><View style={styles.heading}><View style={[styles.icon, { backgroundColor: `${accent}22` }]}><Ionicons color={accent} name="book" size={28} /></View><View style={styles.text}><ThemedText type="title">{course.name}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{course.code ?? 'No course code'}</ThemedText></View></View>{course.description ? <ThemedText>{course.description}</ThemedText> : null}<View style={styles.meta}><ThemedText style={{ color: colors.textSecondary }}>{course.instructor ?? 'Instructor not added'}</ThemedText><ThemedText style={{ color: colors.textSecondary }}>{course.room ?? 'Room not added'}</ThemedText></View></BentoCard>;
}

function safeColor(color: string, fallback: string): string { return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback; }
const styles = StyleSheet.create({ hero: { gap: DesignTokens.spacing.lg, overflow: 'hidden', padding: DesignTokens.spacing.xl }, accent: { bottom: 0, left: 0, position: 'absolute', top: 0, width: 7 }, heading: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md }, icon: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, height: 52, justifyContent: 'center', width: 52 }, text: { flex: 1, gap: DesignTokens.spacing.xs }, meta: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.lg } });
