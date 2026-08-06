import { Pressable, StyleSheet, View } from 'react-native';

import { FileTypeIcon } from '@/components/files/file-type-icon';
import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel, formatFileDate, formatFileSize } from '@/lib/files/file-display';

export function FileCard({ file, onPress }: { file: FileRecord; onPress: () => void }) {
  const { colors } = useAppearance();
  return <AppCard padded={false} style={styles.card}>
    <Pressable accessibilityHint="Opens file details" accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
      <FileTypeIcon file={file} />
      <View style={styles.details}>
        <ThemedText type="subtitle" numberOfLines={2}>{file.displayName}</ThemedText>
        <ThemedText numberOfLines={1}>{file.originalName}</ThemedText>
        <ThemedText style={{ color: colors.textSecondary }}>{fileTypeLabel(file)} · {formatFileSize(file.sizeBytes)}</ThemedText>
        <ThemedText numberOfLines={1}>{file.course ? `${file.course.name}${file.course.code ? ` (${file.course.code})` : ''}` : 'Personal file'}</ThemedText>
        <ThemedText style={{ color: colors.textSecondary }}>Uploaded {formatFileDate(file.createdAt)}</ThemedText>
      </View>
    </Pressable>
  </AppCard>;
}

const styles = StyleSheet.create({ card: { borderRadius: DesignTokens.radius.lg }, content: { alignItems: 'flex-start', flexDirection: 'row', gap: DesignTokens.spacing.md, minHeight: DesignTokens.size.touchTarget, padding: DesignTokens.layout.cardPadding }, details: { flex: 1, gap: DesignTokens.spacing.xs }, pressed: { opacity: 0.72 } });
