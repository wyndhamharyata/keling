import { useSQLiteContext } from 'expo-sqlite';
import { isAlarmEnabled, refreshAlarms, setEnableAlarm } from '../_shared/functions/alarm';
import { useState } from 'react';
import { stopAllAlarms } from 'react-native-nitro-ios-alarm-kit';
import { ThemedText } from '../_shared/components/themed-text';
import { Colors } from '../_shared/constants/theme';
import { useColorScheme } from '../_shared/hooks/use-color-scheme';
import { Switch } from 'react-native';
import { LiquidGlassView } from '@callstack/liquid-glass';

export default function AlarmToggle() {
  const theme = useColorScheme() ?? 'light';
  const db = useSQLiteContext();
  const [alarmToggle, setAlarmToggle] = useState(isAlarmEnabled(db));

  const toggleAlarm = async (enabled: boolean) => {
    setEnableAlarm(db, enabled);
    setAlarmToggle(enabled);
    if (enabled) {
      await refreshAlarms(db);
    } else {
      stopAllAlarms();
    }
  };

  return (
    <LiquidGlassView
      effect={'regular'}
      style={{ flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 30, borderRadius: 40 }}
    >
      <ThemedText style={{ flex: 1, fontWeight: '500' }}>Alarm Reminder</ThemedText>
      <Switch
        value={alarmToggle}
        onValueChange={toggleAlarm}
        trackColor={{ true: Colors[theme].primary, false: Colors[theme].base300 }}
      />
    </LiquidGlassView>
  );
}
