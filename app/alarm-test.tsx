import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  isAvailable,
  requestAlarmPermission,
  scheduleRelativeAlarm,
  scheduleTimer,
  type AlarmWeekday,
} from 'react-native-nitro-ios-alarm-kit';

type Status =
  | { kind: 'idle' }
  | { kind: 'unsupported' }
  | { kind: 'denied' }
  | { kind: 'error'; message: string }
  | { kind: 'scheduled'; alarmId: string; hour: number; minute: number }
  | { kind: 'timerScheduled'; alarmId: string; firesInSeconds: number };

const ALL_DAYS: AlarmWeekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export default function AlarmTestScreen() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [busy, setBusy] = useState(false);

  const guardSupportedAndAuthorized = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios' || !isAvailable()) {
      setStatus({ kind: 'unsupported' });
      return false;
    }
    const authorized = await requestAlarmPermission();
    if (!authorized) {
      setStatus({ kind: 'denied' });
      return false;
    }
    return true;
  };

  const onSchedulePress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await guardSupportedAndAuthorized())) return;

      const target = new Date(Date.now() + 60 * 1000);
      const hour = target.getHours();
      const minute = target.getMinutes();

      const alarmId = await scheduleRelativeAlarm(
        'Keling test',
        { text: 'Stop', textColor: '#FFFFFF', icon: 'checkmark.circle.fill' },
        '#FF9500',
        hour,
        minute,
        ALL_DAYS,
        { text: 'Snooze', textColor: '#FFFFFF', icon: 'moon.zzz.fill' },
        { postAlert: 540 },
      );

      if (!alarmId) {
        setStatus({ kind: 'error', message: 'scheduleRelativeAlarm returned null' });
        return;
      }

      setStatus({ kind: 'scheduled', alarmId, hour, minute });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  };

  const onTimerPress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await guardSupportedAndAuthorized())) return;

      const firesInSeconds = 60;
      const alarmId = await scheduleTimer(
        'Keling timer',
        { text: 'Stop', textColor: '#FFFFFF', icon: 'checkmark.circle.fill' },
        '#FF9500',
        firesInSeconds,
      );

      if (!alarmId) {
        setStatus({ kind: 'error', message: 'scheduleTimer returned null' });
        return;
      }

      setStatus({ kind: 'timerScheduled', alarmId, firesInSeconds });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ThemedText type="title">AlarmKit test</ThemedText>

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={onSchedulePress}
          disabled={busy}
        >
          <ThemedText style={styles.buttonText}>
            {busy ? 'Scheduling…' : 'Schedule daily alarm 1 minute from now'}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={onTimerPress}
          disabled={busy}
        >
          <ThemedText style={styles.buttonText}>
            {busy ? 'Scheduling…' : 'Schedule 60s timer (diagnostic)'}
          </ThemedText>
        </Pressable>

        <View style={styles.status}>
          <ThemedText type="defaultSemiBold">Status</ThemedText>
          <ThemedText>{renderStatus(status)}</ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function renderStatus(status: Status): string {
  switch (status.kind) {
    case 'idle':
      return 'idle — tap the button to schedule.';
    case 'unsupported':
      return 'AlarmKit is not available on this device (requires iOS 26+).';
    case 'denied':
      return 'Alarm permission denied.';
    case 'error':
      return `Error: ${status.message}`;
    case 'scheduled':
      return `Scheduled daily at ${pad(status.hour)}:${pad(status.minute)}\nid: ${status.alarmId}`;
    case 'timerScheduled':
      return `Timer scheduled, fires in ${status.firesInSeconds}s\nid: ${status.alarmId}`;
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  safe: {
    flex: 1,
    gap: 24,
  },
  button: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  status: {
    gap: 8,
  },
});
