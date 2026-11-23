/**
 * Rooms → Lessons (decided 2 Nov 2026, "Lessons, final look"):
 *   one quiet line "Small lessons with checked teachers. £0.99 · How it works ›",
 *   tabs Happening now (N) · Schedule (N),
 *   Happening now: language chips + teacher circles, two per row,
 *   Schedule: a 7-day strip (red count on days with lessons), language + time-of-day chips,
 *             a row of teacher faces (All · Following · each teacher), that day's lessons sorted by time.
 * Reserving and joining (€0.99 with Apple) arrive in slice 10; until then lessons are shown but not tappable.
 * With no lessons at all (the Live world starts empty) the page is one empty state.
 */
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useT, useLang } from '../../i18n';
import { useApp } from '../../state/store';
import { useColors, useScheme } from '../../theme/colors';
import { PEOPLE } from '../../data/people';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Pressy } from '../Pressy';
import { EmptyState } from '../EmptyState';
import { Tap } from './Tap';
import { LessonCircle } from './LessonCircle';
import { localeOf, money } from './money';
import { LESSONS, lessonDate, lessonsNow, timeOfDay, weekDays, type Lesson } from './roomsData';

type Filters = { lang: string; tod: 'any' | 'morning' | 'afternoon' | 'evening'; teacher: string };

export function Lessons({ mode, width }: { mode: 'talk' | 'live'; width: number }) {
  const t = useT();
  const lang = useLang();
  const c = useColors();
  const dark = useScheme() === 'dark';
  const me = useApp((s) => s.me);
  const follows = useApp((s) => s.follows);
  const cc = me.cc;
  const learn = me.langs;
  const [tab, setTab] = useState<'now' | 'plan'>('now');
  const [F, setF] = useState<Filters>({ lang: 'mine', tod: 'any', teacher: '' });
  const [dayPick, setDayPick] = useState<number | null>(null);

  const langOk = (l: string) => F.lang === 'all' || (F.lang === 'mine' ? learn.includes(l) : l === F.lang);
  const now = lessonsNow(langOk, mode);
  const days = weekDays();
  const key = (d: Date) => d.toDateString();
  const base = useMemo(() => LESSONS.filter((x) => lessonDate(x).getTime() > Date.now() - 30 * 60000), []);
  const fil = base.filter((x) => langOk(x.l) && (F.tod === 'any' || timeOfDay(x) === F.tod) && (!F.teacher || (F.teacher === '@f' ? follows[x.host] : x.host === F.teacher)));
  const count: Record<string, number> = {};
  fil.forEach((x) => { const k = key(lessonDate(x)); count[k] = (count[k] || 0) + 1; });
  let di = dayPick;
  if (di == null || !days[di]) { di = days.findIndex((d) => count[key(d)]); if (di < 0) di = 0; }
  const dayList = fil.filter((x) => key(lessonDate(x)) === key(days[di!])).sort((a, b) => a.time.localeCompare(b.time));
  const next = [...fil].sort((a, b) => lessonDate(a).getTime() - lessonDate(b).getTime())[0];
  const teachers = [...new Set(base.map((x) => x.host))];
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => { try { return new Intl.DateTimeFormat(localeOf(lang), o).format(d); } catch { return d.toDateString(); } };
  const todayWord = ({ en: 'Today', fr: 'Auj.', es: 'Hoy', pt: 'Hoje', de: 'Heute', it: 'Oggi', ja: '今日', ar: 'اليوم' } as const)[lang];
  const wk = (d: Date) => lang === 'ar' ? ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'][d.getDay()] : fmt(d, { weekday: 'short' });
  const set = (k: keyof Filters, v: string) => { setF({ ...F, [k]: v }); setDayPick(null); };

  const chip = (k: keyof Filters, v: string, label: string) => (
    <Pressy key={k + v} scale={0.94} onPress={() => set(k, v)} style={[styles.fchip, { borderColor: F[k] === v ? c.ink : c.line, backgroundColor: F[k] === v ? c.ink : 'transparent' }]}>
      <Text style={[styles.fchipText, { color: F[k] === v ? c.bg : c.ink }]}>{t(label)}</Text>
    </Pressy>
  );
  const langChips = [chip('lang', 'mine', 'My languages'), ...learn.map((l) => chip('lang', l, l)), chip('lang', 'all', 'All languages')];
  const circle = Math.floor((width - 12) / 2);

  // nothing happening and nothing planned: one empty state (design B, 23 Nov 2026)
  if (!now.length && !base.length) {
    return <EmptyState icon="cal" title="No lessons live right now" text="Nothing planned yet in your languages." style={{ paddingVertical: 28 }} />;
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.quiet}>
        <Text style={[styles.quietText, { color: c.muted }]}>{t('Small lessons with checked teachers.')} <Text style={{ color: c.ink, fontWeight: '700' }}>{money(0.99, cc, lang)}</Text></Text>
      </View>

      <View style={[styles.seg, { backgroundColor: dark ? 'rgba(118,118,128,0.24)' : c.chip }]}>
        {([['now', 'clock', 'Happening now', now.length], ['plan', 'cal', 'Schedule', fil.length]] as const).map(([k, icon, label, n]) => {
          const on = tab === k;
          return (
            <View key={k} style={{ flex: 1 }}><Pressy scale={0.97} onPress={() => setTab(k)} style={[styles.segBtn, on && { backgroundColor: dark ? '#5A5A63' : c.cardStrong, boxShadow: '0 1px 3px rgba(0,0,0,0.10)' }]}>
              <Icon name={icon} size={15} color={on ? c.ink : c.muted} />
              <Text style={[styles.segText, { color: on ? c.ink : c.muted }]} numberOfLines={1}>{t(label)}</Text>
              <Text style={[styles.segCount, { color: on ? c.ink : c.muted }]}>{n}</Text>
            </Pressy></View>
          );
        })}
      </View>

      {tab === 'now' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fil} style={{ marginHorizontal: -20 }}>{langChips}</ScrollView>
          {now.length ? (
            <>
              <View style={styles.grid}>
                {now.map(({ kind, x }) => <LessonCircle key={x.id} x={x} kind={kind} size={circle} />)}
              </View>
              <Text style={[styles.hint, { color: c.muted }]}>{t('Tap a lesson to see the teacher and what you’ll practise.')}</Text>
            </>
          ) : (
            <View style={[styles.sec, { backgroundColor: dark ? '#141418' : '#FAFAFB', borderColor: c.line, alignItems: 'center', paddingVertical: 22 }]}>
              <View style={[styles.ldot, { opacity: 0.5 }]} />
              <Text style={{ color: c.ink, fontWeight: '700', fontSize: 15 }}>{t('No lesson is happening right now')}</Text>
              {next ? <Text style={{ color: c.muted, fontSize: 13.5, textAlign: 'center' }}>{`${t('Next lesson')}: ${next.title} · ${fmt(lessonDate(next), { weekday: 'short' })} ${next.time}`}</Text> : null}
              <Pressy scale={0.94} onPress={() => setTab('plan')} style={[styles.smallBtn]}><Text style={styles.smallBtnText}>{t('See the schedule')}</Text></Pressy>
            </View>
          )}
        </>
      ) : (
        <View style={[styles.sec, { backgroundColor: dark ? '#141418' : '#FAFAFB', borderColor: c.line, gap: 12 }]}>
          <View style={styles.strip}>
            {days.map((d, i) => {
              const n = count[key(d)] || 0, on = i === di;
              return (
                <View key={i} style={{ flex: 1, minWidth: 0 }}><Pressy scale={0.94} onPress={() => setDayPick(i)} style={[styles.day, on && { backgroundColor: c.ink }, !n && !on && { opacity: 0.45 }]}>
                  <Text style={[styles.dayName, { color: on ? c.bg : c.muted }]} numberOfLines={1}>{i === 0 ? todayWord : wk(d)}</Text>
                  <Text style={[styles.dayNum, { color: on ? c.bg : c.ink }]}>{d.getDate()}</Text>
                  <Text style={[styles.dayCount, n ? { backgroundColor: on ? '#fff' : '#E0101F', color: on ? '#E0101F' : '#fff' } : null]}>{n || ''}</Text>
                </Pressy></View>
              );
            })}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.fil, { paddingHorizontal: 14 }]} style={{ marginHorizontal: -14 }}>
            {langChips}
            <View style={[styles.sep, { backgroundColor: c.line }]} />
            {chip('tod', 'any', 'Any time')}{chip('tod', 'morning', 'Morning')}{chip('tod', 'afternoon', 'Afternoon')}{chip('tod', 'evening', 'Evening')}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 14, paddingVertical: 2 }} style={{ marginHorizontal: -14 }}>
            <Face on={!F.teacher} onPress={() => set('teacher', '')} label={t('All')} icon="people" />
            <Face on={F.teacher === '@f'} onPress={() => set('teacher', '@f')} label={t('Following')} icon="star" />
            {teachers.map((id) => <Face key={id} on={F.teacher === id} onPress={() => set('teacher', id)} label={PEOPLE[id]?.name ?? ''} id={id} />)}
          </ScrollView>
          <View style={styles.dayHead}>
            <Text style={[styles.dayTitle, { color: c.ink }]}>{fmt(days[di], { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            <Text style={{ color: c.muted }}>{dayList.length}</Text>
          </View>
          {dayList.length ? dayList.map((x) => <LessonRow key={x.id} x={x} />) : (
            <Text style={[styles.empty, { color: c.muted }]}>
              {t('No lessons this day with these filters.')}{' '}
              {next ? <Text style={{ color: c.brandText, fontWeight: '700' }} onPress={() => setDayPick(days.findIndex((d) => key(d) === key(lessonDate(next))))}>{t('See the next one ›')}</Text> : null}
            </Text>
          )}
          <Text style={[styles.hint, { color: c.muted, textAlign: 'auto' }]}>{t('Reserve your seat now. You’ll get a reminder 10 minutes before.')}</Text>
        </View>
      )}
    </View>
  );
}

function Face({ on, onPress, label, icon, id }: { on: boolean; onPress: () => void; label: string; icon?: 'people' | 'star'; id?: string }) {
  const c = useColors();
  return (
    <Pressy scale={0.94} onPress={onPress} style={styles.face}>
      <View style={[{ borderRadius: 999 }, on && { boxShadow: '0 0 0 2.5px #E0101F' }]}>
        {id ? <Avatar id={id} size={44} noFlag /> : <View style={[styles.faceAll, { backgroundColor: c.chip }]}><Icon name={icon!} size={20} color={c.ink} /></View>}
      </View>
      <Text style={[styles.faceText, { color: on ? '#E0101F' : c.ink, fontWeight: on ? '800' : '600' }]} numberOfLines={1}>{label}</Text>
    </Pressy>
  );
}

/** One planned lesson: time circle · title · teacher ✓ · language · level · seats left · price. */
function LessonRow({ x }: { x: Lesson }) {
  const t = useT();
  const lang = useLang();
  const c = useColors();
  const cc = useApp((s) => s.me.cc);
  const left = x.seats - x.booked;
  return (
    <Tap style={[styles.row, { backgroundColor: c.chip }]}>
      <View style={[styles.time, { backgroundColor: c.ink }]}>
        <Text style={[styles.timeText, { color: c.bg }]}>{x.time}</Text>
        <Text style={[styles.timeMins, { color: c.bg }]}>{`${x.mins} min`}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text style={[styles.rowTitle, { color: c.ink }]} numberOfLines={2}>{x.title}</Text>
        <View style={styles.rowSub}>
          <Avatar id={x.host} size={20} noFlag />
          <Text style={[styles.rowHost, { color: c.ink }]}>{PEOPLE[x.host]?.name}</Text>
          <View style={styles.vt}><Icon name="check" size={10} color="#fff" strokeWidth={3.2} /></View>
          <Icon name={x.mode === 'live' ? 'video' : 'mic'} size={12} color={c.muted} strokeWidth={2.2} />
          <Text style={[styles.rowMeta, { color: c.muted }]} numberOfLines={1}>{`${x.lang} · ${x.level}`}</Text>
        </View>
        <Text style={[styles.rowSeat, { color: c.muted }]}>{t(left === 1 ? '1 seat left' : `${left} seats left`)}</Text>
      </View>
      <View style={styles.tprice}><Text style={styles.tpriceText}>{money(0.99, cc, lang)}</Text></View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  quiet: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 2 },
  quietText: { flex: 1, fontSize: 14, lineHeight: 18 },
  lnk: { fontWeight: '700', fontSize: 13.5, padding: 4 },
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16 },
  segBtn: { height: 38, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  segText: { fontWeight: '700', fontSize: 14, flexShrink: 1 },
  segCount: { fontSize: 11.5, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 1, borderRadius: 9, overflow: 'hidden', backgroundColor: 'rgba(127,127,140,0.18)' },
  fil: { gap: 6, paddingHorizontal: 20 },
  fchip: { height: 32, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  fchipText: { fontWeight: '600', fontSize: 13 },
  sep: { width: 1, marginVertical: 4, marginHorizontal: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14, paddingTop: 6 },
  hint: { fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
  sec: { padding: 14, borderRadius: 24, borderWidth: 1, gap: 10 },
  ldot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#E0101F', boxShadow: '0 0 0 4px rgba(224,16,31,0.15)' },
  smallBtn: { height: 42, borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center', backgroundImage: 'linear-gradient(180deg, #EE1626, #D90D1C)' },
  smallBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  strip: { flexDirection: 'row', gap: 4 },
  day: { borderRadius: 14, paddingTop: 6, paddingBottom: 4, alignItems: 'center', gap: 2 },
  dayName: { fontSize: 11, fontWeight: '700' },
  dayNum: { fontSize: 18, fontWeight: '800' },
  dayCount: { height: 14, minWidth: 14, fontSize: 10, fontWeight: '800', borderRadius: 7, paddingHorizontal: 4, lineHeight: 14, overflow: 'hidden', textAlign: 'center' },
  face: { width: 52, alignItems: 'center', gap: 4 },
  faceAll: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  faceText: { fontSize: 11, maxWidth: 52 },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingTop: 4 },
  dayTitle: { flex: 1, fontSize: 16, fontWeight: '700', textTransform: 'capitalize' },
  empty: { paddingVertical: 18, paddingHorizontal: 8, textAlign: 'center', fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12 },
  time: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #E0101F' },
  timeText: { fontSize: 15, fontWeight: '800' },
  timeMins: { fontSize: 10.5, opacity: 0.7 },
  rowTitle: { fontSize: 14.5, fontWeight: '700', lineHeight: 18 },
  rowSub: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  rowHost: { fontSize: 12.5, fontWeight: '700' },
  vt: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#2F80ED', alignItems: 'center', justifyContent: 'center' },
  rowMeta: { fontSize: 12, flexShrink: 1 },
  rowSeat: { fontSize: 12 },
  tprice: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, backgroundColor: '#16161D' },
  tpriceText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
