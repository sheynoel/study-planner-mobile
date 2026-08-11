import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { FilePickerField } from '@/components/files/file-picker-field';
import { ThemedText } from '@/components/themed-text';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import type { PickedFile, UploadFileRequest } from '@/lib/api/file.types';
import { DEFAULT_MAX_UPLOAD_BYTES, formatFileSize } from '@/lib/files/file-display';
import { pickSupportedFile } from '@/lib/files/file-picker';

export function FileUploadForm({ autoPick = false, courses, initialCourseId, lockCourse = false, onDirtyChange, onSubmit, onSubmittingChange }: { autoPick?: boolean; courses: Course[]; initialCourseId?: string; lockCourse?: boolean; onDirtyChange?: (dirty: boolean) => void; onSubmit: (request: UploadFileRequest) => Promise<void>; onSubmittingChange?: (submitting: boolean) => void }) {
  const { colors } = useAppearance();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [courseId, setCourseId] = useState<string | null>(initialCourseId ?? null);
  const [fileError, setFileError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const selectedCourse = courses.find((course) => course.id === courseId);

  const chooseFile = useCallback(async () => {
    setApiError(null);
    try {
      const selected = await pickSupportedFile();
      if (!selected) return;
      setFile(selected);
      setFileError(selected.size !== null && selected.size > DEFAULT_MAX_UPLOAD_BYTES
        ? `This file is ${formatFileSize(selected.size)}. The documented backend limit is ${formatFileSize(DEFAULT_MAX_UPLOAD_BYTES)}.`
        : undefined);
    } catch (error) { setApiError(getApiErrorMessage(error)); }
  }, []);

  useEffect(() => onDirtyChange?.(Boolean(file || displayName.trim() || courseId !== (initialCourseId ?? null))), [courseId, displayName, file, initialCourseId, onDirtyChange]);
  useEffect(() => { if (!autoPick) return; const timer = setTimeout(() => void chooseFile(), DesignTokens.motion.normal); return () => clearTimeout(timer); }, [autoPick, chooseFile]);

  async function submit() {
    if (submitting) return;
    if (!file) { setFileError('Choose a file to upload.'); return; }
    if (file.size !== null && file.size > DEFAULT_MAX_UPLOAD_BYTES) return;
    setSubmitting(true); onSubmittingChange?.(true); setApiError(null);
    try { await onSubmit({ file, displayName: displayName.trim() || undefined, courseId: courseId ?? undefined }); }
    catch (error) { setApiError(getApiErrorMessage(error)); }
    finally { setSubmitting(false); onSubmittingChange?.(false); }
  }

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><ErrorBanner message={apiError} /><FilePickerField error={fileError} file={file} onPick={() => void chooseFile()} /><FormField label="Display name (optional)" maxLength={255} onChangeText={setDisplayName} placeholder="Defaults to the filename" value={displayName} />{lockCourse ? <View style={[styles.lockedCourse, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}><ThemedText style={styles.courseLabel}>Course</ThemedText><ThemedText numberOfLines={1} style={[styles.courseName, { color: colors.textSecondary }]}>{selectedCourse?.code || selectedCourse?.name || 'Selected course'}</ThemedText></View> : <View style={styles.field}><ThemedText type="defaultSemiBold">Course (optional)</ThemedText><View style={styles.choices}><ChoiceChip label="No course" selected={courseId === null} onPress={() => setCourseId(null)} />{courses.map((course) => <ChoiceChip key={course.id} label={`${course.name}${course.code ? ` (${course.code})` : ''}`} selected={courseId === course.id} onPress={() => setCourseId(course.id)} />)}</View></View>}<SubmitButton disabled={submitting || Boolean(fileError)} label="Upload File" loadingLabel="Uploading file..." onPress={() => void submit()} /></ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { gap: DesignTokens.spacing.md, padding: DesignTokens.layout.screenPadding, paddingBottom: 40 }, field: { gap: DesignTokens.spacing.sm }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm }, lockedCourse: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, gap: 2, minHeight: 50, padding: DesignTokens.spacing.sm }, courseLabel: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, courseName: { fontSize: 12, lineHeight: 16 } });
