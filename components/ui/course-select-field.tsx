import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';

export function CourseSelectField({ courses, label = 'Course', onChange, value }: { courses: Course[]; label?: string; onChange: (courseId: string | null) => void; value: string | null }) {
  const { colors } = useAppearance();
  const [visible, setVisible] = useState(false);
  const selected = courses.find((course) => course.id === value);
  return <View style={styles.field}><ThemedText style={styles.label}>{label}</ThemedText><Pressable accessibilityLabel={`${label}, ${selected?.code ?? selected?.name ?? 'Personal'}`} accessibilityRole="button" onPress={() => setVisible(true)} style={({ pressed }) => [styles.trigger, { backgroundColor: colors.surface, borderColor: colors.border }, pressed ? styles.pressed : undefined]}><View style={styles.selectedText}><ThemedText numberOfLines={1} style={styles.selectedTitle}>{selected?.code ?? selected?.name ?? 'Personal'}</ThemedText>{selected?.code ? <ThemedText numberOfLines={1} style={[styles.selectedSubtitle, { color: colors.textSecondary }]}>{selected.name}</ThemedText> : null}</View><Ionicons color={colors.textSecondary} name="chevron-down" size={17} /></Pressable>
    <AppBottomSheet expandable initialSnap={0.62} onClose={() => setVisible(false)} title="Select Course" visible={visible}><ScrollView contentContainerStyle={styles.options}><CourseOption onPress={() => { onChange(null); setVisible(false); }} selected={value === null} subtitle="Not linked to a course" title="Personal" />{courses.map((course) => <CourseOption key={course.id} onPress={() => { onChange(course.id); setVisible(false); }} selected={course.id === value} subtitle={course.code ? course.name : undefined} title={course.code ?? course.name} />)}</ScrollView></AppBottomSheet>
  </View>;
}

function CourseOption({ onPress, selected, subtitle, title }: { onPress: () => void; selected: boolean; subtitle?: string; title: string }) { const { colors } = useAppearance(); return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.option, { backgroundColor: selected ? colors.primaryContainer : colors.surfaceSubtle, borderColor: selected ? colors.primary : colors.border }, pressed ? styles.pressed : undefined]}><View style={styles.optionText}><ThemedText numberOfLines={1} style={[styles.optionTitle, selected ? { color: colors.primary } : undefined]}>{title}</ThemedText>{subtitle ? <ThemedText numberOfLines={1} style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{subtitle}</ThemedText> : null}</View></Pressable>; }
const styles = StyleSheet.create({ field: { gap: 7 }, label: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, trigger: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: 1, flexDirection: 'row', minHeight: 48, paddingHorizontal: DesignTokens.spacing.md }, selectedText: { flex: 1, minWidth: 0 }, selectedTitle: { fontSize: 13, fontWeight: '700', lineHeight: 17 }, selectedSubtitle: { fontSize: 10, lineHeight: 13 }, pressed: { opacity: 0.67 }, options: { gap: DesignTokens.spacing.xs, paddingHorizontal: DesignTokens.layout.screenPadding, paddingBottom: DesignTokens.spacing.xl }, option: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 52, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: DesignTokens.spacing.sm }, optionText: { flex: 1, minWidth: 0 }, optionTitle: { fontSize: 13, fontWeight: '700', lineHeight: 17 }, optionSubtitle: { fontSize: 10.5, lineHeight: 14 } });
