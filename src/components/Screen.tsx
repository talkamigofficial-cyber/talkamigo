/**
 * Page frames.
 *
 *   <Screen>…</Screen>                       a normal page (white / black background, safe from the notch)
 *   <Screen red>…</Screen>                   welcome, log-in and sign-up pages (red logo background)
 *   <TopBar title="Settings" />              back button + title, for pushed pages
 *
 * Every pushed page also goes back with the iPhone swipe from the left edge (right edge in Arabic).
 */
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '../theme/colors';
import { useT } from '../i18n';
import { RedBackground } from './RedBackground';
import { Pressy } from './Pressy';
import { Icon } from './Icon';

type Props = { children: React.ReactNode; red?: boolean; withLogo?: boolean; style?: StyleProp<ViewStyle>; edges?: ('top' | 'bottom')[] };

export function Screen({ children, red, withLogo, style, edges = ['top', 'bottom'] }: Props) {
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: red ? '#850612' : c.bg }}>
      {red && <RedBackground withLogo={withLogo} />}
      <SafeAreaView edges={edges} style={[{ flex: 1 }, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

/** The round back button. On the red screens it is frosted white. */
export function BackButton({ onRed, onPress }: { onRed?: boolean; onPress?: () => void }) {
  const c = useColors();
  return (
    <Pressy
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      scale={0.9}
      accessibilityLabel="Back"
      style={[styles.ibtn, onRed ? styles.ibtnRed : { backgroundColor: c.card, borderColor: c.line }]}
    >
      <Icon name="back" size={21} color={onRed ? '#fff' : c.ink} />
    </Pressy>
  );
}

export function TopBar({ title, right, raw }: { title?: string; right?: React.ReactNode; raw?: boolean }) {
  const c = useColors();
  const t = useT();
  return (
    <View style={styles.top}>
      <BackButton />
      <Text style={[styles.h2, { color: c.ink }]} numberOfLines={1}>{title ? (raw ? title : t(title)) : ''}</Text>
      {right}
    </View>
  );
}

export const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 16, paddingBottom: 12, paddingHorizontal: 20 },
  h2: { flex: 1, fontSize: 20, fontWeight: '700' },
  ibtn: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  ibtnRed: { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.35)' },
});
