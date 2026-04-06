import { Pressable, ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { CircleCheckbox } from '@/components/ui/circle-checkbox';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatSchedule } from './_index/scheduleParser';
import { Colors } from '@/constants/theme';
import { useCallback, useMemo, useState } from 'react';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { EventItem, EventStatus } from '@/schemas/event';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllSync } from '@/db/queries';
import { useDbListener } from '@/hooks/use-db-listener';
import { scheduleForDate } from './_index/scheduleMatcher';

const statusOrder: Record<EventStatus, number> = { todo: 0, snoozed: 1, done: 2, skipped: 3 };

export default function HomeScreen() {
  const theme = useColorScheme() ?? 'light';
  const db = useSQLiteContext();
  const router = useRouter();

  const [items, setItems] = useState<EventItem[]>([]);
  useDbListener('events', () => {
    const { sql, params } = scheduleForDate(new Date());
    setItems(getAllSync<EventItem>(db, sql, params, ['subtasks']));
  });

  const sortedItems = useMemo(() => [...items].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]), [items]);

  const onItemCheckboxClicked = useCallback(
    (id: string) => {
      const item = items.find((e) => e.id === id);
      db.runSync(`UPDATE events SET status = ? WHERE id = ?`, [item && item.status === 'done' ? 'todo' : 'done', id]);
    },
    [items],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <ScrollView>
          {sortedItems.map((item, index) => (
            <Animated.View key={item.id} layout={LinearTransition}>
              {index > 0 && <ThemedView style={[styles.separator, { backgroundColor: Colors[theme].base500 }]} />}
              <EventItemView item={item} onItemCheckboxClicked={() => onItemCheckboxClicked(item.id)} />
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

export interface EventItemViewProps {
  item: EventItem;
  onItemCheckboxClicked: () => void;
}

export function EventItemView({ item, onItemCheckboxClicked }: EventItemViewProps) {
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  return (
    <ThemedView style={styles.item}>
      <CircleCheckbox
        value={item.status === 'done'}
        onValueChange={onItemCheckboxClicked}
        color={Colors[theme].primary}
      />
      <Pressable style={styles.item_innerTextView} onPress={() => router.push(`/event?id=${item.id}`)}>
        <ThemedText style={{ fontSize: 18, color: Colors[theme].baseContent }}>{item.title}</ThemedText>
        <ThemedView style={styles.item_secondLine_View}>
          {item.priority === 'high' && (
            <ThemedText style={{ fontSize: 13, color: Colors[theme].error }}>★ High Priority</ThemedText>
          )}
          <ThemedText style={{ fontSize: 13, color: Colors[theme].secondary }}>
            ⧗ {formatSchedule(item.schedule)}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 15,
  },
  item_innerTextView: {
    flex: 1,
    flexDirection: 'column',
  },
  item_secondLine_View: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 30,
  },
});
