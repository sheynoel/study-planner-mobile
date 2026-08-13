import { isValidTime } from '../calendar/calendar-date.ts';

/** Converts a semester-local date and wall-clock time into a concrete UTC instant. */
export function zonedWallClockToIso(date: string, time: string, timeZone: string): string | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!dateMatch || !isValidTime(time)) return null;
  const [hour, minute] = time.split(':').map(Number);
  const wanted = Date.UTC(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]), hour, minute);
  let instant = wanted;
  try {
    for (let index = 0; index < 3; index += 1) {
      const parts = partsAt(new Date(instant), timeZone);
      const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
      const correction = wanted - represented;
      instant += correction;
      if (!correction) break;
    }
    return new Date(instant).toISOString();
  } catch {
    return null;
  }
}

function partsAt(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(value);
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: read('year'), month: read('month'), day: read('day'), hour: read('hour'), minute: read('minute') };
}
