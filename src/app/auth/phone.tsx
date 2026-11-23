/**
 * "Sign up with your phone" / "Log in with your phone" (prototype vAuth() step 'phone').
 *
 * Country-code button (flag + "+44", opens a searchable list) and the number, formatted as you type
 * ("7700 900 123" style groups). The country code starts on the phone's region. Two reassurance lines in a
 * white card (v46), then "Send code", enabled from 7 digits.
 * Opened with ?mode=create (sign-up) or ?mode=signin (log in). The number always stays left-to-right,
 * also in Arabic (CLAUDE.md "App language follows the phone").
 * Faked (no server yet): no SMS is sent; any 6 digits work on the next page.
 */
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Pressy } from '../../components/Pressy';
import { Icon } from '../../components/Icon';
import { Flag } from '../../components/Avatar';
import { Direction } from '../../components/Direction';
import { toast } from '../../components/Toast';
import { AuthHeader, TrustNotes, formatPhone } from '../../components/auth/AuthParts';
import { DialSheet } from '../../components/auth/AuthSheets';
import { phoneLang, phoneRegion, useT } from '../../i18n';
import { useApp } from '../../state/store';
import lists from '../../data/generated/lists.json';

const DIAL = lists.dialCodes as Record<string, string>;

/** Example number shown in the empty box, per country (prototype). */
const EXAMPLE: Record<string, string> = { FR: '6 12 34 56 78', ES: '612 34 56 78', DE: '1512 3456789', IT: '312 345 6789', PT: '912 345 678', JP: '90 1234 5678', US: '201 555 0123' };

/** The phone's own country, or a sensible one for its language (prototype phoneRegion()). */
function startingCountry(): string {
  const region = phoneRegion();
  if (region && DIAL[region]) return region;
  return ({ fr: 'FR', es: 'ES', pt: 'PT', de: 'DE', it: 'IT', ja: 'JP', ar: 'MA', en: 'GB' } as Record<string, string>)[phoneLang()] ?? 'GB';
}

export default function PhoneNumber() {
  const t = useT();
  const { mode = 'create' } = useLocalSearchParams<{ mode?: 'create' | 'signin' }>();
  const savedCc = useApp((s) => (s.onboarded ? s.me.cc : ''));
  const [cc, setCc] = useState(savedCc && DIAL[savedCc] ? savedCc : startingCountry());
  const [digits, setDigits] = useState('');
  const [dialOpen, setDialOpen] = useState(false);
  const create = mode === 'create';
  const ok = digits.length >= 7;

  const send = () => {
    if (!ok) return toast('Enter a valid phone number');
    router.push({ pathname: '/auth/code', params: { mode, cc, phone: digits } });
    toast('Code sent', { icon: 'check', top: true });
  };

  return (
    <Screen red>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthHeader
          step={create ? 1 : undefined}
          title={create ? 'Sign up with your phone' : 'Log in with your phone'}
          sub="We’ll text you a 6-digit code. Your number is never shown on your profile."
        />
        <Direction rtl={false} style={styles.row}>
          <Pressy onPress={() => setDialOpen(true)} scale={0.95} style={styles.dial} accessibilityLabel={t('Country code')}>
            <Flag cc={cc} size={18} />
            <Text style={styles.dialText}>+{DIAL[cc] ?? '44'}</Text>
            <Icon name="down" size={14} color="#16161D" strokeWidth={2.4} />
          </Pressy>
          <TextInput
            value={formatPhone(digits)}
            onChangeText={(v) => setDigits(v.replace(/\D/g, '').slice(0, 12))}
            placeholder={EXAMPLE[cc] ?? '7700 900 123'}
            placeholderTextColor="#9A9AA5"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            autoFocus
            returnKeyType="send"
            onSubmitEditing={send}
            style={styles.input}
            accessibilityLabel={t('Phone number')}
          />
        </Direction>
        <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
          <TrustNotes rows={[['lock', 'Only used to log in and keep your account safe'], ['ban', 'No ads or spam by text, ever']]} />
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ paddingHorizontal: 20, paddingBottom: 22 }}>
          <Button kind="white" title="Send code" disabled={!ok} onPress={send} />
        </View>
      </KeyboardAvoidingView>
      <DialSheet visible={dialOpen} onClose={() => setDialOpen(false)} onPick={(c) => { setCc(c); setDialOpen(false); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 24 },
  dial: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 54, paddingHorizontal: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.95)' },
  dialText: { fontSize: 16, fontWeight: '800', color: '#16161D' },
  input: { flex: 1, minWidth: 0, height: 54, borderRadius: 18, backgroundColor: '#fff', paddingHorizontal: 18, fontSize: 18, letterSpacing: 0.5, color: '#16161D', textAlign: 'left', writingDirection: 'ltr', outlineWidth: 0 },
});
