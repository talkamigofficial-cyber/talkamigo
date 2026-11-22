/**
 * Sign-up step 3 of 9 — "Where are you from?" (prototype vOnboard() step 1, 'ob-cc').
 * Search over every country (A–Z ranked, v94); popular countries before typing. Once picked, the list
 * collapses to that country, then an optional City field (example = that country's capital, v51) and
 * "Show my city on my profile". Picking a country pre-selects its main language for the next step,
 * until the person changes their languages themselves (v51). The country sets the flag and currency.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/store';
import { countryName, useT } from '../../i18n';
import lists from '../../data/generated/lists.json';
import { emojiFlag } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { Pressy } from '../../components/Pressy';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { SearchBox, SectionLabel, WhiteInput } from '../../components/signup/RedPieces';
import { rankSearch } from '../../components/signup/search';
import { goNext, signupSession } from '../../components/signup/flow';

const ALL = lists.countries.map((c) => c.code);
const EN_NAME = Object.fromEntries(lists.countries.map((c) => [c.code, c.name]));
const CAPITAL = lists.capitals as Record<string, string>;
const MAIN_LANGUAGE = lists.countryLanguage as Record<string, string>;

/** "e.g." in each language, as the prototype writes it in placeholders. */
const EG: Record<string, string> = { en: 'e.g.', fr: 'ex. :', es: 'p. ej.', pt: 'ex.:', de: 'z. B.', it: 'es.', ja: '例：', ar: 'مثال:' };

export default function CountryStep() {
  const t = useT();
  const me = useApp((s) => s.me);
  const update = useApp((s) => s.updateMe);
  const [q, setQ] = useState('');

  const shown = (cc: string) => countryName(cc, t.lang);
  const list = q ? rankSearch(ALL, q, shown, (cc) => EN_NAME[cc], t.lang) : me.cc ? [me.cc] : lists.popularCountries;

  const pick = (cc: string) => {
    const lang = MAIN_LANGUAGE[cc];
    const patch: Parameters<typeof update>[0] = { cc, city: '' };
    if (lang && !signupSession.nativesTouched && lists.languages.includes(lang)) {
      patch.natives = [lang];
      patch.langs = me.langs.filter((l) => l !== lang);
    }
    update(patch);
    setQ('');
  };

  return (
    <SignupFrame step="country" title="Where are you from?" sub="Your flag shows on your profile picture." reason="" canContinue={!!me.cc} onNext={() => { update({ city: me.city.trim() }); goNext('country'); }} fixed>
      <SearchBox value={q} onChange={setQ} placeholder="Search all countries" />
      <SectionLabel text={q ? 'Results' : me.cc ? 'Selected · search to change' : 'Popular'} />

      <View style={[styles.group, !(me.cc && !q) && styles.grow]}>
        <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          {list.slice(0, 40).map((cc, i) => (
            <Pressy key={cc} onPress={() => pick(cc)} highlight="#F4F4F6" style={[styles.row, i > 0 && styles.rowLine]} accessibilityState={{ selected: me.cc === cc }}>
              <Text style={styles.flag}>{emojiFlag(cc)}</Text>
              <Text style={styles.name} numberOfLines={1}>{shown(cc)}</Text>
              {me.cc === cc ? <Icon name="check" size={20} color="#E0101F" strokeWidth={3} /> : null}
            </Pressy>
          ))}
          {!list.length ? <View style={styles.row}><Text style={[styles.name, { color: '#6B6B76' }]}>{t('No country found')}</Text></View> : null}
        </ScrollView>
      </View>

      {!q && !me.cc ? <Text style={styles.note}>{t('Type the first letters to find any country in the world.')}</Text> : null}

      {me.cc && !q ? (
        <View style={{ gap: 7 }}>
          <Text style={styles.flab}>{t(`City in ${EN_NAME[me.cc]} (optional)`)}</Text>{/* i18n-ignore: translated by the country-name rule in src/i18n */}
          <WhiteInput value={me.city} onChangeText={(city) => update({ city })} maxLength={30} autoComplete="postal-address-locality" placeholder={`${EG[t.lang] ?? 'e.g.'} ${CAPITAL[me.cc] ?? 'Stockholm'}`} />
          <Pressy onPress={() => update({ showCity: !me.showCity })} scale={0.98} style={styles.tickRow} accessibilityRole="checkbox" accessibilityState={{ checked: me.showCity }}>
            <View style={[styles.tick, me.showCity && styles.tickOn]}>{me.showCity ? <Icon name="check" size={14} color="#fff" strokeWidth={3} /> : null}</View>
            <Text style={styles.tickText}>{t('Show my city on my profile')}</Text>
          </Pressy>
        </View>
      ) : null}
    </SignupFrame>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: 22, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.96)', boxShadow: '0 12px 30px rgba(60,0,40,0.18)' },
  grow: { flex: 1, minHeight: 78 },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 },
  rowLine: { borderTopWidth: 1, borderTopColor: '#ECECF0' },
  flag: { fontSize: 24, lineHeight: 30 },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: '#16161D' },
  note: { color: 'rgba(255,255,255,0.86)', fontSize: 13 },
  flab: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.92)' },
  tickRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  tick: { width: 20, height: 20, borderRadius: 5, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  tickOn: { backgroundColor: '#E0101F' },
  tickText: { color: '#fff', fontSize: 14 },
});
