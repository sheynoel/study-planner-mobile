import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { FileUploadForm } from '@/components/files/file-upload-form';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { useCourses } from '@/contexts/course-context';
import { useFiles } from '@/contexts/file-context';
import type { UploadFileRequest } from '@/lib/api/file.types';
import { fileRoutes } from '@/lib/files/routes';

export default function UploadFileScreen() {
  const params = useLocalSearchParams<{ autoPick?: string | string[]; courseId?: string | string[]; library?: string | string[]; returnOnSuccess?: string | string[] }>();
  const courseId = first(params.courseId);
  const library = first(params.library);
  const autoPick = first(params.autoPick) === '1';
  const returnOnSuccess = first(params.returnOnSuccess) === '1';
  const navigation = useNavigation();
  const { courses, loadCourses } = useCourses();
  const { uploadFile } = useFiles();
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const allowClose = useRef(false);
  useEffect(() => { void loadCourses().catch(() => undefined); }, [loadCourses]);
  usePreventRemove(dirty && !allowClose.current, ({ data }) => { Alert.alert('Discard this upload?', 'The selected material and metadata will be cleared.', [{ text: 'Keep editing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) }]); });
  const close = useCallback(() => { if (!submitting) router.back(); }, [submitting]);

  async function submit(request: UploadFileRequest) {
    await uploadFile(request);
  }

  function complete(selectedCourseId: string | null) {
    allowClose.current = true;
    setDirty(false);
    if (returnOnSuccess) { router.back(); return; }
    if (courseId || library === 'personal') {
      router.replace(selectedCourseId ? fileRoutes.forCourse(selectedCourseId) : fileRoutes.personal);
      return;
    }
    router.replace(fileRoutes.list);
  }

  return <AppBottomSheet expandable expandedSnap={0.96} initialSnap={0.6} modal={false} onClose={close} title="Import Files"><FileUploadForm autoPick={autoPick} courses={courses} initialCourseId={courseId} lockCourse={Boolean(courseId)} onComplete={complete} onDirtyChange={setDirty} onSubmit={submit} onSubmittingChange={setSubmitting} /></AppBottomSheet>;
}

function first(value?: string | string[]): string | undefined { return Array.isArray(value) ? value[0] : value; }
