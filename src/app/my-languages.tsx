/**
 * My languages (decided 2 Nov 2026, prototype vMyLangs) — on the red sign-up background.
 *  I speak natively: 1–3, the first is "Main". I'm learning: up to 3 (Plus: 5), each with a level A1–C2;
 *  ↑ moves one up; × removes (at least one of each must stay).
 *  A language can't be both: adding a learning language as native moves it across (with a short note).
 *  Changes are a DRAFT until Done. Leaving with changes (back button or iPhone swipe) asks:
 *  Save changes / Discard / Keep editing.
 */
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, usePreventRemove, useNavigation } from 'expo-router';
import lists from '../data/generated/lists.json';
import { useApp, type Level } from '../state/store';
import { langName, useT } from '../i18n';
import { onRed } from '../theme/colors';
import { Screen } from '../components/Screen';
import { Icon } from '../components/Icon';
import { Pressy } from '../components/Pressy';
import { Button } from '../components/Button';
import { Sheet } from '../components/Sheet';
import { T } from '../components/T';
import { toast } from '../components/Toast';
import { LEVELS } from '../components/me/helpers';

type Draft = { natives: string[]; langs: string[]; levels: Record<string, Level> };

/** Search like the prototype's qRank (v94): starts-with first, then a word starting with it, then contains; A–Z; accents ignored. */
function searchLanguages(all: string[], q: string, nameOf: (l: string) => string): string[] {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const n = norm(q.trim());
  if (!n) return all;
  const rank = (l: string) => {
    const a = norm(nameOf(l)), b = norm(l);
    if (a.startsWith(n)) return 0;
    if (a.split(/[\s\-–/(]+/).some((w) => w.startsWith(n))) return 1;
    if (a.includes(n)) return 2;
    if (b.startsWith(n)) return 3;
    if (b.includes(n)) return 4;
    return 9;
  };
  return all.map((l) => [l, rank(l)] as const).filter(([, r]) => r < 9).sort((x, y) => x[1] - y[1] || nameOf(x[0]).localeCompare(nameOf(y[0]))).map(([l]) => l);
}

export default function MyLanguages() {
  const t = useT();
  const me = useApp((s) => s.me);
  const plan = useApp((s) => s.plan);
  const maxLearn = plan === 'standard' ? 3 : 5;
  const [draft, setDraft] = useState<Draft>({ natives: [...me.natives], langs: [...me.langs], levels: { ...me.levels } });
  const [open, setOpen] = useState<'' | 'speak' | 'learn'>('');
  const [query, setQuery] = useState('');
  const [askLeave, setAskLeave] = useState(false);
  const navigation = useNavigation();

  const dirty = JSON.stringify(draft.natives) !== JSON.stringify(me.natives) || JSON.stringify(draft.langs) !== JSON.stringify(me.langs) || draft.langs.some((l) => (draft.levels[l] ?? 'A1') !== (me.levels[l] ?? 'A1'));
  const [leaving, setLeaving] = useState(false);

  // back button or iPhone swipe-back with unsaved changes → ask first
  usePreventRemove(dirty && !leaving, () => setAskLeave(true));

  const name = (l: string) => langName(l, t.lang);

  const save = () => {
    const levels = { ...me.levels, ...draft.levels };
    draft.langs.forEach((l) => { if (!levels[l]) levels[l] = 'A1'; });
    useApp.getState().updateMe({ natives: draft.natives, langs: draft.langs, levels });
    setLeaving(true);
    setAskLeave(false);
    setTimeout(() => (navigation.canGoBack() ? router.back() : router.replace('/me')), 0);
    toast('Languages updated everywhere', { icon: 'check' });
  };
  const discard = () => {
    setLeaving(true);
    setAskLeave(false);
    setTimeout(() => (navigation.canGoBack() ? router.back() : router.replace('/me')), 0);
  };

  const add = (kind: 'speak' | 'learn', l: string) => {
    const d = { natives: [...draft.natives], langs: [...draft.langs], levels: { ...draft.levels } };
    if (kind === 'speak') {
      if (d.natives.length >= 3) { toast('You can choose up to 3'); return; }
      if (d.langs.includes(l)) {
        if (d.langs.length <= 1) { toast('Add another language to learn first'); return; }
        d.langs = d.langs.filter((x) => x !== l);
        toast(`Moved ${l} to native`);
      }
      d.natives.push(l);
    } else {
      if (d.langs.length >= maxLearn) { toast(`You can choose up to ${maxLearn}`); return; }
      if (d.natives.includes(l)) {
        if (d.natives.length <= 1) { toast('You need at least one native language'); return; }
        d.natives = d.natives.filter((x) => x !== l);
        toast(`Moved ${l} to learning`);
      }
      d.langs.push(l);
      if (!d.levels[l]) d.levels[l] = 'A1';
    }
    setDraft(d);
    setOpen('');
    setQuery('');
  };
  const remove = (kind: 'speak' | 'learn', l: string) => {
    if (kind === 'speak' && draft.natives.length > 1) setDraft({ ...draft, natives: draft.natives.filter((x) => x !== l) });
    if (kind === 'learn' && draft.langs.length > 1) setDraft({ ...draft, langs: draft.langs.filter((x) => x !== l) });
  };
  const moveUp = (l: string) => {
    const i = draft.langs.indexOf(l);
    if (i <= 0) return;
    const langs = [...draft.langs];
    langs.splice(i, 1);
    langs.splice(i - 1, 0, l);
    setDraft({ ...draft, langs });
  };

  const results = useMemo(() => {
    if (!open) return [];
    const chosen = open === 'speak' ? draft.natives : draft.langs;
    const base = query.trim() ? searchLanguages(lists.languages, query, name) : lists.popularLanguages;
    return base.filter((l) => !chosen.includes(l)).slice(0, 24);
  }, [open, query, draft, t.lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const adder = (kind: 'speak' | 'learn', label: string, count: number, max: number) => {
    if (open === kind) {
      return (
        <View style={styles.adder}>
          <View style={styles.search}>
            <Icon name="search" size={18} color="#8A8A95" />
            <TextInput value={query} onChangeText={setQuery} autoFocus placeholder={t('Search all languages')} placeholderTextColor="#9A9AA5" style={styles.searchInput} autoCorrect={false} />
          </View>
          <View style={styles.results}>
            {results.length ? results.map((l) => {
              const other = kind === 'speak' ? draft.langs.includes(l) : draft.natives.includes(l);
              return (
                <Pressy key={l} onPress={() => add(kind, l)} scale={0.94} style={styles.chip}>
                  <Text style={styles.chipText}>{name(l)}{other ? <Text style={styles.chipNote}> {t(kind === 'speak' ? 'learning' : 'native')}</Text> : null}</Text>
                </Pressy>
              );
            }) : <T style={{ color: 'rgba(255,255,255,0.86)', fontSize: 13.5 }}>No language found</T>}
          </View>
          <Pressy onPress={() => setOpen('')} scale={0.94} style={{ alignSelf: 'center', padding: 6 }}><T style={{ color: '#fff', fontWeight: '800' }}>Close</T></Pressy>
        </View>
      );
    }
    if (count >= max) {
      return <T style={styles.max}>{kind === 'speak' ? 'Up to 3 native languages' : 'Up to 5 languages'}</T>;
    }
    return (
      <Pressy onPress={() => { setOpen(kind); setQuery(''); }} scale={0.97} style={styles.addBtn}>
        <Text style={styles.addText}>+ {t(label)}</Text>
      </Pressy>
    );
  };

  return (
    <Screen red>
      <View style={styles.head}>
        <Pressy onPress={() => router.back()} scale={0.9} style={styles.back} accessibilityLabel="Back"><Icon name="back" size={24} color="#fff" strokeWidth={2.4} /></Pressy>
        <T style={styles.title}>My languages</T>
        <Pressy onPress={save} disabled={!dirty} scale={0.94} style={{ paddingHorizontal: 4, paddingVertical: 6, minWidth: 44 }}>
          <T style={{ fontWeight: '800', fontSize: 16, color: dirty ? '#fff' : 'rgba(255,255,255,0.75)' }}>Done</T>
        </Pressy>
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <T style={styles.h3}>I speak natively</T>
        <T style={styles.hint}>Your main one shows on your profile and decides who sees you as a partner.</T>
        <View style={styles.card}>
          {draft.natives.map((l, i) => (
            <View key={l} style={styles.row}>
              <Text style={styles.tag}>{i === 0 ? t('Main').toLocaleUpperCase(t.lang) : ''}</Text>
              <Text style={styles.lang}>{name(l)}</Text>
              <View style={styles.greenBar} />
              {draft.natives.length > 1 && <RoundX onPress={() => remove('speak', l)} label={`Remove ${l}`} />}
            </View>
          ))}
          {adder('speak', 'Add a native language', draft.natives.length, 3)}
        </View>

        <T style={[styles.h3, { marginTop: 12 }]}>I’m learning</T>
        <T style={styles.hint}>Pick your level for each one. The first is your main language for Flicks, rooms and lessons.</T>
        <View style={styles.card}>
          {draft.langs.map((l, i) => {
            const lv = draft.levels[l] ?? 'A1';
            return (
              <View key={l} style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: 8, paddingVertical: 12 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={styles.tag}>{t(`Learning ${i + 1}`).toLocaleUpperCase(t.lang)}</Text>
                  <Text style={[styles.lang, { flex: 1 }]}>{name(l)}</Text>
                  {i > 0 && (
                    <Pressy onPress={() => moveUp(l)} scale={0.9} style={styles.roundBtn} accessibilityLabel="Move up">
                      <View style={{ transform: [{ rotate: '-90deg' }] }}><Icon name="chev" size={15} color="#fff" /></View>
                    </Pressy>
                  )}
                  {draft.langs.length > 1 && <RoundX onPress={() => remove('learn', l)} label={`Remove ${l}`} />}
                </View>
                <View style={styles.seg}>
                  {LEVELS.map((x) => (
                    <View key={x} style={{ flex: 1 }}>
                      <Pressy onPress={() => setDraft({ ...draft, levels: { ...draft.levels, [l]: x } })} scale={0.94} style={[styles.segBtn, lv === x && styles.segOn]} accessibilityState={{ selected: lv === x }}>
                        <Text style={[styles.segText, lv === x && { color: onRed.buttonText }]}>{x}</Text>
                      </Pressy>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
          {adder('learn', 'Add a language', draft.langs.length, maxLearn)}
        </View>

        <View style={styles.note}>
          <Icon name="info" size={17} color="rgba(255,255,255,0.92)" />
          <Text style={styles.noteText}>{t('Nothing changes until you tap Done.')} {t('Then your profile, Connect, rooms, lessons, Flicks and translations all update at once.')}</Text>
        </View>
      </ScrollView>

      <Sheet visible={askLeave} onClose={() => setAskLeave(false)} title="Save your language changes?">
        <T style={{ fontSize: 14, color: '#6B6B76' }}>If you leave now, nothing changes.</T>
        <Button title="Save changes" onPress={save} />
        <Button kind="glass" title="Discard" onPress={discard} />
        <Pressy onPress={() => setAskLeave(false)} scale={0.94} style={{ alignSelf: 'center', padding: 8 }}><T style={{ fontWeight: '800' }}>Keep editing</T></Pressy>
      </Sheet>
    </Screen>
  );
}

function RoundX({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressy onPress={onPress} scale={0.9} style={styles.roundBtn} accessibilityLabel={label}>
      <Icon name="close" size={15} color="#fff" />
    </Pressy>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 8, paddingStart: 4, paddingEnd: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  back: { width: 34, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 17, fontWeight: '800' },
  body: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  h3: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8, marginHorizontal: 2 },
  hint: { color: 'rgba(255,255,255,0.86)', fontSize: 13, lineHeight: 18, marginHorizontal: 2, marginTop: -4, marginBottom: 2 },
  card: { borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.18)' },
  tag: { fontSize: 11.5, fontWeight: '700', color: 'rgba(255,255,255,0.86)', letterSpacing: 0.4 },
  lang: { color: '#fff', fontSize: 16, fontWeight: '800', flex: 1 },
  greenBar: { width: 30, height: 4, borderRadius: 2, backgroundColor: '#16A34A' },
  roundBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)' },
  segBtn: { height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(60,0,40,0.18)' },
  segText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  addBtn: { minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  max: { textAlign: 'center', padding: 16, fontSize: 13, color: 'rgba(255,255,255,0.86)' },
  adder: { gap: 10, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  search: { height: 46, borderRadius: 14, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 16, color: '#16161D', height: '100%' },
  results: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center' },
  chipText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  chipNote: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.14)' },
  noteText: { flex: 1, color: 'rgba(255,255,255,0.92)', fontSize: 13, lineHeight: 19 },
});
