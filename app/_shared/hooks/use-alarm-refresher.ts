import { useEffect } from 'react';
import { AppState } from 'react-native';
import { addDatabaseChangeListener, useSQLiteContext } from 'expo-sqlite';
import { isAvailable, requestAlarmPermission } from 'react-native-nitro-ios-alarm-kit';
import PQueue from 'p-queue';
import debounce from 'lodash.debounce';

import { isAlarmEnabled, isRefreshCooldownExpired, refreshAlarms } from '@/functions/alarm';

const DEBOUNCE_MS = 500;
const WATCHED_TABLES = new Set(['events', 'actions']);

export function useAlarmRefresher() {
  const db = useSQLiteContext();

  useEffect(() => {
    let cancelled = false;
    const queue = new PQueue({ concurrency: 1 });

    const enqueueRefresh = () => {
      if (cancelled || queue.size > 0) return;
      if (!isAlarmEnabled(db)) return;
      queue.add(() => refreshAlarms(db));
    };

    const debouncedEnqueue = debounce(enqueueRefresh, DEBOUNCE_MS);

    const start = async () => {
      if (!isAvailable()) return undefined;
      const ok = await requestAlarmPermission();
      if (!ok || cancelled) return undefined;

      enqueueRefresh();

      const dbSub = addDatabaseChangeListener(({ tableName }) => {
        if (WATCHED_TABLES.has(tableName)) debouncedEnqueue();
      });

      const appSub = AppState.addEventListener('change', (state) => {
        if (state !== 'active') return;
        if (isRefreshCooldownExpired(db)) enqueueRefresh();
      });

      return () => {
        dbSub.remove();
        appSub.remove();
      };
    };

    const teardownPromise = start();

    return () => {
      cancelled = true;
      debouncedEnqueue.cancel();
      queue.clear();
      teardownPromise.then((teardown) => teardown?.());
    };
  }, [db]);
}
