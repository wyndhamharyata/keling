import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, TextInput, useColorScheme } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { EMPTY_EVENT_ITEM, EventFormInput, EventItem, EventSchema } from '@/schemas/event';
import * as v from 'valibot';
import * as Crypto from 'expo-crypto';
import { ThemedText } from '@/components/themed-text';

type EventFormError = Partial<Record<keyof EventItem, string>>;

export default function EventScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';

  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [record] = useState(id ? db.getFirstSync<EventItem>(`SELECT * FROM events WHERE id = ?`, id) : null);
  const [input, setInput] = useState<EventFormInput>(
    record ? { ...EMPTY_EVENT_ITEM, ...record } : { ...EMPTY_EVENT_ITEM, id: Crypto.randomUUID() },
  );
  const [output, setOutput] = useState<EventItem | null>(record);
  const [errors, setErrors] = useState<EventFormError>({});

  console.log('Errors: ', JSON.stringify(errors));
  console.log('Output', JSON.stringify(output));

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
      console.log('Output empty / invalid, skipping');
      return;
    }
    const values = [
      output.title,
      output.description,
      output.priority,
      output.labels.join(','),
      output.schedule,
      output.status,
    ];

    const params = isEditing ? [...values, id] : [Crypto.randomUUID(), ...values];
    const query = isEditing
      ? `UPDATE events SET title = ?, description = ?, priority = ?, labels = ?, schedule = ?, status = ? WHERE id = ?`
      : `INSERT INTO events (id, title, description, priority, labels, schedule, status VALUES (?, ?, ?, ?, ?, ?, ?)`;

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
      {/* Title Field*/}
      <ThemedView style={{ marginHorizontal: 6 }}>
        <TextInput
          value={input.title}
          style={[
            styles.title,
            {
              color: Colors[theme].baseContent,
              borderColor: errors['title'] ? Colors[theme].error : Colors[theme].baseContent,
            },
          ]}
          placeholder="Task name"
          onChangeText={(text) => handleChange('title', text)}
        />
        {errors['title'] && (
          <ThemedText style={{ fontSize: 12, color: Colors[theme].error }}>{errors['title']}</ThemedText>
        )}
      </ThemedView>

      <TextInput
        value={input.description}
        multiline
        placeholder="Task description"
        style={[styles.description, { color: Colors[theme].baseContent, backgroundColor: Colors[theme].base300 }]}
        onChangeText={(text) => handleChange('description', text)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingVertical: 8,
    borderBottomWidth: 3,
  },
  description: {
    fontSize: 16,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 100,
    borderRadius: 12,
  },
});
