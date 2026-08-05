import { Stack } from 'expo-router';

import { CalendarProvider } from '@/contexts/calendar-context';
import { ClassScheduleProvider } from '@/contexts/class-schedule-context';
import { CourseProvider } from '@/contexts/course-context';
import { TaskProvider } from '@/contexts/task-context';

export default function AppLayout() {
  return (
    <CourseProvider>
      <ClassScheduleProvider>
        <CalendarProvider>
          <TaskProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </TaskProvider>
        </CalendarProvider>
      </ClassScheduleProvider>
    </CourseProvider>
  );
}
