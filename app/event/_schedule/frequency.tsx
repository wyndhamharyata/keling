import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { useState } from 'react';
import { Pressable, useColorScheme } from 'react-native';

export interface FrequencyProps {
  onSetSchedule: (schedule: string) => void;
}

export default function Frequency({ onSetSchedule }: FrequencyProps) {
  const theme = useColorScheme() ?? 'light';
  const [freq, setFreq] = useState([
    { label: 'Once', selected: false },
    { label: 'Daily', selected: false, schedule: '0 9 * * *  ' },
    { label: 'Weekdays', selected: false, schedule: '0 9 * * 1-5' },
    { label: 'Weekly', selected: false, schedule: '0 9 * * 1' },
    { label: 'Monthly', selected: false, schedule: '0 9 1 * *' },
    { label: 'Yearly', selected: false, schedule: '0 9 1 1 *' },
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
              if (f.schedule) onSetSchedule(f.schedule);
            }}
          >
            <LiquidGlassView
              tintColor={f.selected ? Colors[theme].baseContent : Colors[theme].base300}
              style={{ paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10 }}
              interactive={true}
            >
              <ThemedText
                style={{ color: f.selected ? Colors[theme].base300 : Colors[theme].baseContent, margin: 'auto' }}
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
