/**
 * Rooms tab (decided 1–2 Nov 2026, "Rooms page"):
 *   big title "Talk rooms" / "Live rooms" → two big cards (Talk rooms · Live rooms, the chosen one turns red,
 *   remembered) → Rooms (or "Live now") · Lessons → language chips → the list.
 *
 * Talk rooms: room cards, boosted first, with one "Popular lesson" circle as the 3rd item.
 * Live rooms: tiles two per row, with one paid live lesson circle as the 3rd item.
 * The list starts with a few cards and adds 10 more as you scroll (prototype lazyN), so it opens fast.
 *
 * Round 2 (NEXT_STEPS §3–4): the app is empty until real people open rooms, so each list shows an empty
 * state. "Plans", "Open room" and the offer banner are hidden until those features exist (slices 6, 7, 9).
 */
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { useColors, useScheme } from '../../theme/colors';
import { Icon } from '../../components/Icon';
import { Pressy } from '../../components/Pressy';
import { EmptyState } from '../../components/EmptyState';
import { RoomCard } from '../../components/rooms/RoomCard';
import { LiveTile } from '../../components/rooms/LiveTile';
import { LessonCircle, PaidLiveCircle } from '../../components/rooms/LessonCircle';
import { Lessons } from '../../components/rooms/Lessons';
import { langChips, livesFor, talkRoomsFor, type Live, type Room } from '../../components/rooms/roomsData';

type Item =
  | { k: 'room'; r: Room }
  | { k: 'popular'; r: Room }
  | { k: 'tiles'; a: Live; b?: Live }
  | { k: 'paidLive'; x: Live }
  | { k: 'quiet' };

export default function RoomsTab() {
  const t = useT();
  const c = useColors();
  const dark = useScheme() === 'dark';
  const { width } = useWindowDimensions();
  const me = useApp((s) => s.me);
  const mode = useApp((s) => s.roomMode);
  const [tab, setTab] = useState<'rooms' | 'lessons'>('rooms');
  const [chip, setChip] = useState('All');
  const [shown, setShown] = useState(8);
  const pageWidth = Math.min(width, 600) - 40;

  // the list under the chips
  const items: Item[] = useMemo(() => {
    if (tab !== 'rooms') return [];
    if (mode === 'talk') {
      const { free, popular } = talkRoomsFor(chip, me);
      const list: Item[] = free.map((r) => ({ k: 'room', r }));
      if (popular) list.splice(Math.min(2, list.length), 0, { k: 'popular', r: popular });
      return list.length ? list : [{ k: 'quiet' }];
    }
    const { free, popular } = livesFor(chip, me);
    if (!free.length && !popular) return [{ k: 'quiet' }];
    // tiles go two per row; the paid live lesson takes a whole row after the first two tiles
    const rows: Item[] = [];
    const pair = (arr: Live[]) => { for (let i = 0; i < arr.length; i += 2) rows.push({ k: 'tiles', a: arr[i], b: arr[i + 1] }); };
    pair(free.slice(0, 2));
    if (popular) rows.push({ k: 'paidLive', x: popular });
    pair(free.slice(2));
    return rows;
  }, [tab, mode, chip, me]);

  const switchMode = (m: 'talk' | 'live') => { useApp.getState().setRoomMode(m); setShown(8); };

  const header = (
    <View>
      <Text style={[styles.title, { color: c.ink }]}>{t(mode === 'live' ? 'Live rooms' : 'Talk rooms')}</Text>

      <View style={[styles.pad, styles.modes]}>
        {([['talk', 'mic', 'Talk rooms', 'Speak, listen and practise'], ['live', 'video', 'Live rooms', 'One person live on camera']] as const).map(([k, icon, label, sub]) => {
          const on = mode === k;
          return (
            // Pressy sizes its inner layer only, so the flex:1 goes on a wrapping View
            <View key={k} style={{ flex: 1 }}><Pressy scale={0.98} onPress={() => switchMode(k)} style={[styles.mode, { backgroundColor: on ? c.tint : c.chip, borderColor: on ? c.brandText : c.line }]} accessibilityState={{ selected: on }}>
              <Icon name={icon} size={28} color={on ? c.brandText : c.ink} />
              <Text style={[styles.modeTitle, { color: c.ink }]}>{t(label)}</Text>
              <Text style={[styles.modeSub, { color: c.muted }]}>{t(sub)}</Text>
            </Pressy></View>
          );
        })}
      </View>

      <View style={[styles.pad, { paddingTop: 12 }]}>
        <View style={[styles.seg, { backgroundColor: dark ? 'rgba(118,118,128,0.24)' : c.chip }]}>
          {([['rooms', mode === 'live' ? 'Live now' : 'Rooms'], ['lessons', 'Lessons']] as const).map(([k, label]) => {
            const on = tab === k;
            return (
              <View key={k} style={{ flex: 1 }}><Pressy scale={0.97} onPress={() => setTab(k)} style={[styles.segBtn, on && { backgroundColor: dark ? '#5A5A63' : c.cardStrong, boxShadow: '0 1px 3px rgba(0,0,0,0.10)' }]}>
                <Text style={[styles.segText, { color: on ? (dark ? '#fff' : c.ink) : c.muted }]}>{t(label)}</Text>
              </Pressy></View>
            );
          })}
        </View>
      </View>

      <View style={[styles.pad, { paddingTop: 14 }]}>
        {tab === 'lessons' ? (
          <Lessons mode={mode} width={pageWidth} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ marginHorizontal: -20, marginBottom: 12 }}>
            {langChips(me).map((ch) => {
              const on = chip === ch.value;
              return (
                <Pressy key={ch.value} scale={0.94} onPress={() => { setChip(ch.value); setShown(8); }} style={[styles.chip, { borderColor: on ? 'transparent' : c.line, backgroundColor: on ? c.ink : c.card }]}>
                  <Text style={[styles.chipText, { color: on ? c.bg : c.ink }]}>{t(ch.label)}</Text>
                </Pressy>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const tileW = (pageWidth - 10) / 2;
  const renderItem = ({ item }: { item: Item }) => {
    if (item.k === 'room') return <View style={styles.cell}><RoomCard r={item.r} /></View>;
    if (item.k === 'popular') {
      return (
        <View style={[styles.cell, { gap: 6 }]}>
          <View style={styles.popLabel}>
            <Icon name="spark" size={13} color={c.tintText} strokeWidth={2.2} />
            <Text style={[styles.label, { color: c.tintText }]}>{t('Popular lesson').toLocaleUpperCase()}</Text>
          </View>
          <View style={{ alignItems: 'center', paddingTop: 4, paddingBottom: 6 }}>
            <LessonCircle x={item.r} kind="room" size={210} big />
          </View>
        </View>
      );
    }
    if (item.k === 'tiles') {
      return (
        <View style={[styles.cell, { flexDirection: 'row', gap: 10 }]}>
          <View style={{ width: tileW }}><LiveTile x={item.a} /></View>
          {item.b ? <View style={{ width: tileW }}><LiveTile x={item.b} /></View> : null}
        </View>
      );
    }
    if (item.k === 'paidLive') return <View style={styles.cell}><PaidLiveCircle x={item.x} size={Math.min(260, width * 0.72)} /></View>;
    // empty (design B). No button: opening a room arrives in slice 6.
    return mode === 'live'
      ? <EmptyState icon="video" title="No live rooms right now" text="When someone goes live in your languages, it shows here." />
      : <EmptyState icon="mic" title="No talk rooms right now" text="When someone opens a talk room in your languages, it shows here." />;
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={items.slice(0, shown)}
        keyExtractor={(it, i) => (it.k === 'room' || it.k === 'popular' ? it.r.id : it.k === 'tiles' ? it.a.id : it.k === 'paidLive' ? it.x.id : 'q' + i)}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={<View style={{ height: 24 }} />}
        onEndReached={() => setShown((n) => n + 10)}
        onEndReachedThreshold={1.5}
        initialNumToRender={6}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 12, fontSize: 34, fontWeight: '800', letterSpacing: -0.85, lineHeight: 37 },
  pad: { paddingHorizontal: 20 },
  modes: { paddingTop: 16, flexDirection: 'row', gap: 10 },
  mode: { borderWidth: 1.5, borderRadius: 22, paddingTop: 16, paddingBottom: 14, paddingHorizontal: 10, alignItems: 'center', gap: 5 },
  modeTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2, marginTop: 4, textAlign: 'center' },
  modeSub: { fontSize: 12.5, lineHeight: 16, textAlign: 'center' },
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16 },
  segBtn: { height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segText: { fontWeight: '700', fontSize: 13 },
  chips: { gap: 8, paddingHorizontal: 20, paddingVertical: 2 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '700' },
  cell: { paddingHorizontal: 20, marginBottom: 12 },
  popLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1 },
});
