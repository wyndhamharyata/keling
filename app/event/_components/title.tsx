import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { EventFormInput, EventItem } from '@/schemas/event';
import { TextInput, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface TitleProps {
  input: EventFormInput;
  error: string | undefined;
  handleChange: <K extends keyof EventItem>(field: K, value?: EventItem[K]) => void;
}
export default function Title({ input, error, handleChange }: TitleProps) {
  const theme = useColorScheme() ?? 'light';
  return (
    <ThemedView style={{ marginHorizontal: 6 }}>
      <TextInput
        value={input.title}
        style={[
          styles.title,
          {
            color: Colors[theme].baseContent,
            borderColor: error ? Colors[theme].error : Colors[theme].base100,
          },
        ]}
        placeholder="Task name"
        onChangeText={(text) => handleChange('title', text)}
      />
      {error && (
        <ThemedText style={{ visibility: error ? 'visible' : 'invisible', fontSize: 12, color: Colors[theme].error }}>
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
});
