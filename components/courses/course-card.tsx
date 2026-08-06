import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import type { Course } from '@/lib/api/course.types';

function detailValue(value: string | null): string {
  return value ?? '—';
}

export function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  return (
    <Pressable
      accessibilityHint="Opens course details"
      accessibilityLabel={`${course.name}, ${course.code ?? 'no course code'}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : undefined]}>
      <AppCard padded={false} style={styles.card}>
        <View style={[styles.colorBar, { backgroundColor: course.color }]} />
        <View style={styles.content}>
          <View style={styles.headingRow}>
            <ThemedText type="subtitle" numberOfLines={2} style={styles.name}>
              {course.name}
            </ThemedText>
            <View style={[styles.colorDot, { backgroundColor: course.color }]} />
          </View>
          <ThemedText type="defaultSemiBold">Code: {detailValue(course.code)}</ThemedText>
          <ThemedText numberOfLines={1}>Instructor: {detailValue(course.instructor)}</ThemedText>
          <ThemedText numberOfLines={1}>Room: {detailValue(course.room)}</ThemedText>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: DesignTokens.radius.lg,
  },
  pressed: {
    opacity: 0.78,
  },
  card: {
    borderRadius: DesignTokens.radius.lg,
    flexDirection: 'row',
    minHeight: 148,
    overflow: 'hidden',
  },
  colorBar: {
    width: 8,
  },
  content: {
    flex: 1,
    gap: DesignTokens.spacing.xs,
    padding: DesignTokens.layout.cardPadding,
  },
  headingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  name: {
    flex: 1,
  },
  colorDot: {
    borderRadius: 10,
    height: 20,
    marginTop: 2,
    width: 20,
  },
});
