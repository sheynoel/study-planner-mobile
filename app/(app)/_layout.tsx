import { Stack } from 'expo-router';

import { CourseProvider } from '@/contexts/course-context';

export default function AppLayout() {
  return (
    <CourseProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CourseProvider>
  );
}
