import { Colors } from '@/constants/theme';
import { EventFormInput, EventItem } from '@/schemas/event';
import { StyleSheet, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface DefaultProp {
  input: EventFormInput;
  handleChange: <K extends keyof EventItem>(field: K, value?: EventItem[K]) => void;
}

export default function Description({ input, handleChange }: DefaultProp) {
  const theme = useColorScheme() ?? 'light';

  return (
    <TextInput
      value={input.description}
      multiline
      placeholder="Task description"
      style={[styles.description, { color: Colors[theme].baseContent, backgroundColor: Colors[theme].base300 }]}
      onChangeText={(text) => handleChange('description', text)}
    />
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 16,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 100,
    borderRadius: 12,
  },
});
