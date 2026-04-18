import { useLocalSearchParams, useRouter } from 'expo-router';
import { DatePicker } from '@s77rt/react-native-date-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function DatePickerScreen() {
  const { dateUnix } = useLocalSearchParams<{ dateUnix?: string }>();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const date = !!dateUnix ? new Date(parseInt(dateUnix)) : new Date();

  const setDate = (value: Date | null) => {
    if (!value) return;
    router.back();
    router.replace(`/?dateUnix=${value.getTime()}`);
  };

  return (
    <>
      <DatePicker type="date" value={date} onChange={setDate} inline styles={{ accentColor: Colors[theme].primary }} />
    </>
  );
}
