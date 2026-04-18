import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface PickerYearProps {
  schedule: string | null;
  onSetSchedule: (schedule: string | null) => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function replaceCronMonths(months: string[], cron: string | null): string | null {
  if (!cron) return cron;
  const parts = cron.split(' ');
  if (parts.length < 5) return cron;
  const nums = months.map((m) => MONTHS.indexOf(m) + 1).filter((n) => n >= 1 && n <= 12);
  if (nums.length === 0 || nums.length === 12) {
    parts[3] = '*';
  } else {
    const sorted = [...new Set(nums)].sort((a, b) => a - b);
    const isSequential = sorted.length >= 2 && sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
    parts[3] = isSequential ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(',');
  }
  return parts.join(' ');
}

function extractMonthsFromCron(cron: string | null): string[] {
  if (!cron) return [];
  const parts = cron.split(' ');
  if (parts.length < 5) return [];
  const mon = parts[3];
  if (mon === '*') return [...MONTHS];
  if (mon.includes('-')) {
    const [start, end] = mon.split('-').map(Number);
    const out: string[] = [];
    for (let i = start; i <= end; i++) if (MONTHS[i - 1]) out.push(MONTHS[i - 1]);
    return out;
  }
  if (mon.includes(',')) {
    return mon
      .split(',')
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12)
      .sort((a, b) => a - b)
      .map((n) => MONTHS[n - 1]);
  }
  const n = Number(mon);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return [MONTHS[n - 1]];
  return [];
}

export default function PickerYear({ schedule, onSetSchedule }: PickerYearProps) {
  const theme = useColorScheme() ?? 'light';
  const selectedMonths = extractMonthsFromCron(schedule);

  return (
    <>
      <ThemedText style={{ marginHorizontal: 6, fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>
        MONTHS
      </ThemedText>
      <ThemedView style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 10 }}>
        {MONTHS.map((m, index) => (
          <Pressable
            key={`frequency-index-${index}`}
            onPress={() => {
              const next = selectedMonths.includes(m) ? selectedMonths.filter((d) => d !== m) : [...selectedMonths, m];
              onSetSchedule(replaceCronMonths(next, schedule));
            }}
            style={{ width: '22%' }}
          >
            <LiquidGlassView
              tintColor={new Set(selectedMonths).has(m) ? Colors[theme].baseContent : Colors[theme].base300}
              style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}
              interactive={true}
            >
              <ThemedText
                style={{
                  color: new Set(selectedMonths).has(m) ? Colors[theme].base100 : Colors[theme].baseContent,
                  margin: 'auto',
                  fontSize: 14,
                }}
              >
                {m}
              </ThemedText>
            </LiquidGlassView>
          </Pressable>
        ))}
      </ThemedView>
    </>
  );
}
