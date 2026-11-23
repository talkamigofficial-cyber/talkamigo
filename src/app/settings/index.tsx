/**
 * Settings — grouped list like the prototype's vSettings() (each row opens its own page).
 * Round 2: only the pages that work are shown — the account card (→ Edit profile), App language, Appearance
 * and Log out. Every other page is hidden until its slice is built (NEXT_STEPS §4).
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import Constants from 'expo-constants';
import { useColors } from '../../theme/colors';
import { Screen, TopBar } from '../../components/Screen';
import { Avatar } from '../../components/Avatar';
import { Pressy } from '../../components/Pressy';
import { Icon } from '../../components/Icon';
import { T } from '../../components/T';
import { Group, Row } from '../../components/settings/SettingsList';
import { LogoutSheet } from '../../components/settings/LogoutSheet';
import { Mascot } from '../../components/settings/Mascot';

const THEME_NAME = { light: 'Light', dark: 'Dark', system: 'Match phone' } as const;

export default function Settings() {
  const c = useColors();
  const t = useT();
  const { me, theme, appLangChoice } = useApp();
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
            <T style={{ fontSize: 13, color: c.muted }}>Edit profile</T>
          </View>
          <Icon name="chev" size={17} color={c.muted} strokeWidth={2.4} />
        </Pressy>

        {/* Only pages that exist are listed (NEXT_STEPS §4: hide what isn't built). Notifications, Privacy & safety,
            Chat, Learning, Plans, Wallet, purchases, Help, About, Report a problem and Storage come back with their slices. */}
        <Group>
          <Row icon="globe" label="App language" value={langValue} onPress={() => router.push('/settings/language')} />
          <Row icon="moon" label="Appearance" value={t(THEME_NAME[theme])} onPress={() => router.push('/settings/appearance')} />
        </Group>

        <Pressy onPress={() => setLogoutOpen(true)} scale={0.955} style={[styles.bigBtn, { backgroundColor: c.card, borderColor: c.line, borderWidth: 1 }]}>
          <T style={{ fontSize: 16, fontWeight: '800', color: c.tintText }}>Log out</T>
        </Pressy>
        <View style={{ alignItems: 'center', gap: 6, paddingTop: 6 }}>
          <Mascot />
          {/* app name + version: never translated */}
          <T raw style={{ fontSize: 12, color: c.muted }}>{`TalkAmigo ${Constants.expoConfig?.version ?? ''}`}</T>
        </View>
      </ScrollView>
      <LogoutSheet visible={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </Screen>
  );
}


const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 28, gap: 12 },
  account: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1 },
  bigBtn: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
