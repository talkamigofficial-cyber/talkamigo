/**
 * The banner at the top of Rooms: offers (Standard users only), "Teacher live now" and "New lesson".
 * It slides by itself every ~4.5 s, can be swiped left/right by hand (then pauses ~6 s), with dots underneath
 * (decided 1 Nov 2026). Tapping a banner opens its offer or lesson (later slice).
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import { useT, useLang } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Pressy } from '../Pressy';
import { comingSoon } from '../Toast';
import type { Banner as B } from './roomsData';

export function Banner({ items }: { items: B[] }) {
  const t = useT();
  const c = useColors();
  const rtl = useLang() === 'ar';
  const [i, setI] = useState(0);
  const [width, setWidth] = useState(340);
  const held = useRef(0);
  const slide = useRef(new Animated.Value(0)).current;
  const native = Platform.OS !== 'web';
  const n = items.length;

  // new slide comes in from the side it was swiped from
  const go = (dir: 1 | -1) => {
    setI((k) => (k + dir + n) % n);
    slide.setValue(dir * 0.7);
    Animated.timing(slide, { toValue: 0, duration: 450, useNativeDriver: native }).start();
  };

  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  useEffect(() => {
    if (n < 2) return;
    const h = setInterval(() => { if (Date.now() - held.current > 6000) go(1); }, 4500);
    return () => clearInterval(h);
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderRelease: (_e, g) => {
      held.current = Date.now();
      if (Math.abs(g.dx) > 40) go(((g.dx < 0) !== rtl ? 1 : -1) as 1 | -1);
    },
  })).current;

  if (!n) return null;
  const x = items[i % n];
  return (
    <View>
      <View style={styles.clip} {...pan.panHandlers} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Animated.View style={{ transform: [{ translateX: slide.interpolate({ inputRange: [-1, 1], outputRange: [-width, width] }) }] }}>
          <Pressy scale={0.98} onPress={comingSoon} style={[styles.bnr, { backgroundImage: x.bg }]}>
            <Text style={styles.tag}>{t(x.tag).toLocaleUpperCase()}</Text>
            <Text style={styles.emoji}>{x.emoji}</Text>
            <Text style={styles.title} numberOfLines={3}>{t(x.title)}</Text>
            <Text style={styles.sub} numberOfLines={2}>{t(x.sub)}</Text>
          </Pressy>
        </Animated.View>
      </View>
      <View style={styles.dots}>
        {items.map((_, k) => <View key={k} style={[styles.dot, { backgroundColor: c.line }, k === i % n && styles.dotOn]} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { borderRadius: 24, overflow: 'hidden' },
  bnr: { minHeight: 150, borderRadius: 24, padding: 18, paddingTop: 40, justifyContent: 'flex-end', gap: 4, overflow: 'hidden' },
  tag: { position: 'absolute', start: 14, top: 14, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.22)' },
  emoji: { position: 'absolute', end: 14, top: '50%', marginTop: -42, fontSize: 70, lineHeight: 84, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 8 }, textShadowRadius: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', lineHeight: 26.4, maxWidth: 230, marginEnd: 84 },
  sub: { color: '#fff', fontSize: 13.5, opacity: 0.9, lineHeight: 17.5, maxWidth: 230, marginEnd: 84 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOn: { width: 16, backgroundColor: '#E0101F' },
});
