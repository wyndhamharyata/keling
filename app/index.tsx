import { Pressable, ScrollView, StyleSheet, Text, useColorScheme } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { CircleCheckbox } from '@/components/ui/circle-checkbox';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as DropdownMenu from 'zeego/dropdown-menu';
import * as Crypto from 'expo-crypto';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatSchedule } from './_index/scheduleParser';
import { Colors } from '@/constants/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { EventItem, EventStatus } from '@/schemas/event';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllSync } from '@/db/queries';
import { useDbListener } from '@/hooks/use-db-listener';
import { scheduleForDate, toStartOfDayTimestamp } from './_index/scheduleMatcher';

const statusOrder: Record<EventStatus, number> = { todo: 0, snoozed: 1, done: 2, skipped: 3 };

export default function HomeScreen() {
  const theme = useColorScheme() ?? 'light';
  const db = useSQLiteContext();
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [items, setItems] = useState<EventItem[]>([]);

  const goToPrevDay = () => setDate((d) => new Date(d.getTime() - 86400000));
  const goToNextDay = () => setDate((d) => new Date(d.getTime() + 86400000));

  const isToday =
    date.getDate() === new Date().getDate() &&
    date.getMonth() === new Date().getMonth() &&
    date.getFullYear() === new Date().getFullYear();

  const dateLabel =
    date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    (isToday ? ' (today)' : '');

  const fetchItems = useCallback(() => {
    const { sql, params } = scheduleForDate(date);
    setItems(getAllSync<EventItem>(db, sql, params, ['subtasks']));
  }, [date, db]);

  useDbListener(['events', 'actions'], fetchItems);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const sortedItems = useMemo(() => [...items].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]), [items]);

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

  const onItemDelete = useCallback(
    (id: string) => {
      db.runSync(`DELETE FROM events WHERE id = ?`, [id]);
    },
    [db],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={styles.dateSwitcher}>
          <Pressable onPress={goToPrevDay} hitSlop={8}>
            <LiquidGlassView interactive effect="regular" style={styles.dateSwitcherChevron}>
              <IconSymbol
                name="chevron.right"
                size={18}
                color={Colors[theme].baseContent}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </LiquidGlassView>
          </Pressable>
          <LiquidGlassView interactive effect="regular" style={styles.dateSwitcherLabelContainer}>
            <ThemedText style={styles.dateSwitcherLabel}>{dateLabel}</ThemedText>
          </LiquidGlassView>
          <Pressable onPress={goToNextDay} hitSlop={8}>
            <LiquidGlassView interactive effect="regular" style={styles.dateSwitcherChevron}>
              <IconSymbol name="chevron.right" size={18} color={Colors[theme].baseContent} />
            </LiquidGlassView>
          </Pressable>
        </ThemedView>
        <ScrollView>
          {sortedItems.map((item, index) => (
            <Animated.View key={item.id} layout={LinearTransition}>
              {index > 0 && <ThemedView style={[styles.separator, { backgroundColor: Colors[theme].base500 }]} />}
              <EventItemView
                item={item}
                dateTs={dateTs}
                onItemCheckboxClicked={() => onItemCheckboxClicked(item.id)}
                onDelete={() => onItemDelete(item.id)}
              />
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
  dateTs: number;
  onItemCheckboxClicked: () => void;
  onDelete: () => void;
}

export function EventItemView({ item, dateTs, onItemCheckboxClicked, onDelete }: EventItemViewProps) {
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  return (
    <Pressable
      style={styles.item}
      onPress={() => router.push(`/action?event_id=${item.id}&date=${dateTs}`)}
    >
      <CircleCheckbox
        value={item.status === 'done'}
        onValueChange={onItemCheckboxClicked}
        color={Colors[theme].primary}
      />
      <ThemedView style={styles.item_innerTextView}>
        <ThemedText style={{ fontSize: 18, color: Colors[theme].baseContent }}>{item.title}</ThemedText>
        <ThemedView style={styles.item_secondLine_View}>
          {item.priority === 'high' && (
            <ThemedText style={{ fontSize: 13, color: Colors[theme].error }}>★ High Priority</ThemedText>
          )}
          <ThemedText style={{ fontSize: 13, color: Colors[theme].secondary }}>
            ⧗ {formatSchedule(item.schedule)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Pressable hitSlop={8}>
            <IconSymbol name="ellipsis" size={20} color={Colors[theme].secondary} />
          </Pressable>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item key="edit" onSelect={() => router.push(`/event?id=${item.id}`)}>
            <DropdownMenu.ItemTitle>Edit</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key="delete" onSelect={onDelete} destructive>
            <DropdownMenu.ItemTitle>Delete</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Pressable>
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
  dateSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateSwitcherChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSwitcherLabelContainer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  dateSwitcherLabel: {
    fontSize: 16,
    fontWeight: '600',
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
