/**
 * Flicks tab: a full-screen vertical feed, one Flick per screen, swipe up/down (CLAUDE.md §5 Flicks).
 *
 * Top bar: Following · For you · Learn (selected = white with a thin underline). The Learn tab adds language chips.
 * Which Flicks show in each tab: see components/flicks/flicksData.ts.
 *
 * Round 2 (NEXT_STEPS §3–4): Flicks start empty, so each tab shows an empty state until real people post.
 * Your round photo (Flicks profile) and the red + (post a Flick) come back with slice 5.
 * Each page is sized from the feed's own measured height (onLayout), never the window, and the feed clips,
 * so a Flick can never draw over the tab bar (founder's iPhone, NEXT_STEPS §2.6).
 */
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../state/store';
import { useT, useLang } from '../../i18n';
import { Pressy } from '../../components/Pressy';
import { EmptyState } from '../../components/EmptyState';
import { FlickPost } from '../../components/flicks/FlickPost';
import { buildFeed, type FeedItem, type FeedTab, type Flick } from '../../components/flicks/flicksData';

const TABS: [FeedTab, string][] = [['following', 'Following'], ['foryou', 'For you'], ['learn', 'Learn']];

export default function FlicksTab() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<FeedTab>('foryou');
  const [height, setHeight] = useState(0);
  const { me, follows, followsMe, chats, myFlicks } = useApp();
  const learning = me.langs.length ? me.langs : [];
  const [learnLang, setLearnLang] = useState(learning[0] ?? '');

  const feed = useMemo(
    () => buildFeed({ tab, myFlicks: myFlicks as unknown as Flick[], follows, followsMe, chats, learnLang }),
    [tab, myFlicks, follows, followsMe, chats, learnLang],
  );

  const render = useCallback(({ item }: { item: FeedItem }) => <FlickPost flick={item.flick} isNew={item.isNew} height={height} />, [height]);

  // Long tab words (French "Abonnements") use a smaller size on small phones (prototype ≤380 px rule).
  const labelChars = TABS.reduce((n, [, l]) => n + t(l).length, 0);
  const small = width < 360 || labelChars * 8.5 + 36 > width - 40;
  const tiny = width < 330;

  return (
    <View style={styles.page} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {height > 0 && feed.length === 0 && (
        <View style={[styles.empty, { paddingTop: insets.top + (tab === 'learn' ? 90 : 60) }]}>
          {tab === 'learn'
            ? <EmptyState onDark icon="mom" title="No Flicks in your learning languages yet." />
            : tab === 'following'
              ? <EmptyState onDark icon="mom" title="No Flicks yet" text="When you and someone follow each other, their Flicks show here." />
              : <EmptyState onDark icon="mom" title="No Flicks yet" text="When people post Flicks, they show here." />}
        </View>
      )}
      {height > 0 && feed.length > 0 && (
        <FlatList
          key={tab + learnLang} // a new tab starts at the top
          data={feed}
          keyExtractor={(it) => it.flick.id}
          renderItem={render}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          getItemLayout={(_d, i) => ({ length: height, offset: height * i, index: i })}
        />
      )}

      {/* top bar over the feed */}
      <View style={[styles.top, { paddingTop: insets.top + (tiny ? 14 : 16), paddingHorizontal: tiny ? 8 : 16 }]} pointerEvents="box-none">
        <View style={[styles.tabs, { gap: tiny ? 8 : small ? 12 : 18 }]}>
          {TABS.map(([k, label]) => (
            <Pressy key={k} scale={0.94} onPress={() => setTab(k)} style={styles.tabBtn} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
              <Text style={[styles.tabText, { fontSize: tiny ? 11.5 : small ? 13 : 15.5 }, tab === k && styles.tabOn]} numberOfLines={1}>{t(label)}</Text>
              {tab === k && <View style={styles.underline} />}
            </Pressy>
          ))}
        </View>
      </View>

      {tab === 'learn' && learning.length > 0 && (
        <View style={[styles.lnrow, { top: insets.top + 66 }]}>
          {learning.map((l) => (
            <Pressy key={l} scale={0.94} onPress={() => setLearnLang(l)} style={[styles.lchip, l === learnLang && styles.lchipOn]}>
              <Text style={[styles.lchipText, l === learnLang && { color: '#1A1418' }]}>{t(l)}</Text>
            </Pressy>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#120812', overflow: 'hidden' },
  empty: { flex: 1, justifyContent: 'center' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 3 },
  tabs: { flex: 1, minWidth: 0, flexDirection: 'row', justifyContent: 'center' },
  tabBtn: { height: 34, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: 'rgba(255,255,255,0.62)', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 },
  tabOn: { color: '#fff' },
  underline: { position: 'absolute', bottom: 2, left: '30%', right: '30%', height: 2.5, borderRadius: 2, backgroundColor: '#fff' },
  lnrow: { position: 'absolute', left: 16, right: 16, zIndex: 3, flexDirection: 'row', gap: 6, alignItems: 'center' },
  lchip: { height: 30, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center' },
  lchipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  lchipText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
