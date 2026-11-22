/**
 * "Welcome back" — Log in (prototype vAuth() with mode 'signin'; v31 Oct sign-in experience, v45).
 *
 * Logo plate, "Log in the same way you signed up.", a "Continue as…" card when an account was used on
 * this phone, Log in with Google / Apple / phone (with a "Last used" tag), "Trouble logging in?" and
 * "New to TalkAmigo? Create an account".
 *
 * Opened with ?step=approve&m=google when someone logs in with a method that has no account on this
 * phone: "Approve on your other phone" (one phone per account, decided 31 Oct 2026).
 * Faked (no server yet): Google/Apple connect for a second; approving is a button on this screen.
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
import { LostPhoneSheet, TroubleSheet } from '../../components/auth/AuthSheets';
import { approveOnOtherPhone, authDone, openSavedAccount } from '../../components/auth/authFlow';
import { useT } from '../../i18n';
import { useApp, type AuthMethod } from '../../state/store';
import { onRed } from '../../theme/colors';

export default function Login() {
  const params = useLocalSearchParams<{ step?: string; m?: AuthMethod }>();
  if (params.step === 'approve') return <Approve method={params.m ?? 'google'} />;
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

/** "Approve on your other phone": the new phone waits for the old one to say yes. */
function Approve({ method }: { method: AuthMethod }) {
  const t = useT();
  const [lost, setLost] = useState(false);
  return (
    <Screen red>
      <AuthHeader
        title="Approve on your other phone"
        sub="For your safety, TalkAmigo works on one phone at a time. Open TalkAmigo on your other phone and tap Approve."
      />
      <ScrollView contentContainerStyle={styles.approveBody}>
        <View style={styles.device}>
          <View style={styles.deviceIcon}><Icon name="phone" size={20} color="#E0101F" strokeWidth={2.4} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.deviceName}>iPhone 13</Text>
            <Text style={styles.deviceSub}>{t('Your other phone · last active 2 min ago')}</Text>
          </View>
          <View style={styles.waiting}>
            <View style={styles.liveDot} />
            <Text style={styles.waitingText}>{t('Waiting…')}</Text>
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <View>
            <Text style={styles.paraTitle}>{t('What moves to this phone')}</Text>
            <Text style={styles.paraText}>{t('Your profile, plan, coins and Diamonds. Your messages stay on the old phone, then are deleted from it.')}</Text>
          </View>
          <View>
            <Text style={styles.paraTitle}>{t('Then')}</Text>
            <Text style={styles.paraText}>{t('Your other phone is logged out automatically.')}</Text>
          </View>
        </View>
        <Button kind="white" title="Approve on my other phone (demo)" onPress={() => approveOnOtherPhone(method)} />
        <Button kind="outlineWhite" title="I don’t have my other phone" onPress={() => setLost(true)} />
      </ScrollView>
      <LostPhoneSheet visible={lost} onClose={() => setLost(false)} />
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
  approveBody: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 14 },
  device: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 24, backgroundColor: onRed.card },
  deviceIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF0F1', alignItems: 'center', justifyContent: 'center' },
  deviceName: { fontSize: 15, fontWeight: '700', color: onRed.cardInk },
  deviceSub: { fontSize: 13, color: onRed.cardMuted },
  waiting: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0101F', boxShadow: '0 0 0 4px #FFF0F1' },
  waitingText: { fontSize: 12, fontWeight: '800', color: '#C20E1B' },
  paraTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  paraText: { fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.86)' },
});
