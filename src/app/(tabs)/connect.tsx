/**
 * Connect tab (prototype vDiscover; layout decided 1 Nov 2026).
 *
 * The app is empty until real people sign up (NEXT_STEPS §3): with nobody to show, the page is the title
 * and the "nothing here yet" card (design B). Once people exist (slice 2, from the server) it shows
 * the tabs All · Online · Nearby · Serious learners · Teachers, the language chips, and the partners
 * (10 at a time, more while scrolling, v40).
 * Hidden until their feature is built (NEXT_STEPS §4): Plus chip, Search, Filters, bell, the crowned
 * City/Age tabs, the "Get seen first" boost card and the "Live now" tiles.
 */
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { useColors } from '../../theme/colors';
import { PEOPLE } from '../../data/people';
import { Pressy } from '../../components/Pressy';
import { T } from '../../components/T';
import { EmptyState } from '../../components/EmptyState';
import { partnerIds, type ConnectTab } from '../../components/connect/partners';
import { PartnerRow } from '../../components/connect/PartnerRow';

const PAGE = 10;
const TABS: { key: ConnectTab; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'online', label: 'Online' }, { key: 'nearby', label: 'Nearby' },
  { key: 'serious', label: 'Serious learners' }, { key: 'teachers', label: 'Teachers' },
];

export default function ConnectScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const narrow = width < 360;
  const me = useApp((st) => st.me);
  const [tab, setTab] = useState<ConnectTab>('all');
  const [langChip, setLangChip] = useState('mine');
  const [shown, setShown] = useState(PAGE);

  const anyone = Object.keys(PEOPLE).length > 0;
  const myLangs = useMemo(() => [...new Set([...me.natives, ...me.langs])], [me.natives, me.langs]);
  const ids = useMemo(() => partnerIds(tab, langChip, myLangs, me.cc), [tab, langChip, myLangs, me.cc]);

  const pick = (k: ConnectTab) => { setTab(k); setShown(PAGE); };
  const langChips: [string, string][] = [['mine', 'My languages'], ...me.langs.map((l): [string, string] => [l, l]), ['all', 'All languages']];

  const header = (
    <View>
      <View style={[s.top, { paddingTop: insets.top + 16 }]}>
        <T style={[s.h1, { color: c.ink, fontSize: narrow ? 24 : 32 }]}>Connect</T>
      </View>
      {/* tabs and language chips only make sense once there are people to filter */}
      {anyone ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
            {TABS.map((x) => {
              const on = tab === x.key;
              return (
                <Pressy key={x.key} scale={0.92} onPress={() => pick(x.key)} style={[s.tab, on && { backgroundColor: c.ink }]} accessibilityState={{ selected: on }}>
                  <T style={[s.tabText, { color: on ? c.bg : c.muted }]}>{x.label}</T>
                </Pressy>
              );
            })}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            {langChips.map(([k, label]) => {
              const on = langChip === k;
              return (
                <Pressy key={k} scale={0.92} onPress={() => { setLangChip(k); setShown(PAGE); }} style={[s.chip, { borderColor: on ? 'transparent' : c.line, backgroundColor: on ? c.ink : c.card }]}>
                  <T style={[s.chipText, { color: on ? c.bg : c.ink }]}>{label}</T>
                </Pressy>
              );
            })}
          </ScrollView>
        </>
      ) : null}
      <View style={{ height: 6 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={ids.slice(0, shown)}
        keyExtractor={(id) => id}
        renderItem={({ item }) => <PartnerRow id={item} nearby={tab === 'nearby'} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          anyone ? (
            <EmptyState icon="filter" title="No one matches these filters." />
          ) : (
            <EmptyState
              icon="people"
              title="No partners yet"
              text="People who join TalkAmigo will show up here. Complete your profile so they can find you."
              button="Edit profile"
              onPress={() => router.push('/edit-profile')}
            />
          )
        }
        onEndReached={() => shown < ids.length && setShown(shown + PAGE)}
        onEndReachedThreshold={0.6}
        contentContainerStyle={{ paddingBottom: 26 }}
        initialNumToRender={6}
      />
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingBottom: 12, paddingHorizontal: 20 },
  h1: { flexShrink: 0, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  tabs: { gap: 6, paddingTop: 4, paddingBottom: 2, paddingHorizontal: 16 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14 },
  tabText: { fontSize: 15, fontWeight: '700' },
  chips: { gap: 8, paddingTop: 8, paddingHorizontal: 20 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '700' },
});
