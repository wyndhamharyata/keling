import { ReactNode, useCallback, useLayoutEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DAY_MS = 86400000;
const COMMIT_RATIO = 0.25;
const VELOCITY_THRESHOLD = 500;
const COMMIT_DURATION = 200;

export interface DateSwipePagerProps {
  date: Date;
  onDateChange: (next: Date) => void;
  renderDay: (date: Date, width: number) => ReactNode;
}

export default function DateSwipePager({ date, onDateChange, renderDay }: DateSwipePagerProps) {
  const [width, setWidth] = useState(0);
  const tx = useSharedValue(0);
  const startX = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== width) setWidth(w);
  };

  useLayoutEffect(() => {
    if (width > 0) tx.value = -width;
  }, [date, width, tx]);

  const prevDate = new Date(date.getTime() - DAY_MS);
  const nextDate = new Date(date.getTime() + DAY_MS);

  const commit = useCallback(
    (dir: 'prev' | 'next') => {
      const next = new Date(date.getTime() + (dir === 'next' ? DAY_MS : -DAY_MS));
      onDateChange(next);
    },
    [date, onDateChange],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      startX.value = tx.value;
    })
    .onUpdate((e) => {
      tx.value = startX.value + e.translationX;
    })
    .onEnd((e) => {
      const shouldNext = e.translationX < -width * COMMIT_RATIO || e.velocityX < -VELOCITY_THRESHOLD;
      const shouldPrev = e.translationX > width * COMMIT_RATIO || e.velocityX > VELOCITY_THRESHOLD;
      if (shouldNext) {
        tx.value = withTiming(
          -2 * width,
          { duration: COMMIT_DURATION, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) scheduleOnRN(commit, 'next');
          },
        );
      } else if (shouldPrev) {
        tx.value = withTiming(0, { duration: COMMIT_DURATION, easing: Easing.out(Easing.cubic) }, (finished) => {
          if (finished) scheduleOnRN(commit, 'prev');
        });
      } else {
        tx.value = withSpring(-width, { damping: 20, stiffness: 180 });
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  return (
    <View style={styles.viewport} onLayout={onLayout}>
      {width > 0 && (
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.row, { width: 3 * width }, rowStyle]}>
            {renderDay(prevDate, width)}
            {renderDay(date, width)}
            {renderDay(nextDate, width)}
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});
