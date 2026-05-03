import { Pressable, StyleSheet, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { LiquidGlassView } from '@callstack/liquid-glass';
import DateSwitcher from './_components/dateSwitcher';
import AlarmToggle from './_components/alarmToggle';
import DateSwipePager from './_components/dateSwipePager';
import DayView from './_components/dayView';

export default function HomeScreen() {
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();

  const { dateUnix } = useLocalSearchParams<{ dateUnix?: string }>();
  const [date, setDate] = useState(!!dateUnix ? new Date(parseInt(dateUnix)) : new Date());

  const goToPrevDay = () => setDate((d) => new Date(d.getTime() - 86400000));
  const goToNextDay = () => setDate((d) => new Date(d.getTime() + 86400000));

  const showPicker = () => router.push(`/datePicker?dateUnix=${date.getTime()}`);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1, gap: 8 }}>
        <AlarmToggle />
        <DateSwipePager date={date} onDateChange={setDate} renderDay={(d, w) => <DayView date={d} width={w} />} />
        <DateSwitcher date={date} goToNextDay={goToNextDay} goToPrevDay={goToPrevDay} showPicker={showPicker} />
      </SafeAreaView>
      <Pressable style={styles.fabContainer} onPress={() => router.push('/event')}>
        <LiquidGlassView interactive style={styles.fab} effect={'regular'} tintColor={Colors[theme].primary}>
          <Text style={styles.fabText}>+</Text>
        </LiquidGlassView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
