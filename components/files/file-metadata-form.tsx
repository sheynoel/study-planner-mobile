import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import type { UpdateFileRequest } from '@/lib/api/file.types';

export function FileMetadataForm({ courses, initialCourseId, initialDisplayName, onSubmit }: {
  courses: Course[];
  initialCourseId: string | null;
  initialDisplayName: string;
  onSubmit: (request: UpdateFileRequest) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [courseId, setCourseId] = useState<string | null>(initialCourseId);
  const [nameError, setNameError] = useState<string>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  async function submit() {
    if (submitting) return;
    const trimmed = displayName.trim();
    if (!trimmed) { setNameError('Display name is required.'); return; }
    if (trimmed.length > 255) { setNameError('Display name must be 255 characters or fewer.'); return; }
    setSubmitting(true); setApiError(null);
    try { await onSubmit({ displayName: trimmed, courseId }); }
    catch (error) { setApiError(getApiErrorMessage(error)); }
    finally { setSubmitting(false); }
  }
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><ErrorBanner message={apiError} /><FormField error={nameError} label="Display name" maxLength={255} onChangeText={(value) => { setDisplayName(value); setNameError(undefined); }} value={displayName} /><View style={styles.field}><ThemedText type="defaultSemiBold">Course</ThemedText><View style={styles.choices}><ChoiceChip label="No course" selected={courseId === null} onPress={() => setCourseId(null)} />{courses.map((course) => <ChoiceChip key={course.id} label={`${course.name}${course.code ? ` (${course.code})` : ''}`} selected={courseId === course.id} onPress={() => setCourseId(course.id)} />)}</View></View><SubmitButton disabled={submitting} label="Save Changes" loadingLabel="Saving changes..." onPress={() => void submit()} /></ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { gap: DesignTokens.layout.formGap, padding: DesignTokens.layout.screenPadding, paddingBottom: 40 }, field: { gap: DesignTokens.spacing.sm }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm } });
