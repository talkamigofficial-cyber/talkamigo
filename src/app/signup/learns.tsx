/**
 * Sign-up step 6 of 9 — "Which languages are you learning?" (prototype step 3, 'ob-lang', 'lvl', 'ob-addl').
 * Up to 3. Each chosen language is a card with its level bar right under it and the level in words
 * ("B1 · I can talk about most topics"); the A1–C2 key sits in the first card (v87).
 * The popular list folds behind "+ Add another language" once one language is chosen.
 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp, type Level } from '../../state/store';
import { langName, useT } from '../../i18n';
import { Pressy } from '../../components/Pressy';
import { Icon } from '../../components/Icon';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { LanguagePicker } from '../../components/signup/LanguagePicker';
import { RedChip } from '../../components/signup/RedPieces';
import { LevelBar, LEVEL_MEANING } from '../../components/signup/LevelBar';
import { goNext } from '../../components/signup/flow';

export default function LearnsStep() {
  const t = useT();
  const me = useApp((s) => s.me);
  const update = useApp((s) => s.updateMe);
  const [adding, setAdding] = useState(false);
  const L = me.langs;

  const setLangs = (langs: string[]) => {
    const levels = { ...me.levels };
    langs.forEach((l) => { if (!levels[l]) levels[l] = 'A1'; }); // a new language starts at A1
    update({ langs, levels });
    setAdding(false);
  };

  return (
    <SignupFrame
      step="learns"
      title="Which languages are you learning?"
      sub={L.length ? 'Up to 3. Pick your level in each.' : 'Choose up to 3, then your level in each.'}
      reason={L.length ? '' : 'Pick at least one language to learn'}
      onNext={() => goNext('learns')}
      fixed={!L.length || adding}
    >
      {L.length ? (
        <View style={styles.cards}>
          {L.map((l, i) => {
            const v = (me.levels[l] ?? 'A1') as Level;
            return (
              <View key={l} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.name}>{langName(l, t.lang)}</Text>
                  {/* the level in words sits at the end of the line (right, or left in Arabic) */}
                  <View style={styles.meaningBox}>
                    <Text style={styles.meaning} numberOfLines={1}>
                      <Text style={{ fontWeight: '800', color: '#fff' }}>{v}</Text> · {t(LEVEL_MEANING[v])}
                    </Text>
                  </View>
                  <Pressy onPress={() => setLangs(L.filter((x) => x !== l))} scale={0.9} style={styles.remove} accessibilityLabel={`${t('Remove')} ${langName(l, t.lang)}`}>
                    <Icon name="close" size={12} color="rgba(255,255,255,0.8)" strokeWidth={2.6} />
                  </Pressy>
                </View>
                {i === 0 && L.length < 3 ? <Text style={styles.key}>{t('A1–A2 beginner · B1–B2 intermediate · C1–C2 advanced')}</Text> : null}
                <LevelBar value={v} onChange={(lv) => update({ levels: { ...me.levels, [l]: lv } })} />
              </View>
            );
          })}
        </View>
      ) : null}

      {!L.length || adding ? (
        <LanguagePicker selected={L} exclude={me.natives} onChange={setLangs} hideSelected={!!L.length} />
      ) : L.length < 3 ? (
        <View style={{ alignItems: 'flex-start' }}>
          <RedChip raw label={`+ ${t('Add another language')}`} onPress={() => setAdding(true)} />
        </View>
      ) : null}
    </SignupFrame>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 10 },
  card: { backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 16, paddingTop: 7, paddingHorizontal: 10, paddingBottom: 9, gap: 5 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: '#fff', fontSize: 15.5, fontWeight: '800', flexShrink: 0 },
  meaningBox: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  meaning: { color: 'rgba(255,255,255,0.88)', fontSize: 12.5 },
  remove: { minHeight: 32, minWidth: 28, alignItems: 'center', justifyContent: 'center' },
  key: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: -4 },
});
