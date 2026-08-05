import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { ClassSchedule } from '@/lib/api/class-schedule.types';
import type { Course } from '@/lib/api/course.types';
import { formatLocalDate } from '@/lib/calendar/calendar-date';

export function ClassScheduleCard({ course, onPress, schedule }: { course: Course; onPress: () => void; schedule: ClassSchedule }) {
  return (
    <ThemedView style={styles.card} lightColor="#f8fafc" darkColor="#1e293b">
      <View style={[styles.bar, { backgroundColor: course.color }]} />
      <Pressable accessibilityHint="Opens class schedule details" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
        <ThemedText type="subtitle">{titleCase(schedule.weekday)}</ThemedText>
        <ThemedText type="defaultSemiBold">{schedule.startTime} – {schedule.endTime}</ThemedText>
        <ThemedText>{schedule.room ?? 'No room'}</ThemedText>
        <ThemedText lightColor="#64748b" darkColor="#94a3b8">{formatLocalDate(schedule.startDate)} – {formatLocalDate(schedule.endDate)}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

export function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

const styles = StyleSheet.create({ card: { borderRadius: 14, flexDirection: 'row', overflow: 'hidden' }, bar: { width: 6 }, content: { flex: 1, gap: 5, padding: 16 }, pressed: { opacity: 0.7 } });
