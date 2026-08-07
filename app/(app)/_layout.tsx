import { Stack } from 'expo-router';

import { CalendarProvider } from '@/contexts/calendar-context';
import { ClassScheduleProvider } from '@/contexts/class-schedule-context';
import { CourseProvider } from '@/contexts/course-context';
import { TaskProvider } from '@/contexts/task-context';
import { FileProvider } from '@/contexts/file-context';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { HomeProvider } from '@/contexts/home-context';

export default function AppLayout() {
  return (
    <CourseProvider>
      <ClassScheduleProvider>
        <CalendarProvider>
          <FileProvider>
            <TaskProvider>
              <DashboardProvider>
                <HomeProvider>
                  <Stack screenOptions={{ headerShown: false }} />
                </HomeProvider>
              </DashboardProvider>
            </TaskProvider>
          </FileProvider>
        </CalendarProvider>
      </ClassScheduleProvider>
    </CourseProvider>
  );
}
