import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { AppButton } from '@/components/ui/app-button';
import { BentoCard } from '@/components/ui/bento-card';
import { showDestructiveConfirmation } from '@/components/ui/confirmation-dialog';
import { useCalendar } from '@/contexts/calendar-context';
import { useAppearance } from '@/contexts/appearance-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { CalendarEvent } from '@/lib/api/calendar-event.types';
import { formatLocalDate, formatLocalDateTime, toLocalDateKey } from '@/lib/calendar/calendar-date';
import { calendarRoutes } from '@/lib/calendar/routes';

export default function CalendarEventDetailsScreen() {
  const { colors } = useAppearance();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { deleteEvent, getCachedEvent, loadEvent } = useCalendar();
  const { getCachedCourse, loadCourses } = useCourses();
  const [event, setEvent] = useState<CalendarEvent | null>(() => eventId ? getCachedEvent(eventId) ?? null : null);
  const [isLoading, setIsLoading] = useState(!event);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    if (!eventId) { setLoadError('This calendar event link is invalid.'); setIsLoading(false); return; }
    setLoadError(null);
    setIsLoading(true);
    try {
      const [nextEvent] = await Promise.all([loadEvent(eventId), loadCourses()]);
      setEvent(nextEvent);
    } catch (error) { setLoadError(getApiErrorMessage(error)); }
    finally { setIsLoading(false); }
  }, [eventId, loadCourses, loadEvent]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function performDelete() {
    if (!eventId || isDeleting) return;
    setActionError(null);
    setIsDeleting(true);
    try { await deleteEvent(eventId); router.replace(calendarRoutes.list); }
    catch (error) { setActionError(getApiErrorMessage(error)); setIsDeleting(false); }
  }

  function confirmDelete() {
    showDestructiveConfirmation({ title: 'Delete event?', message: 'This action cannot be undone.', onConfirm: () => void performDelete() });
  }

  const course = event?.courseId ? getCachedCourse(event.courseId) : undefined;
  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <AppHeader onBack={() => router.back()} onRightAction={event && eventId ? () => router.push(calendarRoutes.edit(eventId)) : undefined} rightActionLabel={event && eventId ? 'Edit' : undefined} title={event?.title ?? 'Event details'} />
    {isLoading && !event ? <LoadingState label="Loading event..." /> : null}
    {loadError && !event ? <ErrorState message={loadError} onRetry={() => void refresh()} /> : null}
    {event ? <ScrollView contentContainerStyle={styles.content}>
      <BentoCard style={styles.hero} tone="accent">
        <View style={[styles.colorSwatch, { backgroundColor: safeColor(event.color, colors.primary) }]} />
        <View style={styles.heroText}><ThemedText type="title">{event.title}</ThemedText><ThemedText type="defaultSemiBold">{event.isAllDay ? 'All-day event' : 'Calendar event'}</ThemedText></View>
      </BentoCard>
      <BentoCard style={styles.detailsCard}>
        <DetailRow color={colors.textSecondary} label="Description" value={event.description ?? 'Not provided'} /><Divider color={colors.border} />
        <DetailRow color={colors.textSecondary} label="Course" value={course ? `${course.name}${course.code ? ` (${course.code})` : ''}` : event.courseId ? 'Course unavailable' : 'Personal event'} /><Divider color={colors.border} />
        <DetailRow color={colors.textSecondary} label="Location" value={event.location ?? 'Not provided'} /><Divider color={colors.border} />
        <DetailRow color={colors.textSecondary} label="Start" value={event.isAllDay ? formatLocalDate(toLocalDateKey(event.startAt)) : formatLocalDateTime(event.startAt)} /><Divider color={colors.border} />
        <DetailRow color={colors.textSecondary} label="End" value={event.endAt ? event.isAllDay ? formatLocalDate(toLocalDateKey(event.endAt)) : formatLocalDateTime(event.endAt) : 'Not provided'} /><Divider color={colors.border} />
        <DetailRow color={colors.textSecondary} label="All day" value={event.isAllDay ? 'Yes' : 'No'} /><Divider color={colors.border} />
        <DetailRow color={colors.textSecondary} label="Color" value={event.color ?? 'Default'} />
      </BentoCard>
      <ErrorBanner message={actionError ?? loadError} />
      <AppButton label={isDeleting ? 'Deleting event...' : 'Delete event'} loading={isDeleting} onPress={confirmDelete} variant="danger" />
    </ScrollView> : null}
  </SafeAreaView></ThemedView>;
}

function DetailRow({ color, label, value }: { color: string; label: string; value: string }) { return <View style={styles.detailRow}><ThemedText type="defaultSemiBold" style={{ color }}>{label}</ThemedText><ThemedText selectable>{value}</ThemedText></View>; }
function Divider({ color }: { color: string }) { return <View style={[styles.divider, { backgroundColor: color }]} />; }
function safeColor(color: string | null, fallback: string): string { return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback; }

const styles = StyleSheet.create({
  screen: { flex: 1 }, safeArea: { flex: 1 }, content: { gap: 16, padding: 20, paddingBottom: 40 },
  hero: { borderRadius: 20, flexDirection: 'row', gap: 16, padding: 24 }, colorSwatch: { borderRadius: 999, width: 10 }, heroText: { flex: 1, gap: 8 },
  detailsCard: { gap: 14, padding: 20 }, detailRow: { gap: 4 }, divider: { height: StyleSheet.hairlineWidth },
});
