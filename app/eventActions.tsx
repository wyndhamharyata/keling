import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

export default function EventActionsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const { id } = useLocalSearchParams<{ id: string }>();

  const onEdit = () => {
    router.back();
    router.push(`/event?id=${id}`);
  };

  const onDelete = () => {
    db.runSync(`DELETE FROM events WHERE id = ?`, [id]);
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[theme].base100 }]}>
      <Pressable style={styles.item} onPress={onEdit}>
        <ThemedText style={{ fontSize: 18, color: Colors[theme].baseContent }}>Edit</ThemedText>
      </Pressable>
      <Pressable style={styles.item} onPress={onDelete}>
        <ThemedText style={{ fontSize: 18, color: Colors[theme].error }}>Delete</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  item: {
    paddingVertical: 15,
  },
});
