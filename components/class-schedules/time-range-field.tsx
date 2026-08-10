import { StyleSheet, View } from 'react-native';

import { TimePickerField } from '@/components/ui/time-picker-field';

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
    <View style={styles.row}>
      <TimePickerField error={startError} label="Start time" onChange={onStartChange} value={startTime} />
      <TimePickerField error={endError} label="End time" onChange={onEndChange} value={endTime} />
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 10 } });
