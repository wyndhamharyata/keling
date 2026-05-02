import { SQLiteDatabase } from 'expo-sqlite';
import { scheduleFixedAlarm, stopAllAlarms } from 'react-native-nitro-ios-alarm-kit';

import { collectAlarms } from '@/functions/alarm-scheduler';

const WINDOW_DAYS = 28;
const MAX_ALARMS = 60;
const REFRESH_COOLDOWN_MS = Math.floor((WINDOW_DAYS / 2) * 86_400_000);

// metadata keys
const IS_ALARM_ENABLED_KEY = 'isAlarmEnabled';
const LAST_ALARM_REFRESH_AT_KEY = 'lastAlarmRefreshAt';

export function isAlarmEnabled(db: SQLiteDatabase): boolean {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM metadata WHERE key = ?', [IS_ALARM_ENABLED_KEY]);
  return !!row && !!row.value && row.value === '1';
}

export function setEnableAlarm(db: SQLiteDatabase, enable: boolean) {
  db.runSync('INSERT INTO metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
    IS_ALARM_ENABLED_KEY,
    enable ? '1' : '0',
  ]);
}

export function getLastRefreshAt(db: SQLiteDatabase): number {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM metadata WHERE key = ?', [
    LAST_ALARM_REFRESH_AT_KEY,
  ]);
  return row ? Number(row.value) : 0;
}

function setLastRefreshAt(db: SQLiteDatabase, ts: number): void {
  db.runSync('INSERT INTO metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
    LAST_ALARM_REFRESH_AT_KEY,
    String(ts),
  ]);
}

export function isRefreshCooldownExpired(db: SQLiteDatabase): boolean {
  const last = getLastRefreshAt(db);
  const now = Date.now();
  return !(last <= now && now - last < REFRESH_COOLDOWN_MS);
}

export async function refreshAlarms(db: SQLiteDatabase) {
  await stopAllAlarms();

  const alarms = await collectAlarms(db, WINDOW_DAYS, MAX_ALARMS);

  let failed = false;
  for (const alarm of alarms) {
    try {
      await scheduleFixedAlarm(
        alarm.event.title.slice(0, 15),
        { text: 'Stop', textColor: '#fff', icon: 'checkmark.circle.fill' },
        '#FF9500',
        undefined,
        Math.floor(alarm.timestamp / 1000),
        { postAlert: 540 },
      );
    } catch (err) {
      console.error('Failed to schedule alarm:', alarm.event.title, err);
      failed = true;
    }
  }

  setLastRefreshAt(db, Date.now());

  if (failed) {
    console.warn('Some alarms failed to schedule');
  }
}
