import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { CourseScheduleEditor } from '@/components/courses/course-schedule-editor';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import {
  COURSE_COLORS,
  type CourseFormErrors,
  type CourseFormField,
  type CourseFormValues,
  validateCourseForm,
} from '@/lib/courses/course-form';
import { emptyClassScheduleForm, type ClassScheduleFormErrors, type ClassScheduleFormValues, validateClassScheduleForm } from '@/lib/class-schedules/class-schedule-form';

export function CourseForm({
  initialValues,
  loadingLabel,
  onSubmit,
  submitLabel,
  withSchedules = false,
}: {
  initialValues: CourseFormValues;
  loadingLabel: string;
  onSubmit: (values: CourseFormValues, schedules: ClassScheduleFormValues[]) => Promise<void>;
  submitLabel: string;
  withSchedules?: boolean;
}) {
  const { colors } = useAppearance();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<ClassScheduleFormValues[]>([]);
  const [scheduleErrors, setScheduleErrors] = useState<ClassScheduleFormErrors[]>([]);

  function updateField(field: CourseFormField, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const nextErrors = validateCourseForm(values);
    const nextScheduleErrors = schedules.map(validateClassScheduleForm);

    if (Object.keys(nextErrors).length > 0 || nextScheduleErrors.some((errors) => Object.keys(errors).length > 0)) {
      setErrors(nextErrors);
      setScheduleErrors(nextScheduleErrors);
      return;
    }

    setApiError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(values, schedules);
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ErrorBanner message={apiError} />
        <FormField
          autoCapitalize="words"
          error={errors.name}
          label="Course name"
          onChangeText={(value) => updateField('name', value)}
          placeholder="Algorithms"
          returnKeyType="next"
          value={values.name}
        />
        <FormField
          autoCapitalize="characters"
          error={errors.code}
          label="Code (optional)"
          onChangeText={(value) => updateField('code', value)}
          placeholder="CS 301"
          returnKeyType="next"
          value={values.code}
        />
        <FormField
          error={errors.description}
          label="Description (optional)"
          multiline
          onChangeText={(value) => updateField('description', value)}
          placeholder="What this course covers"
          style={styles.multilineInput}
          textAlignVertical="top"
          value={values.description}
        />
        <FormField
          autoCapitalize="words"
          error={errors.instructor}
          label="Instructor (optional)"
          onChangeText={(value) => updateField('instructor', value)}
          placeholder="Professor Rivera"
          returnKeyType="next"
          value={values.instructor}
        />
        <FormField
          autoCapitalize="words"
          error={errors.room}
          label="Room (optional)"
          onChangeText={(value) => updateField('room', value)}
          placeholder="Room 402"
          returnKeyType="done"
          value={values.room}
        />

        <View style={styles.colorField}>
          <ThemedText type="defaultSemiBold">Course color</ThemedText>
          <View style={styles.colorGrid}>
            {COURSE_COLORS.map((color) => {
              const isSelected = values.color.toUpperCase() === color.toUpperCase();

              return (
                <Pressable
                  accessibilityLabel={`Select color ${color}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={color}
                  onPress={() => updateField('color', color)}
                  style={({ pressed }) => [
                    styles.colorOption,
                    isSelected ? { borderColor: colors.primary } : undefined,
                    pressed ? styles.pressedColor : undefined,
                  ]}>
                  <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                  {isSelected ? <ThemedText style={styles.selectedMark}>✓</ThemedText> : null}
                </Pressable>
              );
            })}
          </View>
          {errors.color ? (
            <ThemedText style={[styles.fieldError, { color: colors.dangerText }]}>
              {errors.color}
            </ThemedText>
          ) : null}
        </View>

        {withSchedules ? <CourseScheduleEditor errors={scheduleErrors} onAdd={() => { setSchedules((current) => [...current, emptyClassScheduleForm()]); setScheduleErrors((current) => [...current, {}]); }} onChange={(index, schedule) => { setSchedules((current) => current.map((item, itemIndex) => itemIndex === index ? schedule : item)); setScheduleErrors((current) => current.map((item, itemIndex) => itemIndex === index ? {} : item)); }} onRemove={(index) => { setSchedules((current) => current.filter((_item, itemIndex) => itemIndex !== index)); setScheduleErrors((current) => current.filter((_item, itemIndex) => itemIndex !== index)); }} schedules={schedules} /> : null}

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

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    gap: DesignTokens.layout.formGap,
    padding: DesignTokens.layout.screenPadding,
    paddingBottom: 40,
  },
  multilineInput: {
    minHeight: 120,
  },
  colorField: {
    gap: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 24,
    borderWidth: 3,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  pressedColor: {
    opacity: 0.65,
  },
  colorSwatch: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  selectedMark: { color: '#ffffff', fontWeight: '800', position: 'absolute' },
  fieldError: {
    fontSize: 14,
    lineHeight: 20,
  },
});
