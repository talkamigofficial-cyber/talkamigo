/**
 * A one-line title that slowly slides to show the rest when it doesn't fit, then slides back
 * (decided 1 Nov 2026: "Long titles slide"). Off when the phone has Reduce Motion: the title is then cut with "…".
 *
 *   <Marquee text={room.title} style={styles.title} />
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Text, View, type TextStyle, type StyleProp } from 'react-native';
import { useLang } from '../../i18n';

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

export function Marquee({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const rtl = useLang() === 'ar';
  const reduce = useReduceMotion();
  const [box, setBox] = useState(0);
  const [full, setFull] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const overflow = full - box;

  useEffect(() => {
    x.setValue(0);
    if (reduce || overflow <= 2 || !box) return;
    const ms = Math.max(4000, overflow * 60);
    const native = Platform.OS !== 'web';
    // hold at the start, slide, hold at the end, slide back (like the prototype's 18%–82% keyframes)
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(ms * 0.18),
      Animated.timing(x, { toValue: (rtl ? 1 : -1) * overflow, duration: ms * 0.64, easing: Easing.inOut(Easing.ease), useNativeDriver: native }),
      Animated.delay(ms * 0.36),
      Animated.timing(x, { toValue: 0, duration: ms * 0.64, easing: Easing.inOut(Easing.ease), useNativeDriver: native }),
      Animated.delay(ms * 0.18),
    ]));
    loop.start();
    return () => loop.stop();
  }, [overflow, box, reduce, rtl, x]);

  return (
    <View style={{ flex: 1, minWidth: 0, overflow: 'hidden' }} onLayout={(e) => setBox(e.nativeEvent.layout.width)}>
      {reduce || overflow <= 2 ? (
        // a title that is only a hair too wide is clipped invisibly instead of getting "…"
        <Text style={style} numberOfLines={1} ellipsizeMode={!reduce && overflow > 0 ? 'clip' : 'tail'}>{text}</Text>
      ) : (
        <Animated.View style={{ width: full + 1, transform: [{ translateX: x }] }}>
          <Text style={style} numberOfLines={1} ellipsizeMode="clip">{text}</Text>
        </Animated.View>
      )}
      {/* invisible copy that measures the full width of the title */}
      <View style={{ position: 'absolute', opacity: 0, flexDirection: 'row', width: 4000 }} pointerEvents="none">
        <Text style={style} onLayout={(e) => setFull(e.nativeEvent.layout.width)}>{text}</Text>
      </View>
    </View>
  );
}
