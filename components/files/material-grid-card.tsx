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
  return <BentoCard style={styles.card}><Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}><View style={styles.top}><FileTypeIcon file={file} /><ThemedText style={{ color: colors.textSecondary }}>{fileTypeLabel(file)}</ThemedText></View><ThemedText type="defaultSemiBold" numberOfLines={2}>{file.displayName}</ThemedText><ThemedText numberOfLines={1} style={{ color: colors.textSecondary }}>{file.course?.name ?? 'Personal'}</ThemedText><ThemedText style={[styles.date, { color: colors.textSecondary }]}>{formatFileDate(file.createdAt)}</ThemedText></Pressable></BentoCard>;
}

const styles = StyleSheet.create({ card: { minHeight: 172, padding: 0, width: 190 }, content: { flex: 1, gap: DesignTokens.spacing.sm, minHeight: 172, padding: DesignTokens.spacing.md }, top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, date: { fontSize: 12, marginTop: 'auto' }, pressed: { opacity: 0.72 } });
