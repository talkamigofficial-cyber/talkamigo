/**
 * One partner in Connect (decided 1 Nov 2026): photo with flag and online ring, name (+ Teacher / Boosted),
 * language pair with 6 level dots ("FR ●●●●●● ⇄ EN ●●●○○○"), "Active now" or "Active 9 min ago",
 * a 2-line bio, small tags, and a red 👋 wave button (after waving it becomes a chat button).
 */
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { toast } from '../Toast';
import { useLang, useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { getPerson } from '../../data/people';
import { useApp } from '../../state/store';
import { spokenLabel } from '../profile/helpers';
import { BOOSTED, kmTo, langCode } from './partners';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** 6 small dots, red up to the level. */
export function LevelDots({ level }: { level: string }) {
  const c = useColors();
  const n = LEVELS.indexOf(level) + 1;
  return (
    <View style={s.dots} accessibilityLabel={level}>
      {LEVELS.map((_, k) => <View key={k} style={[s.lvDot, { backgroundColor: k < n ? c.brand : c.line }]} />)}
    </View>
  );
}

/** Yellow "Boosted" tag with a bolt (paid ranking must always be labelled, EU rule). */
export function BoostedPill() {
  return (
    <View style={s.boosted}>
      <Icon name="bolt" size={12} color="#9A5A00" strokeWidth={2.4} />
      <T style={s.boostedText}>Boosted</T>
    </View>
  );
}

export const PartnerRow = memo(function PartnerRow({ id, nearby }: { id: string; nearby: boolean }) {
  const c = useColors();
  const t = useT();
  const lang = useLang();
  const waved = useApp((st) => !!st.waved[id]);
  const myCountry = useApp((st) => st.me.cc);
  const p = getPerson(id);
  if (!p) return null;
  const seen = p.seen ?? 5;
  const active = p.online ? 'Active now' : seen >= 60 ? `Active ${Math.round(seen / 60)} h ago` : `Active ${seen} min ago`;

  const onWave = () => {
    useApp.getState().wave(id);
    toast(`You waved at ${p.name} 👋`, { icon: 'check' });
  };

  return (
    <View style={[s.row, { borderBottomColor: c.line }]}>
      {/* the wrapper takes the free width (Pressy puts its style on an inner view) */}
      <View style={s.mainWrap}>
      <Pressy scale={0.98} style={s.main} onPress={() => router.push(`/user/${id}`)} accessibilityLabel={spokenLabel('prof', p.name, lang)}>
        <Avatar id={id} size={58} ring />
        <View style={s.info}>
          <View style={s.nameLine}>
            <Text style={[s.name, { color: c.ink }]} numberOfLines={1}>{p.name}</Text>
            {p.teacher ? <T style={[s.pill, { backgroundColor: c.tint, color: c.tintText }]}>Teacher</T> : null}
            {BOOSTED.has(id) ? <BoostedPill /> : null}
          </View>
          <View style={s.pair}>
            <Text style={[s.code, { color: c.ink }]}>{langCode(p.native)}</Text>
            <LevelDots level="C2" />
            <Text style={[s.arr, { color: c.muted }]}>⇄</Text>
            <Text style={[s.code, { color: c.ink }]}>{langCode(p.learning)}</Text>
            <LevelDots level={p.lvl} />
          </View>
          <View style={s.act}>
            {p.online ? <View style={s.onDot} /> : null}
            <T style={[s.actText, { color: c.muted }]}>{active}</T>
            {nearby ? <Text style={[s.actText, { color: c.muted }]} numberOfLines={1}>{` · ${p.city} · ≈ ${kmTo(myCountry, p).toLocaleString()} km`}</Text> : null}
          </View>
          {/* what people write about themselves is never auto-translated */}
          <T raw style={[s.bio, { color: c.soft }]} numberOfLines={2}>{p.bio}</T>
          {p.tags?.length ? (
            <View style={s.tags}>
              {p.tags.map((tag) => (
                <T key={tag} style={[s.tag, tag === 'New' ? { backgroundColor: '#E7F8EE', color: '#15803D' } : { backgroundColor: c.chip, color: c.soft }]}>{tag}</T>
              ))}
            </View>
          ) : null}
        </View>
      </Pressy>
      </View>
      {/* after a wave the prototype turns this into a chat button; chats open in slice 3, so until then it just shows a tick */}
      {waved ? (
        <View style={[s.wave, { backgroundColor: c.chip }]} accessibilityLabel={t(`You waved at ${p.name} 👋`)}>
          <Icon name="check" size={18} color={c.muted} strokeWidth={2.4} />
        </View>
      ) : (
        <Pressy scale={0.9} style={[s.wave, { backgroundColor: c.brand }]} onPress={onWave} accessibilityLabel={spokenLabel('wave', p.name, lang)}>
          <Text style={{ fontSize: 18 }}>👋</Text>
        </Pressy>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  mainWrap: { flex: 1, minWidth: 0 },
  main: { flexDirection: 'row', gap: 12 },
  info: { flex: 1, minWidth: 0, gap: 4 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: 16.5, fontWeight: '800', flexShrink: 1 },
  pill: { fontSize: 11.5, fontWeight: '800', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden' },
  boosted: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, backgroundColor: '#FFF1D6' },
  boostedText: { fontSize: 11.5, fontWeight: '800', color: '#9A5A00' },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  code: { fontSize: 12, fontWeight: '800' },
  arr: { fontSize: 12, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 2 },
  lvDot: { width: 5, height: 5, borderRadius: 3 },
  act: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actText: { fontSize: 12 },
  onDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  bio: { fontSize: 13.5, lineHeight: 19 },
  tags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { fontSize: 11.5, fontWeight: '700', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, overflow: 'hidden' },
  wave: { width: 46, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
});
