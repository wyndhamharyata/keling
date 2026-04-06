import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CircleCheckbox } from '@/components/ui/circle-checkbox';
import { Colors } from '@/constants/theme';
import { EventFormInput, EventItem } from '@/schemas/event';
import { Fragment } from 'react';
import { Pressable, StyleSheet, TextInput, useColorScheme, View } from 'react-native';

export interface SubtaskProps {
  input: EventFormInput;
  error: string | undefined;
  handleChange: <K extends keyof EventItem>(field: K, value?: EventItem[K]) => void;
}

export default function Subtask({ input, handleChange }: SubtaskProps) {
  const theme = useColorScheme() ?? 'light';
  const subtasks = Array.isArray(input['subtasks']) ? input['subtasks'] : [];

  return (
    <ThemedView style={{ gap: 10, paddingHorizontal: 6 }}>
      <ThemedText style={{ fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>SUBTASKS</ThemedText>
      {subtasks.map((s, index) => (
        <Fragment key={`subtask-item-${index}`}>
          {index > 0 && (
            <ThemedView style={{ backgroundColor: Colors[theme].base500, height: StyleSheet.hairlineWidth }} />
          )}
          <SubtaskItem
            label={s.label}
            setSubtask={(text) => {
              const updated = input['subtasks']?.map((item, i) =>
                i === index ? { label: text, isDone: false } : item,
              );
              handleChange('subtasks', updated);
            }}
          />
        </Fragment>
      ))}
      <ThemedView style={{ backgroundColor: Colors[theme].base500, height: StyleSheet.hairlineWidth }} />
      <Pressable
        onPress={() => {
          const updated = [...(input['subtasks'] ?? []), { label: '', isDone: false }];
          handleChange('subtasks', updated);
        }}
      >
        <ThemedText style={{ color: Colors[theme].accent, fontWeight: 'bold' }}>+ Add Item</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function SubtaskItem({ label, setSubtask }: { label: string; setSubtask: (label: string) => void }) {
  const theme = useColorScheme() ?? 'light';
  return (
    <ThemedView style={[styles.item]}>
      <CircleCheckbox value={false} color={Colors[theme].primary} />
      <TextInput
        placeholder={'Add subtask name'}
        value={label}
        style={{ flex: 1, fontSize: 18, color: Colors[theme].baseContent }}
        onChangeText={(text) => setSubtask(text)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
});
