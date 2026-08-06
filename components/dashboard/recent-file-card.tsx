import { Pressable, StyleSheet, View } from 'react-native';

import { FileTypeIcon } from '@/components/files/file-type-icon';
import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel } from '@/lib/files/file-display';

export function RecentFileCard({ file, onPress }: { file: FileRecord; onPress: () => void }) {
  const { colors } = useAppearance();
  return (
    <AppCard padded={false} style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.content, pressed ? styles.pressed : undefined]}>
        <FileTypeIcon file={file} />
        <View style={styles.details}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>{file.displayName}</ThemedText>
          <ThemedText numberOfLines={1}>{fileTypeLabel(file)} · {file.course?.name ?? 'Personal file'}</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>{new Date(file.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</ThemedText>
        </View>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({ card: { borderRadius: DesignTokens.radius.lg }, content: { alignItems: 'center', flexDirection: 'row', gap: DesignTokens.spacing.md, padding: DesignTokens.layout.cardPadding }, details: { flex: 1, gap: DesignTokens.spacing.xs }, pressed: { opacity: 0.72 } });
