import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface CircleCheckboxProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  color?: string;
  size?: number;
}

export function CircleCheckbox({
  value,
  onValueChange,
  color = '#888',
  size = 24,
}: CircleCheckboxProps) {
  const borderWidth = 2;
  const iconSize = size - borderWidth * 4;

  return (
    <Pressable onPress={() => onValueChange?.(!value)}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            backgroundColor: value ? color : 'transparent',
          },
        ]}>
        {value && <Ionicons name="checkmark" size={iconSize} color="#fff" />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
