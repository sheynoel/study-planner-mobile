import { Pressable, StyleSheet, View } from 'react-native';

import { FileTypeIcon } from '@/components/files/file-type-icon';
import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel, formatFileDate } from '@/lib/files/file-display';

export function MaterialGridCard({ file, onPress }: { file: FileRecord; onPress: () => void }) {
  const { colors } = useAppearance();
  return <BentoCard style={styles.card}><Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}><View style={styles.top}><FileTypeIcon compact file={file} /><ThemedText style={[styles.type, { color: colors.textSecondary }]}>{fileTypeLabel(file)}</ThemedText></View><ThemedText numberOfLines={2} style={styles.title}>{file.displayName}</ThemedText><ThemedText numberOfLines={1} style={[styles.course, { color: colors.textSecondary }]}>{file.course?.name ?? 'Personal'}</ThemedText><ThemedText style={[styles.date, { color: colors.textSecondary }]}>{formatFileDate(file.createdAt)}</ThemedText></Pressable></BentoCard>;
}

const styles = StyleSheet.create({ card: { minHeight: 134, padding: 0, width: 164 }, content: { flex: 1, gap: 4, minHeight: 134, padding: DesignTokens.spacing.sm }, top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, type: { fontSize: 9.5 }, title: { fontSize: 12, fontWeight: '700', lineHeight: 16 }, course: { fontSize: 9.5, lineHeight: 13 }, date: { fontSize: 9.5, lineHeight: 13, marginTop: 'auto' }, pressed: { opacity: 0.72 } });
