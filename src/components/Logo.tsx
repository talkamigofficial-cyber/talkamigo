/**
 * The TalkAmigo signature: "Talk" near-black + "Amigo" brand red, never translated (v45).
 * On the red screens it sits on a white rounded plate, optionally with the app icon.
 *
 *   <LogoPlate icon />        Join / Welcome back
 *   <LogoPlate big />         Welcome (large, no icon)
 *   <Signature size={20} />   plain, on normal pages
 */
import { Image, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../theme/colors';
import { Direction } from './Direction';

export const LOGO = require('../../assets/images/logo.jpg');

export function Signature({ size = 20, onPlate }: { size?: number; onPlate?: boolean }) {
  const c = useColors();
  return (
    <Text style={[styles.sig, { fontSize: size, writingDirection: 'ltr' }]} accessibilityLabel="TalkAmigo">
      <Text style={{ color: onPlate ? '#16161D' : c.ink }}>Talk</Text>
      <Text style={{ color: '#E0101F' }}>Amigo</Text>
    </Text>
  );
}

export function LogoPlate({ icon, big }: { icon?: boolean; big?: boolean }) {
  return (
    <Direction rtl={false} style={[styles.plate, big ? styles.big : icon ? styles.withIcon : null]}>
      {icon && <Image source={LOGO} style={styles.icon} />}
      <Signature size={big ? 52 : 32} onPlate />
    </Direction>
  );
}

const styles = StyleSheet.create({
  sig: { fontWeight: '900', letterSpacing: -1.2 },
  plate: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 18, boxShadow: '0 14px 34px rgba(70,0,40,0.28)',
  },
  withIcon: { paddingStart: 8 },
  big: { paddingVertical: 14, paddingHorizontal: 26, borderRadius: 26 },
  icon: { width: 44, height: 44, borderRadius: 12 },
});
