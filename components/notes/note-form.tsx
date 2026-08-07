import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import { type NoteFormErrors, type NoteFormField, type NoteFormValues, validateNoteForm } from '@/lib/notes/note-form';

export function NoteForm({ courses, initialValues, loadingLabel, onSubmit, submitLabel }: { courses: Course[]; initialValues: NoteFormValues; loadingLabel: string; onSubmit: (values: NoteFormValues) => Promise<void>; submitLabel: string }) {
  const { colors } = useAppearance(); const [values, setValues] = useState(initialValues); const [errors, setErrors] = useState<NoteFormErrors>({}); const [apiError, setApiError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  function update<Field extends NoteFormField>(field: Field, value: NoteFormValues[Field]) { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setApiError(null); }
  async function submit() { if (submitting) return; const next = validateNoteForm(values); if (Object.keys(next).length) { setErrors(next); return; } setSubmitting(true); setApiError(null); try { await onSubmit(values); } catch (error) { setApiError(getApiErrorMessage(error)); } finally { setSubmitting(false); } }
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <ErrorBanner message={apiError} />
    <FormField autoCapitalize="sentences" error={errors.title} label="Title" onChangeText={(value) => update('title', value)} placeholder="Bring lab gown" value={values.title} />
    <FormField error={errors.content} label="Details (optional)" multiline onChangeText={(value) => update('content', value)} placeholder="Add anything useful to remember" style={styles.details} textAlignVertical="top" value={values.content} />
    <Selection label="Course (optional)"><ChoiceChip label="Personal" onPress={() => update('courseId', null)} selected={values.courseId === null} />{courses.map((course) => <ChoiceChip key={course.id} label={course.code || course.name} onPress={() => update('courseId', course.id)} selected={values.courseId === course.id} />)}</Selection>
    <View style={styles.row}><View style={styles.flex}><FormField error={errors.relevantDate} keyboardType="numbers-and-punctuation" label="Relevant date (optional)" onChangeText={(value) => update('relevantDate', value)} placeholder="YYYY-MM-DD" value={values.relevantDate} /></View><View style={styles.time}><FormField error={errors.relevantTime} keyboardType="numbers-and-punctuation" label="Time" onChangeText={(value) => update('relevantTime', value)} placeholder="HH:mm" value={values.relevantTime} /></View></View>
    <View style={styles.row}><View style={styles.flex}><FormField error={errors.reminderDate} keyboardType="numbers-and-punctuation" label="Reminder date (optional)" onChangeText={(value) => update('reminderDate', value)} placeholder="YYYY-MM-DD" value={values.reminderDate} /></View><View style={styles.time}><FormField error={errors.reminderTime} keyboardType="numbers-and-punctuation" label="Time" onChangeText={(value) => update('reminderTime', value)} placeholder="HH:mm" value={values.reminderTime} /></View></View>
    <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>Dates use this device&apos;s timezone. Reminder delivery is deferred; the reminder time is saved and displayed.</ThemedText>
    <View style={styles.toggle}><View style={styles.flex}><ThemedText type="defaultSemiBold">Pin note</ThemedText><ThemedText style={[styles.hint, { color: colors.textSecondary }]}>Keep it prominent in note lists.</ThemedText></View><Switch accessibilityLabel="Pin note" onValueChange={(value) => update('isPinned', value)} value={values.isPinned} /></View>
    <SubmitButton disabled={submitting} label={submitLabel} loadingLabel={loadingLabel} onPress={() => void submit()} />
  </ScrollView></KeyboardAvoidingView>;
}
function Selection({ children, label }: { children: React.ReactNode; label: string }) { return <View style={styles.selection}><ThemedText type="defaultSemiBold">{label}</ThemedText><View style={styles.choices}>{children}</View></View>; }
const styles = StyleSheet.create({ flex: { flex: 1 }, content: { gap: DesignTokens.spacing.lg, padding: DesignTokens.layout.screenPadding, paddingBottom: 40 }, details: { minHeight: 88 }, row: { alignItems: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.sm }, time: { width: 105 }, selection: { gap: DesignTokens.spacing.sm }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm }, toggle: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md }, hint: { fontSize: 11, lineHeight: 16 } });
