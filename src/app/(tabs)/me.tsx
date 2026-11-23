/**
 * Me tab — your own profile (CLAUDE.md §5 "Me", Language card design).
 * Order: coins · Diamonds · ☰ Settings → Language card → My Flicks → This week → "Profile N% complete ›".
 *
 * Round 2 (NEXT_STEPS §4): Shop, the boost card and the round shortcuts are hidden until they exist
 * (slices 5, 9, 10). The coin and Diamond chips show the balance but aren't buttons until the Wallet exists (slice 9).
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
import { BalanceChip } from '../../components/me/Money';
import { LanguageCard } from '../../components/me/LanguageCard';
import { MyFlicksRow, ThisWeekCard } from '../../components/me/MeSections';
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
          <TourTarget id="me-coins"><BalanceChip kind="coin" value={fullNumber(coins, t.lang)} label={t('Coins')} /></TourTarget>
          <TourTarget id="me-diamonds"><BalanceChip kind="gem" value={fullNumber(diamonds, t.lang)} label={t('Diamonds')} /></TourTarget>
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
        <View style={[styles.pad, { paddingTop: 12 }]}><ThisWeekCard /></View>
        {/* only while the missing part is something Edit profile can fix (the photo); video and Flicks come later */}
        {pc < 100 && !me.photo && (
          <View style={[styles.pad, { paddingTop: 10 }]}>
            {/* opens Edit profile, where the missing parts are filled in */}
            <Pressy onPress={() => router.push('/edit-profile')} scale={0.97} style={{ alignSelf: 'flex-start' }}>
              <T raw style={{ fontSize: 13, fontWeight: '700', color: c.tintText }}>{profileCompleteLine(pc, me, t.lang)}</T>
            </Pressy>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  pad: { paddingHorizontal: 20 },
  menuBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
