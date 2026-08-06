import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PlannerColors } from '@/constants/theme';

export function CalendarLegend() {
  return (
    <View accessibilityLabel="Calendar item legend" style={styles.container}>
      <LegendItem color={PlannerColors.event} label="Event" symbol="E" />
      <LegendItem color={PlannerColors.task} label="Task deadline" symbol="T" />
      <LegendItem color={PlannerColors.classSchedule} label="Class" symbol="C" />
    </View>
  );
}

function LegendItem({ color, label, symbol }: { color: string; label: string; symbol: string }) {
  return <View style={styles.item}><View style={[styles.symbol, { backgroundColor: color }]}><ThemedText style={styles.symbolText}>{symbol}</ThemedText></View><ThemedText style={styles.label}>{label}</ThemedText></View>;
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 20, paddingBottom: 8 },
  item: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  symbol: { alignItems: 'center', borderRadius: 999, height: 20, justifyContent: 'center', width: 20 },
  symbolText: { color: '#ffffff', fontSize: 11, fontWeight: '800', lineHeight: 14 },
  label: { fontSize: 13 },
});
