/**
 * Teacher lessons are CIRCLES, so they never look like normal rooms (decided 2 Nov 2026, "Lessons, final look").
 *
 *   <LessonCircle x={room} kind="room" />   black circle (white in dark mode): "Open now", teacher, title, price.
 *                                            Teacher ROOMS have a red ring that fills with the seats taken;
 *                                            teacher LIVES have a full red ring and say "● LIVE".
 *   <PaidLiveCircle x={live} />             the big round "LIVE · Lesson" card mixed into Live rooms (v90).
 * Under each circle: mic/camera icon + seats left. Joining (€0.99 with Apple) comes in a later slice.
 */
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useT, useLang } from '../../i18n';
import { useApp } from '../../state/store';
import { useColors, useScheme } from '../../theme/colors';
import { PEOPLE } from '../../data/people';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Pressy } from '../Pressy';
import { comingSoon } from '../Toast';
import { money } from './money';
import { cssBackground } from '../../theme/background';
import type { Live, Room } from './roomsData';

/** A ring around a circle; `part` (0–1) of it is red, starting at the top. */
function Ring({ size, width, part, track, gap }: { size: number; width: number; part: number; track: string; gap: number }) {
  const r = (size - width) / 2;
  const len = 2 * Math.PI * r;
  return (
    <Svg width={size} height={size} style={{ position: 'absolute', left: -gap - width, top: -gap - width }} pointerEvents="none">
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={width} fill="none" />
      {part > 0 && (
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E0101F" strokeWidth={width} fill="none"
          strokeDasharray={`${len * part} ${len}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="butt" />
      )}
    </Svg>
  );
}

export function LessonCircle({ x, kind, size, big }: { x: Room | Live; kind: 'room' | 'live'; size: number; big?: boolean }) {
  const t = useT();
  const lang = useLang();
  const c = useColors();
  const dark = useScheme() === 'dark';
  const cc = useApp((s) => s.me.cc);
  const seats = x.seats ?? 10, booked = x.booked ?? 0;
  const live = kind === 'live';
  const host = PEOPLE[x.host];
  return (
    <Pressy scale={0.98} onPress={comingSoon} style={[styles.wrap, { width: size }]} accessibilityLabel={x.title}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.ink, boxShadow: live ? '0 10px 24px rgba(224,16,31,0.18)' : '0 10px 24px rgba(0,0,0,0.12)' }]}>
        <Ring size={size + 10} width={2} gap={3} part={live ? 1 : booked / seats} track="rgba(127,127,140,0.35)" />
        <View style={styles.badge}>
          {live ? <View style={styles.liveDot} /> : <Icon name="mic" size={11} color={dark ? '#C20E1B' : '#FF5A66'} strokeWidth={2.6} />}
          <Text style={[styles.badgeText, { color: dark ? '#C20E1B' : '#FF5A66' }]}>{t(live ? 'LIVE' : 'Open now').toLocaleUpperCase()}</Text>
        </View>
        <Avatar id={x.host} size={big ? 44 : 34} noFlag />
        <Text style={[styles.title, { color: c.bg, fontSize: big ? 15.5 : 13 }]} numberOfLines={2}>{x.title}</Text>
        <Text style={[styles.meta, { color: c.bg, fontSize: big ? 11.5 : 10.5 }]} numberOfLines={1}>{`${host?.name} · ${x.lang} · ${x.level ?? ''}`}</Text>
        <View style={styles.price}><Text style={styles.priceText}>{money(0.99, cc, lang)}</Text></View>
      </View>
      <View style={styles.seats}>
        <Icon name={live ? 'video' : 'mic'} size={13} color={c.muted} strokeWidth={2.2} />
        <Text style={[styles.seatsText, { color: c.muted }]} numberOfLines={1}>{t(`${seats - booked} seats left`)}</Text>
      </View>
    </Pressy>
  );
}

export function PaidLiveCircle({ x, size }: { x: Live; size: number }) {
  const t = useT();
  const lang = useLang();
  const c = useColors();
  const cc = useApp((s) => s.me.cc);
  const seats = x.seats || 8, booked = Math.min(seats, x.booked ?? 5);
  return (
    <View style={styles.plc}>
      <Pressy scale={0.98} onPress={comingSoon} style={{ width: size, height: size }} accessibilityLabel={x.title}>
        <View style={[styles.plcb, { width: size, height: size, borderRadius: size / 2, ...cssBackground(x.bg, '#3A0A20') }]}>
          <View style={[StyleSheet.absoluteFill, { backgroundImage: 'radial-gradient(closest-side, transparent 50%, rgba(0,0,0,0.6))' }]} />
          <View style={styles.plci}>
            <View style={styles.plct}>
              <View style={[styles.liveDot, { backgroundColor: '#fff' }]} />
              <Text style={styles.plctText}>{`${t('LIVE')} · ${t('Lesson')}`}</Text>
            </View>
            <Avatar id={x.host} size={52} noFlag />
            <Text style={styles.plcTitle} numberOfLines={2}>{x.title}</Text>
            <Text style={styles.plcMeta} numberOfLines={1}>{`${PEOPLE[x.host]?.name} · ${x.lang || x.l}${x.level ? ' · ' + x.level : ''}`}</Text>
            <View style={[styles.price, { borderRadius: 13, paddingHorizontal: 13 }]}><Text style={[styles.priceText, { fontSize: 15 }]}>{money(0.99, cc, lang)}</Text></View>
          </View>
          {/* red ring inside the edge, filled with the seats taken */}
          <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Circle cx={size / 2} cy={size / 2} r={size / 2 - 2} stroke="#E0101F" strokeWidth={4} fill="none"
              strokeDasharray={`${2 * Math.PI * (size / 2 - 2) * (booked / seats)} ${2 * Math.PI * size}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          </Svg>
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', inset: -5, borderRadius: size, borderWidth: 2, borderColor: 'rgba(127,127,140,0.35)' }} />
      </Pressy>
      <View style={styles.seats}>
        <Icon name="video" size={15} color={c.muted} />
        <Text style={[styles.seatsText, { color: c.muted, fontSize: 13 }]}>{t(`${seats - booked} seats left`)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 7 },
  circle: { alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: '12%', paddingVertical: '8%' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E0101F' },
  title: { fontWeight: '800', lineHeight: 15.6, textAlign: 'center' },
  meta: { opacity: 0.72, textAlign: 'center' },
  price: { marginTop: 2, paddingHorizontal: 11, paddingVertical: 4, borderRadius: 999, backgroundColor: '#E0101F' },
  priceText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  seats: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
  seatsText: { fontSize: 11.5, fontWeight: '700' },
  plc: { alignItems: 'center', gap: 8, paddingTop: 6, paddingBottom: 4, width: '100%' },
  plcb: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  plci: { alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 34 },
  plct: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#E0101F' },
  plctText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  plcTitle: { color: '#fff', fontSize: 16.5, fontWeight: '800', lineHeight: 20, textAlign: 'center' },
  plcMeta: { color: '#fff', fontSize: 12.5, opacity: 0.88 },
});
