import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { CalendarEventForm } from '@/components/calendar/calendar-event-form';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCalendar } from '@/contexts/calendar-context';
import { useCourses } from '@/contexts/course-context';
import { createEmptyCalendarEventForm, type CalendarEventFormValues, toCreateCalendarEventRequest } from '@/lib/calendar/calendar-event-form';
import { parseLocalDate } from '@/lib/calendar/calendar-date';
import { calendarRoutes } from '@/lib/calendar/routes';

export default function AddCalendarEventScreen() {
  const params = useLocalSearchParams<{ courseId?: string | string[]; date?: string | string[] }>();
  const requestedDate = Array.isArray(params.date) ? params.date[0] : params.date;
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const navigation = useNavigation();
  const { createEvent } = useCalendar();
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const allowClose = useRef(false);
  const refreshCourses = useCallback(() => loadCourses(), [loadCourses]);
  const initialValues = useMemo(() => ({ ...createEmptyCalendarEventForm(requestedDate ? parseLocalDate(requestedDate) ?? new Date() : new Date()), courseId: courseId ?? null }), [courseId, requestedDate]);

  useEffect(() => { void refreshCourses().catch(() => undefined); }, [refreshCourses]);
  usePreventRemove(dirty && !allowClose.current, ({ data }) => { Alert.alert('Discard this event?', 'Your unsaved event will be lost.', [{ text: 'Keep editing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) }]); });
  const close = useCallback(() => { if (!submitting) router.back(); }, [submitting]);

  async function handleCreate(values: CalendarEventFormValues) {
    const event = await createEvent(toCreateCalendarEventRequest(values));
    allowClose.current = true;
    setDirty(false);
    router.replace(calendarRoutes.details(event.id));
  }

  return <AppBottomSheet expandable expandedSnap={0.96} initialSnap={0.76} modal={false} onClose={close} title="Add Event">
    {listStatus === 'idle' || listStatus === 'loading' ? <LoadingState label="Loading courses..." /> : null}
    {listStatus === 'error' ? <ErrorState message={listError ?? 'Courses could not be loaded.'} onRetry={() => void refreshCourses().catch(() => undefined)} /> : null}
    {listStatus === 'success' ? <CalendarEventForm courses={courses} initialValues={initialValues} loadingLabel="Creating event..." onDirtyChange={setDirty} onSubmit={handleCreate} onSubmittingChange={setSubmitting} submitLabel="Add Event" /> : null}
  </AppBottomSheet>;
}
