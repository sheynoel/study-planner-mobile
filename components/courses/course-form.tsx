import { type ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { CourseColorPicker } from '@/components/courses/course-color-picker';
import { CourseScheduleEditor } from '@/components/courses/course-schedule-editor';
import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import { emptyCourseScheduleForm, type CourseScheduleFormErrors, type CourseScheduleFormValues, validateCourseScheduleForm } from '@/lib/class-schedules/class-schedule-form';
import { type CourseFormErrors, type CourseFormField, type CourseFormValues, validateCourseForm } from '@/lib/courses/course-form';

export function CourseForm({ afterSubmit, initialValues, loadingLabel, modalHeader, onSubmit, submitLabel, withSchedules = false }: { afterSubmit?: ReactNode; initialValues: CourseFormValues; loadingLabel: string; modalHeader?: { actionLabel: string; onCancel: () => void; title: string }; onSubmit: (values: CourseFormValues, schedules: CourseScheduleFormValues[]) => Promise<void>; submitLabel: string; withSchedules?: boolean }) {
  const { colors } = useAppearance();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<CourseScheduleFormValues[]>([]);
  const [scheduleErrors, setScheduleErrors] = useState<CourseScheduleFormErrors[]>([]);
  const isCreateModal = Boolean(modalHeader);

  function updateField(field: CourseFormField, value: string) { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setApiError(null); }
  async function handleSubmit() {
    if (isSubmitting) return;
    const nextErrors = validateCourseForm(values);
    const nextScheduleErrors = schedules.map(validateCourseScheduleForm);
    if (Object.keys(nextErrors).length || nextScheduleErrors.some((item) => Object.keys(item).length)) { setErrors(nextErrors); setScheduleErrors(nextScheduleErrors); return; }
    setApiError(null); setIsSubmitting(true);
    try { await onSubmit(values, schedules); }
    catch (error) { setApiError(getApiErrorMessage(error)); }
    finally { setIsSubmitting(false); }
  }

  const basics = <AppCard style={styles.sectionCard}>
    {isCreateModal ? <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>COURSE</ThemedText> : null}
    <FormField autoCapitalize="words" error={errors.name} label={isCreateModal ? 'Main Title' : 'Course name'} onChangeText={(value) => updateField('name', value)} placeholder="Algorithms" returnKeyType="next" value={values.name} />
    <FormField autoCapitalize="characters" error={errors.code} label={isCreateModal ? 'Subtitle' : 'Code (optional)'} onChangeText={(value) => updateField('code', value)} placeholder="CS 301" returnKeyType="next" value={values.code} />
  </AppCard>;
  const details = <AppCard style={styles.sectionCard}>
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>DETAILS</ThemedText>
    <FormField autoCapitalize="words" error={errors.instructor} label="Instructor (optional)" onChangeText={(value) => updateField('instructor', value)} placeholder="Professor Rivera" returnKeyType="next" value={values.instructor} />
    {!isCreateModal ? <FormField autoCapitalize="words" error={errors.room} label="Room (optional)" onChangeText={(value) => updateField('room', value)} placeholder="Room 402" returnKeyType="next" value={values.room} /> : null}
    <FormField error={errors.description} label="Description (optional)" multiline onChangeText={(value) => updateField('description', value)} placeholder="What this course covers" style={styles.multilineInput} textAlignVertical="top" value={values.description} />
  </AppCard>;

  return <View style={styles.root}>
    {modalHeader ? <View style={[styles.modalHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}><Pressable accessibilityRole="button" disabled={isSubmitting} onPress={modalHeader.onCancel} style={styles.headerAction}><ThemedText style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</ThemedText></Pressable><ThemedText style={styles.modalTitle}>{modalHeader.title}</ThemedText><Pressable accessibilityRole="button" disabled={isSubmitting} onPress={() => void handleSubmit()} style={styles.headerAction}><ThemedText style={{ color: colors.primary, fontWeight: '800' }}>{isSubmitting ? 'Saving…' : modalHeader.actionLabel}</ThemedText></Pressable></View> : null}
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={apiError} />
        {basics}{details}
        <AppCard style={styles.sectionCard}><CourseColorPicker error={errors.color} onChange={(value) => updateField('color', value)} value={values.color} /></AppCard>
        {withSchedules ? <AppCard style={styles.sectionCard}><CourseScheduleEditor accentColor={values.color} errors={scheduleErrors} onAdd={() => { setSchedules((current) => [...current, emptyCourseScheduleForm()]); setScheduleErrors((current) => [...current, {}]); }} onChange={(index, schedule) => { setSchedules((current) => current.map((item, itemIndex) => itemIndex === index ? schedule : item)); setScheduleErrors((current) => current.map((item, itemIndex) => itemIndex === index ? {} : item)); }} onRemove={(index) => { setSchedules((current) => current.filter((_item, itemIndex) => itemIndex !== index)); setScheduleErrors((current) => current.filter((_item, itemIndex) => itemIndex !== index)); }} schedules={schedules} /></AppCard> : null}
        {!modalHeader ? <SubmitButton disabled={isSubmitting} label={submitLabel} loadingLabel={loadingLabel} onPress={() => void handleSubmit()} /> : null}
        {afterSubmit}
      </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, keyboardView: { flex: 1 }, modalHeader: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 58, paddingHorizontal: DesignTokens.spacing.sm }, modalTitle: { flex: 1, fontSize: 17, fontWeight: '800', textAlign: 'center' }, headerAction: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 70, paddingHorizontal: 5 }, content: { gap: DesignTokens.spacing.md, padding: DesignTokens.layout.screenPadding, paddingBottom: 48 }, sectionCard: { gap: DesignTokens.spacing.md, padding: DesignTokens.spacing.md }, sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, lineHeight: 14 }, multilineInput: { minHeight: 84 } });
