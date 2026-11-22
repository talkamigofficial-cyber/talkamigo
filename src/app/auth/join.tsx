/**
 * "Join TalkAmigo" — Create account, Step 1 of 9 (prototype vAuth() with mode 'create', step 'pick'; v45/v46).
 *
 * The white TalkAmigo plate, "Free to join · about 2 minutes.", a note that sign-up is in the phone's
 * language, the mini demo chat, then Sign up with Google / Apple / phone number, the teacher card,
 * the trust notes, the Terms line and "Already have an account? Log in".
 *
 * Faked (no server yet): Google and Apple "connect" for a second and always succeed.
 * Teacher sign-up is built in slice 7, so its card shows "Coming in the next update".
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { LogoPlate } from '../../components/Logo';
import { Pressy } from '../../components/Pressy';
import { Icon } from '../../components/Icon';
import { comingSoon, toast } from '../../components/Toast';
import { AuthHeader, TrustNotes } from '../../components/auth/AuthParts';
import { ProviderButtons } from '../../components/auth/ProviderButtons';
import { JoinDemoChat } from '../../components/auth/JoinDemoChat';
import { LegalSheet } from '../../components/auth/AuthSheets';
import { authDone } from '../../components/auth/authFlow';
import { LANG_NAME, pickLang, useT } from '../../i18n';
import { useApp, type AuthMethod } from '../../state/store';

export default function Join() {
  const t = useT();
  const welcomeLang = useApp((s) => s.welcomeLangChoice);
  const [busy, setBusy] = useState<AuthMethod | null>(null);
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null);

  const pick = (m: AuthMethod) => {
    if (m === 'phone') return router.push({ pathname: '/auth/phone', params: { mode: 'create' } });
    setBusy(m);
    setTimeout(() => {
      setBusy(null);
      toast(`Signed up with ${m === 'google' ? 'Google' : 'Apple'} (demo)`, { icon: 'check', top: true });
      authDone('create', m);
    }, 900);
  };

  return (
    <Screen red>
      <AuthHeader step={1} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.titleRow}>
            <Text style={styles.join}>{t('Join')}</Text>
            <LogoPlate icon />
          </View>
          <Text style={styles.sub}>{t('Free to join · about 2 minutes.')}</Text>
          {/* v57: sign-up follows the phone's language; the app language chosen on Welcome applies afterwards */}
          <View style={styles.note}>
            <Icon name="globe" size={15} color="rgba(255,255,255,0.9)" />
            <Text style={styles.noteText}>
              {t('Sign-up is in your phone’s language.')} {t('Inside the app:')} <Text style={{ fontWeight: '800', color: '#fff' }}>{LANG_NAME[pickLang(welcomeLang)]}</Text> · {t('change it any time in Settings.')}
            </Text>
          </View>
        </View>

        <JoinDemoChat />

        <ProviderButtons mode="create" onPick={pick} busy={busy} />

        <Pressy onPress={comingSoon} scale={0.98} style={styles.teach}>
          <View style={styles.teachIcon}><Icon name="book" size={20} color="#1D4ED8" /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.teachTitle}>{t('Do you teach a language?')}</Text>
            <Text style={styles.teachSub}>{t('Sign up as a teacher and give paid lessons')}</Text>
          </View>
          <Icon name="chev" size={18} color="#fff" strokeWidth={2.4} />
        </Pressy>

        <TrustNotes rows={[
          ['lock', 'We never post anything or see your Google/Apple password'],
          ['eye', 'With Apple you can hide your real email'],
          ['phone', 'Your phone number is never shown to anyone'],
          ['shield', '18+ only · every profile is moderated'],
        ]} />

        <Text style={styles.legal}>
          {t('By continuing you agree to our')}{' '}
          <Text style={styles.link} onPress={() => setLegal('terms')} accessibilityRole="link">{t('Terms')}</Text>{' '}
          {t('and')}{' '}
          <Text style={styles.link} onPress={() => setLegal('privacy')} accessibilityRole="link">{t('Privacy Policy')}</Text>.
        </Text>

        <Text style={styles.already}>
          {t('Already have an account?')}{' '}
          <Text style={styles.alreadyLink} onPress={() => router.replace('/auth/login')} accessibilityRole="link">{t('Log in')}</Text>
        </Text>
      </ScrollView>
      <LegalSheet which={legal} onClose={() => setLegal(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20, gap: 16 },
  hero: { gap: 10, alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  join: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6, color: '#fff' },
  sub: { fontSize: 15.5, fontWeight: '600', color: 'rgba(255,255,255,0.92)' },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.88)' },
  teach: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.12)' },
  teachIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  teachTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  teachSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  legal: { fontSize: 12, lineHeight: 19, textAlign: 'center', color: 'rgba(255,255,255,0.86)' },
  link: { color: '#fff', fontWeight: '700', textDecorationLine: 'underline' },
  already: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.86)' },
  alreadyLink: { color: '#fff', fontWeight: '800' },
});
