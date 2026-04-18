import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Frequency, { DatePickerType } from './_schedule/frequency';
import Time from './_schedule/time';
import PickerWeek from './_schedule/picker/week';
import PickerMonth from './_schedule/picker/month';
import { useLocalSearchParams } from 'expo-router';

function detectPickerType(cron: string | null): DatePickerType {
  if (!cron) return 'None';
  const parts = cron.split(' ').filter(Boolean);
  if (parts.length < 5) return 'None';
  const [, , dom, , dow] = parts;
  if (dow !== '*') return 'Week';
  if (dom !== '*') return 'Date';
  return 'None';
}

export default function Schedule() {
  const theme = useColorScheme() ?? 'light';

  const { cron } = useLocalSearchParams<{ cron?: string }>();
  const [schedule, setSchedule] = useState<string | null>(cron ?? null);
  const [pickerType, setPickerType] = useState<DatePickerType>(detectPickerType(cron ?? null));

  return (
    <KeyboardAwareScrollView
      style={{ height: '100%' }}
      contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 24, gap: 10 }}
    >
      <Frequency onSetSchedule={setSchedule} onPickerChange={setPickerType} pickerType={pickerType} />
      <ThemedView style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }} />
      <Time onSetSchedule={setSchedule} schedule={schedule} />
      <ThemedView style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }} />
      {(() => {
        switch (pickerType) {
          case 'Week':
            return <PickerWeek schedule={schedule} onSetSchedule={setSchedule} />;
          case 'Date':
            return <PickerMonth schedule={schedule} onSetSchedule={setSchedule} />;
          default:
            return null;
        }
      })()}
      {pickerType !== 'None' && (
        <ThemedView
          style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }}
        />
      )}
      <ThemedText>{schedule}</ThemedText>
      <ThemedText>{pickerType}</ThemedText>
    </KeyboardAwareScrollView>
  );
}
