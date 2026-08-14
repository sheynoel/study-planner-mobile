import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { FileRecord } from '@/lib/api/file.types';
import { fileTypeLabel } from '@/lib/files/file-display';

export function FileTypeIcon({ compact = false, file }: { compact?: boolean; file: Pick<FileRecord, 'extension' | 'mimeType'> }) {
  return <View accessibilityLabel={`${fileTypeLabel(file)} file`} style={[styles.icon, compact ? styles.compact : undefined, { backgroundColor: badgeColor(file.extension) }]}><ThemedText style={[styles.label, compact ? styles.compactLabel : undefined]}>{fileTypeLabel(file).slice(0, 5)}</ThemedText></View>;
}

function badgeColor(extension: string | null): string { const value = extension?.toLowerCase(); if (value === 'pdf') return '#B85C5C'; if (['doc', 'docx', 'txt'].includes(value ?? '')) return '#527AA3'; if (['ppt', 'pptx'].includes(value ?? '')) return '#B76E45'; if (['xls', 'xlsx', 'csv'].includes(value ?? '')) return '#4F8065'; if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'heic'].includes(value ?? '')) return '#7A68A6'; return '#68727D'; }

const styles = StyleSheet.create({
  icon: { alignItems: 'center', borderRadius: 10, height: 48, justifyContent: 'center', width: 48 },
  label: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', lineHeight: 14 },
  compact: { borderRadius: 8, height: 34, width: 34 },
  compactLabel: { fontSize: 8.5, lineHeight: 11 },
});
