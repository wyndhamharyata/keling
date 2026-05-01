import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { migrateDatabase } from '@/db/migrations';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAlarmRefresher } from '@/hooks/use-alarm-refresher';
import { Colors } from '@/constants/theme';

function AlarmRefresher() {
  useAlarmRefresher();
  return null;
}

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  return (
    <Suspense
      fallback={
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <SQLiteProvider
        databaseName="keling.db"
        onInit={migrateDatabase}
        useSuspense
        options={{ enableChangeListener: true }}
      >
        <AlarmRefresher />
        <KeyboardProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="event" options={{ title: 'New Event' }} />
              <Stack.Screen
                name="action"
                options={{
                  contentStyle: { backgroundColor: Colors[theme].base100 },
                  presentation: 'formSheet',
                  title: 'Subtasks',
                  sheetAllowedDetents: [0.3, 0.5, 1.0],
                }}
              />
              <Stack.Screen
                name="eventActions"
                options={{
                  contentStyle: { backgroundColor: Colors[theme].base100 },
                  presentation: 'formSheet',
                  headerShown: false,
                  title: 'Actions',
                  sheetAllowedDetents: [0.15],
                }}
              />
              <Stack.Screen
                name="datePicker"
                options={{
                  contentStyle: { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#ffffff' },
                  presentation: 'formSheet',
                  title: 'DatePicker',
                  headerShown: false,
                  sheetAllowedDetents: [0.48],
                }}
              />
              <Stack.Screen
                name="event/schedule/index"
                options={{
                  contentStyle: { backgroundColor: Colors[theme].base100 },
                  presentation: 'formSheet',
                  title: 'Scheduler',
                  headerShown: true,
                  headerShadowVisible: false,
                  headerTitleStyle: { color: Colors[theme].baseContent },
                  headerStyle: { backgroundColor: Colors[theme].base100 },
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </KeyboardProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
