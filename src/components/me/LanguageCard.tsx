/**
 * The "Language card" at the top of the Me tab (decided 29 Oct 2026, deliberately not like HelloTalk):
 * red top edge · photo · name, age, pencil (Edit profile), plan badge ·
 * flag, city, @username · Online · stats tiles Following / Followers / Views (v98: above the levels) ·
 * native languages ("Fluent") · each learning language as a 6-step A1–C2 ladder with the labels in
 * ONE row under the bars (v85) and the real time practised this week.
 */
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { countryName, useT } from '../../i18n';
import { BRAND_GRADIENT, useColors } from '../../theme/colors';
import { Avatar, Flag } from '../Avatar';
import { Icon, type IconName } from '../Icon';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { useProfileExtras } from './profileExtras';
import { LEVELS, ageOf, followingCount, langCode, practiceThisWeek, shortNumber } from './helpers';

export function LanguageCard() {
  const c = useColors();
  const t = useT();
  const { me, plan, follows, followersN, views, newFollowers, newViews } = useApp();
  const showAge = useProfileExtras((s) => s.showAge);
  const age = ageOf(me.bday);
  const learning = me.langs.filter((l) => !me.natives.includes(l));
  const place = me.city && me.showCity ? `${me.city}, ${countryName(me.cc, t.lang)}` : countryName(me.cc, t.lang);

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
      <View style={styles.redEdge} />

      {/* photo + name */}
      <View style={styles.head}>
        {/* the "+ / ▶ intro video" button comes back when intro videos can be recorded and played (later slice) */}
        <Avatar id="me" size={72} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: c.ink }]}>
              {me.name}
              {showAge && age != null ? <Text style={{ fontWeight: '600', color: c.muted }}>, {age}</Text> : null}
            </Text>
            <Pressy onPress={() => router.push('/edit-profile')} scale={0.9} style={[styles.pencil, { backgroundColor: c.chip }]} accessibilityLabel="Edit profile">
              <Icon name="pen2" size={15} color={c.ink} strokeWidth={2.2} />
            </Pressy>
            {plan === 'plus' && <View style={[styles.pill, { backgroundImage: BRAND_GRADIENT }]}><Text style={styles.pillWhite}>Plus</Text></View>}
            {plan === 'infinity' && <View style={[styles.pill, { backgroundColor: '#1A1418' }]}><Text style={[styles.pillWhite, { color: '#FFC531' }]}>∞ Infinity</Text></View>}
          </View>
          <View style={styles.placeRow}>
            <Flag cc={me.cc} size={14} />
            <Text style={[styles.place, { color: c.muted }]}>{place} · @{me.handle}</Text>
          </View>
          <View style={[styles.status, { backgroundColor: c.chip }]}>
            <View style={styles.greenDot} />
            <T style={{ fontSize: 12, fontWeight: '700', color: c.good }}>Online</T>
          </View>
        </View>
      </View>

      {/* stats tiles (v98) */}
      <View style={styles.stats}>
        <StatTile icon="user" value={String(followingCount(follows))} label="Following" />
        <StatTile icon="people" value={shortNumber(followersN, t.lang)} label="Followers" badge={newFollowers} />
        <StatTile icon="eye" value={shortNumber(views, t.lang)} label="Views" badge={newViews} />
      </View>

      {/* languages */}
      <View style={{ gap: 10, marginTop: 16 }}>
        {me.natives.map((n) => (
          <View key={n} style={styles.langRow}>
            <Text style={[styles.code, { color: c.ink }]}>{langCode(n)}</Text>
            <View style={[styles.pill, { backgroundColor: c.chip }]}><T style={{ fontSize: 11.5, fontWeight: '800', color: c.ink }}>Fluent</T></View>
          </View>
        ))}
        {learning.map((l) => <LevelLadder key={l} lang={l} level={me.levels[l] ?? 'A1'} mins={me.mins[l] ?? 0} />)}
      </View>
    </View>
  );
}

function StatTile({ icon, value, label, badge }: { icon: IconName; value: string; label: string; badge?: number }) {
  const c = useColors();
  return (
    // not a button yet: the Following / Followers / Views pages arrive with real accounts (slice 2)
    <View style={{ flex: 1, minWidth: 0 }}>
    <View style={[styles.tile, { backgroundColor: c.chip }]} accessibilityLabel={`${value} ${label}`}>
      {badge ? <View style={styles.badge}><Text style={styles.badgeText}>+{badge}</Text></View> : null}
      <View style={styles.tileValue}>
        <Icon name={icon} size={15} color="#E0101F" strokeWidth={2.2} />
        <Text style={{ fontSize: 15.5, fontWeight: '700', color: c.ink, fontVariant: ['tabular-nums'] }}>{value}</Text>
      </View>
      <T style={{ fontSize: 11.5, color: c.muted }} numberOfLines={1}>{label}</T>
    </View>
    </View>
  );
}

function LevelLadder({ lang, level, mins }: { lang: string; level: string; mins: number }) {
  const c = useColors();
  const t = useT();
  const n = LEVELS.indexOf(level as (typeof LEVELS)[number]) + 1;
  return (
    <View style={[styles.langRow, { alignItems: 'flex-start' }]}>
      <Text style={[styles.code, { color: c.ink, paddingTop: 2 }]}>{langCode(lang)}</Text>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.steps}>
          {LEVELS.map((_, k) => <View key={k} style={[styles.step, { backgroundColor: k < n ? c.brand : c.chip }]} />)}
        </View>
        <View style={styles.steps}>
          {LEVELS.map((x) => (
            <Text key={x} style={[styles.stepLabel, { color: x === level ? c.tintText : c.muted }]}>{x}</Text>
          ))}
        </View>
        <Text style={{ fontSize: 12, fontWeight: '600', color: c.muted }}>{practiceThisWeek(mins, t.lang)}</Text>
      </View>
      <Text style={{ width: 30, textAlign: 'right', fontWeight: '800', fontSize: 13.5, color: c.tintText }}>{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, padding: 18, borderWidth: 1, overflow: 'hidden' },
  redEdge: { position: 'absolute', left: 0, right: 0, top: 0, height: 5, backgroundImage: BRAND_GRADIENT },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  plus: { position: 'absolute', end: -4, bottom: 0, width: 26, height: 26, borderRadius: 13, borderWidth: 3, backgroundImage: BRAND_GRADIENT, alignItems: 'center', justifyContent: 'center' },
  plusText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 24, fontWeight: '800', letterSpacing: -0.2, flexShrink: 1 },
  pencil: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  pillWhite: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  placeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  place: { fontSize: 13.5, flexShrink: 1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, marginTop: 2 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  stats: { flexDirection: 'row', gap: 8, marginTop: 14 },
  tile: { borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingTop: 9, paddingBottom: 8, paddingHorizontal: 4 },
  tileValue: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badge: { position: 'absolute', top: -7, end: 6, backgroundColor: '#E0101F', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 1, boxShadow: '0 2px 8px rgba(224,16,31,0.45)', zIndex: 1 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 10.5 },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  code: { width: 62, fontSize: 13.5, fontWeight: '700' },
  steps: { flexDirection: 'row', gap: 4 },
  step: { flex: 1, height: 8, borderRadius: 4 },
  stepLabel: { flex: 1, textAlign: 'center', fontSize: 9.5, fontWeight: '700' },
});
