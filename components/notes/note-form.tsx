import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

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
import { type NoteFormErrors, type NoteFormField, type NoteFormValues, validateNoteForm } from '@/lib/notes/note-form';

export function NoteForm({ courses, initialValues, loadingLabel, lockCourse = false, onDirtyChange, onSubmit, onSubmittingChange, submitLabel }: { courses: Course[]; initialValues: NoteFormValues; loadingLabel: string; lockCourse?: boolean; onDirtyChange?: (dirty: boolean) => void; onSubmit: (values: NoteFormValues) => Promise<void>; onSubmittingChange?: (submitting: boolean) => void; submitLabel: string }) {
  const { colors } = useAppearance();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<NoteFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const selectedCourse = courses.find((course) => course.id === values.courseId);
  useEffect(() => onDirtyChange?.(JSON.stringify(values) !== JSON.stringify(initialValues)), [initialValues, onDirtyChange, values]);
  function update<Field extends NoteFormField>(field: Field, value: NoteFormValues[Field]) { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setApiError(null); }
  async function submit() { if (submitting) return; const next = validateNoteForm(values); if (Object.keys(next).length) { setErrors(next); return; } setSubmitting(true); onSubmittingChange?.(true); setApiError(null); try { await onSubmit(values); } catch (error) { setApiError(getApiErrorMessage(error)); } finally { setSubmitting(false); onSubmittingChange?.(false); } }

  return <View style={styles.root}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <ErrorBanner message={apiError} />
    <View style={styles.field}><ThemedText style={styles.label}>Title <ThemedText style={{ color: colors.textMuted }}>(optional)</ThemedText></ThemedText><TextInput accessibilityLabel="Note title" onChangeText={(text) => update('title', text)} placeholder="Bring lab gown" placeholderTextColor={colors.textMuted} style={[styles.titleInput, { backgroundColor: colors.surface, borderColor: errors.title ? colors.danger : colors.border, color: colors.text }]} value={values.title} />{errors.title ? <FieldError message={errors.title} /> : null}</View>
    <View style={styles.field}><ThemedText style={styles.label}>Note</ThemedText><TextInput accessibilityLabel="Note content" multiline onChangeText={(text) => update('content', text)} placeholder="Write a note…" placeholderTextColor={colors.textMuted} scrollEnabled={false} style={[styles.noteInput, { backgroundColor: colors.surface, borderColor: errors.content ? colors.danger : colors.border, color: colors.text }]} textAlignVertical="top" value={values.content} />{errors.content ? <FieldError message={errors.content} /> : null}</View>
    {lockCourse ? <View style={[styles.lockedCourse, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}><View><ThemedText style={styles.label}>Course</ThemedText><ThemedText numberOfLines={1} style={[styles.courseName, { color: colors.textSecondary }]}>{selectedCourse?.code ?? selectedCourse?.name ?? 'Course'}</ThemedText></View></View> : <CourseSelectField courses={courses} onChange={(courseId) => update('courseId', courseId)} value={values.courseId} />}
    <DateTimeRow date={values.relevantDate} dateError={errors.relevantDate} dateLabel="Relevant date" onDate={(date) => { update('relevantDate', date); if (!date) update('relevantTime', ''); }} onTime={(time) => update('relevantTime', time)} time={values.relevantTime} timeError={errors.relevantTime} />
    <DateTimeRow date={values.reminderDate} dateError={errors.reminderDate} dateLabel="Reminder" onDate={(date) => { update('reminderDate', date); if (!date) update('reminderTime', ''); }} onTime={(time) => update('reminderTime', time)} time={values.reminderTime} timeError={errors.reminderTime} />
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: values.isPinned }} onPress={() => update('isPinned', !values.isPinned)} style={styles.toggle}><View style={styles.toggleText}><ThemedText style={styles.label}>Pin note</ThemedText><ThemedText style={[styles.hint, { color: colors.textSecondary }]}>Keep it first in course notes.</ThemedText></View><Switch accessibilityLabel="Pin note" onValueChange={(value) => update('isPinned', value)} value={values.isPinned} /></Pressable>
  </ScrollView><View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}><AppButton label={submitting ? loadingLabel : submitLabel} loading={submitting} onPress={() => void submit()} /></View></View>;
}

function DateTimeRow({ date, dateError, dateLabel, onDate, onTime, time, timeError }: { date: string; dateError?: string; dateLabel: string; onDate: (value: string) => void; onTime: (value: string) => void; time: string; timeError?: string }) { return <View style={styles.field}><ThemedText style={styles.label}>{dateLabel}</ThemedText><View style={styles.dateRow}><DatePickerField allowClear displayFormat="compact" error={dateError} hideLabel label={dateLabel} onChange={onDate} placeholder="Add date" value={date} /><TimePickerField disabled={!date} error={timeError} hideLabel label={`${dateLabel} time`} onChange={onTime} placeholder="Add time" value={time} /></View></View>; }
function FieldError({ message }: { message: string }) { const { colors } = useAppearance(); return <ThemedText style={[styles.error, { color: colors.dangerText }]}>{message}</ThemedText>; }
const styles = StyleSheet.create({ root: { flex: 1 }, content: { gap: DesignTokens.spacing.md, paddingBottom: DesignTokens.spacing.lg, paddingHorizontal: DesignTokens.layout.screenPadding }, field: { gap: 7 }, label: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, titleInput: { borderRadius: DesignTokens.radius.md, borderWidth: 1, fontSize: 14, minHeight: 46, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: 9 }, noteInput: { borderRadius: DesignTokens.radius.md, borderWidth: 1, fontSize: 13, minHeight: 86, padding: DesignTokens.spacing.md }, lockedCourse: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, minHeight: 50, padding: DesignTokens.spacing.sm }, courseName: { fontSize: 12, lineHeight: 16 }, dateRow: { flexDirection: 'row', gap: DesignTokens.spacing.sm }, toggle: { alignItems: 'center', flexDirection: 'row', minHeight: DesignTokens.size.touchTarget }, toggleText: { flex: 1 }, hint: { fontSize: 10, lineHeight: 14 }, error: { fontSize: 11, lineHeight: 15 }, footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: DesignTokens.layout.screenPadding, paddingTop: DesignTokens.spacing.sm } });
