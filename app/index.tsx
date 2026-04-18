import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';

import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { EventItem, EventStatus } from '@/schemas/event';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllSync } from '@/db/queries';
import { useDbListener } from '@/hooks/use-db-listener';
import { scheduleForDate, toStartOfDayTimestamp } from './_index/scheduleMatcher';
import EventItemView from './_index/eventItemView';
import DateSwitcher from './_index/dateSwitcher';

const statusOrder: Record<EventStatus, number> = { todo: 0, snoozed: 1, done: 2, skipped: 3 };

export default function HomeScreen() {
  const theme = useColorScheme() ?? 'light';
  const db = useSQLiteContext();
  const router = useRouter();

  const { dateUnix } = useLocalSearchParams<{ dateUnix?: string }>();
  const [date, setDate] = useState(!!dateUnix ? new Date(parseInt(dateUnix)) : new Date());
  const [items, setItems] = useState<EventItem[]>([]);

  const goToPrevDay = () => setDate((d) => new Date(d.getTime() - 86400000));
  const goToNextDay = () => setDate((d) => new Date(d.getTime() + 86400000));

  const showPicker = () => router.push(`/datePicker?dateUnix=${date.getTime()}`);

  const fetchItems = useCallback(() => {
    const { sql, params } = scheduleForDate(date);
    setItems(getAllSync<EventItem>(db, sql, params, ['subtasks']));
  }, [date, db]);

  useDbListener(['events', 'actions'], fetchItems);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const sortedItems = useMemo(() => [...items].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]), [items]);
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <DateSwitcher date={date} goToNextDay={goToNextDay} goToPrevDay={goToPrevDay} showPicker={showPicker} />
        {total > 0 && (
          <ThemedView style={{ gap: 8, marginVertical: 20 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ flex: 1, color: Colors[theme].baseContent }}>{`${count} of ${total} done`}</Text>
              <Text style={{ color: Colors[theme].baseContent }}>{`${progress}%`}</Text>
            </View>
            <View style={{ height: 12, borderRadius: 6, backgroundColor: Colors[theme].base500, overflow: 'hidden' }}>
              <Animated.View
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
      </SafeAreaView>
      <Pressable style={styles.fabContainer} onPress={() => router.push('/event')}>
        <LiquidGlassView interactive style={styles.fab} effect={'regular'} tintColor={Colors[theme].primary}>
          <Text style={styles.fabText}>+</Text>
        </LiquidGlassView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
