import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { FileTypeIcon } from '@/components/files/file-type-icon';
import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel, formatFileDate, formatFileSize } from '@/lib/files/file-display';

export function CourseMaterialRow({ file, onPress }: { file: FileRecord; onPress: () => void }) { const { colors } = useAppearance(); return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }, pressed ? styles.pressed : undefined]}><FileTypeIcon compact file={file} /><View style={styles.text}><ThemedText numberOfLines={1} style={styles.title}>{file.displayName}</ThemedText><ThemedText numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>{fileTypeLabel(file)} · {formatFileSize(file.sizeBytes)} · {formatFileDate(file.createdAt)}</ThemedText></View><Ionicons color={colors.textSecondary} name="chevron-forward" size={15} /></Pressable>; }
const styles = StyleSheet.create({ row: { alignItems: 'center', borderRadius: DesignTokens.radius.md, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: DesignTokens.spacing.sm, minHeight: 48, paddingHorizontal: DesignTokens.spacing.sm, paddingVertical: 6 }, text: { flex: 1, minWidth: 0 }, title: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, meta: { fontSize: 9.5, lineHeight: 13 }, pressed: { opacity: 0.66 } });
