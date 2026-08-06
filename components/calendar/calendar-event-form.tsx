import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { Course } from '@/lib/api/course.types';
import { getApiErrorMessage } from '@/lib/api/api-client';
import {
  CALENDAR_EVENT_COLORS,
  type CalendarEventFormErrors,
  type CalendarEventFormField,
  type CalendarEventFormValues,
  validateCalendarEventForm,
} from '@/lib/calendar/calendar-event-form';

export function CalendarEventForm({
  courses,
  initialValues,
  loadingLabel,
  onSubmit,
  submitLabel,
}: {
  courses: Course[];
  initialValues: CalendarEventFormValues;
  loadingLabel: string;
  onSubmit: (values: CalendarEventFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const { colors } = useAppearance();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CalendarEventFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Field extends CalendarEventFormField>(field: Field, value: CalendarEventFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    const nextErrors = validateCalendarEventForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
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
        <FormField autoCapitalize="sentences" error={errors.title} label="Event title" onChangeText={(value) => updateField('title', value)} placeholder="Algorithms review session" value={values.title} />
        <FormField error={errors.description} label="Description (optional)" multiline onChangeText={(value) => updateField('description', value)} placeholder="Add useful details" style={styles.multiline} textAlignVertical="top" value={values.description} />
        <FormField error={errors.location} label="Location (optional)" onChangeText={(value) => updateField('location', value)} placeholder="Library room 204" value={values.location} />

        <SelectionField label="Course (optional)">
          <ChoiceChip label="No course" selected={values.courseId === null} onPress={() => updateField('courseId', null)} />
          {courses.map((course) => <ChoiceChip key={course.id} label={`${course.name}${course.code ? ` (${course.code})` : ''}`} selected={values.courseId === course.id} onPress={() => updateField('courseId', course.id)} />)}
        </SelectionField>

        <ToggleRow label="All-day event" value={values.isAllDay} onValueChange={(value) => updateField('isAllDay', value)} />
        <View style={styles.dateRow}>
          <View style={styles.flex}><FormField autoCapitalize="none" error={errors.startDate} keyboardType="numbers-and-punctuation" label="Start date" onChangeText={(value) => updateField('startDate', value)} placeholder="YYYY-MM-DD" value={values.startDate} /></View>
          {!values.isAllDay ? <View style={styles.flex}><FormField autoCapitalize="none" error={errors.startTime} keyboardType="numbers-and-punctuation" label="Start time" onChangeText={(value) => updateField('startTime', value)} placeholder="HH:mm" value={values.startTime} /></View> : null}
        </View>
        <ToggleRow label="Add an end date and time" value={values.hasEnd} onValueChange={(value) => updateField('hasEnd', value)} />
        {values.hasEnd ? <View style={styles.dateRow}>
          <View style={styles.flex}><FormField autoCapitalize="none" error={errors.endDate} keyboardType="numbers-and-punctuation" label="End date" onChangeText={(value) => updateField('endDate', value)} placeholder="YYYY-MM-DD" value={values.endDate} /></View>
          {!values.isAllDay ? <View style={styles.flex}><FormField autoCapitalize="none" error={errors.endTime} keyboardType="numbers-and-punctuation" label="End time" onChangeText={(value) => updateField('endTime', value)} placeholder="HH:mm" value={values.endTime} /></View> : null}
        </View> : null}
        <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
          Dates and times use this device&apos;s timezone and are sent to the API as ISO timestamps.
        </ThemedText>

        <SelectionField label="Color (optional)">
          <ChoiceChip label="Default" selected={values.color === null} onPress={() => updateField('color', null)} />
          {CALENDAR_EVENT_COLORS.map((color) => (
            <Pressable accessibilityLabel={`Select color ${color}`} accessibilityRole="button" accessibilityState={{ selected: values.color === color }} key={color} onPress={() => updateField('color', color)} style={({ pressed }) => [styles.colorChoice, { backgroundColor: color }, values.color === color ? [styles.selectedColor, { borderColor: colors.background, outlineColor: colors.primary }] : undefined, pressed ? styles.pressed : undefined]} />
          ))}
        </SelectionField>
        {errors.color ? <ThemedText style={{ color: colors.dangerText }}>{errors.color}</ThemedText> : null}
        <SubmitButton disabled={isSubmitting} label={submitLabel} loadingLabel={loadingLabel} onPress={() => void handleSubmit()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SelectionField({ children, label }: { children: React.ReactNode; label: string }) {
  return <View style={styles.selectionField}><ThemedText type="defaultSemiBold">{label}</ThemedText><View style={styles.choices}>{children}</View></View>;
}

function ToggleRow({ label, onValueChange, value }: { label: string; onValueChange: (value: boolean) => void; value: boolean }) {
  return <View style={styles.toggleRow}><ThemedText type="defaultSemiBold">{label}</ThemedText><Switch accessibilityLabel={label} onValueChange={onValueChange} value={value} /></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: DesignTokens.layout.formGap, padding: DesignTokens.layout.screenPadding, paddingBottom: 40 },
  multiline: { minHeight: 100 },
  dateRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  hint: { fontSize: 13, lineHeight: 18, marginTop: -8 },
  selectionField: { gap: 8 },
  choices: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorChoice: { borderRadius: 999, height: 36, width: 36 },
  selectedColor: { borderWidth: 3, outlineWidth: 2 },
  toggleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  pressed: { opacity: 0.68 },
});
