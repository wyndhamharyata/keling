import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { formatSchedule } from './scheduleParser';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { CircleCheckbox } from '@/components/ui/circle-checkbox';
import { EventItem } from '@/schemas/event';

export interface EventItemViewProps {
  item: EventItem;
  dateTs: number;
  onItemCheckboxClicked: () => void;
  onDelete: () => void;
}

export default function EventItemView({ item, dateTs, onItemCheckboxClicked, onDelete }: EventItemViewProps) {
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  return (
    <Pressable
      style={styles.item}
      onPress={() =>
        !!item.subtasks && item.subtasks.length > 0 ? router.push(`/action?event_id=${item.id}&date=${dateTs}`) : onItemCheckboxClicked()
      }
    >
      <CircleCheckbox
        value={item.status === 'done'}
        onValueChange={onItemCheckboxClicked}
        color={Colors[theme].primary}
      />
      <ThemedView style={styles.item_innerTextView}>
        <ThemedText style={{ fontSize: 18, color: Colors[theme].baseContent }}>{item.title}</ThemedText>
        <ThemedView style={styles.item_secondLine_View}>
          {item.priority === 'high' && (
            <ThemedText style={{ fontSize: 13, color: Colors[theme].error }}>★ High Priority</ThemedText>
          )}
          <ThemedText style={{ fontSize: 13, color: Colors[theme].secondary }}>
            ⧗ {formatSchedule(item.schedule)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Pressable hitSlop={8}>
            <IconSymbol name="ellipsis" size={20} color={Colors[theme].secondary} />
          </Pressable>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item key="edit" onSelect={() => router.push(`/event?id=${item.id}`)}>
            <DropdownMenu.ItemTitle>Edit</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item key="delete" onSelect={onDelete} destructive>
            <DropdownMenu.ItemTitle>Delete</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
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
});
