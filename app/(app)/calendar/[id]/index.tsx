import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ErrorBanner } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorState, LoadingState } from '@/components/ui/async-state';
import { useCalendar } from '@/contexts/calendar-context';
import { useCourses } from '@/contexts/course-context';
import { getApiErrorMessage } from '@/lib/api/api-client';
import type { CalendarEvent } from '@/lib/api/calendar-event.types';
import { formatLocalDate, formatLocalDateTime, toLocalDateKey } from '@/lib/calendar/calendar-date';
import { calendarRoutes } from '@/lib/calendar/routes';

export default function CalendarEventDetailsScreen() {
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
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Delete this calendar event permanently?')) void performDelete();
      return;
    }
    Alert.alert('Delete event?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void performDelete() },
    ]);
  }

  const course = event?.courseId ? getCachedCourse(event.courseId) : undefined;
  return <ThemedView style={styles.screen}><SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <AppHeader onBack={() => router.back()} onRightAction={event && eventId ? () => router.push(calendarRoutes.edit(eventId)) : undefined} rightActionLabel={event && eventId ? 'Edit' : undefined} title={event?.title ?? 'Event details'} />
    {isLoading && !event ? <LoadingState label="Loading event..." /> : null}
    {loadError && !event ? <ErrorState message={loadError} onRetry={() => void refresh()} /> : null}
    {event ? <ScrollView contentContainerStyle={styles.content}>
      <ThemedView style={styles.hero} lightColor="#ede9fe" darkColor="#3b0764">
        <View style={[styles.colorSwatch, { backgroundColor: safeColor(event.color) }]} />
        <View style={styles.heroText}><ThemedText type="title">{event.title}</ThemedText><ThemedText type="defaultSemiBold">{event.isAllDay ? 'All-day event' : 'Calendar event'}</ThemedText></View>
      </ThemedView>
      <ThemedView style={styles.detailsCard} lightColor="#f8fafc" darkColor="#1e293b">
        <DetailRow label="Description" value={event.description ?? 'Not provided'} /><Divider />
        <DetailRow label="Course" value={course ? `${course.name}${course.code ? ` (${course.code})` : ''}` : event.courseId ? 'Course unavailable' : 'Personal event'} /><Divider />
        <DetailRow label="Location" value={event.location ?? 'Not provided'} /><Divider />
        <DetailRow label="Start" value={event.isAllDay ? formatLocalDate(toLocalDateKey(event.startAt)) : formatLocalDateTime(event.startAt)} /><Divider />
        <DetailRow label="End" value={event.endAt ? event.isAllDay ? formatLocalDate(toLocalDateKey(event.endAt)) : formatLocalDateTime(event.endAt) : 'Not provided'} /><Divider />
        <DetailRow label="All day" value={event.isAllDay ? 'Yes' : 'No'} /><Divider />
        <DetailRow label="Color" value={event.color ?? 'Default'} />
      </ThemedView>
      <ErrorBanner message={actionError ?? loadError} />
      <Pressable accessibilityRole="button" disabled={isDeleting} onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, isDeleting ? styles.disabled : undefined, pressed && !isDeleting ? styles.pressed : undefined]}><ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">{isDeleting ? 'Deleting event...' : 'Delete event'}</ThemedText></Pressable>
    </ScrollView> : null}
  </SafeAreaView></ThemedView>;
}

function DetailRow({ label, value }: { label: string; value: string }) { return <View style={styles.detailRow}><ThemedText type="defaultSemiBold" style={styles.detailLabel}>{label}</ThemedText><ThemedText selectable>{value}</ThemedText></View>; }
function Divider() { return <View style={styles.divider} />; }
function safeColor(color: string | null): string { return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#7c3aed'; }

const styles = StyleSheet.create({
  screen: { flex: 1 }, safeArea: { flex: 1 }, content: { gap: 16, padding: 20, paddingBottom: 40 },
  hero: { borderRadius: 20, flexDirection: 'row', gap: 16, padding: 24 }, colorSwatch: { borderRadius: 999, width: 10 }, heroText: { flex: 1, gap: 8 },
  detailsCard: { borderRadius: 16, gap: 14, padding: 20 }, detailRow: { gap: 4 }, detailLabel: { color: '#64748b' }, divider: { backgroundColor: '#94a3b8', height: StyleSheet.hairlineWidth, opacity: 0.45 },
  deleteButton: { alignItems: 'center', backgroundColor: '#b91c1c', borderRadius: 12, minHeight: 50, padding: 13 }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.8 },
});
