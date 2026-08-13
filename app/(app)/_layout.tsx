import { Stack } from 'expo-router';

import { CalendarProvider } from '@/contexts/calendar-context';
import { ClassScheduleProvider } from '@/contexts/class-schedule-context';
import { CourseProvider } from '@/contexts/course-context';
import { TaskProvider } from '@/contexts/task-context';
import { FileProvider } from '@/contexts/file-context';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { HomeProvider } from '@/contexts/home-context';
import { NoteProvider } from '@/contexts/note-context';
import { NotificationPreferencesProvider } from '@/contexts/notification-preferences-context';

export const unstable_settings = {
  anchor: 'index',
};

export default function AppLayout() {
  return (
    <NotificationPreferencesProvider>
    <CourseProvider>
      <ClassScheduleProvider>
        <CalendarProvider>
          <FileProvider>
            <TaskProvider>
              <DashboardProvider>
                <NoteProvider>
                  <HomeProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="index" />
                      <Stack.Screen name="courses/new" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
                      <Stack.Screen name="tasks/new" options={{ animation: 'fade', contentStyle: { backgroundColor: 'transparent' }, gestureEnabled: false, presentation: 'transparentModal' }} />
                      <Stack.Screen name="calendar/new" options={{ animation: 'fade', contentStyle: { backgroundColor: 'transparent' }, gestureEnabled: false, presentation: 'transparentModal' }} />
                      <Stack.Screen name="notes/new" options={{ animation: 'fade', contentStyle: { backgroundColor: 'transparent' }, gestureEnabled: false, presentation: 'transparentModal' }} />
                      <Stack.Screen name="files/upload" options={{ animation: 'fade', contentStyle: { backgroundColor: 'transparent' }, gestureEnabled: false, presentation: 'transparentModal' }} />
                    </Stack>
                  </HomeProvider>
                </NoteProvider>
              </DashboardProvider>
            </TaskProvider>
          </FileProvider>
        </CalendarProvider>
      </ClassScheduleProvider>
    </CourseProvider>
    </NotificationPreferencesProvider>
  );
}
