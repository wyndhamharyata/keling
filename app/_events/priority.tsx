import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { EventFormInput, EventItem } from '@/schemas/event';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { useMemo } from 'react';
import { Pressable, useColorScheme, View } from 'react-native';

export interface PriorityProps {
  input: EventFormInput;
  error: string | undefined;
  handleChange: <K extends keyof EventItem>(field: K, value?: EventItem[K]) => void;
}
export default function Priority({ input, error, handleChange }: PriorityProps) {
  const theme = useColorScheme() ?? 'light';

  const getColors = (target: EventItem['priority']) => {
    if (target !== input.priority) {
      return { background: Colors[theme].base100, text: Colors[theme].baseContent };
    }

    if (target === 'low') return { background: Colors[theme].success, text: Colors[theme].successContent };
    if (target === 'medium') return { background: Colors[theme].warning, text: Colors[theme].warningContent };
    if (target === 'high') return { background: Colors[theme].error, text: Colors[theme].errorContent };
  };

  return (
    <View>
      <ThemedText style={{ marginHorizontal: 6, fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>
        PRIORITY
      </ThemedText>
      <View
        style={{
          backgroundColor: Colors[theme].base100,
          flexDirection: 'row',
          width: '100%',
          height: 60,
          alignItems: 'stretch',
          gap: 15,
          paddingVertical: 10,
          borderRadius: 30,
        }}
      >
        <Pressable style={{ flex: 1, flexBasis: 0 }} onPress={() => handleChange('priority', 'low')}>
          <LiquidGlassView
            tintColor={getColors('low')?.background}
            style={{ flex: 1, borderRadius: 20 }}
            interactive={true}
          >
            <ThemedText style={{ color: getColors('low')?.text, margin: 'auto' }}>Low</ThemedText>
          </LiquidGlassView>
        </Pressable>

        <Pressable style={{ flex: 1, flexBasis: 0 }} onPress={() => handleChange('priority', 'medium')}>
          <LiquidGlassView
            tintColor={getColors('medium')?.background}
            style={{ flex: 1, borderRadius: 20 }}
            interactive={true}
          >
            <ThemedText style={{ color: getColors('medium')?.text, margin: 'auto' }}>Medium</ThemedText>
          </LiquidGlassView>
        </Pressable>

        <Pressable style={{ flex: 1, flexBasis: 0 }} onPress={() => handleChange('priority', 'high')}>
          <LiquidGlassView
            tintColor={getColors('high')?.background}
            style={{ flex: 1, borderRadius: 20 }}
            interactive={true}
          >
            <ThemedText style={{ color: getColors('high')?.text, margin: 'auto' }}>High</ThemedText>
          </LiquidGlassView>
        </Pressable>
      </View>
    </View>
  );
}
