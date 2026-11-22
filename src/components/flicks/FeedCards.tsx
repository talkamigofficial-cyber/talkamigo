/**
 * The other full-screen cards in the Flicks feed (prototype vMoments / promoFlick):
 *   LiveFlickCard  – a talk room or live room that is open right now ("● LIVE NOW", Join)
 *   PromoFlick     – "Sponsored · TalkAmigo" offer for Plus (Standard users only, once in For you)
 *   EmptyFlick     – message when a tab has nothing to show
 */
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useT, useLang } from '../../i18n';
import { useApp } from '../../state/store';
import { getPerson } from '../../data/people';
import { Avatar } from '../Avatar';
import { Pressy } from '../Pressy';
import { comingSoon } from '../Toast';
import { money } from '../rooms/money';
import { MASCOT_CROWN } from '../rooms/mascot';
import { FLICK_LAYOUT as L, } from './layout';
import type { LiveCard } from './flicksData';
import { cssBackground } from '../../theme/background';

const ROOM_BG = 'radial-gradient(90% 60% at 80% 15%, #A779FF, transparent 60%), radial-gradient(90% 70% at 10% 90%, #E0101F, transparent 60%), #1A0610';

export function LiveFlickCard({ card: x, height }: { card: LiveCard; height: number }) {
  const t = useT();
  const lang = useLang();
  const cc = useApp((s) => s.me.cc);
  const rtl = lang === 'ar';
  const host = getPerson(x.host);
  const kindLabel = x.price ? 'Lesson' : x.kind === 'live' ? 'Live room' : 'Talk room';
  return (
    <View style={{ height, overflow: 'hidden', ...cssBackground(x.kind === 'live' ? x.bg || '#3A0A20' : ROOM_BG) }} accessibilityLabel={t('Live lounge')}>
      <View style={[styles.txt, rtl ? { right: 24, left: 84 } : { left: 24, right: 84 }]}>
        <Text style={styles.livePill}>{x.price ? `● ${t('LIVE')} · ${t('Lesson')}` : t(`● LIVE NOW · ${kindLabel}`)}</Text>
        <Text style={styles.big}>{x.title}</Text>
        <View style={styles.hostRow}>
          <Avatar id={x.host} size={40} />
          <Text style={styles.hostName}>{host?.name}</Text>
        </View>
        <Text style={styles.count}>{t(`${x.count} ${x.kind === 'live' ? 'watching' : 'listening'} · ${x.lang}`)}</Text>
        <Pressy scale={0.955} onPress={comingSoon} style={styles.join}>
          <Text style={styles.joinText}>{x.price ? `${t('Join')} · ${money(0.99, cc, lang)}` : t('Join')}</Text>
        </Pressy>
      </View>
      <View style={[styles.rail, rtl ? { left: L.railSide } : { right: L.railSide }, { bottom: L.railBottom }]}>
        <Pressy scale={0.88} onPress={comingSoon} style={styles.circ} accessibilityLabel={t('More options')}>
          <Text style={styles.dots3}>•••</Text>
        </Pressy>
      </View>
    </View>
  );
}

export function PromoFlick({ height }: { height: number }) {
  const t = useT();
  const rtl = useLang() === 'ar';
  return (
    <View style={{ height, overflow: 'hidden', ...cssBackground('radial-gradient(100% 70% at 80% 10%, #FF5A66 0%, transparent 60%), linear-gradient(160deg, #E0101F, #7A0010)') }} accessibilityLabel={t('TalkAmigo offer')}>
      <View style={[styles.txt, { top: 130 }, rtl ? { right: 24, left: 84 } : { left: 24, right: 84 }]}>
        <Text style={styles.sponsored}>{t('Sponsored · TalkAmigo')}</Text>
        <Text style={styles.big}>{t('See who viewed your profile 👀')}</Text>
        <Text style={styles.sub}>{t('Plus also gives private rooms, rooms with no time limit, a free first boost and no promos.')}</Text>
        <Pressy scale={0.955} onPress={comingSoon} style={[styles.join, { backgroundColor: '#fff' }]}>
          <Text style={[styles.joinText, { color: '#C20E1B' }]}>{t('See Plus')}</Text>
        </Pressy>
      </View>
      <View style={[styles.mascot, rtl ? { left: 20 } : { right: 20 }]} pointerEvents="none">
        <SvgXml xml={MASCOT_CROWN} width={140} height={127} />
      </View>
    </View>
  );
}

export function EmptyFlick({ text, height }: { text: string; height: number }) {
  const t = useT();
  return (
    <View style={{ height, backgroundColor: '#1A0610' }}>
      <View style={styles.emptyBox}>
        <Text style={[styles.big, { fontSize: 24, lineHeight: 29 }]}>{t(text)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  txt: { position: 'absolute', top: 120, gap: 14 },
  livePill: { alignSelf: 'flex-start', backgroundColor: '#E0101F', color: '#fff', fontSize: 11.5, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  sponsored: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.92)', color: '#1A1418', fontSize: 11.5, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  big: { color: '#fff', fontSize: 30, fontWeight: '700', lineHeight: 34, letterSpacing: -0.4 },
  sub: { color: '#fff', fontSize: 16, lineHeight: 23, opacity: 0.92 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  count: { color: '#fff', fontSize: 14.5, opacity: 0.9 },
  join: { alignSelf: 'flex-start', marginTop: 6, height: 54, paddingHorizontal: 20, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center' },
  joinText: { color: '#C20E1B', fontWeight: '800', fontSize: 16 },
  rail: { position: 'absolute', alignItems: 'center' },
  circ: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  dots3: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  mascot: { position: 'absolute', bottom: 92, width: 140 },
  emptyBox: { position: 'absolute', top: '20%', left: 24, right: 80 },
});
