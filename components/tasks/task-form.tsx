import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { TaskPriority, TaskStatus } from '@/lib/api/task.types';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/lib/tasks/task-display';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskFormErrors,
  type TaskFormField,
  type TaskFormValues,
  validateTaskForm,
} from '@/lib/tasks/task-form';

export function TaskForm({
  courses,
  initialValues,
  loadingLabel,
  onSubmit,
  submitLabel,
}: {
  courses: Course[];
  initialValues: TaskFormValues;
  loadingLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const { colors } = useAppearance();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Field extends TaskFormField>(field: Field, value: TaskFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    const nextErrors = validateTaskForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setApiError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={apiError} />
        <FormField
          autoCapitalize="sentences"
          error={errors.title}
          label="Task title"
          onChangeText={(value) => updateField('title', value)}
          placeholder="Finish algorithms problem set"
          value={values.title}
        />
        <FormField
          error={errors.description}
          label="Description (optional)"
          multiline
          onChangeText={(value) => updateField('description', value)}
          placeholder="Add useful details"
          style={styles.multilineInput}
          textAlignVertical="top"
          value={values.description}
        />

        <SelectionField label="Course (optional)">
          <ChoiceChip
            label="No course"
            selected={values.courseId === null}
            onPress={() => updateField('courseId', null)}
          />
          {courses.map((course) => (
            <ChoiceChip
              key={course.id}
              label={`${course.name}${course.code ? ` (${course.code})` : ''}`}
              selected={values.courseId === course.id}
              onPress={() => updateField('courseId', course.id)}
            />
          ))}
        </SelectionField>

        <View style={styles.dateRow}>
          <View style={styles.flex}>
            <FormField
              autoCapitalize="none"
              error={errors.dueDate}
              keyboardType="numbers-and-punctuation"
              label="Due date (optional)"
              onChangeText={(value) => updateField('dueDate', value)}
              placeholder="YYYY-MM-DD"
              value={values.dueDate}
            />
          </View>
          <View style={styles.flex}>
            <FormField
              autoCapitalize="none"
              error={errors.dueTime}
              keyboardType="numbers-and-punctuation"
              label="Time (optional)"
              onChangeText={(value) => updateField('dueTime', value)}
              placeholder="HH:mm"
              value={values.dueTime}
            />
          </View>
        </View>
        <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
          Time uses the device&apos;s local timezone. A date without a time is due at 23:59.
        </ThemedText>

        <SelectionField label="Priority">
          {TASK_PRIORITIES.map((priority) => (
            <ChoiceChip
              key={priority}
              label={TASK_PRIORITY_LABELS[priority]}
              selected={values.priority === priority}
              onPress={() => updateField('priority', priority as TaskPriority)}
            />
          ))}
        </SelectionField>

        <SelectionField label="Status">
          {TASK_STATUSES.map((status) => (
            <ChoiceChip
              key={status}
              label={TASK_STATUS_LABELS[status]}
              selected={values.status === status}
              onPress={() => updateField('status', status as TaskStatus)}
            />
          ))}
        </SelectionField>

        <SubmitButton
          disabled={isSubmitting}
          label={submitLabel}
          loadingLabel={loadingLabel}
          onPress={() => void handleSubmit()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SelectionField({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View style={styles.selectionField}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <View style={styles.choices}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: DesignTokens.layout.formGap, padding: DesignTokens.layout.screenPadding, paddingBottom: 40 },
  multilineInput: { minHeight: 110 },
  dateRow: { flexDirection: 'row', gap: 12 },
  hint: { fontSize: 13, lineHeight: 18, marginTop: -10 },
  selectionField: { gap: DesignTokens.spacing.sm },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm },
});
