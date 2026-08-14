import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorBanner, FormField, SubmitButton } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { ChoiceChip } from '@/components/ui/choice-chip';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { Course } from '@/lib/api/course.types';
import type { PickedFile, UploadFileRequest } from '@/lib/api/file.types';
import { formatFileSize } from '@/lib/files/file-display';
import { pickSupportedFiles } from '@/lib/files/file-picker';
import { isLargeLocalFile } from '@/lib/files/local-file-service';

export function FileUploadForm({ autoPick = false, courses, initialCourseId, lockCourse = false, onComplete, onDirtyChange, onSubmit, onSubmittingChange }: { autoPick?: boolean; courses: Course[]; initialCourseId?: string; lockCourse?: boolean; onComplete?: (courseId: string | null) => void; onDirtyChange?: (dirty: boolean) => void; onSubmit: (request: UploadFileRequest) => Promise<void>; onSubmittingChange?: (submitting: boolean) => void }) {
  const { colors } = useAppearance();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState<string | null>(initialCourseId ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const selectedCourse = courses.find((course) => course.id === courseId);

  const chooseFiles = useCallback(async () => {
    setError(null);
    try { const selected = await pickSupportedFiles(); if (selected) setFiles(selected); }
    catch (reason) { setError(getApiErrorMessage(reason)); }
  }, []);
  useEffect(() => onDirtyChange?.(Boolean(files.length || displayName.trim() || description.trim() || courseId !== (initialCourseId ?? null))), [courseId, description, displayName, files.length, initialCourseId, onDirtyChange]);
  useEffect(() => { if (!autoPick) return; const timer = setTimeout(() => void chooseFiles(), DesignTokens.motion.normal); return () => clearTimeout(timer); }, [autoPick, chooseFiles]);

  async function submit() {
    if (submitting) return;
    if (!files.length) { setError('Choose at least one file to import.'); return; }
    setSubmitting(true); onSubmittingChange?.(true); setError(null);
    let imported = 0;
    try {
      for (const file of files) {
        await onSubmit({ file, displayName: files.length === 1 ? displayName.trim() || undefined : undefined, description: description.trim() || undefined, courseId: courseId ?? undefined, courseName: selectedCourse?.name });
        imported += 1;
      }
      onComplete?.(courseId);
    } catch (reason) {
      const suffix = imported ? ` ${imported} file${imported === 1 ? '' : 's'} were imported before the failure.` : '';
      setError(`${getApiErrorMessage(reason)}${suffix}`);
    } finally { setSubmitting(false); onSubmittingChange?.(false); }
  }

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><ErrorBanner message={error} />
    <View style={styles.field}><ThemedText type="defaultSemiBold">Files</ThemedText>{files.length ? <View style={[styles.selection, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>{files.map((file) => <View key={`${file.uri}-${file.name}`}><ThemedText numberOfLines={1} style={styles.fileName}>{file.name}</ThemedText><ThemedText style={[styles.fileMeta, { color: colors.textSecondary }]}>{formatFileSize(file.size)}{isLargeLocalFile(file.size) ? ' · Large file—copying may take a while' : ''}</ThemedText></View>)}</View> : <ThemedText style={{ color: colors.textMuted }}>No files selected</ThemedText>}<AppButton label={files.length ? 'Choose Again' : 'Choose Files'} onPress={() => void chooseFiles()} variant="secondary" /></View>
    {files.length === 1 ? <FormField label="Display name (optional)" maxLength={255} onChangeText={setDisplayName} placeholder="Defaults to the filename" value={displayName} /> : null}
    <FormField label="Description (optional)" maxLength={500} multiline onChangeText={setDescription} placeholder="Add a note about these materials" value={description} />
    {lockCourse ? <View style={[styles.lockedCourse, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}><ThemedText style={styles.courseLabel}>Course</ThemedText><ThemedText numberOfLines={1} style={{ color: colors.textSecondary }}>{selectedCourse?.name ?? 'Selected course'}</ThemedText></View> : <View style={styles.field}><ThemedText type="defaultSemiBold">Course</ThemedText><View style={styles.choices}><ChoiceChip label="Personal / No Course" selected={courseId === null} onPress={() => setCourseId(null)} />{courses.map((course) => <ChoiceChip key={course.id} label={course.code ?? course.name} selected={courseId === course.id} onPress={() => setCourseId(course.id)} />)}</View></View>}
    <SubmitButton disabled={submitting} label={`Import ${files.length || ''} File${files.length === 1 ? '' : 's'}`.replace('  ', ' ')} loadingLabel="Copying into app storage..." onPress={() => void submit()} />
    <ThemedText style={[styles.privacy, { color: colors.textSecondary }]}>Stored only on this device. Uninstalling the app or clearing its data can remove imported files.</ThemedText>
  </ScrollView></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { gap: DesignTokens.spacing.md, padding: DesignTokens.layout.screenPadding, paddingBottom: 40 }, field: { gap: DesignTokens.spacing.sm }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: DesignTokens.spacing.sm }, selection: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, gap: 8, padding: DesignTokens.spacing.sm }, fileName: { fontSize: 12, fontWeight: '700' }, fileMeta: { fontSize: 10 }, lockedCourse: { borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, gap: 2, minHeight: 50, padding: DesignTokens.spacing.sm }, courseLabel: { fontSize: 12, fontWeight: '700' }, privacy: { fontSize: 10.5, lineHeight: 15, textAlign: 'center' } });
