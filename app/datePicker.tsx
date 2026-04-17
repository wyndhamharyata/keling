import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { DatePicker } from '@s77rt/react-native-date-picker';

export default function DatePickerScreen() {
  const { dateUnix } = useLocalSearchParams<{ dateUnix?: string }>();
  const router = useRouter();
  const date = !!dateUnix ? new Date(parseInt(dateUnix)) : new Date();

  const setDate = (value: Date | null) => {
    if (!value) return

  };

  return (
    <>
      <DatePicker type="date" value={date} onChange={setDate} inline />
    </>
  );
}
