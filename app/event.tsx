import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { EMPTY_EVENT_ITEM, EventFormInput, EventItem, EventSchema } from '@/schemas/event';
import * as v from 'valibot';

type EventFormError = Partial<Record<keyof EventItem, string>>;

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const isEditing = !!id;
  const record = id ? db.getFirstSync<EventItem>('SELECT * FROM events WHERE id = ?', id) : null;

  const [input, setInput] = useState<EventFormInput>(
    record ? { ...EMPTY_EVENT_ITEM, ...record } : EMPTY_EVENT_ITEM,
  );
  const [output, setOutput] = useState<EventItem | null>(record);
  const [errors, setErrors] = useState<EventFormError>({});

  const handleChange = <K extends keyof EventItem>(field: K, value: EventItem[K]) => {
    const next = { ...input, [field]: value };
    setInput(next);

    const result = v.safeParse(EventSchema, next);
    if (result.success) {
      setOutput(result.output);
      setErrors({});
      return;
    }

    setOutput(null);

    const flatErrors = v.flatten(result.issues);
    const newError: EventFormError = {};
    if (flatErrors.nested) {
      for (const key of Object.keys(flatErrors.nested) as (keyof EventItem)[]) {
        const msgs = flatErrors.nested[key];
        if (msgs) newError[key] = msgs[0];
      }
    }

    setErrors(newError);
  };

  const handleSave = async () => {
    if (!output) return;
    await db.runAsync(
      `INSERT INTO events (id, title, description, priority, labels, schedule, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        output.title,
        output.description,
        output.priority,
        output.labels.join(','),
        output.schedule,
        output.status,
      ],
    );

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
        }}
      />
      <ThemedText type="title">{isEditing ? 'Edit Event' : 'New Event'}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
