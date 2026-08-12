import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import { useNotificationPreferences } from '@/contexts/notification-preferences-context';

export default function NotificationsScreen() {
  const { colors } = useAppearance();
  const { deliverySupported, preferences, setEnabled, setReminder } = useNotificationPreferences();
  return <AppScreen edges={['top', 'bottom']}><AppHeader compactTitle onBack={() => router.back()} title="Notifications" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={[styles.notice, { backgroundColor: colors.surfaceAccent, borderColor: colors.border }]}><Ionicons color={colors.primary} name="information-circle-outline" size={18} /><ThemedText style={[styles.noticeText, { color: colors.textSecondary }]}>These choices are saved on this device. Notification delivery and scheduling are not implemented yet.</ThemedText></View>
    <SettingLabel label="NOTIFICATIONS" /><View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}><ToggleRow description="Keep reminder choices active" label="Master notifications" onChange={setEnabled} value={preferences.enabled} /></View>
    <SettingLabel label="REMINDERS" /><View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}><ToggleRow description="Deadlines and due work" disabled={!preferences.enabled} divider label="Task reminders" onChange={(value) => setReminder('taskReminders', value)} value={preferences.taskReminders} /><ToggleRow description="Timed and all-day events" disabled={!preferences.enabled} divider label="Event reminders" onChange={(value) => setReminder('eventReminders', value)} value={preferences.eventReminders} /><ToggleRow description="Saved note reminder times" disabled={!preferences.enabled} divider label="Note reminders" onChange={(value) => setReminder('noteReminders', value)} value={preferences.noteReminders} /><ToggleRow description="Recurring class times" disabled={!preferences.enabled} label="Class reminders" onChange={(value) => setReminder('classReminders', value)} value={preferences.classReminders} /></View>
    {!deliverySupported ? <ThemedText style={[styles.footnote, { color: colors.textSecondary }]}>No notification permissions are requested and no reminders are scheduled by these controls.</ThemedText> : null}
  </ScrollView></AppScreen>;
}

function SettingLabel({ label }: { label: string }) { const { colors } = useAppearance(); return <ThemedText style={[styles.label, { color: colors.textSecondary }]}>{label}</ThemedText>; }
function ToggleRow({ description, disabled = false, divider = false, label, onChange, value }: { description: string; disabled?: boolean; divider?: boolean; label: string; onChange: (value: boolean) => void; value: boolean }) { const { colors } = useAppearance(); return <View style={[styles.row, divider ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : undefined, disabled ? styles.disabled : undefined]}><View style={styles.rowText}><ThemedText numberOfLines={1} style={styles.rowTitle}>{label}</ThemedText><ThemedText numberOfLines={1} style={[styles.rowDescription, { color: colors.textSecondary }]}>{description}</ThemedText></View><Switch accessibilityLabel={label} disabled={disabled} ios_backgroundColor={colors.surfaceSubtle} onValueChange={onChange} thumbColor={value ? colors.primaryText : colors.surface} trackColor={{ false: colors.border, true: colors.primary }} value={value} /></View>; }

const styles = StyleSheet.create({ content: { gap: DesignTokens.spacing.md, padding: DesignTokens.layout.screenPadding, paddingBottom: 48 }, notice: { alignItems: 'flex-start', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.sm, padding: DesignTokens.spacing.md }, noticeText: { flex: 1, fontSize: 11, lineHeight: 15 }, label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, lineHeight: 14, marginTop: DesignTokens.spacing.sm }, group: { borderRadius: DesignTokens.radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' }, row: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: 64, paddingHorizontal: DesignTokens.spacing.md, paddingVertical: 8 }, rowText: { flex: 1, minWidth: 0 }, rowTitle: { fontSize: 13, fontWeight: '700', lineHeight: 17 }, rowDescription: { fontSize: 10, lineHeight: 14 }, disabled: { opacity: 0.45 }, footnote: { fontSize: 10, lineHeight: 14, paddingHorizontal: 2 } });
