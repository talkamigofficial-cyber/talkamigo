/**
 * "Welcome back" — Log in (prototype vAuth() with mode 'signin'; v31 Oct sign-in experience, v45).
 *
 * Logo plate, "Log in the same way you signed up.", a "Continue as…" card when an account was used on
 * this phone, Log in with Google / Apple / phone (with a "Last used" tag), "Trouble logging in?" and
 * "New to TalkAmigo? Create an account".
 *
 * Opened with ?step=none when someone logs in with a way that no account on this phone uses:
 * "No account on this phone" + Create an account (CLAUDE.md §5). Until the server exists (slice 2)
 * the phone can't look accounts up anywhere else, so we never pretend to log in.
 * The prototype's "Approve on your other phone" step comes back in slice 2, when it can be real.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/Screen';
import { LogoPlate } from '../../components/Logo';
import { Pressy } from '../../components/Pressy';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { Icon } from '../../components/Icon';
import { AuthHeader } from '../../components/auth/AuthParts';
import { ProviderButtons } from '../../components/auth/ProviderButtons';
import { TroubleSheet } from '../../components/auth/AuthSheets';
import { authDone, openSavedAccount } from '../../components/auth/authFlow';
import { useT } from '../../i18n';
import { useApp, type AuthMethod } from '../../state/store';

export default function Login() {
  const params = useLocalSearchParams<{ step?: string }>();
  if (params.step === 'none') return <NoAccount />;
  return <PickMethod />;
}

function PickMethod() {
  const t = useT();
  const me = useApp((s) => s.me);
  const lastAuth = useApp((s) => s.lastAuth);
  const [busy, setBusy] = useState<AuthMethod | null>(null);
  const [trouble, setTrouble] = useState(false);
  const back = !!lastAuth && !!me.handle;

  const pick = (m: AuthMethod) => {
    if (m === 'phone') return router.push({ pathname: '/auth/phone', params: { mode: 'signin' } });
    setBusy(m);
    setTimeout(() => { setBusy(null); authDone('signin', m); }, 900);
  };

  return (
    <Screen red>
      <AuthHeader />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <LogoPlate icon />
          <Text style={styles.title}>{t('Welcome back')}</Text>
          <Text style={styles.sub}>{t(back ? 'Pick up where you left off.' : 'Log in the same way you signed up.')}</Text>
        </View>
        <View style={styles.buttons}>
          {back ? (
            <>
              <Pressy onPress={openSavedAccount} scale={0.98} style={styles.quick}>
                <Avatar id="me" size={46} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.quickName} numberOfLines={1}>{t(`Continue as ${me.name}`)}</Text>
                  <Text style={styles.quickSub} numberOfLines={1}>@{me.handle} · {lastAuth === 'phone' ? t('Phone number') : lastAuth === 'google' ? 'Google' : 'Apple'}</Text>
                </View>
                <Icon name="chev" size={18} color="#6B6B76" strokeWidth={2.4} />
              </Pressy>
              <Text style={styles.or}>{t('Or log in with')}</Text>
            </>
          ) : null}
          <ProviderButtons mode="signin" onPick={pick} busy={busy} lastUsed={lastAuth} />
          <Pressy onPress={() => setTrouble(true)} scale={0.96} style={{ alignSelf: 'center', padding: 8 }}>
            <Text style={styles.trouble}>{t('Trouble logging in?')}</Text>
          </Pressy>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.newTo}>
          {t('New to TalkAmigo?')}{' '}
          <Text style={styles.newLink} onPress={() => router.replace('/auth/join')} accessibilityRole="link">{t('Create an account')}</Text>
        </Text>
      </ScrollView>
      <TroubleSheet visible={trouble} onClose={() => setTrouble(false)} />
    </Screen>
  );
}

/** Logged in with a way no account on this phone uses: say so plainly and offer to create one. */
function NoAccount() {
  return (
    <Screen red>
      <AuthHeader title="No account on this phone" sub="No TalkAmigo account on this phone logs in this way. Create one: it takes about 2 minutes." />
      <View style={styles.noAccBody}>
        <Button kind="white" title="Create an account" onPress={() => router.replace('/auth/join')} />
        <Button kind="outlineWhite" title="Use another way" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 6 },
  title: { marginTop: 6, fontSize: 30, fontWeight: '800', letterSpacing: -0.6, color: '#fff', textAlign: 'center' },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.86)', textAlign: 'center' },
  buttons: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  quick: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)' },
  quickName: { fontSize: 16, fontWeight: '800', color: '#16161D' },
  quickSub: { fontSize: 13, color: '#6B6B76' },
  or: { textAlign: 'center', paddingTop: 6, fontSize: 11.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)' },
  trouble: { fontSize: 13.5, fontWeight: '700', color: 'rgba(255,255,255,0.86)' },
  newTo: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 16, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.86)' },
  newLink: { color: '#fff', fontWeight: '800' },
  noAccBody: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
});
