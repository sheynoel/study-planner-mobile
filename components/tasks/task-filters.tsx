import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Course } from '@/lib/api/course.types';
import type { TaskPriority } from '@/lib/api/task.types';
import { TASK_PRIORITY_LABELS } from '@/lib/tasks/task-display';
import type { TaskFilterPreset, TaskFilterState } from '@/lib/tasks/task-filters';

const PRESETS: readonly { label: string; value: TaskFilterPreset }[] = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Completed', value: 'completed' },
];

const PRIORITIES: readonly TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

export function TaskFilters({
  courses,
  onChange,
  value,
}: {
  courses: Course[];
  onChange: (value: TaskFilterState) => void;
  value: TaskFilterState;
}) {
  return (
    <View style={styles.container}>
      <FilterRow label="View">
        {PRESETS.map((preset) => (
          <FilterChip
            key={preset.value}
            label={preset.label}
            selected={value.preset === preset.value}
            onPress={() =>
              onChange(preset.value === 'all' ? { preset: 'all' } : { ...value, preset: preset.value })
            }
          />
        ))}
      </FilterRow>

      <FilterRow label="Course">
        <FilterChip
          label="All courses"
          selected={!value.courseId}
          onPress={() => onChange({ ...value, courseId: undefined })}
        />
        {courses.map((course) => (
          <FilterChip
            key={course.id}
            label={course.code ?? course.name}
            selected={value.courseId === course.id}
            onPress={() => onChange({ ...value, courseId: course.id })}
          />
        ))}
      </FilterRow>

      <FilterRow label="Priority">
        <FilterChip
          label="All priorities"
          selected={!value.priority}
          onPress={() => onChange({ ...value, priority: undefined })}
        />
        {PRIORITIES.map((priority) => (
          <FilterChip
            key={priority}
            label={TASK_PRIORITY_LABELS[priority]}
            selected={value.priority === priority}
            onPress={() => onChange({ ...value, priority })}
          />
        ))}
      </FilterRow>
    </View>
  );
}

function FilterRow({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {children}
      </ScrollView>
    </View>
  );
}

function FilterChip({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selectedChip : undefined,
        pressed ? styles.pressed : undefined,
      ]}>
      <ThemedText
        style={styles.chipLabel}
        lightColor={selected ? '#ffffff' : undefined}
        darkColor={selected ? '#ffffff' : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingBottom: 10 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  label: { paddingLeft: 20, width: 82 },
  chips: { gap: 8, paddingRight: 20 },
  chip: {
    borderColor: '#94a3b8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedChip: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  chipLabel: { fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.7 },
});
