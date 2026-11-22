/**
 * The three sign-in buttons: Google (white), Apple (black), phone number (white).
 * From the prototype's PROVIDERS list + btn() in vAuth().
 *
 *   <ProviderButtons mode="create" onPick={(m) => …} busy={busy} />
 *
 * mode "create" → "Sign up with Google"; mode "signin" → "Log in with Google" + a "Last used" tag
 * on the method used last time on this phone. While Google/Apple "connect", that button shows a
 * spinner and "Connecting to Google…" (v31 Oct: sign-in experience).
 */
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Pressy } from '../Pressy';
import { useT } from '../../i18n';
import type { AuthMethod } from '../../state/store';
import { connectingText } from './AuthParts';

export function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 01-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z" />
      <Path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6.1-4.5H2.3v2.8A11 11 0 0012 23z" />
      <Path fill="#FBBC05" d="M5.9 14.1a6.6 6.6 0 010-4.2V7.1H2.3a11 11 0 000 9.8z" />
      <Path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 002.3 7.1l3.6 2.8C6.8 7.3 9.2 5.4 12 5.4z" />
    </Svg>
  );
}

export function AppleLogo({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path fill={color} d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9s-2-.9-3.3-.9a5 5 0 00-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5a11 11 0 001.4-2.9 4.4 4.4 0 01-2.8-4.3zM14 5.3a4.3 4.3 0 001-3.3 4.5 4.5 0 00-3 1.5 4.2 4.2 0 00-1 3.2c1.2.1 2.3-.6 3-1.4z" />
    </Svg>
  );
}

function PhoneLogo({ size = 20, color = '#16161D' }: { size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <Rect x={6} y={2} width={12} height={20} rx={3} />
      <Path d="M11 18h2" />
    </Svg>
  );
}

const LABEL: Record<AuthMethod, { create: string; signin: string; name: string }> = {
  google: { create: 'Sign up with Google', signin: 'Log in with Google', name: 'Google' },
  apple: { create: 'Sign up with Apple', signin: 'Log in with Apple', name: 'Apple' },
  phone: { create: 'Sign up with phone number', signin: 'Log in with phone number', name: 'phone' },
};

type Props = {
  mode: 'create' | 'signin';
  onPick: (m: AuthMethod) => void;
  busy: AuthMethod | null; // the button that is "connecting"
  lastUsed?: AuthMethod | null; // log in only
};

export function ProviderButtons({ mode, onPick, busy, lastUsed }: Props) {
  const t = useT();
  return (
    <View style={{ gap: 10 }}>
      {(['google', 'apple', 'phone'] as AuthMethod[]).map((m) => {
        const apple = m === 'apple';
        const ink = apple ? '#fff' : '#16161D';
        const isBusy = busy === m;
        const label = isBusy ? connectingText(t.lang, LABEL[m].name) : t(LABEL[m][mode]);
        return (
          <Pressy key={m} onPress={() => onPick(m)} disabled={!!busy} scale={0.955} style={[styles.btn, apple ? styles.apple : styles.white]} accessibilityLabel={label}>
            <View style={styles.logo}>
              {isBusy ? <ActivityIndicator color={ink} /> : m === 'google' ? <GoogleLogo /> : apple ? <AppleLogo /> : <PhoneLogo />}
            </View>
            <Text style={[styles.text, { color: ink }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{label}</Text>
            {mode === 'signin' && lastUsed === m ? (
              <View style={styles.last}><Text style={styles.lastText}>{t('Last used')}</Text></View>
            ) : null}
          </Pressy>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  white: { backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 22px rgba(60,0,40,0.18)' },
  apple: { backgroundColor: '#111114' },
  logo: { width: 20, alignItems: 'center' },
  // centred label; the trailing space mirrors the logo so the text sits in the middle
  text: { flex: 1, textAlign: 'center', fontWeight: '800', fontSize: 16, marginEnd: 20 },
  last: { position: 'absolute', end: 10, top: -8, backgroundColor: '#E0101F', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  lastText: { color: '#fff', fontSize: 10.5, fontWeight: '800' },
});
