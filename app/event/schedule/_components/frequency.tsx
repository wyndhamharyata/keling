import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type DatePickerType = 'None' | 'Week' | 'Date' | 'Month';

export interface FrequencyProps {
  pickerType: DatePickerType;
  onSetSchedule: (schedule: string) => void;
  onPickerChange: (picker: DatePickerType) => void;
}

export default function Frequency({ pickerType, onSetSchedule, onPickerChange }: FrequencyProps) {
  const theme = useColorScheme() ?? 'light';
  const [freq, setFreq] = useState<
    { label: string; selected: boolean; schedule: string; pickerType: DatePickerType }[]
  >([
    { label: 'Once', selected: false, schedule: '* * * * *', pickerType: 'None' },
    { label: 'Daily', selected: false, schedule: '0 9 * * *  ', pickerType: 'None' },
    { label: 'Weekdays', selected: false, schedule: '0 9 * * 1-5', pickerType: 'Week' },
    { label: 'Weekly', selected: pickerType === 'Week', schedule: '0 9 * * 1', pickerType: 'Week' },
    { label: 'Monthly', selected: pickerType === 'Date', schedule: '0 9 1 * *', pickerType: 'Date' },
    { label: 'Yearly', selected: pickerType === 'Month', schedule: '0 9 1 1 *', pickerType: 'Month' },
  ]);

  return (
    <>
      <ThemedText style={{ marginHorizontal: 6, fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>
        FREQUENCY
      </ThemedText>
      <ThemedView style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 10 }}>
        {freq.map((f, index) => (
          <Pressable
            key={`frequency-index-${index}`}
            onPress={() => {
              setFreq((prev) => prev.map((v, i) => ({ ...v, selected: i === index })));
              if (f.schedule) {
                onSetSchedule(f.schedule);
                onPickerChange(f.pickerType);
              }
            }}
          >
            <LiquidGlassView
              tintColor={f.selected ? Colors[theme].baseContent : Colors[theme].base300}
              style={{ paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10 }}
              interactive={true}
            >
              <ThemedText
                style={{ color: f.selected ? Colors[theme].base100 : Colors[theme].baseContent, margin: 'auto' }}
              >
                {f.label}
              </ThemedText>
            </LiquidGlassView>
          </Pressable>
        ))}
      </ThemedView>
    </>
  );
}
