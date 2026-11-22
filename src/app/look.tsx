/**
 * "Choose your look" — shown once, right after sign-up, before "Your AI helpers" (v43; prototype vThemeGate()).
 * Three previews: Light · Dark · Match phone (the default). Tapping one switches the app straight away.
 * Not counted as a sign-up step. Changeable any time in Settings → Appearance.
 */
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../state/store';
import { useT } from '../i18n';
import { useColors } from '../theme/colors';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { ThemeCards } from '../components/signup/ThemeCards';

export default function LookScreen() {
  const t = useT();
  const c = useColors();
  const phoneDark = useColorScheme() === 'dark';
  return (
    <Screen>
      <View style={styles.body}>
        <View style={[styles.picon, { backgroundColor: c.tint }]}><Icon name="sun" size={30} color={c.tintText} /></View>
        <Text style={[styles.title, { color: c.ink }]}>{t('Choose your look')}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>{t('Light, dark or the same as your phone. You can change it any time in Settings → Appearance.')}</Text>
        <ThemeCards />
        <View style={styles.now}>
          <Icon name={phoneDark ? 'moon' : 'sun'} size={16} color={c.muted} />
          <Text style={{ color: c.muted, fontSize: 13, fontWeight: '600' }}>{t(phoneDark ? 'Your phone is in dark mode' : 'Your phone is in light mode')}</Text>
        </View>
      </View>
      <View style={styles.foot}>
        <Button title="Continue" onPress={() => { useApp.getState().setLookChosen(); router.replace('/ai-helpers'); }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 40, gap: 16 },
  picon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '700', lineHeight: 33 },
  sub: { fontSize: 15, lineHeight: 22 },
  now: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  foot: { paddingHorizontal: 20, paddingBottom: 26 },
});
