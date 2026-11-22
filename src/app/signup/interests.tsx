/**
 * Sign-up step 7 of 9 — "Interests & hobbies" (prototype step 4, 'ob-int', 'ob-int-add').
 * Search over ~100 interests (A–Z ranked, v94), the 24 most popular shown first, no limit, at least one.
 * If the search finds nothing exact, people can add their own ("+ Add “…”").
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import lists from '../../data/generated/lists.json';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { RedChip, SearchBox, SectionLabel } from '../../components/signup/RedPieces';
import { rankSearch } from '../../components/signup/search';
import { goNext } from '../../components/signup/flow';

export default function InterestsStep() {
  const t = useT();
  const sel = useApp((s) => s.me.interests);
  const update = useApp((s) => s.updateMe);
  const [q, setQ] = useState('');

  const list = q ? rankSearch(lists.interests, q, (x) => t(x), (x) => x, t.lang) : lists.popularInterests;
  const typed = q.trim();
  const canAddOwn = !!typed && !lists.interests.some((x) => x.toLowerCase() === typed.toLowerCase());
  const toggle = (x: string) => { update({ interests: sel.includes(x) ? sel.filter((i) => i !== x) : [...sel, x] }); setQ(''); };
  // interests people typed themselves are shown exactly as written
  const label = (x: string) => (lists.interests.includes(x) ? t(x) : x);

  return (
    <SignupFrame
      step="interests"
      title="Interests & hobbies"
      sub="Pick as many as you like. We use them to suggest partners and Flicks."
      reason={sel.length ? '' : 'Pick at least one interest'}
      onNext={() => goNext('interests')}
      fixed
    >
      {sel.length ? (
        <View style={styles.wrap}>
          {sel.map((x) => <RedChip key={x} raw on label={`${label(x)} ✕`} onPress={() => toggle(x)} />)}
        </View>
      ) : null}
      <SearchBox value={q} onChange={setQ} placeholder="Search interests and hobbies" />
      <SectionLabel text={q ? 'Results' : 'Most popular'} />
      <ScrollView style={styles.box} contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        {list.map((x) => <RedChip key={x} raw label={label(x)} on={sel.includes(x)} onPress={() => toggle(x)} />)}
        {canAddOwn ? <RedChip raw label={`+ ${t('Add')} “${typed}”`} onPress={() => toggle(typed)} /> : null}
      </ScrollView>
    </SignupFrame>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' },
  box: { flex: 1, minHeight: 78 },
});
