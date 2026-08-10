import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ErrorBanner } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { CourseSelectField } from '@/components/ui/course-select-field';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { TimePickerField } from '@/components/ui/time-picker-field';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import type { TaskFormErrors, TaskFormField, TaskFormValues } from '@/lib/tasks/task-form';
import { validateTaskForm } from '@/lib/tasks/task-form';

const PRIORITIES = [{ label: 'Low', value: 'LOW' }, { label: 'Medium', value: 'MEDIUM' }, { label: 'High', value: 'HIGH' }] as const;

export function TaskCreateSheetForm({ courses, initialValues, onDirtyChange, onSubmit, onSubmittingChange }: { courses: Course[]; initialValues: TaskFormValues; onDirtyChange: (dirty: boolean) => void; onSubmit: (values: TaskFormValues) => Promise<void>; onSubmittingChange: (submitting: boolean) => void }) {
  const { colors } = useAppearance();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { onDirtyChange(JSON.stringify(values) !== JSON.stringify(initialValues)); }, [initialValues, onDirtyChange, values]);
  function update<Field extends TaskFormField>(field: Field, value: TaskFormValues[Field]) { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setApiError(null); }
  async function submit() { if (submitting) return; const next = validateTaskForm({ ...values, status: 'TODO' }); if (Object.keys(next).length) { setErrors(next); return; } setSubmitting(true); onSubmittingChange(true); setApiError(null); try { await onSubmit({ ...values, status: 'TODO' }); } catch (error) { setApiError(getApiErrorMessage(error)); } finally { setSubmitting(false); onSubmittingChange(false); } }

  return <View style={styles.root}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <ErrorBanner message={apiError} />
    <View style={styles.field}><ThemedText style={styles.label}>Task title</ThemedText><TextInput accessibilityLabel="Task title" autoCapitalize="sentences" onChangeText={(value) => update('title', value)} placeholder="What needs to be done?" placeholderTextColor={colors.textMuted} returnKeyType="next" style={[styles.titleInput, { backgroundColor: colors.surface, borderColor: errors.title ? colors.danger : colors.border, color: colors.text }]} value={values.title} />{errors.title ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{errors.title}</ThemedText> : null}</View>
    <CourseSelectField courses={courses} onChange={(value) => update('courseId', value)} value={values.courseId} />
    <View style={styles.field}><ThemedText style={styles.label}>Due</ThemedText><View style={styles.dueRow}><DatePickerField allowClear displayFormat="compact" error={errors.dueDate} hideLabel label="Due date" onChange={(value) => { update('dueDate', value); if (!value) update('dueTime', ''); }} pickerTitle="Select due date" placeholder="Set date" value={values.dueDate} /><TimePickerField disabled={!values.dueDate} error={errors.dueTime} hideLabel label="Due time" onChange={(value) => update('dueTime', value)} pickerTitle="Select due time" placeholder="Set time" value={values.dueTime} /></View></View>
    <View style={styles.field}><ThemedText style={styles.label}>Priority</ThemedText><View style={styles.priorityRow}>{PRIORITIES.map((priority) => { const selected = values.priority === priority.value; const tone = priority.value === 'LOW' ? colors.successSurface : priority.value === 'HIGH' ? colors.dangerSurface : colors.warningSurface; return <Pressable accessibilityRole="button" accessibilityState={{ selected }} key={priority.value} onPress={() => update('priority', priority.value)} style={({ pressed }) => [styles.priorityChip, { backgroundColor: selected ? tone : colors.surface, borderColor: selected ? colors.primary : colors.border }, pressed ? styles.pressed : undefined]}><ThemedText style={[styles.priorityLabel, selected ? { color: colors.text } : { color: colors.textSecondary }]}>{priority.label}</ThemedText></Pressable>; })}</View></View>
    <View style={styles.field}><ThemedText style={styles.label}>Details</ThemedText><TextInput accessibilityLabel="Details" autoCapitalize="sentences" multiline onChangeText={(value) => update('description', value)} placeholder="Optional notes" placeholderTextColor={colors.textMuted} scrollEnabled={false} style={[styles.details, { backgroundColor: colors.surface, borderColor: errors.description ? colors.danger : colors.border, color: colors.text }]} textAlignVertical="top" value={values.description} />{errors.description ? <ThemedText style={[styles.error, { color: colors.dangerText }]}>{errors.description}</ThemedText> : null}</View>
  </ScrollView><View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}><AppButton label={submitting ? 'Adding task...' : 'Add Task'} loading={submitting} onPress={() => void submit()} /></View></View>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { gap: DesignTokens.spacing.md, paddingHorizontal: DesignTokens.layout.screenPadding, paddingBottom: DesignTokens.spacing.md }, field: { gap: 7 }, label: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, titleInput: { borderRadius: DesignTokens.radius.md, borderWidth: 1, fontSize: 16, minHeight: 48, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: 10 }, dueRow: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, priorityRow: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, priorityChip: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 38 }, priorityLabel: { fontSize: 12, fontWeight: '700' }, details: { borderRadius: DesignTokens.radius.md, borderWidth: 1, fontSize: 14, minHeight: 64, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: 10 }, error: { fontSize: 11, lineHeight: 15 }, footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: DesignTokens.layout.screenPadding, paddingTop: DesignTokens.spacing.sm }, pressed: { opacity: 0.67 } });
