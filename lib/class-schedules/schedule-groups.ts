import type { ClassSchedule, Weekday } from '@/lib/api/class-schedule.types';

export type ScheduleGroup = { weekdays: Weekday[]; startTime: string; endTime: string; room: string | null; startDate: string; endDate: string };
const LABELS: Record<Weekday, string> = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };

export function groupClassSchedules(schedules: ClassSchedule[]): ScheduleGroup[] {
  const groups = new Map<string, ScheduleGroup>();
  for (const schedule of schedules) {
    const key = [schedule.startTime, schedule.endTime, schedule.room ?? '', schedule.startDate, schedule.endDate].join('|');
    const current = groups.get(key);
    if (current) current.weekdays.push(schedule.weekday);
    else groups.set(key, { weekdays: [schedule.weekday], startTime: schedule.startTime, endTime: schedule.endTime, room: schedule.room, startDate: schedule.startDate, endDate: schedule.endDate });
  }
  return [...groups.values()];
}

export function formatWeekdays(weekdays: Weekday[]): string { return weekdays.map((weekday) => LABELS[weekday]).join(' · '); }
