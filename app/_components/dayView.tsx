import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useCallback, useMemo, useState } from 'react';
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { EventItem, EventStatus } from '@/schemas/event';
import { getAllSync } from '@/db/queries';
import { useDbListener } from '@/hooks/use-db-listener';
import { scheduleForDate, toStartOfDayTimestamp } from './scheduleMatcher';
import EventItemView from './eventItemView';

const statusOrder: Record<EventStatus, number> = { todo: 0, snoozed: 1, done: 2, skipped: 3 };

function fetchDayItems(db: SQLiteDatabase, date: Date): EventItem[] {
  const { sql, params } = scheduleForDate(date);
  return getAllSync<EventItem>(db, sql, params, ['subtasks']);
}

export interface DayViewProps {
  date: Date;
  width: number;
}

export default function DayView({ date, width }: DayViewProps) {
  const theme = useColorScheme() ?? 'light';
  const db = useSQLiteContext();

  const [items, setItems] = useState<EventItem[]>(() => fetchDayItems(db, date));

  // Adjust state during render on date prop change so the new date never
  // paints with the previous day's items. React re-runs render with the new
  // state synchronously before committing, so no intermediate paint is shown.
  const [prevDateMs, setPrevDateMs] = useState(date.getTime());
  if (prevDateMs !== date.getTime()) {
    setPrevDateMs(date.getTime());
    setItems(fetchDayItems(db, date));
  }

  const fetchItems = useCallback(() => {
    setItems(fetchDayItems(db, date));
  }, [db, date]);

  useDbListener(['events', 'actions'], fetchItems);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]),
    [items],
  );
  const { progress, count, total } = useMemo(() => {
    const count = sortedItems.filter((v) => v.status === 'done').length;
    const total = sortedItems.length;
    const progress = Math.round((count / total) * 100);
    return { progress, count, total };
  }, [sortedItems]);

  const dateTs = toStartOfDayTimestamp(date);

  const onItemCheckboxClicked = useCallback(
    (id: string) => {
      const item = items.find((e) => e.id === id);
      const newStatus = item && item.status === 'done' ? 'todo' : 'done';
      const subtasks = JSON.stringify(item?.subtasks ?? []);
      db.runSync(
        `INSERT INTO actions (id, event_id, date, status, subtasks) VALUES (?, ?, ?, ?, ?) ON CONFLICT(event_id, date) DO UPDATE SET status = excluded.status`,
        [Crypto.randomUUID(), id, dateTs, newStatus, subtasks],
      );
    },
    [items, dateTs, db],
  );

  return (
    <View style={[styles.page, { width }]}>
      {total > 0 && (
        <ThemedView style={{ gap: 8, marginVertical: 20 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ flex: 1, color: Colors[theme].baseContent }}>{`${count} of ${total} done`}</Text>
            <Text style={{ color: Colors[theme].baseContent }}>{`${progress}%`}</Text>
          </View>
          <View style={{ height: 12, borderRadius: 6, backgroundColor: Colors[theme].base500, overflow: 'hidden' }}>
            <Animated.View
              key={dateTs}
              layout={LinearTransition}
              style={{ height: 12, borderRadius: 6, backgroundColor: Colors[theme].success, width: `${progress}%` }}
            />
          </View>
        </ThemedView>
      )}
      <ScrollView>
        {sortedItems.map((item, index) => (
          <Animated.View key={item.id} layout={LinearTransition}>
            {index > 0 && <ThemedView style={[styles.separator, { backgroundColor: Colors[theme].base500 }]} />}
            <EventItemView item={item} dateTs={dateTs} onItemCheckboxClicked={() => onItemCheckboxClicked(item.id)} />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
