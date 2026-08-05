import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { CalendarEventForm } from '@/components/calendar/calendar-event-form';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCalendar } from '@/contexts/calendar-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { CalendarEvent } from '@/lib/api/calendar-event.types';
import { calendarEventToFormValues, type CalendarEventFormValues, toUpdateCalendarEventRequest } from '@/lib/calendar/calendar-event-form';
import { calendarRoutes } from '@/lib/calendar/routes';

export default function EditCalendarEventScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { loadEvent, updateEvent } = useCalendar();
  const { courses, loadCourses } = useCourses();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!eventId) { setLoadError('This calendar event link is invalid.'); setIsLoading(false); return; }
    setLoadError(null); setIsLoading(true);
    try { const [nextEvent] = await Promise.all([loadEvent(eventId), loadCourses()]); setEvent(nextEvent); }
    catch (error) { setLoadError(getApiErrorMessage(error)); }
    finally { setIsLoading(false); }
  }, [eventId, loadCourses, loadEvent]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function handleUpdate(values: CalendarEventFormValues) {
    if (!eventId) throw new Error('This calendar event link is invalid.');
    await updateEvent(eventId, toUpdateCalendarEventRequest(values));
    if (router.canGoBack()) router.back(); else router.replace(calendarRoutes.details(eventId));
  }

  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}><AppHeader onBack={() => router.back()} subtitle="Update timing, course, location, or display details." title="Edit event" />
    {isLoading && !event ? <LoadingState label="Loading event..." /> : null}
    {loadError && !event ? <ErrorState message={loadError} onRetry={() => void refresh()} /> : null}
    {event ? <CalendarEventForm courses={courses} initialValues={calendarEventToFormValues(event)} loadingLabel="Saving changes..." onSubmit={handleUpdate} submitLabel="Save changes" /> : null}
  </SafeAreaView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, safeArea: { flex: 1 } });
