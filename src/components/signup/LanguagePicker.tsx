/**
 * Picking languages on the red sign-up screens (prototype langPick()):
 * the chosen languages as white chips with ✕, a search box over all 50 languages (A–Z ranked, v94),
 * then "Popular" (or "Results") chips. A language can't be both spoken and learned: the other list's
 * languages are left out. Up to 3 per list. The list scrolls inside its own box (v87).
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import lists from '../../data/generated/lists.json';
import { langName, useT } from '../../i18n';
import { toast } from '../Toast';
import { RedChip, SearchBox, SectionLabel } from './RedPieces';
import { rankSearch } from './search';

type Props = {
  selected: string[];
  /** languages in the other list (spoken vs learning), hidden here */
  exclude: string[];
  onChange: (next: string[]) => void;
  /** hide the chips of chosen languages (the learning step shows them as level cards instead) */
  hideSelected?: boolean;
  autoFocus?: boolean;
};

export function LanguagePicker({ selected, exclude, onChange, hideSelected }: Props) {
  const t = useT();
  const [q, setQ] = useState('');
  const shown = (l: string) => langName(l, t.lang);
  const list = (q ? rankSearch(lists.languages, q, shown, (l) => l, t.lang) : lists.popularLanguages).filter((l) => !exclude.includes(l));

  const toggle = (l: string) => {
    setQ('');
    if (selected.includes(l)) return onChange(selected.filter((x) => x !== l));
    if (selected.length >= 3) return toast('You can choose up to 3');
    onChange([...selected, l]);
  };

  return (
    <>
      {selected.length && !hideSelected ? (
        <View style={styles.wrap}>
          {selected.map((l) => <RedChip key={l} raw on label={`${shown(l)} ✕`} a11y={shown(l)} onPress={() => toggle(l)} />)}
        </View>
      ) : null}
      <SearchBox value={q} onChange={setQ} placeholder="Search all languages" />
      <SectionLabel text={q ? 'Results' : 'Popular'} />
      <ScrollView style={styles.box} contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        {list.slice(0, 30).map((l) => <RedChip key={l} raw label={shown(l)} on={selected.includes(l)} onPress={() => toggle(l)} />)}
        {!list.length ? <Text style={styles.none}>{t('No language found')}</Text> : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' },
  box: { flex: 1, minHeight: 78 },
  none: { color: 'rgba(255,255,255,0.86)', fontSize: 14 },
});
