/**
 * The sections of the Me tab under the Language card, top to bottom (Me page order, 1 Nov 2026):
 *   MyFlicksRow    — 3 thumbnails with likes; with no Flicks yet, one small empty card (founder, NEXT_STEPS §2.7)
 *   ThisWeekCard   — streak · time spoken · corrections, today's goal bar, Mon–Sun dots
 *
 * Round 2 (NEXT_STEPS §4): the "Get seen first" boost card (slice 9), the round shortcuts (Notebook, Lessons,
 * Clubs, Passport, Wallet, Plans, Duo) and "See all ›" / "+ New Flick" (slice 5) are hidden until they exist.
 */
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { useColors, useScheme } from '../../theme/colors';
import { Icon, type IconName } from '../Icon';
import { T } from '../T';
import { cssBackground, hoursMinutes, shortNumber, weekLetters, weekOf } from './helpers';

/** Small grey capital heading ("MY FLICKS", "THIS WEEK"). */
export function Label({ children }: { children: string }) {
  const c = useColors();
  const t = useT();
  return <Text style={[styles.label, { color: c.muted }]}>{t(children).toLocaleUpperCase(t.lang)}</Text>;
}

export function MyFlicksRow() {
  const c = useColors();
  const t = useT();
  const dark = useScheme() === 'dark';
  const flicks = useApp((s) => s.myFlicks).slice(0, 3);
  return (
    <View style={{ gap: 10 }}>
      <Label>My Flicks</Label>
      {flicks.length === 0 ? (
        // small empty card (design B, compact): icon square + one line, no button until posting exists (slice 5)
        <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.line }]}>
          <View style={[styles.emptyTile, { backgroundColor: dark ? 'rgba(238,22,38,0.14)' : '#FFF0F1' }]}>
            <Icon name="mom" size={22} color={dark ? '#FF5A66' : '#C20E1B'} />
          </View>
          <View style={{ flex: 1 }}>
            <T style={{ fontSize: 15, fontWeight: '800' }}>No Flicks yet</T>
            <T style={{ fontSize: 13, color: c.muted }}>Your Flicks will show here.</T>
          </View>
        </View>
      ) : (
        <View style={styles.flicks}>
          {flicks.map((m) => (
            <View key={m.id} style={[styles.flick, cssBackground(m.bg)]} accessibilityLabel={t('My Flicks')}>
              {m.photo ? <Text style={{ fontSize: 40 }}>{m.photo}</Text> : <Text style={styles.flickText} numberOfLines={4}>{m.text}</Text>}
              <Text style={styles.likes}>♥ {shortNumber(m.likes ?? 0, t.lang)}</Text>
            </View>
          ))}
          {/* keep the tiles a third of the row wide when there are fewer than 3 */}
          {Array.from({ length: 3 - flicks.length }, (_, i) => <View key={'gap' + i} style={{ flex: 1 }} />)}
        </View>
      )}
    </View>
  );
}

export function ThisWeekCard() {
  const c = useColors();
  const t = useT();
  const streak = useApp((s) => s.streak);
  const W = weekOf();
  const letters = weekLetters(t.lang);
  const stat = (icon: IconName, value: string, label: string) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Icon name={icon} size={20} color={c.brand} strokeWidth={2.4} />
        <Text style={{ fontSize: 20, fontWeight: '800', color: c.ink }}>{value}</Text>
      </View>
      <T style={{ fontSize: 12, color: c.muted, textAlign: 'center' }}>{label}</T>
    </View>
  );
  const goalReached = W.today >= W.goal;
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
      <Label>This week</Label>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {stat('flame', String(streak), 'day streak')}
        {stat('mic', hoursMinutes(W.mins, t.lang), 'spoken')}
        {stat('check', String(W.fixes), 'corrections given')}
      </View>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T style={{ fontSize: 13, fontWeight: '700' }}>Today</T>
          <Text style={{ fontSize: 13, fontWeight: '700', color: c.muted }}>
            {W.today} / {W.goal} min{goalReached ? ` · ${t('goal reached 🎉')}` : ''}
          </Text>
        </View>
        <View style={[styles.bar, { backgroundColor: c.chip }]}>
          <View style={[styles.barFill, { width: `${Math.min(100, (W.today / W.goal) * 100)}%` }]} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {letters.map((d, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 6 }}>
            <View style={[styles.day, { backgroundColor: W.days[i] ? c.brand : c.chip }]}>
              <Text style={{ color: '#fff', fontSize: 12 }}>{W.days[i] ? '✓' : ''}</Text>
            </View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.muted }}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1 },
  flicks: { flexDirection: 'row', gap: 8 },
  flick: { flex: 1, aspectRatio: 3 / 4, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 8 },
  flickText: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 15 },
  likes: { position: 'absolute', start: 8, bottom: 6, color: '#fff', fontSize: 12, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 4 },
  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, padding: 12 },
  emptyTile: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 24, borderWidth: 1, padding: 16, gap: 14 },
  bar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5, backgroundImage: 'linear-gradient(90deg, #6B4BFF, #E0101F)' },
  day: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});

