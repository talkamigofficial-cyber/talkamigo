/**
 * Flicks tab: a full-screen vertical feed, one Flick per screen, swipe up/down (CLAUDE.md §5 Flicks).
 *
 * Top bar: Following · For you · Learn (selected = white with a thin underline), your round photo
 * (Flicks profile) and the red + (post a Flick). The Learn tab adds language chips and "N done today".
 * Which Flicks show in each tab: see components/flicks/flicksData.ts.
 */
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../state/store';
import { useT, useLang } from '../../i18n';
import { Avatar } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { Pressy } from '../../components/Pressy';
import { comingSoon } from '../../components/Toast';
import { BRAND_GRADIENT } from '../../theme/colors';
import { FlickPost } from '../../components/flicks/FlickPost';
import { EmptyFlick, LiveFlickCard, PromoFlick } from '../../components/flicks/FeedCards';
import { buildFeed, type FeedItem, type FeedTab, type Flick } from '../../components/flicks/flicksData';
import { TourTarget } from '../../components/tour/TourTarget';

const TABS: [FeedTab, string][] = [['following', 'Following'], ['foryou', 'For you'], ['learn', 'Learn']];

export default function FlicksTab() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<FeedTab>('foryou');
  const [height, setHeight] = useState(0);
  const { me, follows, followsMe, chats, myFlicks, plan } = useApp();
  const learning = me.langs.length ? me.langs : [];
  const [learnLang, setLearnLang] = useState(learning[0] ?? '');

  const feed = useMemo(
    () => buildFeed({ tab, myFlicks: myFlicks as unknown as Flick[], follows, followsMe, chats, learnLang, plan }),
    [tab, myFlicks, follows, followsMe, chats, learnLang, plan],
  );

  const render = useCallback(({ item }: { item: FeedItem }) => {
    if (item.type === 'flick') return <FlickPost flick={item.flick} isNew={item.isNew} height={height} />;
    if (item.type === 'live') return <LiveFlickCard card={item.card} height={height} />;
    if (item.type === 'promo') return <PromoFlick height={height} />;
    return <EmptyFlick text={item.text} height={height} />;
  }, [height]);

  // The three tabs share the row with two 44 pt buttons. Long words (French "Abonnements") don't fit at full size,
  // so use the compact style when they wouldn't fit, not only on small phones (prototype ≤380 px rule, made general).
  const labelChars = TABS.reduce((n, [, l]) => n + t(l).length, 0);
  const small = width < 380 || labelChars * 8.5 + 36 > width - 132;
  const tiny = width < 340;

  return (
    <View style={styles.page} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {height > 0 && (
        <FlatList
          key={tab + learnLang} // a new tab starts at the top
          data={feed}
          keyExtractor={(it, i) => (it.type === 'flick' ? it.flick.id : it.type === 'live' ? 'live-' + it.card.id : it.type + i)}
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
      <View style={[styles.top, { paddingTop: insets.top + (tiny ? 14 : 16), paddingHorizontal: tiny ? 8 : small ? 10 : 16, gap: tiny ? 3 : small ? 4 : 6 }]} pointerEvents="box-none">
        <View style={[styles.tabs, { gap: tiny ? 6 : small ? 10 : 18, justifyContent: small ? 'flex-start' : 'center' }]}>
          {TABS.map(([k, label]) => (
            <Pressy key={k} scale={0.94} onPress={() => setTab(k)} style={styles.tabBtn} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
              <Text style={[styles.tabText, { fontSize: tiny ? 11.5 : small ? 13 : 15.5 }, tab === k && styles.tabOn]} numberOfLines={1}>{t(label)}</Text>
              {tab === k && <View style={styles.underline} />}
            </Pressy>
          ))}
        </View>
        <Pressy scale={0.9} onPress={comingSoon} style={[styles.ibtn, styles.profBtn, tiny && styles.ibtnTiny]} accessibilityLabel={t('My Flicks profile')}>
          <View style={styles.profRing}><Avatar id="me" size={30} noFlag /></View>
        </Pressy>
        <TourTarget id="flicks-post">
          <Pressy scale={0.9} onPress={comingSoon} style={[styles.ibtn, styles.solid, tiny && styles.ibtnTiny]} accessibilityLabel={t('Post a Flick')}>
            <Icon name="plus" size={21} color="#fff" />
          </Pressy>
        </TourTarget>
      </View>

      {tab === 'learn' && learning.length > 0 && (
        <View style={[styles.lnrow, { top: insets.top + 66 }]}>
          {learning.map((l) => (
            <Pressy key={l} scale={0.94} onPress={() => setLearnLang(l)} style={[styles.lchip, l === learnLang && styles.lchipOn]}>
              <Text style={[styles.lchipText, l === learnLang && { color: '#1A1418' }]}>{t(l)}</Text>
            </Pressy>
          ))}
          <View style={styles.lday}>
            <Icon name="check" size={14} color="#4ADE80" strokeWidth={3} />
            <Text style={styles.ldayText}>{t('0 done today')}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#120812' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 3 },
  tabs: { flex: 1, minWidth: 0, flexDirection: 'row' },
  tabBtn: { height: 34, minWidth: 44, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: 'rgba(255,255,255,0.62)', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 },
  tabOn: { color: '#fff' },
  underline: { position: 'absolute', bottom: 2, left: '30%', right: '30%', height: 2.5, borderRadius: 2, backgroundColor: '#fff' },
  ibtn: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  ibtnTiny: { width: 34, height: 34 },
  profBtn: { backgroundColor: 'rgba(0,0,0,0.25)', overflow: 'hidden' },
  profRing: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 999 },
  solid: { backgroundImage: BRAND_GRADIENT, boxShadow: '0 8px 20px rgba(224,16,31,0.35)' },
  lnrow: { position: 'absolute', left: 16, right: 16, zIndex: 3, flexDirection: 'row', gap: 6, alignItems: 'center' },
  lchip: { height: 30, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center' },
  lchipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  lchipText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  lday: { marginStart: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.9 },
  ldayText: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
});
