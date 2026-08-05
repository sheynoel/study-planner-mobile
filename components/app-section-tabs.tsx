import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { calendarRoutes } from '@/lib/calendar/routes';
import { courseRoutes } from '@/lib/courses/routes';
import { taskRoutes } from '@/lib/tasks/routes';

export function AppSectionTabs({ active }: { active: 'calendar' | 'courses' | 'tasks' }) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      <SectionTab
        active={active === 'courses'}
        label="Courses"
        onPress={() => router.replace(courseRoutes.list)}
      />
      <SectionTab
        active={active === 'tasks'}
        label="Tasks"
        onPress={() => router.replace(taskRoutes.list)}
      />
      <SectionTab
        active={active === 'calendar'}
        label="Calendar"
        onPress={() => router.replace(calendarRoutes.list)}
      />
    </View>
  );
}

function SectionTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        active ? styles.activeTab : undefined,
        pressed ? styles.pressed : undefined,
      ]}>
      <ThemedText
        type="defaultSemiBold"
        lightColor={active ? '#ffffff' : '#0a7ea4'}
        darkColor={active ? '#ffffff' : '#7dd3fc'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tab: {
    alignItems: 'center',
    borderColor: '#0a7ea4',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  activeTab: {
    backgroundColor: '#0a7ea4',
  },
  pressed: {
    opacity: 0.72,
  },
});
