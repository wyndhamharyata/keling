import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { useEffect, useState } from 'react';
import { Platform, Pressable, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface TimeProps {
  schedule: string | null;
  onSetSchedule: (schedule: string | null) => void;
}

export default function Time({ schedule, onSetSchedule }: TimeProps) {
  const [time, setTime] = useState(extractTimeFromCron(schedule) ?? '09:30');
  const theme = useColorScheme() ?? 'light';
  const timePresets = ['06:00', '08:00', '09:30', '12:00', '17:00', '18:00', '21:00'];

  useEffect(() => {
    const extracted = extractTimeFromCron(schedule);
    if (extracted) setTime((prev) => (extracted !== prev ? extracted : prev));
  }, [schedule]);

  function formatTime(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  const onTimeChange = (time: string) => {
    const temp = formatTime(time);
    setTime(temp);
    onSetSchedule(replaceCronTime(temp, schedule));
  };

  function replaceCronTime(time: string, cron: string | null): string | null {
    if (!cron) return cron;
    const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!match) return cron;
    const [, hh, mm] = match;
    const parts = cron.split(' ');
    if (parts.length < 5) return null;
    parts[0] = String(Number(mm));
    parts[1] = String(Number(hh));
    return parts.join(' ');
  }

  function extractTimeFromCron(cron: string | null): string | null {
    if (!cron) return null;
    const parts = cron.split(' ');
    if (parts.length < 5) return null;
    const mm = Number(parts[0]);
    const hh = Number(parts[1]);
    if (!Number.isInteger(mm) || !Number.isInteger(hh)) return null;
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  return (
    <>
      <ThemedText style={{ marginHorizontal: 6, fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>
        TIME
      </ThemedText>
      <ThemedView
        style={{
          backgroundColor: Colors[theme].accentSoft,
          borderRadius: 16,
          paddingVertical: 14,
        }}
      >
        <TextInput
          value={time}
          onChangeText={onTimeChange}
          keyboardType="number-pad"
          maxLength={5}
          inputMode="numeric"
          style={{
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 50,
            fontWeight: 'semibold',
            letterSpacing: 12,
            color: Colors[theme].accent,
            textAlign: 'center',
          }}
        />
      </ThemedView>

      <ThemedView style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 10 }}>
        {timePresets.map((f, index) => (
          <Pressable key={`frequency-index-${index}`} onPress={() => onTimeChange(f)}>
            <LiquidGlassView
              tintColor={Colors[theme].base100}
              style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}
              interactive={true}
            >
              <ThemedText style={{ color: Colors[theme].baseContent, margin: 'auto', fontSize: 14 }}>{f}</ThemedText>
            </LiquidGlassView>
          </Pressable>
        ))}
      </ThemedView>
    </>
  );
}
