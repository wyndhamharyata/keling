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

  const { activeColor, inactiveColor, activeContent, inactiveContent } = useMemo(
    () => ({
      activeColor: Colors[theme].primary,
      inactiveColor: Colors[theme].base100,
      activeContent: Colors[theme].primaryContent,
      inactiveContent: Colors[theme].baseContent,
    }),
    [theme],
  );

  return (
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
          tintColor={input.priority === 'low' ? activeColor : inactiveColor}
          style={{ flex: 1, borderRadius: 20 }}
          interactive={true}
        >
          <ThemedText style={{ color: input.priority === 'low' ? activeContent : inactiveContent, margin: 'auto' }}>
            Low
          </ThemedText>
        </LiquidGlassView>
      </Pressable>

      <Pressable style={{ flex: 1, flexBasis: 0 }} onPress={() => handleChange('priority', 'medium')}>
        <LiquidGlassView
          tintColor={input.priority === 'medium' ? Colors[theme].primary : Colors[theme].base100}
          style={{ flex: 1, borderRadius: 20 }}
          interactive={true}
        >
          <ThemedText style={{ color: input.priority === 'medium' ? activeContent : inactiveContent, margin: 'auto' }}>
            Medium
          </ThemedText>
        </LiquidGlassView>
      </Pressable>

      <Pressable style={{ flex: 1, flexBasis: 0 }} onPress={() => handleChange('priority', 'high')}>
        <LiquidGlassView
          tintColor={input.priority === 'high' ? Colors[theme].primary : Colors[theme].base100}
          style={{ flex: 1, borderRadius: 20 }}
          interactive={true}
        >
          <ThemedText style={{ color: input.priority === 'high' ? activeContent : inactiveContent, margin: 'auto' }}>
            High
          </ThemedText>
        </LiquidGlassView>
      </Pressable>
    </View>
  );
}
