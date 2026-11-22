/**
 * A tappable area that reacts to the finger like the prototype (v47/v48):
 * it dips slightly while pressed and springs back, with a light tap vibration.
 * Use it instead of Pressable/TouchableOpacity everywhere so the whole app feels the same.
 *
 *   <Pressy onPress={…} scale={0.94}>…</Pressy>
 *
 * scale: 0.94 normal buttons · 0.955 big buttons · 0.9 round icon buttons · 0.98 cards · 1 = no shrink (list rows)
 */
import { useRef } from 'react';
import { Animated, Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scale?: number;
  haptic?: boolean;
  /** grey highlight instead of shrinking (for list rows) */
  highlight?: string;
};

export function Pressy({ style, scale = 0.94, haptic = true, highlight, onPressIn, onPressOut, onPress, disabled, children, ...rest }: Props) {
  const v = useRef(new Animated.Value(1)).current;
  const to = (value: number, ms: number) => Animated.timing(v, { toValue: value, duration: ms, useNativeDriver: Platform.OS !== 'web' }).start();

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => { if (!highlight) to(scale, 70); onPressIn?.(e); }}
      onPressOut={(e) => { if (!highlight) Animated.spring(v, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 40, bounciness: 6 }).start(); onPressOut?.(e); }}
      onPress={(e) => {
        if (haptic && Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      accessibilityState={{ disabled: !!disabled, ...rest.accessibilityState }}
      // the extra invisible tap area keeps small text buttons easy to hit (v105)
      hitSlop={rest.hitSlop ?? 6}
    >
      {({ pressed }) => (
        <Animated.View style={[style, { transform: [{ scale: v }] }, highlight && pressed ? { backgroundColor: highlight } : null]}>
          {typeof children === 'function' ? children({ pressed } as any) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
