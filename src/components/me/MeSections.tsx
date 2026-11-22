/**
 * The sections of the Me tab under the Language card, top to bottom (Me page order, 1 Nov 2026):
 *   MyFlicksRow    — 3 thumbnails with likes + "See all ›" (a "+ New Flick" tile when fewer than 3)
 *   BoostCard      — dark "Get seen first" card with a slow light sweep (still when Reduce Motion is on)
 *   ThisWeekCard   — streak · time spoken · corrections, today's goal bar, Mon–Sun dots
 *   Shortcuts      — round buttons: Notebook · Lessons · Clubs · Passport · Wallet · Plans · Duo
 * Everything that opens a later-slice feature shows "Coming in the next update".
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Icon, type IconName } from '../Icon';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { comingSoon } from '../Toast';
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
  const flicks = useApp((s) => s.myFlicks).slice(0, 3);
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}><Label>My Flicks</Label></View>
        <Pressy onPress={comingSoon} scale={0.94}><T style={{ fontSize: 13.5, fontWeight: '800', color: c.tintText }}>See all ›</T></Pressy>
      </View>
      <View style={styles.flicks}>
        {flicks.map((m) => (
          <View key={m.id} style={{ flex: 1 }}>
            <Pressy onPress={comingSoon} scale={0.97} style={[styles.flick, cssBackground(m.bg)]} accessibilityLabel="My Flick">
              {m.photo ? <Text style={{ fontSize: 40 }}>{m.photo}</Text> : <Text style={styles.flickText} numberOfLines={4}>{m.text}</Text>}
              <Text style={styles.likes}>♥ {shortNumber(m.likes, t.lang)}</Text>
            </Pressy>
          </View>
        ))}
        {flicks.length < 3 && (
          <View style={{ flex: 1 }}>
            <Pressy onPress={comingSoon} scale={0.97} style={[styles.flick, { backgroundColor: c.chip, gap: 4 }]}>
              <Text style={{ fontSize: 28, color: c.muted }}>+</Text>
              <T style={{ fontSize: 12, fontWeight: '700', color: c.muted }}>New Flick</T>
            </Pressy>
          </View>
        )}
      </View>
    </View>
  );
}

export function BoostCard() {
  // The demo account has the TalkAmigo Team's 50% coupon, so its profile boost costs 150 (prototype bcost()).
  const coupon = useApp((s) => s.account === 'demo');
  const tiles: { emoji: string; name: string; sub: string }[] = [
    { emoji: '⚡', name: 'Profile', sub: `30 min · ${coupon ? 150 : 300}` },
    { emoji: '🎯', name: 'Flick', sub: '1 h · 150' },
    { emoji: '🎙', name: 'Talk room', sub: '15 min · 100' },
  ];
  return (
    <View style={styles.boost}>
      <LightSweep />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 30 }}>🚀</Text>
        <View style={{ flex: 1 }}>
          <T style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>Get seen first</T>
          <T style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Show up first for people learning your languages.</T>
        </View>
      </View>
      <View style={styles.btiles}>
        {tiles.map((x) => (
          <View key={x.name} style={{ flex: 1 }}>
            <Pressy onPress={comingSoon} scale={0.95} style={styles.btile}>
              <Text style={{ fontSize: 20 }}>{x.emoji}</Text>
              <T style={{ color: '#fff', fontSize: 14, fontWeight: '800' }} numberOfLines={1}>{x.name}</T>
              <T style={{ color: '#fff', fontSize: 12, fontWeight: '700' }} numberOfLines={1}>{x.sub}</T>
            </Pressy>
          </View>
        ))}
      </View>
      <T style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Boosted posts always show a “Boosted” tag.</T>
    </View>
  );
}

/** The slow diagonal shine across the boost card. Stays still when the phone has Reduce Motion on. */
function LightSweep() {
  const [calm, setCalm] = useState(false);
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setCalm).catch(() => {});
  }, []);
  useEffect(() => {
    if (calm) return;
    const loop = Animated.loop(Animated.timing(x, { toValue: 1, duration: 5000, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [calm, x]);
  if (calm) return null;
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-400, 400] });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateX }, { rotate: '20deg' }], backgroundImage: 'linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)' }]} />
  );
}

export function ThisWeekCard() {
  const c = useColors();
  const t = useT();
  const account = useApp((s) => s.account);
  const streak = useApp((s) => s.streak);
  const W = weekOf(account);
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

export function Shortcuts() {
  const c = useColors();
  const items: [IconName, string][] = [['bookmark', 'Notebook'], ['book', 'Lessons'], ['people', 'Clubs'], ['globe', 'Passport'], ['wallet', 'Wallet'], ['crown', 'Plans'], ['flame', 'Duo']];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 6 }}>
      {items.map(([icon, label]) => (
        <Pressy key={label} onPress={comingSoon} scale={0.92} style={{ width: 62, alignItems: 'center', gap: 6 }}>
          <View style={[styles.round, { backgroundColor: c.chip }]}><Icon name={icon} size={23} color={c.tintText} /></View>
          <T style={{ fontSize: 11.5, fontWeight: '700', color: c.soft }} numberOfLines={1}>{label}</T>
        </Pressy>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1 },
  flicks: { flexDirection: 'row', gap: 8 },
  flick: { aspectRatio: 3 / 4, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 8 },
  flickText: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 15 },
  likes: { position: 'absolute', start: 8, bottom: 6, color: '#fff', fontSize: 12, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 4 },
  boost: {
    borderRadius: 24, padding: 16, gap: 12, overflow: 'hidden',
    backgroundImage: 'radial-gradient(120% 90% at 100% 0%, #FF5A2E 0%, transparent 55%), radial-gradient(90% 90% at 0% 100%, #7B2BFF 0%, transparent 60%), linear-gradient(#1A0610, #1A0610)',
  },
  btiles: { flexDirection: 'row', gap: 8 },
  btile: { borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.13)', paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', gap: 3 },
  card: { borderRadius: 24, borderWidth: 1, padding: 16, gap: 14 },
  bar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5, backgroundImage: 'linear-gradient(90deg, #6B4BFF, #E0101F)' },
  day: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  round: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});

