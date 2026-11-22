/**
 * "Your AI helpers" — asked once after sign-up, before the tour (Apple rule 5.1.2(i); prototype vAiGate()).
 * Explains what is sent, to whom, what never happens, and how to change your mind; then Allow / Not now.
 * Without it, Translate and subtitles ask first (built with those features in later slices).
 * Then the app opens on Flicks, where the welcome tour starts.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../state/store';
import { useT } from '../i18n';
import { useColors } from '../theme/colors';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon, type IconName } from '../components/Icon';
import { Pressy } from '../components/Pressy';
import { Sheet } from '../components/Sheet';

const ROWS: [IconName, string, string][] = [
  ['globe', 'What is sent', 'Only the text you tap Translate or Check on, and the audio in a room, call or Live while subtitles are on.'],
  ['people', 'Who receives it', 'Our translation and speech-to-text partners, under contract with us. They’re listed in the Privacy Policy.'],
  ['shield', 'What never happens', 'It’s never used to train AI models, never sold and never shown to anyone else.'],
  ['gear', 'Change your mind', 'Any time in Settings → Privacy & safety → AI helpers.'],
];

/** The Privacy Policy, same sections as the prototype's LEGAL.privacy. */
const PRIVACY: [string, string][] = [
  ['What we collect', 'Your profile, your languages, what you post and send, and your purchases. Your phone number is never shown.'],
  ['Location', 'Only the city you type. We never use GPS.'],
  ['AI partners', 'When you allow AI helpers, the text or audio you choose is sent to our translation and speech-to-text partners. It’s never used to train AI or sold.'],
  ['Analytics', 'Crash reports and app usage, without advertising tracking.'],
  ['Your rights', 'Download your data, correct it or delete your account any time in Settings → Account. EU/UK data rules apply.'],
  ['Contact', 'privacy@talkamigo.app'],
];

export default function AiHelpersScreen() {
  const t = useT();
  const c = useColors();
  const [privacy, setPrivacy] = useState(false);
  const answer = (ok: boolean) => { useApp.getState().setAiOK(ok); router.replace('/flicks'); };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.picon, { backgroundColor: c.tint }]}><Icon name="tr" size={30} color={c.tintText} /></View>
        <Text style={[styles.title, { color: c.ink }]}>{t('Your AI helpers')}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>{t('TalkAmigo can use AI to translate messages and Flicks, check your sentences and show live subtitles. You decide.')}</Text>
        <View style={[styles.group, { backgroundColor: c.card, borderColor: c.line }]}>
          {ROWS.map(([icon, head, body], i) => (
            <View key={head} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]}>
              <Icon name={icon} size={20} color={c.brand} strokeWidth={2.4} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.rowHead, { color: c.ink }]}>{t(head)}</Text>
                <Text style={[styles.rowBody, { color: c.muted }]}>{t(body)}</Text>
              </View>
            </View>
          ))}
        </View>
        <Pressy onPress={() => setPrivacy(true)} style={{ alignSelf: 'center', paddingVertical: 4 }} accessibilityRole="link">
          <Text style={[styles.link, { color: c.tintText }]}>{t('Privacy Policy')}</Text>
        </Pressy>
      </ScrollView>

      <View style={styles.foot}>
        <Button title="Allow AI helpers" onPress={() => answer(true)} />
        <Button kind="glass" title="Not now" onPress={() => answer(false)} />
        <Text style={[styles.fine, { color: c.muted }]}>{t('Without AI helpers you can still chat, call and join rooms. Translate and subtitles will ask first.')}</Text>
      </View>

      <Sheet visible={privacy} onClose={() => setPrivacy(false)} title="Privacy Policy">
        {PRIVACY.map(([head, body]) => (
          <View key={head} style={{ gap: 2 }}>
            <Text style={{ color: c.ink, fontSize: 15, fontWeight: '700' }}>{t(head)}</Text>
            <Text style={{ color: c.muted, fontSize: 14, lineHeight: 21 }}>{head === 'Contact' ? body : t(body)}</Text>
          </View>
        ))}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, gap: 16 },
  picon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '700', lineHeight: 33 },
  sub: { fontSize: 15, lineHeight: 22 },
  group: { borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  rowHead: { fontSize: 16, fontWeight: '600' },
  rowBody: { fontSize: 12.5, lineHeight: 17 },
  link: { fontSize: 12.5, fontWeight: '800' },
  foot: { paddingHorizontal: 20, paddingBottom: 26, gap: 10 },
  fine: { fontSize: 11.5, lineHeight: 16, textAlign: 'center' },
});
