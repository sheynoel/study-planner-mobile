import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { PickedFile } from '@/lib/api/file.types';
import { formatFileSize } from '@/lib/files/file-display';

export function FilePickerField({ error, file, onPick }: { error?: string; file: PickedFile | null; onPick: () => void }) {
  const { colors } = useAppearance();
  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">File</ThemedText>
      {file ? <AppCard style={styles.selected}><ThemedText type="defaultSemiBold" numberOfLines={2}>{file.name}</ThemedText><ThemedText>{file.mimeType}</ThemedText><ThemedText>{formatFileSize(file.size)}</ThemedText></AppCard> : <ThemedText style={{ color: colors.textMuted }}>No file selected</ThemedText>}
      {error ? <ThemedText style={{ color: colors.dangerText }}>{error}</ThemedText> : null}
      <AppButton label={file ? 'Choose Another File' : 'Choose File'} onPress={onPick} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({ field: { gap: DesignTokens.spacing.sm }, selected: { borderRadius: DesignTokens.radius.lg, gap: DesignTokens.spacing.xs } });
