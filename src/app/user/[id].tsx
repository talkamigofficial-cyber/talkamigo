/**
 * Someone else's profile (prototype vUser). Opened from Connect, Chats and anywhere a person's photo is tapped:
 *   /user/<id>
 *
 * Photo · number of Flicks · name, age, Teacher, flag + city, online, "Follows you" · Speaks / Learning ·
 * Follow · tabs Flicks / About · ••• menu (close friends, mute).
 * No invented numbers (NEXT_STEPS §3): follower counts arrive with the server (slice 2).
 * Hidden until their feature is built (NEXT_STEPS §4): Message (slice 3), gifts and top supporters (slice 9),
 * intro video playback, Invite to Duo.
 * An unknown id (e.g. an account that was deleted) shows "This account is no longer available".
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getPerson } from '../../data/people';
import { liveFlicks } from '../../data/live';
import { useApp } from '../../state/store';
import { useLang, useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Avatar, Flag } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Pressy } from '../../components/Pressy';
import { Screen, TopBar } from '../../components/Screen';
import { T } from '../../components/T';
import { EmptyState } from '../../components/EmptyState';
import { FlickGrid, Stat, UserMenu, type GridItem } from '../../components/profile/ProfileParts';
import { followToast } from '../../components/profile/helpers';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const t = useT();
  const lang = useLang();
  const p = getPerson(id);
  const following = useApp((s) => !!s.follows[id]);
  const followsMe = useApp((s) => s.followsMe.includes(id));
  const [tab, setTab] = useState<'flicks' | 'about'>('flicks');
  const [menu, setMenu] = useState(false);

  if (!p) {
    return (
      <Screen>
        <TopBar />
        <EmptyState icon="user" title="This account is no longer available" style={{ flex: 1, paddingBottom: 80 }} />
      </Screen>
    );
  }

  const theirFlicks: GridItem[] = liveFlicks
    .filter((m) => m.by === id)
    .map((m) => ({ id: m.id, bg: m.bg ?? '#3A0A20', photo: typeof m.photo === 'string' ? m.photo : undefined, text: m.text, likes: m.likes ?? 0 }));

  const learning = `Learning ${p.learning} ${p.lvl}`; // i18n-ignore: pattern "lrnlv", e.g. "Learning English B1"

  const onFollow = () => {
    useApp.getState().toggleFollow(id);
    followToast(!following, followsMe, lang);
  };

  return (
    <Screen edges={['top']}>
      <TopBar
        title={p.name}
        raw
        right={
          <Pressy scale={0.9} onPress={() => setMenu(true)} style={[s.ibtn, { backgroundColor: c.card, borderColor: c.line }]} accessibilityLabel={t('More options')}>
            <Text style={[s.dots, { color: c.ink }]}>•••</Text>
          </Pressy>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* photo + numbers */}
        <View style={s.head}>
          <Avatar id={id} size={92} ring />
          <View style={s.stats}>
            <Stat value={String(theirFlicks.length)} label="Flicks" />
          </View>
        </View>

        {/* who they are */}
        <View style={s.who}>
          <View style={s.line}>
            <Text style={[s.name, { color: c.ink }]}>{`${p.name}, ${p.age}`}</Text>
            {p.teacher ? <T style={[s.pill, { backgroundColor: c.tint, color: c.tintText }]}>Teacher</T> : null}
            <View style={s.place}>
              <Flag cc={p.cc} size={15} />
              <Text style={[s.city, { color: c.muted }]}>{p.city}</Text>
              {p.online ? <Text style={[s.city, { color: c.muted }]}> · <T style={{ color: c.good, fontWeight: '700', fontSize: 13.5 }}>online</T></Text> : null}
            </View>
            {followsMe ? <T style={[s.pill, { backgroundColor: c.chip, color: c.muted }]}>Follows you</T> : null}
          </View>
          <View style={s.line}>
            <T style={[s.pill, { backgroundColor: c.chip, color: c.ink }]}>{`Speaks ${p.native}`}</T>
            <T style={[s.pill, { backgroundColor: c.tint, color: c.tintText }]}>{learning}</T>
          </View>
        </View>

        {/* actions */}
        <View style={s.actions}>
          <View style={{ flex: 1 }}><Button title={following ? 'Following ✓' : 'Follow'} kind={following ? 'glass' : 'primary'} small onPress={onFollow} /></View>
        </View>

        {/* Flicks / About */}
        <View style={[s.pad, { paddingTop: 18 }]}>
          <View style={[s.seg, { backgroundColor: c.chip }]}>
            {(['flicks', 'about'] as const).map((k) => (
              <View key={k} style={{ flex: 1 }}>
                <Pressy scale={0.97} onPress={() => setTab(k)} style={[s.segBtn, tab === k && { backgroundColor: c.cardStrong, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }]} accessibilityState={{ selected: tab === k }}>
                  <T style={[s.segText, { color: tab === k ? c.ink : c.muted }]}>{k === 'flicks' ? 'Flicks' : 'About'}</T>
                </Pressy>
              </View>
            ))}
          </View>
        </View>
        <View style={[s.pad, { paddingTop: 12, gap: 12 }]}>
          {tab === 'flicks' ? (
            theirFlicks.length ? <FlickGrid items={theirFlicks} /> : <EmptyState icon="mom" title="No Flicks yet" />
          ) : (
            <>
              <T raw style={{ lineHeight: 24, color: c.soft, fontSize: 15 }}>{p.bio}</T>
              <View style={s.interests}>
                {p.interests.map((x) => (
                  <View key={x} style={[s.chip, { borderColor: c.line, backgroundColor: c.card }]}>
                    <T style={{ fontSize: 14, fontWeight: '700', color: c.ink }}>{x}</T>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <UserMenu id={id} visible={menu} onClose={() => setMenu(false)} />
    </Screen>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  ibtn: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dots: { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20 },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  who: { paddingTop: 12, paddingHorizontal: 20, gap: 7 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '800' },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  city: { fontSize: 13.5 },
  pill: { fontSize: 11.5, fontWeight: '800', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 8, paddingTop: 12, paddingHorizontal: 20 },
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16 },
  segBtn: { height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 14, fontWeight: '700' },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
});
