import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel } from '@/lib/files/file-display';
import { useAppearance } from '@/contexts/appearance-context';

export function FileTypeIcon({ compact = false, file }: { compact?: boolean; file: Pick<FileRecord, 'extension' | 'mimeType'> }) {
  const { colors } = useAppearance();
  return <View accessibilityLabel={`${fileTypeLabel(file)} file`} style={[styles.icon, compact ? styles.compact : undefined, { backgroundColor: colors.primary }]}><ThemedText style={[styles.label, compact ? styles.compactLabel : undefined, { color: colors.primaryText }]}>{fileTypeLabel(file).slice(0, 5)}</ThemedText></View>;
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', borderRadius: 10, height: 48, justifyContent: 'center', width: 48 },
  label: { fontSize: 11, fontWeight: '800', lineHeight: 14 },
  compact: { borderRadius: 8, height: 34, width: 34 },
  compactLabel: { fontSize: 8.5, lineHeight: 11 },
});
