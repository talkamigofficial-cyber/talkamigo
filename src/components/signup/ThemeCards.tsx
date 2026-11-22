/**
 * The three look previews — Light · Dark · Match phone (default) — drawn like the prototype's themeCards().
 * Tapping one switches the app straight away. Used on "Choose your look"; can be reused in Settings → Appearance.
 */
import { StyleSheet, Text, View } from 'react-native';
import { useApp, type Theme } from '../../state/store';
import { useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Pressy } from '../Pressy';

/** [value, label, preview background, card colour, text colour] — same drawings as the prototype's themeCards(). */
const CARDS: [Theme, string, string, string, string][] = [
  ['light', 'Light', '#FBF6F5', '#FFE1E3', '#1A1418'],
  ['dark', 'Dark', '#0E0A11', '#3A0A18', '#F7F1F4'],
  ['system', 'Match phone', 'linear-gradient(90deg, #FBF6F5 50%, #0E0A11 50%)', '#E0101F', '#888888'],
];

export function ThemeCards() {
  const t = useT();
  const c = useColors();
  const theme = useApp((s) => s.theme);
  return (
    <View style={styles.cards}>
      {CARDS.map(([value, label, bg, card, ink]) => {
        const on = theme === value;
        return (
          <View key={value} style={{ flex: 1 }}>
            <Pressy onPress={() => useApp.getState().setTheme(value)} scale={0.97} style={[styles.card, { borderColor: on ? c.brandText : c.line, backgroundColor: c.card }]} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <View style={[styles.mini, { backgroundImage: bg.startsWith('linear') ? bg : undefined, backgroundColor: bg.startsWith('linear') ? undefined : bg }]}>
                <View style={{ height: 10, width: '60%', borderRadius: 5, backgroundColor: ink, opacity: 0.8 }} />
                <View style={{ height: 34, borderRadius: 9, backgroundColor: card }} />
                <View style={{ height: 8, width: '80%', borderRadius: 4, backgroundColor: ink, opacity: 0.35 }} />
                <View style={{ height: 8, width: '50%', borderRadius: 4, backgroundColor: ink, opacity: 0.35 }} />
                <View style={{ marginTop: 'auto', height: 14, borderRadius: 7, backgroundImage: 'linear-gradient(135deg, #FF4A2E, #E0101F)' }} />
              </View>
              <Text style={[styles.cardLabel, { color: c.ink }]} numberOfLines={1} adjustsFontSizeToFit>{t(label)}</Text>
              {value === 'system' ? <Text style={[styles.def, { color: c.muted }]}>{t('Default')}</Text> : null}
            </Pressy>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { flexDirection: 'row', gap: 10 },
  card: { borderWidth: 2, borderRadius: 20, padding: 8, gap: 8, alignItems: 'center' },
  mini: { width: '100%', height: 120, borderRadius: 14, overflow: 'hidden', gap: 6, padding: 10 },
  cardLabel: { fontWeight: '700', fontSize: 13 },
  def: { fontSize: 11, fontWeight: '600', marginTop: -6 },
});
