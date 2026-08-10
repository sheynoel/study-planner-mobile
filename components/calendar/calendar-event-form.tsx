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
import { CourseSelectField } from '@/components/ui/course-select-field';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { TimePickerField } from '@/components/ui/time-picker-field';
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

        <CourseSelectField courses={courses} onChange={(courseId) => updateField('courseId', courseId)} value={values.courseId} />

        <ToggleRow label="All-day event" value={values.isAllDay} onValueChange={(value) => updateField('isAllDay', value)} />
        <View style={styles.dateRow}>
          <DatePickerField error={errors.startDate} label="Start date" onChange={(value) => updateField('startDate', value)} value={values.startDate} />
          {!values.isAllDay ? <TimePickerField error={errors.startTime} label="Start time" onChange={(value) => updateField('startTime', value)} value={values.startTime} /> : null}
        </View>
        <ToggleRow label="Add an end date and time" value={values.hasEnd} onValueChange={(value) => updateField('hasEnd', value)} />
        {values.hasEnd ? <View style={styles.dateRow}>
          <DatePickerField error={errors.endDate} label="End date" onChange={(value) => updateField('endDate', value)} value={values.endDate} />
          {!values.isAllDay ? <TimePickerField error={errors.endTime} label="End time" onChange={(value) => updateField('endTime', value)} value={values.endTime} /> : null}
        </View> : null}
        <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
          Dates and times use this device&apos;s timezone and are sent to the API as ISO timestamps.
        </ThemedText>

        <SelectionField label="Color (optional)">
          <Pressable accessibilityRole="button" accessibilityState={{ selected: values.color === null }} onPress={() => updateField('color', null)} style={[styles.defaultColor, { backgroundColor: values.color === null ? colors.primaryContainer : colors.surfaceSubtle, borderColor: values.color === null ? colors.primary : colors.border }]}><ThemedText style={[styles.defaultLabel, { color: values.color === null ? colors.primary : colors.textSecondary }]}>Default</ThemedText></Pressable>
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
  content: { gap: DesignTokens.spacing.md, padding: DesignTokens.layout.screenPadding, paddingBottom: 40 },
  multiline: { minHeight: 82 },
  dateRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  hint: { fontSize: 10.5, lineHeight: 15 },
  selectionField: { gap: 8 },
  choices: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorChoice: { borderRadius: 999, height: 36, width: 36 },
  selectedColor: { borderWidth: 3, outlineWidth: 2 },
  defaultColor: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 36, paddingHorizontal: DesignTokens.spacing.md },
  defaultLabel: { fontSize: 11, fontWeight: '700' },
  toggleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  pressed: { opacity: 0.68 },
});
