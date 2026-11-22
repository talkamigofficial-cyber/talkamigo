/**
 * The iPhone-style birthday wheel (v87, founder picked option B): three columns day · month · year,
 * month names in the app language. It opens in place under "Birthday" and has its own Done.
 * Nothing is pre-filled on the form (no silent 14 Mar 1999): the birthday stays empty until Done.
 * Years shown: 13 to 100 years ago (the 18+ rule is explained, not hidden).
 * Prototype: bdWheel(), bdSync(), 'bd-open' / 'bd-done'.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useT } from '../../i18n';
import { Pressy } from '../Pressy';

const ROW = 32; // height of one line in the wheel
const VISIBLE = 5; // lines shown (2 above, the chosen one, 2 below)

type Parts = { d: number; m: number; y: number };

function Column({ items, value, onChange, flex, label }: { items: [number, string][]; value: number; onChange: (v: number) => void; flex: number; label: string }) {
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [cur, setCur] = useState(value);
  const index = Math.max(0, items.findIndex(([v]) => v === value));
  useEffect(() => { setTimeout(() => ref.current?.scrollTo({ y: index * ROW, animated: false }), 0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / ROW)));
    setCur(items[i][0]);
    onChange(items[i][0]);
  };
  return (
    <ScrollView
      ref={ref}
      style={{ flex, height: ROW * VISIBLE }}
      contentContainerStyle={{ paddingVertical: ROW * 2 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ROW}
      decelerationRate="fast"
      onMomentumScrollEnd={settle}
      onScrollEndDrag={settle}
      onScroll={(e) => { const i = Math.round(e.nativeEvent.contentOffset.y / ROW); if (items[i] && items[i][0] !== cur) setCur(items[i][0]); }}
      scrollEventThrottle={32}
      accessibilityLabel={label}
      nestedScrollEnabled
    >
      {items.map(([v, l]) => (
        <Text key={v} style={[styles.item, v === cur && styles.itemOn]} numberOfLines={1}>{l}</Text>
      ))}
    </ScrollView>
  );
}

export function BirthdayWheel({ value, onDone }: { value: string | null; onDone: (iso: string) => void }) {
  const t = useT();
  const lang = t.lang;
  const start: Parts = value ? { d: +value.slice(8, 10), m: +value.slice(5, 7), y: +value.slice(0, 4) } : { d: 15, m: 6, y: 2000 };
  const draft = useRef<Parts>(start);

  const { days, months, years } = useMemo(() => {
    const loc = lang === 'ar' ? 'ar-u-nu-latn' : lang;
    const monthName = (i: number) => { try { return new Intl.DateTimeFormat(loc, { month: 'long' }).format(new Date(2000, i, 10)); } catch { return String(i + 1); } };
    const now = new Date().getFullYear();
    const ys: [number, string][] = [];
    for (let y = now - 13; y >= now - 100; y--) ys.push([y, String(y)]);
    return {
      days: Array.from({ length: 31 }, (_, i) => [i + 1, String(i + 1)] as [number, string]),
      months: Array.from({ length: 12 }, (_, i) => [i + 1, monthName(i)] as [number, string]),
      years: ys,
    };
  }, [lang]);

  const done = () => {
    const { d, m, y } = draft.current;
    const last = new Date(y, m, 0).getDate(); // 31 February becomes 28/29
    onDone(`${y}-${String(m).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`);
  };

  return (
    <View style={styles.box}>
      <View style={styles.head}>
        <Text style={styles.headText}>{t('Choose your birthday')}</Text>
        <Pressy onPress={done} style={styles.doneBtn}><Text style={styles.done}>{t('Done')}</Text></Pressy>
      </View>
      <View style={styles.cols}>
        <View style={styles.band} pointerEvents="none" />
        <Column label={t('Day')} items={days} value={start.d} flex={1} onChange={(v) => (draft.current.d = v)} />
        <Column label={t('Month')} items={months} value={start.m} flex={1.6} onChange={(v) => (draft.current.m = v)} />
        <Column label={t('Year')} items={years} value={start.y} flex={1} onChange={(v) => (draft.current.y = v)} />
      </View>
    </View>
  );
}

/** "15 June 2000" in the app language. */
export function formatBirthday(iso: string, lang: string) {
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : lang === 'en' ? 'en-GB' : lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T12:00:00'));
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#F2F2F7', borderRadius: 18, paddingTop: 6, paddingHorizontal: 10, paddingBottom: 10 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingStart: 6, paddingEnd: 4 },
  headText: { fontSize: 14, fontWeight: '600', color: '#16161D' },
  doneBtn: { minHeight: 40, paddingHorizontal: 6, justifyContent: 'center' },
  done: { color: '#E0101F', fontWeight: '800', fontSize: 15 },
  cols: { flexDirection: 'row', height: ROW * VISIBLE },
  band: { position: 'absolute', left: 0, right: 0, top: ROW * 2, height: ROW, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.07)' },
  item: { height: ROW, lineHeight: ROW, textAlign: 'center', fontSize: 16, color: '#8A8A94' },
  itemOn: { color: '#16161D', fontWeight: '700' },
});
