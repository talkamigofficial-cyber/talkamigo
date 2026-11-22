/**
 * "Live now" section shown in Connect after the 4th person: title + "See all", then 3 tall live tiles
 * (host photo, LIVE tag, title). Joining lives comes in a later slice.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import demo from '../../data/generated/demo.json';
import { Avatar } from '../Avatar';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { comingSoon } from '../Toast';
import { useColors } from '../../theme/colors';
import { cssBackground } from '../profile/helpers';

export function LiveNowStrip() {
  const c = useColors();
  const lives = demo.lives.slice(0, 3);
  if (!lives.length) return null;
  return (
    <View style={{ paddingBottom: 14 }}>
      <View style={s.sec}>
        <T style={[s.h3, { color: c.ink }]}>Live now</T>
        <Pressy scale={0.94} onPress={comingSoon}><T style={[s.link, { color: c.tintText }]}>See all</T></Pressy>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {lives.map((L) => (
          <Pressy key={L.id} scale={0.96} onPress={comingSoon} style={[s.tile, cssBackground(L.bg)]} accessibilityLabel={L.title}>
            <View style={s.host}><Avatar id={L.host} size={52} noFlag /></View>
            <View style={s.live}><T style={s.liveText}>LIVE</T></View>
            <Text style={s.title} numberOfLines={3}>{L.title}</Text>
          </Pressy>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  sec: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 22, paddingBottom: 12, paddingHorizontal: 20 },
  h3: { fontSize: 20, fontWeight: '700' },
  link: { fontSize: 14, fontWeight: '800' },
  row: { gap: 8, paddingHorizontal: 20 },
  tile: { width: 120, height: 160, borderRadius: 20, overflow: 'hidden' },
  host: { position: 'absolute', top: 38, alignSelf: 'center' },
  live: { position: 'absolute', top: 8, start: 8, height: 22, paddingHorizontal: 8, borderRadius: 999, backgroundColor: '#E0101F', justifyContent: 'center' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  title: { position: 'absolute', start: 10, end: 10, bottom: 10, color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 16 },
});
