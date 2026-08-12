import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';

export function StudentProfileCard({ email, name }: { email: string; name: string }) {
  const { colors } = useAppearance();
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ST';
  return <AppCard style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={[styles.avatar, { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}><ThemedText style={[styles.initials, { color: colors.primary }]}>{initials}</ThemedText></View>
    <View style={styles.identity}><ThemedText numberOfLines={2} style={styles.name}>{name}</ThemedText><ThemedText style={[styles.role, { color: colors.primary }]}>STUDENT</ThemedText></View>
    <View style={[styles.accountRow, { borderTopColor: colors.border }]}><Ionicons color={colors.textSecondary} name="mail-outline" size={17} /><View style={styles.accountText}><ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>SIGNED-IN EMAIL</ThemedText><ThemedText numberOfLines={2} selectable style={styles.email}>{email}</ThemedText></View></View>
  </AppCard>;
}

const styles = StyleSheet.create({ card: { alignItems: 'center', gap: DesignTokens.spacing.md, padding: DesignTokens.spacing.xl }, avatar: { alignItems: 'center', borderRadius: DesignTokens.radius.pill, borderWidth: 1.5, height: 68, justifyContent: 'center', width: 68 }, initials: { fontSize: 21, fontWeight: '800', lineHeight: 27 }, identity: { alignItems: 'center', gap: 3 }, name: { fontSize: 23, fontWeight: '800', lineHeight: 29, textAlign: 'center' }, role: { fontSize: 10, fontWeight: '900', letterSpacing: 1, lineHeight: 14 }, accountRow: { alignItems: 'center', alignSelf: 'stretch', borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.md, marginTop: DesignTokens.spacing.sm, paddingTop: DesignTokens.spacing.lg }, accountText: { flex: 1, gap: 2, minWidth: 0 }, fieldLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, lineHeight: 12 }, email: { fontSize: 12, fontWeight: '600', lineHeight: 17 } });
