import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { ThemedText } from '@/components/themed-text';
import { DesignTokens } from '@/constants/theme';
import { useAppearance } from '@/contexts/appearance-context';
import type { CalendarItem } from '@/lib/api/calendar-event.types';
import type { CalendarDensity } from '@/lib/calendar/calendar-display';
import { formatLocalTime, toLocalDateKey } from '@/lib/calendar/calendar-date';
import { isCalendarTaskOverdue } from '@/lib/calendar/calendar-items';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function MonthCalendar({ density, items, month, onMonthChange, onSelectDate, selectedDate }: { density: CalendarDensity; items: CalendarItem[]; month: Date; onMonthChange: (month: Date) => void; onSelectDate: (date: string) => void; selectedDate: string }) {
  const { colors } = useAppearance();
  const grouped = groupItems(items);
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;
  return <Calendar
    current={monthKey}
    customHeader={() => <View style={styles.weekdays}>{WEEKDAYS.map((day) => <ThemedText key={day} style={[styles.weekday, { color: colors.textMuted }]}>{day}</ThemedText>)}</View>}
    dayComponent={({ date }: { date?: DateData }) => date ? <CalendarDay date={date} density={density} items={grouped.get(date.dateString) ?? []} month={month} onPress={onSelectDate} selected={selectedDate === date.dateString} /> : null}
    enableSwipeMonths
    firstDay={0}
    onMonthChange={(value) => onMonthChange(new Date(value.year, value.month - 1, 1))}
    showSixWeeks
    style={[styles.calendar, { backgroundColor: colors.surface }]}
    theme={{ backgroundColor: colors.surface, calendarBackground: colors.surface, weekVerticalMargin: 0 }}
  />;
}

function CalendarDay({ date, density, items, month, onPress, selected }: { date: DateData; density: CalendarDensity; items: CalendarItem[]; month: Date; onPress: (date: string) => void; selected: boolean }) {
  const { colors } = useAppearance();
  const previews = [...items].sort(comparePreviewItems);
  const visible = previews.slice(0, 2);
  const overflow = previews.length - visible.length;
  const currentMonth = date.month === month.getMonth() + 1;
  const today = date.dateString === toLocalDateKey(new Date());
  return <Pressable accessibilityLabel={`${new Date(date.year, date.month - 1, date.day).toLocaleDateString(undefined, { dateStyle: 'full' })}, ${items.length} calendar ${items.length === 1 ? 'item' : 'items'}`} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onPress(date.dateString)} style={({ pressed }) => [styles.day, selected ? { backgroundColor: colors.primaryContainer } : undefined, pressed ? styles.pressed : undefined]}>
    <View style={[styles.numberWrap, today && !selected ? { borderColor: colors.primary, borderWidth: 1 } : undefined, selected ? { backgroundColor: colors.primary } : undefined]}><ThemedText style={[styles.dayNumber, { color: selected ? colors.primaryText : currentMonth ? colors.text : colors.textMuted }]}>{date.day}</ThemedText></View>
    <View style={[styles.previews, !currentMonth ? styles.subdued : undefined]}>{visible.map((item) => <MiniPreview density={density} item={item} key={item.id} />)}{overflow > 0 ? <ThemedText numberOfLines={1} style={[styles.overflow, { color: colors.textSecondary }]}>+{overflow}</ThemedText> : null}</View>
  </Pressable>;
}

function MiniPreview({ density, item }: { density: CalendarDensity; item: CalendarItem }) {
  const { colors } = useAppearance();
  const label = density === 'detailed' && !item.isAllDay ? `${shortTime(item.startAt)} ${previewTitle(item)}` : previewTitle(item);
  return <View style={styles.preview}><View style={[styles.accent, { backgroundColor: item.color ?? colors.primary }]} /><ThemedText numberOfLines={1} style={styles.previewText}>{label}</ThemedText></View>;
}

function previewTitle(item: CalendarItem): string {
  if (item.sourceType === 'class_schedule') return item.courseCode ?? item.courseName ?? item.title;
  return item.title;
}
function shortTime(value: string): string { return formatLocalTime(value).replace(':00', '').replace(' ', '').toLowerCase(); }
function groupItems(items: CalendarItem[]): Map<string, CalendarItem[]> { const result = new Map<string, CalendarItem[]>(); for (const item of items) result.set(item.date, [...(result.get(item.date) ?? []), item]); return result; }
function comparePreviewItems(left: CalendarItem, right: CalendarItem): number {
  const priority = previewPriority(left) - previewPriority(right);
  if (priority) return priority;
  return Date.parse(left.startAt) - Date.parse(right.startAt);
}
function previewPriority(item: CalendarItem): number { if (isCalendarTaskOverdue(item)) return 0; if (item.sourceType === 'task') return 1; if (item.sourceType === 'event') return 2; if (item.sourceType === 'class_schedule') return 3; return 4; }

const styles = StyleSheet.create({ calendar: { paddingLeft: 0, paddingRight: 0 }, weekdays: { flexDirection: 'row', paddingBottom: 5 }, weekday: { flex: 1, fontSize: 9, fontWeight: '800', lineHeight: 12, textAlign: 'center' }, day: { borderRadius: DesignTokens.radius.sm, height: 60, minWidth: 0, paddingHorizontal: 2, paddingTop: 2, width: '100%' }, numberWrap: { alignItems: 'center', borderRadius: 10, height: 20, justifyContent: 'center', width: 20 }, dayNumber: { fontSize: 10.5, fontWeight: '700', lineHeight: 14 }, previews: { gap: 1, minHeight: 35, paddingTop: 2 }, preview: { alignItems: 'center', flexDirection: 'row', minWidth: 0 }, accent: { borderRadius: 2, height: 9, marginRight: 2, width: 2 }, previewText: { flex: 1, fontSize: 8, fontWeight: '600', lineHeight: 10 }, overflow: { fontSize: 8, fontWeight: '800', lineHeight: 10, paddingLeft: 4 }, subdued: { opacity: 0.42 }, pressed: { opacity: 0.62 } });
