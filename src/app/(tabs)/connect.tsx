/**
 * Connect tab (prototype vDiscover; layout decided 1 Nov 2026).
 *
 * Header "Connect" with a gold 👑 Plus chip (Standard only), Search, Filters and the bell.
 * Tabs: All · Online · Nearby · Serious learners · Teachers · 👑 City · 👑 Age (crowned = Plus → "is a Plus feature" sheet).
 * Language chips: My languages · each language I'm learning · All languages.
 * Then the "Get seen first" boost card and the partners (10 at a time, more while scrolling, v40),
 * with "Live now" tiles after the 4th person.
 */
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Icon } from '../../components/Icon';
import { Pressy } from '../../components/Pressy';
import { T } from '../../components/T';
import { comingSoon } from '../../components/Toast';
import { activityUnread } from '../../components/chats/chatData';
import { partnerIds, type ConnectTab } from '../../components/connect/partners';
import { PartnerRow } from '../../components/connect/PartnerRow';
import { LiveNowStrip } from '../../components/connect/LiveNowStrip';
import { PlusGateSheet } from '../../components/connect/PlusGateSheet';

const PAGE = 10;
const TABS: { key: ConnectTab | 'city' | 'age'; label: string; plus?: string }[] = [
  { key: 'all', label: 'All' }, { key: 'online', label: 'Online' }, { key: 'nearby', label: 'Nearby' },
  { key: 'serious', label: 'Serious learners' }, { key: 'teachers', label: 'Teachers' },
  { key: 'city', label: 'City', plus: 'City search' }, { key: 'age', label: 'Age', plus: 'Age range' },
];

export default function ConnectScreen() {
  const c = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const narrow = width < 360;
  const { me, plan, account } = useApp();
  const [tab, setTab] = useState<ConnectTab>('all');
  const [langChip, setLangChip] = useState('mine');
  const [shown, setShown] = useState(PAGE);
  const [gate, setGate] = useState<string | null>(null);

  const myLangs = useMemo(() => [...new Set([...me.natives, ...me.langs])], [me.natives, me.langs]);
  const ids = useMemo(() => partnerIds(tab, langChip, myLangs, me.cc), [tab, langChip, myLangs, me.cc]);
  const bell = account === 'demo' ? activityUnread() : 0;
  // the demo account has a 50%-off boost coupon (TalkAmigo Team message), so the boost costs 150 instead of 300
  const boostCost = account === 'demo' ? 150 : 300;
  const isPlus = plan !== 'standard';

  const pick = (k: ConnectTab) => { setTab(k); setShown(PAGE); };
  const langChips: [string, string][] = [['mine', 'My languages'], ...me.langs.map((l): [string, string] => [l, l]), ['all', 'All languages']];

  const header = (
    <View>
      <View style={[s.top, { paddingTop: insets.top + 16 }]}>
        <T style={[s.h1, { color: c.ink, fontSize: narrow ? 24 : 32 }]}>Connect</T>
        <View style={{ flex: 1 }} />
        {!isPlus ? (
          <Pressy scale={0.92} onPress={comingSoon} style={s.plusChip} accessibilityLabel="Plus">
            <Icon name="crown" size={14} color="#F5A300" fill="#F5A300" strokeWidth={0} />
            {/* small phones (iPhone SE): crown only, so the buttons fit */}
            {!narrow ? <Text style={s.plusText}>Plus</Text> : null}{/* i18n-ignore: brand name */}
          </Pressy>
        ) : null}
        <IconButton icon="search" label="Search" small={narrow} />
        <IconButton icon="filter" label="Filters" small={narrow} />
        <IconButton icon="bell" label="Activity" count={bell} small={narrow} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
        {TABS.map((x) => {
          const on = tab === x.key;
          const locked = !!x.plus && !isPlus;
          return (
            <Pressy
              key={x.key}
              scale={0.92}
              onPress={() => (locked ? setGate(x.plus!) : x.key === 'city' || x.key === 'age' ? comingSoon() : pick(x.key as ConnectTab))}
              style={[s.tab, on && { backgroundColor: c.ink }]}
              accessibilityState={{ selected: on }}
            >
              {x.plus ? <Icon name="crown" size={14} color="#F5A300" fill="#F5A300" strokeWidth={0} /> : null}
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
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <Pressy scale={0.98} onPress={comingSoon} style={[s.boost, { backgroundColor: c.card, borderColor: c.line }]}>
          <Text style={{ fontSize: 22 }}>🚀</Text>
          <View style={{ flex: 1 }}>
            <T style={[s.boostTitle, { color: c.ink }]}>Get seen first</T>
            <T style={{ fontSize: 12.5, color: c.muted }}>{`Top of Connect for 30 min · ${boostCost} coins`}</T>{/* i18n-ignore: pattern "topc" */}
          </View>
          <Icon name="chev" size={17} color={c.muted} strokeWidth={2.4} />
        </Pressy>
      </View>
      <View style={{ height: 6 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={ids.slice(0, shown)}
        keyExtractor={(id) => id}
        renderItem={({ item, index }) => (
          <>
            <PartnerRow id={item} nearby={tab === 'nearby'} />
            {index === 3 ? <LiveNowStrip /> : null}
          </>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={<T style={{ padding: 20, color: c.muted }}>No one matches these filters.</T>}
        onEndReached={() => shown < ids.length && setShown(shown + PAGE)}
        onEndReachedThreshold={0.6}
        contentContainerStyle={{ paddingBottom: 26 }}
        initialNumToRender={6}
      />
      <PlusGateSheet feature={gate ? t(gate) : null} onClose={() => setGate(null)} />
    </View>
  );
}

function IconButton({ icon, label, count, small }: { icon: 'search' | 'filter' | 'bell'; label: string; count?: number; small?: boolean }) {
  const c = useColors();
  const t = useT();
  return (
    <Pressy scale={0.9} onPress={comingSoon} style={[s.ibtn, small && { width: 38, height: 38, borderRadius: 13 }, { backgroundColor: c.card, borderColor: c.line }]} accessibilityLabel={t(label)}>
      <Icon name={icon} size={small ? 19 : 21} color={c.ink} />
      {count ? <View style={[s.dot, { borderColor: c.bg }]}><Text style={s.dotText}>{count}</Text></View> : null}
    </Pressy>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 12, paddingHorizontal: 20 },
  h1: { flexShrink: 0, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  plusChip: { height: 36, paddingHorizontal: 11, borderRadius: 999, backgroundColor: '#1A1418', flexDirection: 'row', alignItems: 'center', gap: 5 },
  plusText: { color: '#FFC531', fontWeight: '800', fontSize: 13 },
  ibtn: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: -4, end: -4, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: '#E0101F', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  tabs: { gap: 6, paddingTop: 4, paddingBottom: 2, paddingHorizontal: 16 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14 },
  tabText: { fontSize: 15, fontWeight: '700' },
  chips: { gap: 8, paddingTop: 8, paddingHorizontal: 20 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '700' },
  boost: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 24, borderWidth: 1 },
  boostTitle: { fontSize: 14.5, fontWeight: '800' },
});
