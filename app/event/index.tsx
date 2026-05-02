import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, DeviceEventEmitter, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { EMPTY_EVENT_ITEM, EventFormInput, EventItem, EventSchema } from '@/schemas/event';
import { getFirstSync } from '@/db/queries';
import * as v from 'valibot';
import * as Crypto from 'expo-crypto';
import Schedule from './_components/schedule';
import Title from './_components/title';
import Description from './_components/description';
import Priority from './_components/priority';
import Subtask from './_components/subtask';
import { SCHEDULE_SAVE_EVENT } from './schedule';
import TimeTable from '../_shared/components/time-table';

type EventFormError = Partial<Record<keyof EventItem, string>>;

export default function EventScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';

  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [record] = useState(() => {
    const row = id ? getFirstSync<EventItem>(db, `SELECT * FROM events WHERE id = ?`, [id], ['subtasks']) : null;
    if (row)
      row.labels =
        typeof row.labels === 'string' ? (row.labels as unknown as string).split(',').filter(Boolean) : row.labels;
    return row;
  });
  const [input, setInput] = useState<EventFormInput>(
    record ? { ...EMPTY_EVENT_ITEM, ...record } : { ...EMPTY_EVENT_ITEM, id: Crypto.randomUUID() },
  );
  const [output, setOutput] = useState<EventItem | null>(record);
  const [errors, setErrors] = useState<EventFormError>({});

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(SCHEDULE_SAVE_EVENT, (cron: string) => {
      handleChange('schedule', cron);
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleChange = <K extends keyof EventItem>(field: K, value?: EventItem[K]) => {
    const next = { ...input, [field]: value };
    setInput(next);

    const result = v.safeParse(EventSchema, next);

    if (result.success) {
      setOutput(result.output);
      setErrors({});
      return;
    }

    setOutput(null);
    setErrors(() => {
      const flat = v.flatten(result.issues);
      const newErrors: EventFormError = {};

      if (flat.nested) {
        for (const key of Object.keys(flat.nested) as (keyof EventItem)[]) {
          const msgs = flat.nested[key];
          if (msgs) newErrors[key] = msgs[0];
        }
      }

      return newErrors;
    });
  };

  const handleSave = async () => {
    if (!output) {
      return;
    }
    const values = [
      output.title,
      output.description,
      output.priority,
      output.labels.join(','),
      output.schedule,
      output.status,
      JSON.stringify(output.subtasks ?? []),
    ];

    const params = isEditing ? [...values, id] : [Crypto.randomUUID(), ...values];
    const query = isEditing
      ? `UPDATE events SET title = ?, description = ?, priority = ?, labels = ?, schedule = ?, status = ?, subtasks = ? WHERE id = ?`
      : `INSERT INTO events (id, title, description, priority, labels, schedule, status, subtasks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.runAsync(query, params);
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Event' : 'New Event',
          headerTitleStyle: { color: Colors[theme].baseContent },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors[theme].base100 },
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () => <Button title="Save" disabled={!output} onPress={handleSave} />,
        }}
      />

      <KeyboardAwareScrollView
        style={{ height: '100%' }}
        contentContainerStyle={{ gap: 10 }}
        bottomOffset={20}
        showsVerticalScrollIndicator={false}
      >
        <Title input={input} error={errors['title']} handleChange={handleChange} />
        <Pressable onPress={() => router.navigate(`/event/schedule?cron=${input?.schedule}`)}>
          <TimeTable schedule={input.schedule} clickable={true} />
        </Pressable>
        <Subtask input={input} error={undefined} handleChange={handleChange} />
        <Description input={input} handleChange={handleChange} />
        <Priority input={input} error={errors['priority']} handleChange={handleChange} />
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 10,
  },
});
