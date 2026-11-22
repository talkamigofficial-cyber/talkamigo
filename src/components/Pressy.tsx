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
import { Animated, Platform, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scale?: number;
  haptic?: boolean;
  /** grey highlight instead of shrinking (for list rows) */
  highlight?: string;
};

/**
 * Style keys that place the button among its neighbours (flex: 1 in a row, margins, absolute position, width).
 * They must sit on the outer tappable area, otherwise a row of buttons with flex: 1 collapses.
 * Everything else (colours, padding, corners, height) stays on the inner box that shrinks when pressed.
 */
const OUTER_KEYS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'position', 'top', 'bottom', 'left', 'right', 'start', 'end',
  'zIndex', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'aspectRatio', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'marginStart', 'marginEnd', 'marginHorizontal', 'marginVertical',
]);

function splitStyle(style: StyleProp<ViewStyle>) {
  const all = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(all)) (OUTER_KEYS.has(k) ? outer : inner)[k] = v;
  // the inner box fills the outer area (Pressable stretches it across; flexGrow fills the height)
  if (outer.flex != null || outer.flexGrow != null || outer.height != null || outer.aspectRatio != null || outer.alignSelf === 'stretch') inner.flexGrow = 1;
  return { outer: outer as ViewStyle, inner: inner as ViewStyle };
}

export function Pressy({ style, scale = 0.94, haptic = true, highlight, onPressIn, onPressOut, onPress, disabled, children, ...rest }: Props) {
  const v = useRef(new Animated.Value(1)).current;
  const to = (value: number, ms: number) => Animated.timing(v, { toValue: value, duration: ms, useNativeDriver: Platform.OS !== 'web' }).start();

  const { outer, inner } = splitStyle(style);

  return (
    <Pressable
      {...rest}
      style={outer}
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
        <Animated.View style={[inner, { transform: [{ scale: v }] }, highlight && pressed ? { backgroundColor: highlight } : null]}>
          {typeof children === 'function' ? children({ pressed } as any) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
