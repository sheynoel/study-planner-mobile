import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { TimeRangeField } from '@/components/class-schedules/time-range-field';
import { WeekdayPicker } from '@/components/class-schedules/weekday-picker';
import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import {
  type ClassScheduleFormErrors,
  type ClassScheduleFormField,
  type ClassScheduleFormValues,
  validateClassScheduleForm,
} from '@/lib/class-schedules/class-schedule-form';

export function ClassScheduleForm({ course, initialValues, loadingLabel, onSubmit, submitLabel }: {
  course: Course;
  initialValues: ClassScheduleFormValues;
  loadingLabel: string;
  onSubmit: (values: ClassScheduleFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const { colors } = useAppearance();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ClassScheduleFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<Field extends ClassScheduleFormField>(field: Field, value: ClassScheduleFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    const nextErrors = validateClassScheduleForm(values);
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
        <WeekdayPicker value={values.weekday} onChange={(value) => update('weekday', value)} />
        <TimeRangeField startTime={values.startTime} endTime={values.endTime} startError={errors.startTime} endError={errors.endTime} onStartChange={(value) => update('startTime', value)} onEndChange={(value) => update('endTime', value)} />
        <FormField error={errors.room} label="Room (optional)" onChangeText={(value) => update('room', value)} placeholder="Room 402" value={values.room} />
        <View style={styles.row}>
          <View style={styles.flex}><FormField autoCapitalize="none" error={errors.startDate} keyboardType="numbers-and-punctuation" label="Starts on" onChangeText={(value) => update('startDate', value)} placeholder="YYYY-MM-DD" value={values.startDate} /></View>
          <View style={styles.flex}><FormField autoCapitalize="none" error={errors.endDate} keyboardType="numbers-and-punctuation" label="Ends on" onChangeText={(value) => update('endDate', value)} placeholder="YYYY-MM-DD" value={values.endDate} /></View>
        </View>
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
});
