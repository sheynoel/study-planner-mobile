import { StyleSheet, View } from 'react-native';

import { FileTypeIcon } from '@/components/files/file-type-icon';
import { ThemedText } from '@/components/themed-text';
import { BentoCard } from '@/components/ui/bento-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel, formatFileDate } from '@/lib/files/file-display';

export function FilePreviewCard({ file, onPress, width = 190 }: { file: FileRecord; onPress: () => void; width?: number }) {
  const { colors } = useAppearance();
  return <BentoCard onPress={onPress} style={[styles.card, { width }]}><FileTypeIcon file={file} /><View style={styles.text}><ThemedText type="defaultSemiBold" numberOfLines={2}>{file.displayName}</ThemedText><ThemedText numberOfLines={1} style={{ color: colors.textSecondary }}>{fileTypeLabel(file)} · {file.course?.name ?? 'Personal'}</ThemedText><ThemedText style={[styles.date, { color: colors.textSecondary }]}>{formatFileDate(file.createdAt)}</ThemedText></View></BentoCard>;
}
const styles = StyleSheet.create({ card: { gap: DesignTokens.spacing.md, minHeight: 174 }, text: { gap: DesignTokens.spacing.xs }, date: { ...DesignTokens.typography.caption } });
