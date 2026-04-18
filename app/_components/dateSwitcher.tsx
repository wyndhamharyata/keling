import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface DateSwitcherProps {
  date: Date;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  showPicker: () => void;
}

export default function DateSwitcher({ date, goToPrevDay, goToNextDay, showPicker }: DateSwitcherProps) {
  const theme = useColorScheme() ?? 'light';

  const isToday =
    date.getDate() === new Date().getDate() &&
    date.getMonth() === new Date().getMonth() &&
    date.getFullYear() === new Date().getFullYear();

  const dateLabel =
    date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    (isToday ? ' (Today)' : '');
  return (
    <ThemedView style={styles.dateSwitcher}>
      <Pressable onPress={goToPrevDay} hitSlop={8}>
        <LiquidGlassView interactive effect="regular" style={styles.dateSwitcherChevron}>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={Colors[theme].baseContent}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </LiquidGlassView>
      </Pressable>
      <Pressable onPress={showPicker}>
        <LiquidGlassView interactive effect="regular" style={styles.dateSwitcherLabelContainer}>
          <ThemedText style={styles.dateSwitcherLabel}>{dateLabel}</ThemedText>
        </LiquidGlassView>
      </Pressable>
      <Pressable onPress={goToNextDay} hitSlop={8}>
        <LiquidGlassView interactive effect="regular" style={styles.dateSwitcherChevron}>
          <IconSymbol name="chevron.right" size={18} color={Colors[theme].baseContent} />
        </LiquidGlassView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  dateSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateSwitcherChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSwitcherLabelContainer: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  dateSwitcherLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
