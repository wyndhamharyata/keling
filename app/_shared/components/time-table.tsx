import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/constants/theme';
import { Platform } from 'react-native';
import cronstrue from 'cronstrue';
import { IconSymbol } from './ui/icon-symbol.ios';

export default function TimeTable({ schedule, clickable = false }: { schedule: string | null; clickable?: boolean }) {
  const theme = useColorScheme() ?? 'light';

  return (
    <>
      <ThemedText style={{ marginHorizontal: 6, fontSize: 13, fontWeight: 'bold', color: Colors[theme].base600 }}>
        SCHEDULE
      </ThemedText>
      <ThemedView
        style={{
          padding: 20,
          backgroundColor: Colors[theme].primarySoft,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <ThemedView style={{ gap: 10, backgroundColor: Colors[theme].primarySoft, flex: 1 }}>
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: 'semibold',
              color: Colors[theme].primary,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            }}
          >{`"${cronstrue.toString(schedule!, { use24HourTimeFormat: true })}"`}</ThemedText>
          <ThemedText
            style={{
              color: Colors[theme].baseContent,
              fontSize: 14,
              fontWeight: 'thin',
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            }}
          >
            {schedule}
          </ThemedText>
        </ThemedView>
        {clickable && <IconSymbol name="chevron.right" size={18} color={Colors[theme].baseContent} />}
      </ThemedView>
    </>
  );
}
