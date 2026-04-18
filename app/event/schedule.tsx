import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import Frequency from './_schedule/frequency';
import Time from './_schedule/time';

export default function Schedule() {
  const theme = useColorScheme() ?? 'light';

  const [schedule, setSchedule] = useState<string | null>(null);

  return (
    <ThemedView style={{ paddingVertical: 20, paddingHorizontal: 24, gap: 10 }}>
      <Frequency onSetSchedule={setSchedule} />
      <ThemedView style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }} />
      <Time onSetSchedule={setSchedule} schedule={schedule} />
      <ThemedView style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }} />
      <ThemedText>{schedule}</ThemedText>
    </ThemedView>
  );
}
