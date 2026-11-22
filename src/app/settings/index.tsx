/**
 * Settings — grouped list like the prototype's vSettings() (each row opens its own page).
 * In slice 1, App language and Appearance work; the account card opens Edit profile;
 * the other pages arrive in later slices ("Coming in the next update").
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { BRAND_GRADIENT, useColors } from '../../theme/colors';
import { Screen, TopBar } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { Pressy } from '../../components/Pressy';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { T } from '../../components/T';
import { comingSoon } from '../../components/Toast';
import { Group, Row } from '../../components/settings/SettingsList';
import { LogoutSheet } from '../../components/settings/LogoutSheet';
import { Mascot } from '../../components/settings/Mascot';
import { Coin } from '../../components/me/Money';
import { fullNumber } from '../../components/me/helpers';

const PLAN_NAME = { standard: 'Standard', plus: 'Plus', infinity: '∞ Infinity' } as const;
const THEME_NAME = { light: 'Light', dark: 'Dark', system: 'Match phone' } as const;

export default function Settings() {
  const c = useColors();
  const t = useT();
  const { me, plan, coins, theme, appLangChoice } = useApp();
  const [logoutOpen, setLogoutOpen] = useState(false);
  // the chosen language is shown in its own name ("Français"); "Phone default" is translated
  const langValue = appLangChoice === 'Phone default' ? t('Phone default') : appLangChoice;

  return (
    <Screen>
      <TopBar title="Settings" />
      <ScrollView contentContainerStyle={styles.list}>
        {/* account card: opens Edit profile (the full Account page arrives with real accounts in slice 2) */}
        <Pressy onPress={() => router.push('/edit-profile')} scale={0.98} style={[styles.account, { backgroundColor: c.card, borderColor: c.line }]}>
          <Avatar id="me" size={54} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <T raw style={{ fontSize: 17, fontWeight: '800' }}>{me.name}</T>
            <T style={{ fontSize: 13, color: c.muted }}>Profile, username and ways to log in</T>
          </View>
          <Icon name="chev" size={17} color={c.muted} strokeWidth={2.4} />
        </Pressy>

        <Group>
          <Row icon="bell" label="Notifications" onPress={comingSoon} />
          <Row icon="shield" label="Privacy & safety" onPress={comingSoon} />
        </Group>
        <Group>
          <Row icon="chat" label="Chat settings" onPress={comingSoon} />
          <Row icon="book" label="Learning settings" onPress={comingSoon} />
          <Row icon="cloud" label="Chat backup" onPress={comingSoon} value={<View style={[styles.plusPill, { backgroundImage: BRAND_GRADIENT }]}><Text style={styles.plusText}>Plus</Text></View>} />
        </Group>
        <Group>
          <Row icon="crown" label="Plans" value={t(PLAN_NAME[plan])} onPress={comingSoon} />
          <Row icon="wallet" label="Wallet & payouts" onPress={comingSoon} value={<View style={styles.coins}><Coin size={14} /><Text style={{ color: c.muted, fontSize: 14, fontWeight: '600' }}>{fullNumber(coins, t.lang)}</Text></View>} />
          <Row icon="globe" label="App language" value={langValue} onPress={() => router.push('/settings/language')} />
          <Row icon="moon" label="Appearance" value={t(THEME_NAME[theme])} onPress={() => router.push('/settings/appearance')} />
        </Group>
        <Group>
          <Row label="Restore purchases" onPress={comingSoon} />
          <Row label="Manage subscription" value={plan === 'plus' ? 'Plus' : '—'} onPress={comingSoon} />
        </Group>
        <Group>
          <Row icon="star" label="Rate TalkAmigo" onPress={comingSoon} />
          <Row icon="info" label="About" onPress={comingSoon} />
        </Group>
        <Group>
          <Row icon="bug" label="Report a problem" onPress={comingSoon} />
          <Row icon="help" label="Help & safety centre" onPress={comingSoon} />
          <Row icon="box" label="Storage" value="128 MB" onPress={comingSoon} />
        </Group>

        <Pressy onPress={() => setLogoutOpen(true)} scale={0.955} style={[styles.bigBtn, { backgroundColor: c.card, borderColor: c.line, borderWidth: 1 }]}>
          <T style={{ fontSize: 16, fontWeight: '800', color: c.tintText }}>Log out</T>
        </Pressy>
        <Button kind="ghost" title="Reset demo" onPress={comingSoon} />
        <View style={{ alignItems: 'center', gap: 6, paddingTop: 6 }}>
          <Mascot />
          {/* app name + version: never translated */}
          <T raw style={{ fontSize: 12, color: c.muted }}>TalkAmigo beta 0.3</T>
        </View>
      </ScrollView>
      <LogoutSheet visible={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </Screen>
  );
}


const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 28, gap: 12 },
  account: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1 },
  plusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  plusText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  coins: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bigBtn: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
