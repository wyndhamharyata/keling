import { scheduleForDate } from '@/app/_components/scheduleMatcher';
import { EventItem } from '@/schemas/event';
import { SQLiteDatabase } from 'expo-sqlite';

const MIN_INTERVAL_MS = 10 * 60_000;

export type AlarmEntry = { timestamp: number; event: Pick<EventItem, 'id' | 'title' | 'description'> };

export function expandTimeField(field: string, max: number): number[] {
  if (field === '*') return Array.from({ length: max + 1 }, (_, index) => index);

  if (field.includes(',')) return field.split(',').flatMap((f) => expandTimeField(f, max));

  if (field.startsWith('*/')) {
    const step = Number(field.slice(2));
    return Array.from({ length: max + 1 }, (_, index) => index).filter((i) => i % step === 0);
  }

  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  return [Number(field)];
}

function collectMinutesAlarms(
  event: EventItem,
  day: Date,
  hours: number[],
  minutes: number[],
  now: number,
  alarms: AlarmEntry[],
  maxAlarms: number,
): boolean {
  let lastAlarmTs = 0;

  for (const h of hours) {
    for (const m of minutes) {
      const t = new Date(day);
      t.setHours(h, m, 0, 0);
      const ts = t.getTime();
      if (ts <= now) continue;
      if (lastAlarmTs > 0 && ts - lastAlarmTs < MIN_INTERVAL_MS) continue;
      if (alarms.length >= maxAlarms) return true;
      alarms.push({ timestamp: ts, event });
      lastAlarmTs = ts;
    }
  }
  return false;
}

function collectEventAlarms(
  event: EventItem,
  day: Date,
  now: number,
  alarms: AlarmEntry[],
  maxAlarms: number,
): boolean {
  const [minVal, hourVal] = event.schedule.split(/\s+/);
  const minutes = expandTimeField(minVal, 59);
  const hours = expandTimeField(hourVal, 23);

  return collectMinutesAlarms(event, day, hours, minutes, now, alarms, maxAlarms);
}

async function collectDayAlarms(
  db: SQLiteDatabase,
  day: Date,
  now: number,
  alarms: AlarmEntry[],
  maxAlarms: number,
): Promise<boolean> {
  const { sql, params } = scheduleForDate(day, {
    where: "COALESCE(a.status, cron.status) != 'done'",
  });
  const events: EventItem[] = await db.getAllAsync(sql, params);

  for (const event of events) {
    if (collectEventAlarms(event, day, now, alarms, maxAlarms)) return true;
  }
  return false;
}

export async function collectAlarms(db: SQLiteDatabase, windowDays: number, maxAlarms: number): Promise<AlarmEntry[]> {
  const now = Date.now();
  const alarms: AlarmEntry[] = [];

  for (let d = 0; d < windowDays; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    day.setHours(0, 0, 0, 0);

    if (await collectDayAlarms(db, day, now, alarms, maxAlarms)) break;
  }

  alarms.sort((a, b) => a.timestamp - b.timestamp);
  return alarms;
}
