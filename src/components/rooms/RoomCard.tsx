/**
 * A free talk room in the Rooms list: design 6 "host ring" (decided 10 Nov 2026, v76).
 *   tags (language · #topic · Plus/Official/Teacher · Boosted) → sound bars + sliding title →
 *   host photo with a red ring + name · 5 faces · total count in a black pill.
 * Light mode: white card with a faint red glow at the bottom; dark mode: dark card.
 */
import { memo, useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useT, useLang } from '../../i18n';
import { useColors, useScheme, BRAND_GRADIENT } from '../../theme/colors';
import { PEOPLE } from '../../data/people';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Tap } from './Tap';
import { Marquee, useReduceMotion } from './Marquee';
import { n0 } from './money';
import { cardFaces, type Room } from './roomsData';

const ALL_IDS = Object.keys(PEOPLE);

export const RoomCard = memo(function RoomCard({ r, onPress }: { r: Room; onPress?: () => void }) {
  const t = useT();
  const lang = useLang();
  const c = useColors();
  const dark = useScheme() === 'dark';
  const faces = cardFaces(r, ALL_IDS);
  return (
    <Tap onPress={onPress} scale={0.98} style={[styles.card, { backgroundColor: dark ? c.card : c.bg, borderColor: c.line }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundImage: `linear-gradient(180deg, transparent ${dark ? 50 : 55}%, ${dark ? 'rgba(255,40,60,0.10)' : 'rgba(224,16,31,0.06)'})` }]} pointerEvents="none" />
      <View style={styles.tags}>
        <Pill text={r.lang} bg={c.chip} color={c.ink} raw />
        {r.topic ? <Pill text={`# ${r.topic}`} bg={c.tint} color={c.tintText} raw /> : null}
        {r.vip ? <Pill text="Plus" gradient color="#fff" raw /> : null}
        {r.official ? <Pill text={t('Official')} bg={c.tint} color={c.tintText} raw /> : null}
        {r.teacher ? <Pill text={t('Teacher')} bg={c.tint} color={c.tintText} raw /> : null}
        {r.boosted ? <BoostedPill /> : null}
      </View>
      <View style={styles.titleLine}>
        <SoundBars color={dark ? '#FF4651' : '#E0101F'} />
        <Marquee text={r.title} style={[styles.title, { color: c.ink }]} />
      </View>
      <View style={styles.bottom}>
        <View style={styles.hostRing}><Avatar id={r.host} size={36} /></View>
        <Text style={[styles.hostName, { color: c.ink }]} numberOfLines={1}>{PEOPLE[r.host]?.name}</Text>
        <View style={styles.faces}>
          {faces.map((id, i) => (
            <View key={id} style={[styles.face, { borderColor: dark ? '#1b1b20' : c.bg }, i > 0 && { marginStart: -6 }]}>
              <Avatar id={id} size={30} />
            </View>
          ))}
        </View>
        <View style={[styles.count, { backgroundColor: dark ? '#000' : '#111114' }]}>
          <Text style={styles.countText}>{n0(r.count, lang)}</Text>
        </View>
      </View>
    </Tap>
  );
});

export function Pill({ text, bg, color, gradient, raw }: { text: string; bg?: string; color: string; gradient?: boolean; raw?: boolean }) {
  const t = useT();
  return (
    <View style={[styles.pill, gradient ? { backgroundImage: BRAND_GRADIENT } : { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]} numberOfLines={1}>{raw ? text : t(text)}</Text>
    </View>
  );
}

/** "⚡ Boosted": paid ranking is always labelled (EU rule, CLAUDE.md §7 Boosts). */
export function BoostedPill() {
  const t = useT();
  return (
    <View style={[styles.pill, { backgroundColor: '#FFF1D6' }]}>
      <Icon name="bolt" size={12} color="#9A5A00" strokeWidth={2.4} />
      <Text style={[styles.pillText, { color: '#9A5A00' }]}>{t('Boosted')}</Text>
    </View>
  );
}

/** Three little bars moving like sound (still when Reduce Motion is on). */
function SoundBars({ color }: { color: string }) {
  const reduce = useReduceMotion();
  const bars = [useRef(new Animated.Value(0.6)).current, useRef(new Animated.Value(1)).current, useRef(new Animated.Value(0.75)).current];
  useEffect(() => {
    if (reduce) return;
    const native = Platform.OS !== 'web';
    const loops = bars.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 250),
      Animated.timing(v, { toValue: 0.3, duration: 800, useNativeDriver: native }),
      Animated.timing(v, { toValue: 1, duration: 800, useNativeDriver: native }),
    ])));
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  const heights = [9.6, 16, 12];
  return (
    <View style={styles.sbar}>
      {bars.map((v, i) => (
        <Animated.View key={i} style={{ width: 3.5, height: heights[i], borderRadius: 2, backgroundColor: color, transform: [{ scaleY: v }], transformOrigin: 'bottom' }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, borderWidth: 1, padding: 16, gap: 12, overflow: 'hidden' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, rowGap: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, maxWidth: '100%' },
  pillText: { fontSize: 11.5, fontWeight: '800' },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  title: { fontSize: 19, fontWeight: '700', lineHeight: 23 },
  sbar: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostRing: { borderRadius: 999, boxShadow: '0 0 0 2.5px #E0101F' },
  hostName: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '700', textAlign: 'auto' },
  faces: { flexDirection: 'row', alignItems: 'center' },
  face: { borderWidth: 2, borderRadius: 999 },
  count: { minWidth: 32, height: 32, paddingHorizontal: 7, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
