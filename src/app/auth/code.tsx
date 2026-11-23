/**
 * "Enter the 6-digit code" (prototype vAuth() last step; v31 Oct sign-in experience).
 *
 * Six boxes over one hidden text box, so the iPhone can fill the code straight from the SMS
 * (one-time-code). It checks by itself when the 6th digit is typed. "Resend in 0:30" counts down,
 * "Change number" goes back, and the anti-scam line "Never share this code…" is always there.
 * Opened with ?mode=create|signin&cc=GB&phone=7700900123.
 * Faked (no server yet): any 6 digits are accepted.
 */
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Pressy } from '../../components/Pressy';
import { Direction } from '../../components/Direction';
import { toast } from '../../components/Toast';
import { AuthHeader, checkingText, formatPhone } from '../../components/auth/AuthParts';
import { authDone } from '../../components/auth/authFlow';
import { useT } from '../../i18n';
import { onRed } from '../../theme/colors';
import lists from '../../data/generated/lists.json';

const DIAL = lists.dialCodes as Record<string, string>;
const RESEND_SECONDS = 30;

export default function Code() {
  const t = useT();
  const { mode = 'create', cc = 'GB', phone = '' } = useLocalSearchParams<{ mode?: 'create' | 'signin'; cc?: string; phone?: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const checking = useRef(false); // true while a check runs (a ref, so the automatic check sees it at once)
  const [left, setLeft] = useState(RESEND_SECONDS);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const create = mode === 'create';

  // "Resend in 0:30": counts down once a second
  useEffect(() => {
    if (left <= 0) return;
    const h = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(h);
  }, [left]);

  const verify = (value = code) => {
    if (checking.current) return; // the automatic check and a tap on Verify must not run twice (v53 bug)
    if (!/^\d{6}$/.test(value)) return toast('Enter the 6-digit code');
    checking.current = true;
    setBusy(true);
    setTimeout(() => {
      checking.current = false;
      setBusy(false);
      toast('Number verified ✓', { icon: 'check', top: true });
      authDone(mode, 'phone', phone);
    }, 700);
  };

  const onType = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6) setTimeout(() => verify(digits), 250); // checks by itself on the 6th digit
  };

  const resend = () => {
    setLeft(RESEND_SECONDS);
    setCode('');
    toast('New code sent', { top: true });
  };

  const sentTo = `+${DIAL[cc] ?? '44'} ${formatPhone(phone)}`;

  return (
    <Screen red>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthHeader
          step={create ? 1 : undefined}
          title="Enter the 6-digit code"
          sub={
            <Text style={styles.sub}>
              {t(`Sent to ${sentTo} ·`)}{' '}
              <Text style={styles.link} onPress={() => router.back()} accessibilityRole="link">{t('Change number')}</Text>
            </Text>
          }
        />
        <Pressable onPress={() => input.current?.focus()} accessibilityLabel={t('Enter the 6-digit code')}>
          <Direction rtl={false} style={styles.boxes}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const full = code.length === 6;
              const current = i === code.length;
              return (
                <View key={i} style={[styles.box, full && styles.boxOk, current && styles.boxCur]}>
                  <Text style={[styles.digit, full && { color: '#D90F2B' }]}>{code[i] ?? ''}</Text>
                </View>
              );
            })}
          </Direction>
        </Pressable>
        {/* the real text box is invisible; it receives the keyboard and the SMS auto-fill */}
        <TextInput
          ref={input}
          value={code}
          onChangeText={onType}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          style={styles.hidden}
          accessibilityLabel={t('Enter the 6-digit code')}
        />
        <View style={styles.under}>
          <View />
          <Pressy onPress={resend} disabled={left > 0} scale={0.95}>
            <Text style={[styles.resend, left > 0 && { color: 'rgba(255,255,255,0.86)' }]}>
              {/* "Resend in 0:30" uses the "resend" pattern */}
              {left > 0 ? t(`Resend in 0:${String(left).padStart(2, '0')}`) : t('Resend code')} {/* i18n-ignore (pattern 'resend') */}
            </Text>
          </Pressy>
        </View>
        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <View style={styles.warn}>
            <Icon name="shield" size={18} color="#C20E1B" strokeWidth={2.2} />
            <Text style={styles.warnText}>
              <Text style={{ fontWeight: '800', color: onRed.cardInk }}>{t('Never share this code.')}</Text> {t('TalkAmigo staff will never ask you for it.')}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ paddingHorizontal: 20, paddingBottom: 22 }}>
          <Button kind="white" title={busy ? checkingText(t.lang) : 'Verify'} raw={busy} busy={busy} disabled={code.length !== 6} onPress={() => verify()} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.86)' },
  link: { color: '#fff', fontWeight: '800' },
  boxes: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 24 },
  box: { flex: 1, height: 58, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  boxCur: { borderColor: '#fff' },
  boxOk: { backgroundColor: '#fff', borderColor: '#fff' },
  digit: { fontSize: 26, fontWeight: '700', color: '#fff' },
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  under: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  resend: { fontSize: 14, fontWeight: '800', color: '#fff' },
  warn: { flexDirection: 'row', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 24, backgroundColor: onRed.card },
  warnText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#3A3A44' },
});
