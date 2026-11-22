/**
 * "In a room now" row at the top of Chats: an "Open room" bubble, then round photos of people
 * I follow or chat with who are live (red ring, LIVE tag) or in a talk room (red/orange ring, 🎙 ROOM tag).
 * Scrolls sideways. Joining a room comes in a later slice.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { comingSoon } from '../Toast';
import { useLang, useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { getPerson } from '../../data/people';
import { spokenLabel } from '../profile/helpers';

export function InRoomRow({ friends }: { friends: { id: string; kind: 'live' | 'room' }[] }) {
  const c = useColors();
  const t = useT();
  const lang = useLang();
  const friendsText = `${friends.length} friends`; // i18n-ignore: pattern "friends"
  return (
    <View>
      <View style={s.head}>
        <T style={[s.label, { color: c.muted }]}>In a room now</T>
        {friends.length ? <T style={[s.label, { color: c.tintText }]}>{friendsText}</T> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        <Pressy scale={0.9} style={s.bubble} onPress={comingSoon} accessibilityLabel={t('Open room')}>
          <View style={[s.ring, { backgroundColor: c.chip }]}>
            <Text style={[s.plus, { color: c.tintText }]}>+</Text>
          </View>
          <T style={[s.small, { color: c.ink, fontSize: 11 }]} numberOfLines={2}>Open room</T>
        </Pressy>
        {friends.map((f) => {
          const name = getPerson(f.id)?.name ?? '';
          return (
            <Pressy key={f.id} scale={0.9} style={s.bubble} onPress={comingSoon} accessibilityLabel={spokenLabel(f.kind === 'live' ? 'live' : 'talk', name, lang)}>
              <View style={[s.ring, f.kind === 'live' ? { backgroundColor: c.brand } : { backgroundImage: 'linear-gradient(135deg, #E0101F, #FF8A5B 50%, #E0101F)' }]}>
                <View style={[s.inner, { backgroundColor: c.bg }]}>
                  <Avatar id={f.id} size={54} noFlag />
                </View>
                <View style={[s.tag, { borderColor: c.bg }]}>
                  <T style={s.tagText}>{f.kind === 'live' ? 'LIVE' : '🎙 ROOM'}</T>
                </View>
              </View>
              <Text style={[s.small, { color: c.ink }]} numberOfLines={1}>{name}</Text>
            </Pressy>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 8, paddingHorizontal: 20 },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  row: { gap: 14, paddingTop: 4, paddingBottom: 6, paddingHorizontal: 20 },
  bubble: { width: 66, alignItems: 'center', gap: 5 },
  ring: { width: 64, height: 64, borderRadius: 32, padding: 3, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  plus: { fontSize: 26, fontWeight: '700' },
  tag: { position: 'absolute', bottom: -6, alignSelf: 'center', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, backgroundColor: '#E0101F', borderWidth: 2 },
  tagText: { color: '#fff', fontSize: 9.5, fontWeight: '800' },
  small: { fontSize: 11.5, fontWeight: '600', maxWidth: 66, textAlign: 'center' },
});
