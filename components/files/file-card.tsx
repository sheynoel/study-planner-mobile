import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { FileTypeIcon } from '@/components/files/file-type-icon';
import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel, formatFileDate, formatFileSize } from '@/lib/files/file-display';

export function FileCard({ file, onMenu, onPress }: { file: FileRecord; onMenu: () => void; onPress: () => void }) { const { colors } = useAppearance(); return <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}><Pressable accessibilityHint="Opens file" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.main, pressed ? styles.pressed : undefined]}><FileTypeIcon compact file={file} /><View style={styles.details}><ThemedText numberOfLines={1} style={styles.title}>{file.displayName}</ThemedText><ThemedText numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>{file.course?.name ?? 'Personal'} · {fileTypeLabel(file)} · {formatFileSize(file.sizeBytes)}</ThemedText><ThemedText style={[styles.course, { color: colors.textSecondary }]}>Added {formatFileDate(file.createdAt)}</ThemedText></View></Pressable><Pressable accessibilityLabel={`Actions for ${file.displayName}`} hitSlop={8} onPress={onMenu} style={styles.menu}><Ionicons color={colors.textSecondary} name="ellipsis-vertical" size={18} /></Pressable></View>; }
const styles = StyleSheet.create({ row: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 62 }, main: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: DesignTokens.spacing.sm, minWidth: 0, paddingHorizontal: DesignTokens.spacing.sm, paddingVertical: 7 }, details: { flex: 1, minWidth: 0 }, title: { fontSize: 12.5, fontWeight: '700', lineHeight: 17 }, meta: { fontSize: 9.5, lineHeight: 13 }, course: { fontSize: 9.5, lineHeight: 13 }, menu: { alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center', width: 42 }, pressed: { opacity: 0.68 } });
