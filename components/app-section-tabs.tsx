import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { FloatingQuickAdd } from '@/components/ui/floating-quick-add';
import { DesignTokens, Shadows } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { calendarRoutes } from '@/lib/calendar/routes';
import { courseRoutes } from '@/lib/courses/routes';
import { taskRoutes } from '@/lib/tasks/routes';
import { fileRoutes } from '@/lib/files/routes';

type Section = 'home' | 'calendar' | 'courses' | 'files' | 'tasks';
const TABS: readonly { icon: keyof typeof Ionicons.glyphMap; label: string; section: Section; onPress: () => void }[] = [
  { section: 'home', label: 'Home', icon: 'home-outline', onPress: () => router.replace('/') },
  { section: 'calendar', label: 'Calendar', icon: 'calendar-outline', onPress: () => router.replace(calendarRoutes.list) },
  { section: 'tasks', label: 'Tasks', icon: 'checkbox-outline', onPress: () => router.replace(taskRoutes.list) },
  { section: 'courses', label: 'Courses', icon: 'folder-open-outline', onPress: () => router.replace(courseRoutes.list) },
  { section: 'files', label: 'Files', icon: 'documents-outline', onPress: () => router.replace(fileRoutes.list) },
];

export function AppSectionTabs({ active }: { active: Section }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppearance();
  return <><View accessibilityRole="tablist" style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.outline, paddingBottom: Math.max(insets.bottom, 8) }]}>{TABS.map((tab) => <SectionTab active={active === tab.section} icon={tab.icon} key={tab.section} label={tab.label} onPress={tab.onPress} />)}</View><FloatingQuickAdd /></>;
}

function SectionTab({ active, icon, label, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors } = useAppearance();
  return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.tab, active ? { backgroundColor: colors.primaryContainer } : undefined, pressed ? styles.pressed : undefined]}><Ionicons color={active ? colors.primary : colors.textSecondary} name={active ? icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap : icon} size={19} /><ThemedText style={[styles.label, { color: active ? colors.primary : colors.textSecondary }]}>{label}</ThemedText></Pressable>;
}

const styles = StyleSheet.create({ container: { borderTopWidth: StyleSheet.hairlineWidth, bottom: 0, flexDirection: 'row', gap: DesignTokens.spacing.xs, left: 0, paddingHorizontal: DesignTokens.spacing.sm, paddingTop: DesignTokens.spacing.xs, position: 'absolute', right: 0, zIndex: 20, ...Shadows }, tab: { alignItems: 'center', borderRadius: DesignTokens.radius.md, flex: 1, gap: 1, justifyContent: 'center', minHeight: 50, paddingHorizontal: 2, paddingVertical: DesignTokens.spacing.xs }, label: { fontSize: 10, fontWeight: '600', lineHeight: 13 }, pressed: { opacity: 0.7 } });
