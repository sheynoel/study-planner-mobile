import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { TimeRangeField } from '@/components/class-schedules/time-range-field';
import { MultiWeekdayPicker } from '@/components/class-schedules/weekday-picker';
import { ThemedText } from '@/components/themed-text';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import {
  type CourseScheduleFormErrors,
  type CourseScheduleFormValues,
  validateCourseScheduleForm,
} from '@/lib/class-schedules/class-schedule-form';
import { formatWeekdays } from '@/lib/class-schedules/schedule-groups';

export function ClassScheduleForm({ course, fixedWeekdays = false, initialValues, loadingLabel, onSubmit, submitLabel }: {
  course: Course;
  fixedWeekdays?: boolean;
  initialValues: CourseScheduleFormValues;
  loadingLabel: string;
  onSubmit: (values: CourseScheduleFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const { colors } = useAppearance();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CourseScheduleFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<Field extends keyof CourseScheduleFormValues>(field: Field, value: CourseScheduleFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    const nextErrors = validateCourseScheduleForm(values);
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setApiError(null);
    setIsSubmitting(true);
    try { await onSubmit(values); }
    catch (error) { setApiError(getApiErrorMessage(error)); }
    finally { setIsSubmitting(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={apiError} />
        <View style={[styles.courseCard, { backgroundColor: colors.surfaceVariant }]}>
          <View style={[styles.color, { backgroundColor: course.color }]} />
          <View style={styles.flex}><ThemedText type="defaultSemiBold">{course.name}</ThemedText><ThemedText>{course.code ?? 'No course code'}</ThemedText></View>
        </View>
        {fixedWeekdays ? <View style={styles.fixedDays}><ThemedText type="defaultSemiBold">Day</ThemedText><ThemedText>{formatWeekdays(values.weekdays)}</ThemedText></View> : <MultiWeekdayPicker error={errors.weekdays} value={values.weekdays} onChange={(value) => update('weekdays', value)} />}
        <TimeRangeField startTime={values.startTime} endTime={values.endTime} startError={errors.startTime} endError={errors.endTime} onStartChange={(value) => update('startTime', value)} onEndChange={(value) => update('endTime', value)} />
        <FormField error={errors.room} label="Room (optional)" onChangeText={(value) => update('room', value)} placeholder="Room 402" value={values.room} />
        <View style={styles.row}><DatePickerField error={errors.startDate} label="Starts" onChange={(value) => update('startDate', value)} value={values.startDate} /><DatePickerField error={errors.endDate} label="Ends" onChange={(value) => update('endDate', value)} value={values.endDate} /></View>
        <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>The meeting repeats weekly on the selected weekday within this inclusive date range.</ThemedText>
        <SubmitButton disabled={isSubmitting} label={submitLabel} loadingLabel={loadingLabel} onPress={() => void handleSubmit()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, content: { gap: DesignTokens.layout.formGap, padding: DesignTokens.layout.screenPadding, paddingBottom: 40 }, row: { flexDirection: 'row', gap: DesignTokens.spacing.md },
  courseCard: { alignItems: 'center', borderRadius: DesignTokens.radius.lg, flexDirection: 'row', gap: DesignTokens.spacing.md, padding: DesignTokens.spacing.md },
  color: { borderRadius: 12, height: 24, width: 24 }, hint: { fontSize: 13, lineHeight: 18, marginTop: -10 },
  fixedDays: { gap: DesignTokens.spacing.xs },
});
