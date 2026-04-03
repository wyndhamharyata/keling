import { StyleSheet, useColorScheme, VirtualizedList } from 'react-native';
import { Checkbox } from 'expo-checkbox';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventList } from './_index/mocks';
import { EventItem } from './_index/types';
import { formatSchedule } from './_index/scheduleParser';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useColorScheme() ?? 'light';
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>
        <VirtualizedList
          initialNumToRender={4}
          renderItem={({ item }) => <EventItemView item={item} />}
          keyExtractor={(item: EventItem) => item.id}
          getItemCount={() => eventList.length}
          getItem={(_, index) => {
            return eventList[index];
          }}
          ItemSeparatorComponent={() => (
            <ThemedView style={[styles.separator, { backgroundColor: Colors[theme].base500 }]} />
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

export interface EventItemViewProps {
  item: EventItem;
}

export function EventItemView({ item }: EventItemViewProps) {
  const theme = useColorScheme() ?? 'light';
  return (
    <ThemedView style={styles.item}>
      <Checkbox
        style={styles.checkbox}
        value={true}
        onValueChange={() => {
          console.log('Checkbox clicked');
        }}
        color={Colors[theme].primary}
      />
      <ThemedView style={styles.item_innerTextView}>
        <ThemedText style={{ fontSize: 18, color: Colors[theme].baseContent }}>{item.title}</ThemedText>
        <ThemedView style={styles.item_secondLine_View}>
          {item.priority === 'high' && (
            <ThemedText style={{ fontSize: 12, color: Colors[theme].error }}>★ High Priority</ThemedText>
          )}
          <ThemedText style={{ fontSize: 12, color: Colors[theme].secondary }}>
            ⧗ {formatSchedule(item.schedule)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 15,
  },
  item_innerTextView: {
    flex: 1,
    flexDirection: 'column',
  },
  item_secondLine_View: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
  },
  checkbox: {
    marginRight: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 5
  },
});
