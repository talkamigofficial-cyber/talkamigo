/**
 * Three small previews to choose the app's look: Light · Dark · Match phone (prototype themeCards()).
 * Tapping one switches the whole app at once. "Match phone" is the default (decided 5 Nov 2026).
 * Used by Settings → Appearance (and can be reused by "Choose your look" after sign-up).
 */
import { StyleSheet, View } from 'react-native';
import { useApp, type Theme } from '../../state/store';
import { useColors } from '../../theme/colors';
import { Pressy } from '../Pressy';
import { T } from '../T';

const CARDS: { value: Theme; label: string; bg: string; block: string; ink: string }[] = [
  { value: 'light', label: 'Light', bg: 'linear-gradient(#FBF6F5, #FBF6F5)', block: '#FFE1E3', ink: '#1A1418' },
  { value: 'dark', label: 'Dark', bg: 'linear-gradient(#0E0A11, #0E0A11)', block: '#3A0A18', ink: '#F7F1F4' },
  { value: 'system', label: 'Match phone', bg: 'linear-gradient(90deg, #FBF6F5 50%, #0E0A11 50%)', block: '#E0101F', ink: '#888888' },
];

export function ThemeCards() {
  const c = useColors();
  const theme = useApp((s) => s.theme);
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {CARDS.map((x) => {
        const on = theme === x.value;
        return (
          <View key={x.value} style={{ flex: 1 }}>
            <Pressy
              onPress={() => useApp.getState().setTheme(x.value)}
              scale={0.96}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[styles.card, { backgroundColor: c.card, borderColor: on ? c.brandText : c.line }]}
            >
              <View style={[styles.mini, { backgroundImage: x.bg }]}>
                <View style={[styles.line, { width: '60%', height: 10, backgroundColor: x.ink, opacity: 0.8 }]} />
                <View style={{ height: 34, borderRadius: 9, backgroundColor: x.block }} />
                <View style={[styles.line, { width: '80%', backgroundColor: x.ink, opacity: 0.35 }]} />
                <View style={[styles.line, { width: '50%', backgroundColor: x.ink, opacity: 0.35 }]} />
                <View style={styles.button} />
              </View>
              <T style={{ fontWeight: '700', fontSize: 13, textAlign: 'center' }}>{x.label}</T>
              {x.value === 'system' && <T style={{ fontSize: 11, fontWeight: '600', color: c.muted, marginTop: -6 }}>Default</T>}
            </Pressy>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 2, borderRadius: 20, padding: 8, gap: 8, alignItems: 'center' },
  mini: { width: '100%', height: 120, borderRadius: 14, overflow: 'hidden', gap: 6, padding: 10 },
  line: { height: 8, borderRadius: 4 },
  button: { marginTop: 'auto', height: 14, borderRadius: 7, backgroundImage: 'linear-gradient(135deg, #FF4A2E, #E0101F)' },
});
