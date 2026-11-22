/**
 * Me tab — your own profile (CLAUDE.md §5 "Me", Language card design).
 * Order: coins · Diamonds · ☰ Settings → Language card → My Flicks → "Get seen first" boost card →
 * This week → Shop → "Profile N% complete" → round shortcuts.
 * Wallet, shop, boosts, follows, views and shortcuts arrive in later slices ("Coming in the next update").
 */
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Pressy } from '../../components/Pressy';
import { Icon } from '../../components/Icon';
import { T } from '../../components/T';
import { comingSoon } from '../../components/Toast';
import { BalanceChip } from '../../components/me/Money';
import { LanguageCard } from '../../components/me/LanguageCard';
import { BoostCard, MyFlicksRow, Shortcuts, ThisWeekCard } from '../../components/me/MeSections';
import { fullNumber, profileCompleteLine, profileStrength } from '../../components/me/helpers';
import { TourTarget } from '../../components/tour/TourTarget';

export default function MeTab() {
  const c = useColors();
  const t = useT();
  const { coins, diamonds, me, myFlicks } = useApp();
  const pc = profileStrength(me, myFlicks.length);
  const { width } = useWindowDimensions();

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* top row: balances and Settings (the Share button was removed on 2 Nov 2026) */}
        <View style={styles.top}>
          <TourTarget id="me-coins"><BalanceChip kind="coin" value={fullNumber(coins, t.lang)} onPress={comingSoon} label="Coins" /></TourTarget>
          <TourTarget id="me-diamonds"><BalanceChip kind="gem" value={fullNumber(diamonds, t.lang)} onPress={comingSoon} label="Diamonds" /></TourTarget>
          <View style={{ flex: 1 }} />
          {/* on phones narrower than 375 pt only the ☰ icon shows, so the row never runs off the screen (prototype .stl) */}
          <TourTarget id="me-settings">
          {width < 375 ? (
            <Pressy onPress={() => router.push('/settings')} scale={0.9} accessibilityLabel={t('Settings')} style={[styles.menuBtn, { backgroundColor: c.card, borderColor: c.line }]}>
              <Icon name="menu" size={19} color={c.ink} strokeWidth={2.2} />
            </Pressy>
          ) : (
            <Button kind="glass" small icon="menu" title="Settings" onPress={() => router.push('/settings')} style={{ height: 44 }} />
          )}
          </TourTarget>
        </View>

        <TourTarget id="me-langcard" style={styles.pad}><LanguageCard /></TourTarget>
        <View style={[styles.pad, { paddingTop: 14 }]}><MyFlicksRow /></View>
        <View style={[styles.pad, { paddingTop: 12 }]}><BoostCard /></View>
        <View style={[styles.pad, { paddingTop: 12 }]}><ThisWeekCard /></View>
        <View style={[styles.pad, { paddingTop: 12, flexDirection: 'row' }]}>
          <View style={{ flex: 1 }}><Button kind="glass" small icon="bag" title="Shop" onPress={comingSoon} /></View>
        </View>
        {pc < 100 && (
          <View style={[styles.pad, { paddingTop: 10 }]}>
            <Pressy onPress={comingSoon} scale={0.97} style={{ alignSelf: 'flex-start' }}>
              <T raw style={{ fontSize: 13, fontWeight: '700', color: c.tintText }}>{profileCompleteLine(pc, me, t.lang)}</T>
            </Pressy>
          </View>
        )}
        <View style={{ paddingTop: 16 }}><Shortcuts /></View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  pad: { paddingHorizontal: 20 },
  menuBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
