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
import { getApiErrorMessage } from '@/lib/api/api-client';
import {
  COURSE_COLORS,
  type CourseFormErrors,
  type CourseFormField,
  type CourseFormValues,
  validateCourseForm,
} from '@/lib/courses/course-form';

export function CourseForm({
  initialValues,
  loadingLabel,
  onSubmit,
  submitLabel,
}: {
  initialValues: CourseFormValues;
  loadingLabel: string;
  onSubmit: (values: CourseFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                    isSelected ? styles.selectedColorOption : undefined,
                    pressed ? styles.pressedColor : undefined,
                  ]}>
                  <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                </Pressable>
              );
            })}
          </View>
          {errors.color ? (
            <ThemedText lightColor="#b91c1c" darkColor="#fecaca" style={styles.fieldError}>
              {errors.color}
            </ThemedText>
          ) : null}
        </View>

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
    gap: 18,
    padding: 20,
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
  selectedColorOption: {
    borderColor: '#0a7ea4',
  },
  pressedColor: {
    opacity: 0.65,
  },
  colorSwatch: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  fieldError: {
    fontSize: 14,
    lineHeight: 20,
  },
});
