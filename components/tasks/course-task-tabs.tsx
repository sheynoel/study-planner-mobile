import { ScrollView, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import type { TaskCourseSelection } from '@/lib/tasks/task-filters';

export function CourseTaskTabs({ courses, onChange, value }: { courses: Course[]; onChange: (value: TaskCourseSelection) => void; value: TaskCourseSelection }) {
  return <ScrollView contentContainerStyle={styles.content} horizontal showsHorizontalScrollIndicator={false}>
    <CourseTab accent={undefined} label="All" onPress={() => onChange(undefined)} selected={!value} />
    {courses.map((course) => <CourseTab accent={course.color} key={course.id} label={course.code?.trim() || shortName(course.name)} onPress={() => onChange(course.id)} selected={value === course.id} />)}
    <CourseTab accent={undefined} label="Personal" onPress={() => onChange('personal')} selected={value === 'personal'} />
  </ScrollView>;
}

function CourseTab({ accent, label, onPress, selected }: { accent?: string; label: string; onPress: () => void; selected: boolean }) {
  const { colors } = useAppearance();
  const selectedColor = accent ?? colors.primary;
  return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.tab, pressed ? styles.pressed : undefined]}>
    <ThemedText numberOfLines={1} style={[styles.label, { color: selected ? colors.primary : colors.textSecondary }]}>{label}</ThemedText>
    <View style={[styles.underline, { backgroundColor: selected ? selectedColor : 'transparent' }]} />
  </Pressable>;
}

function shortName(name: string): string { return name.length > 12 ? `${name.slice(0, 11)}…` : name; }

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.lg, paddingHorizontal: DesignTokens.layout.screenPadding }, tab: { justifyContent: 'flex-end', minHeight: DesignTokens.size.touchTarget, paddingTop: DesignTokens.spacing.sm }, label: { fontSize: 14, fontWeight: '700', maxWidth: 112 }, underline: { borderRadius: DesignTokens.radius.pill, height: 3, marginTop: DesignTokens.spacing.xs }, pressed: { opacity: 0.68 } });
