import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface PickerMonthProps {
  schedule: string | null;
  onSetSchedule: (schedule: string | null) => void;
}
function replaceCronDays(days: string[], cron: string | null): string | null {
  if (!cron) return cron;
  const parts = cron.split(' ');
  if (parts.length < 5) return cron;
  const indices = days.map((d) => DAYS_OF_WEEK.indexOf(d)).filter((i) => i >= 0);
  if (indices.length === 0 || indices.length === 7) {
    parts[4] = '*';
  } else {
    const sorted = [...new Set(indices)].sort((a, b) => a - b);
    const isSequential = sorted.length >= 2 && sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
    parts[4] = isSequential ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(',');
  }
  return parts.join(' ');
}

function extractDaysFromCron(cron: string | null): string[] {
  if (!cron) return [];
  const parts = cron.split(' ');
  if (parts.length < 5) return [];
  const dow = parts[4];
  if (dow === '*') return [...DAYS_OF_WEEK];
  if (dow.includes('-')) {
    const [start, end] = dow.split('-').map(Number);
    const out: string[] = [];
    for (let i = start; i <= end; i++) if (DAYS_OF_WEEK[i]) out.push(DAYS_OF_WEEK[i]);
    return out;
  }
  if (dow.includes(',')) {
    return dow
      .split(',')
      .map(Number)
      .sort((a, b) => a - b)
      .map((i) => DAYS_OF_WEEK[i])
      .filter(Boolean);
  }
  const n = Number(dow);
  if (Number.isInteger(n) && n >= 0 && n <= 6) return [DAYS_OF_WEEK[n]];
  return [];
}

export default function PickerWeek({ schedule, onSetSchedule }: PickerMonthProps) {
  const theme = useColorScheme() ?? 'light';
  const selectedDates = extractDaysFromCron(schedule);

  return (
    <>
      <ThemedText style={{ marginHorizontal: 6, fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>
        DAYS OF WEEK
      </ThemedText>
      <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
        {DAYS_OF_WEEK.map((f, index) => (
          <Pressable
            key={`frequency-index-${index}`}
            onPress={() => {
              const next = selectedDates.includes(f) ? selectedDates.filter((d) => d !== f) : [...selectedDates, f];
              onSetSchedule(replaceCronDays(next, schedule));
            }}
            style={{ flex: 1 }}
          >
            <LiquidGlassView
              tintColor={new Set(selectedDates).has(f) ? Colors[theme].baseContent : Colors[theme].base100}
              style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}
              interactive={true}
            >
              <ThemedText
                style={{
                  color: new Set(selectedDates).has(f) ? Colors[theme].base100 : Colors[theme].baseContent,
                  margin: 'auto',
                  fontSize: 14,
                }}
              >
                {f[0]}
              </ThemedText>
            </LiquidGlassView>
          </Pressable>
        ))}
      </ThemedView>
    </>
  );
}
