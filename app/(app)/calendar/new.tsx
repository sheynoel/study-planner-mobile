import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { CalendarEventForm } from '@/components/calendar/calendar-event-form';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCalendar } from '@/contexts/calendar-context';
import { useCourses } from '@/contexts/course-context';
import { createEmptyCalendarEventForm, type CalendarEventFormValues, toCreateCalendarEventRequest } from '@/lib/calendar/calendar-event-form';
import { parseLocalDate } from '@/lib/calendar/calendar-date';
import { calendarRoutes } from '@/lib/calendar/routes';

export default function AddCalendarEventScreen() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const requestedDate = Array.isArray(params.date) ? params.date[0] : params.date;
  const { createEvent } = useCalendar();
  const { courses, listError, listStatus, loadCourses } = useCourses();
  const refreshCourses = useCallback(() => loadCourses(), [loadCourses]);
  const initialValues = useMemo(() => createEmptyCalendarEventForm(requestedDate ? parseLocalDate(requestedDate) ?? new Date() : new Date()), [requestedDate]);

  useEffect(() => { void refreshCourses().catch(() => undefined); }, [refreshCourses]);

  async function handleCreate(values: CalendarEventFormValues) {
    const event = await createEvent(toCreateCalendarEventRequest(values));
    router.replace(calendarRoutes.details(event.id));
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} subtitle="Create a personal or course-related event." title="Add event" />
    {listStatus === 'idle' || listStatus === 'loading' ? <LoadingState label="Loading courses..." /> : null}
    {listStatus === 'error' ? <ErrorState message={listError ?? 'Courses could not be loaded.'} onRetry={() => void refreshCourses().catch(() => undefined)} /> : null}
    {listStatus === 'success' ? <CalendarEventForm courses={courses} initialValues={initialValues} loadingLabel="Creating event..." onSubmit={handleCreate} submitLabel="Create event" /> : null}
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 } });
