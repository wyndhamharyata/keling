import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Fragment, useCallback, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CircleCheckbox } from '@/components/ui/circle-checkbox';
import { Colors } from '@/constants/theme';
import { getFirstSync } from '@/db/queries';
import { EventItem } from '@/schemas/event';

type Subtask = { label: string; isDone: boolean };

export default function ActionScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const { event_id, date } = useLocalSearchParams<{ event_id: string; date: string }>();
  const dateTs = Number(date);

  const [event, setEvent] = useState(() =>
    getFirstSync<EventItem>(db, `SELECT * FROM events WHERE id = ?`, [event_id], ['subtasks']),
  );

  const [subtasks, setSubtasks] = useState<Subtask[]>(() => {
    const action = getFirstSync<{ subtasks: Subtask[] }>(
      db,
      `SELECT CASE WHEN a.subtasks != '[]' THEN a.subtasks ELSE e.subtasks END AS subtasks FROM actions AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.event_id = ? AND a.date = ?`,
      [event_id, dateTs],
      ['subtasks'],
    );
    return action?.subtasks ?? event?.subtasks ?? [];
  });

  const toggleSubtask = useCallback(
    (index: number) => {
      const updated = subtasks.map((s, i) => (i === index ? { ...s, isDone: !s.isDone } : s));

      const hasFinishedAllTasks = !updated.some((i) => !i.isDone);
      const status = hasFinishedAllTasks ? 'done' : (event?.status ?? 'todo');
      console.log('*** Has finished All Tasks', hasFinishedAllTasks, '*** Status', status);

      setSubtasks(updated);
      db.runSync(
        `INSERT INTO actions (id, event_id, date, status, subtasks) VALUES (?, ?, ?, ?, ?) ON CONFLICT(event_id, date) DO UPDATE SET subtasks = excluded.subtasks, status = excluded.status`,
        [Crypto.randomUUID(), event_id, dateTs, status, JSON.stringify(updated)],
      );
    },
    [subtasks, event_id, dateTs, event?.status, db],
  );

  if (!event) {
    router.back();
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: event.title,
          headerTitleStyle: { color: Colors[theme].baseContent },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors[theme].base100 },
        }}
      />

      {subtasks.length === 0 ? (
        <ThemedText style={{ color: Colors[theme].secondary, textAlign: 'center', marginTop: 20 }}>
          No subtasks
        </ThemedText>
      ) : (
        <ThemedView style={{ gap: 0 }}>
          {subtasks.map((s, index) => (
            <Fragment key={`subtask-${index}`}>
              {index > 0 && (
                <ThemedView style={{ backgroundColor: Colors[theme].base500, height: StyleSheet.hairlineWidth }} />
              )}
              <Pressable style={styles.item} onPress={() => toggleSubtask(index)}>
                <CircleCheckbox
                  value={s.isDone}
                  onValueChange={() => toggleSubtask(index)}
                  color={Colors[theme].primary}
                />
                <ThemedText
                  style={{
                    fontSize: 18,
                    color: s.isDone ? Colors[theme].secondary : Colors[theme].baseContent,
                    textDecorationLine: s.isDone ? 'line-through' : 'none',
                  }}
                >
                  {s.label}
                </ThemedText>
              </Pressable>
            </Fragment>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 15,
  },
});
