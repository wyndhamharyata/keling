import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { EventFormInput, EventItem } from '@/schemas/event';
import { Platform, TextInput, StyleSheet, useColorScheme } from 'react-native';

export interface ScheduleProps {
  input: EventFormInput;
  error: string | undefined;
  handleChange: <K extends keyof EventItem>(field: K, value?: EventItem[K]) => void;
}
export default function Schedule({ input, error, handleChange }: ScheduleProps) {
  const theme = useColorScheme() ?? 'light';
  return (
    <ThemedView>
      <ThemedText style={{ marginHorizontal: 6, fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>SCHEDULE</ThemedText>
      <TextInput
        value={input.schedule}
        placeholder="Task schedule"
        style={[
          styles.schedule,
          {
            color: error ? Colors[theme].error : Colors[theme].baseContent,
            borderColor: error ? Colors[theme].error : Colors[theme].base100,
            backgroundColor: Colors[theme].base300,
            borderWidth: 2,
          },
        ]}
        onChangeText={(text) => handleChange('schedule', text)}
      />
      {error && (
        <ThemedText
          style={{
            marginHorizontal: 6,
            visibility: error ? 'visible' : 'invisible',
            fontSize: 12,
            color: Colors[theme].error,
          }}
        >
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  schedule: {
    fontSize: 30,
    letterSpacing: 8,
    paddingVertical: 20,
    borderRadius: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
