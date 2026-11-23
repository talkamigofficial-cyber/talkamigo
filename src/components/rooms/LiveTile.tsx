/**
 * A live room tile in the Live rooms grid (prototype liveTile): tall card in the host's colours,
 * the host's photo in the middle, LIVE + "N watching" (+ rocket when boosted) at the top,
 * sliding title and host name with flag at the bottom. Two tiles per row.
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useT, useLang } from '../../i18n';
import { PEOPLE } from '../../data/people';
import { Avatar, Flag } from '../Avatar';
import { Icon } from '../Icon';
import { Tap } from './Tap';
import { cssBackground } from '../../theme/background';
import { Marquee } from './Marquee';
import { n0 } from './money';
import type { Live } from './roomsData';

export const LiveTile = memo(function LiveTile({ x, onPress }: { x: Live; onPress?: () => void }) {
  const t = useT();
  const lang = useLang();
  const host = PEOPLE[x.host];
  return (
    <Tap onPress={onPress} scale={0.98} style={[styles.tile, cssBackground(x.bg)]} accessibilityLabel={x.title}>
      <View style={styles.center}><Avatar id={x.host} size={76} noFlag /></View>
      <View style={[StyleSheet.absoluteFill, { backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.65))' }]} pointerEvents="none" />
      <View style={styles.top}>
        <Text style={[styles.dk, { backgroundColor: '#E0101F' }]}>{t('LIVE')}</Text>
        <Text style={styles.dk}>{t(`${n0(x.viewers, lang)} watching`)}</Text>
        {x.boosted ? (
          <View style={[styles.dkBox, { backgroundColor: '#FFC531' }]} accessibilityLabel={t('Boosted')}>
            <Icon name="rocket" size={13} color="#1A1418" strokeWidth={2.2} />
          </View>
        ) : null}
      </View>
      <View style={styles.bottom}>
        <View style={{ flexDirection: 'row' }}><Marquee text={x.title} style={styles.title} /></View>
        <View style={styles.hostRow}>
          <Text style={styles.host} numberOfLines={1}>{host?.name}</Text>
          {host ? <Flag cc={host.cc} size={13} /> : null}
        </View>
      </View>
    </Tap>
  );
});

const styles = StyleSheet.create({
  tile: { width: '100%', aspectRatio: 3 / 4, borderRadius: 22, overflow: 'hidden' },
  center: { position: 'absolute', left: 0, right: 0, top: '42%', marginTop: -38, alignItems: 'center' },
  top: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  dk: { height: 24, lineHeight: 24, paddingHorizontal: 8, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.38)', color: '#fff', fontSize: 10.5, fontWeight: '800' },
  dkBox: { height: 24, paddingHorizontal: 7, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', left: 12, right: 12, bottom: 12, gap: 3 },
  title: { color: '#fff', fontSize: 14.5, fontWeight: '700', lineHeight: 18 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  host: { color: '#fff', fontSize: 12, opacity: 0.9 },
});
