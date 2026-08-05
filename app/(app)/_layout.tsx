import { Stack } from 'expo-router';

import { CourseProvider } from '@/contexts/course-context';
import { TaskProvider } from '@/contexts/task-context';

export default function AppLayout() {
  return (
    <CourseProvider>
      <TaskProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TaskProvider>
    </CourseProvider>
  );
}
