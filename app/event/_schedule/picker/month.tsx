import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface PickerMonthProps {
  schedule: string | null;
  onSetSchedule: (schedule: string | null) => void;
}
const DAYS_OF_MONTH = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31',
];

function replaceCronDates(dates: string[], cron: string | null): string | null {
  if (!cron) return cron;
  const parts = cron.split(' ');
  if (parts.length < 5) return cron;
  const nums = dates.map((d) => Number(d)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 31);
  if (nums.length === 0 || nums.length === 31) {
    parts[2] = '*';
  } else {
    const sorted = [...new Set(nums)].sort((a, b) => a - b);
    const isSequential = sorted.length >= 2 && sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
    parts[2] = isSequential ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(',');
  }
  return parts.join(' ');
}

function extractDatesFromCron(cron: string | null): string[] {
  if (!cron) return [];
  const parts = cron.split(' ');
  if (parts.length < 5) return [];
  const dom = parts[2];
  if (dom === '*') return [...DAYS_OF_MONTH];
  if (dom.includes('-')) {
    const [start, end] = dom.split('-').map(Number);
    const out: string[] = [];
    for (let i = start; i <= end; i++) if (i >= 1 && i <= 31) out.push(String(i));
    return out;
  }
  if (dom.includes(',')) {
    return dom
      .split(',')
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 31)
      .sort((a, b) => a - b)
      .map((n) => String(n));
  }
  const n = Number(dom);
  if (Number.isInteger(n) && n >= 1 && n <= 31) return [String(n)];
  return [];
}

export default function PickerMonth({ schedule, onSetSchedule }: PickerMonthProps) {
  const theme = useColorScheme() ?? 'light';
  const selectedDates = extractDatesFromCron(schedule);

  return (
    <>
      <ThemedText style={{ marginHorizontal: 6, fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>
        DAYS OF WEEK
      </ThemedText>
      <ThemedView style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 15 }}>
        {DAYS_OF_MONTH.map((f, index) => (
          <Pressable
            key={`frequency-index-${index}`}
            onPress={() => {
              const next = selectedDates.includes(f) ? selectedDates.filter((d) => d !== f) : [...selectedDates, f];
              onSetSchedule(replaceCronDates(next, schedule));
            }}
            style={{}}
          >
            <LiquidGlassView
              tintColor={new Set(selectedDates).has(f) ? Colors[theme].baseContent : Colors[theme].base300}
              style={{ width: 35, height: 35, borderRadius: 17 }}
              interactive={true}
            >
              <ThemedText
                style={{
                  color: new Set(selectedDates).has(f) ? Colors[theme].base300 : Colors[theme].baseContent,
                  margin: 'auto',
                  fontSize: 14,
                }}
              >
                {f}
              </ThemedText>
            </LiquidGlassView>
          </Pressable>
        ))}
      </ThemedView>
    </>
  );
}
