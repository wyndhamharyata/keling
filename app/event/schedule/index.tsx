import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useLayoutEffect, useRef, useState } from 'react';
import { Button, DeviceEventEmitter, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Frequency, { DatePickerType } from './_components/frequency';
import Time from './_components/time';
import PickerWeek from './_components/picker/week';
import PickerMonth from './_components/picker/month';
import PickerYear from './_components/picker/year';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import TimeTable from '@/app/_shared/components/time-table';

export const SCHEDULE_SAVE_EVENT = 'event.schedule.save';

function detectPickerType(cron: string | null): DatePickerType {
  if (!cron) return 'None';
  const parts = cron.split(' ').filter(Boolean);
  if (parts.length < 5) return 'None';
  const [, , dom, mon, dow] = parts;
  if (dow !== '*') return 'Week';
  if (mon !== '*') return 'Month';
  if (dom !== '*') return 'Date';
  return 'None';
}

export default function Schedule() {
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  const navigation = useNavigation();

  const { cron } = useLocalSearchParams<{ cron?: string }>();
  const [schedule, setSchedule] = useState<string | null>(cron ?? null);
  const [pickerType, setPickerType] = useState<DatePickerType>(detectPickerType(cron ?? null));

  const handleSave = () => {
    DeviceEventEmitter.emit(SCHEDULE_SAVE_EVENT, schedule);
    router.back();
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Save" onPress={() => handleSaveRef.current()} />,
    });
  }, [navigation]);

  return (
    <KeyboardAwareScrollView
      style={{ height: '100%' }}
      contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 24, gap: 10 }}
      contentInsetAdjustmentBehavior="automatic"
      bottomOffset={20}
      showsVerticalScrollIndicator={false}
    >
      <Frequency onSetSchedule={setSchedule} onPickerChange={setPickerType} pickerType={pickerType} />
      <ThemedView style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }} />
      <TimeTable schedule={schedule} />
      <ThemedView style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }} />
      <Time onSetSchedule={setSchedule} schedule={schedule} />
      <ThemedView style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }} />
      {(() => {
        switch (pickerType) {
          case 'Week':
            return <PickerWeek schedule={schedule} onSetSchedule={setSchedule} />;
          case 'Date':
            return <PickerMonth schedule={schedule} onSetSchedule={setSchedule} />;
          case 'Month':
            return (
              <>
                <PickerYear schedule={schedule} onSetSchedule={setSchedule} />
                <ThemedView
                  style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }}
                />
                <PickerMonth schedule={schedule} onSetSchedule={setSchedule} />
              </>
            );
          default:
            return null;
        }
      })()}
      {pickerType !== 'None' && (
        <ThemedView
          style={{ backgroundColor: Colors[theme].base500, marginTop: 4, height: StyleSheet.hairlineWidth }}
        />
      )}
    </KeyboardAwareScrollView>
  );
}
