import { StyleSheet, View } from 'react-native';

import { FormField } from '@/components/auth/auth-form';
import { ThemedText } from '@/components/themed-text';

export function TimeRangeField({
  endError, endTime, onEndChange, onStartChange, startError, startTime,
}: {
  endError?: string;
  endTime: string;
  onEndChange: (value: string) => void;
  onStartChange: (value: string) => void;
  startError?: string;
  startTime: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.row}>
        <View style={styles.flex}><FormField autoCapitalize="none" error={startError} keyboardType="numbers-and-punctuation" label="Start time" onChangeText={onStartChange} placeholder="09:00" value={startTime} /></View>
        <View style={styles.flex}><FormField autoCapitalize="none" error={endError} keyboardType="numbers-and-punctuation" label="End time" onChangeText={onEndChange} placeholder="10:30" value={endTime} /></View>
      </View>
      <ThemedText style={styles.hint} lightColor="#64748b" darkColor="#94a3b8">24-hour local wall-clock time (HH:mm)</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({ field: { gap: 4 }, row: { flexDirection: 'row', gap: 12 }, flex: { flex: 1 }, hint: { fontSize: 13, lineHeight: 18 } });
