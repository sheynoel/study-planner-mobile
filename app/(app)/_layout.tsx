import { Stack } from 'expo-router';

import { CalendarProvider } from '@/contexts/calendar-context';
import { CourseProvider } from '@/contexts/course-context';
import { TaskProvider } from '@/contexts/task-context';

export default function AppLayout() {
  return (
    <CourseProvider>
      <CalendarProvider>
        <TaskProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TaskProvider>
      </CalendarProvider>
    </CourseProvider>
  );
}
