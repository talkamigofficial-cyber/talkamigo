/**
 * The A1 … C2 level picker (a segmented bar) and what each level means in words (v87, prototype LVMEAN).
 * Used on the sign-up learning step; it can be reused in Settings → My languages.
 */
import { StyleSheet, Text, View } from 'react-native';
import { Pressy } from '../Pressy';
import type { Level } from '../../state/store';

export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const LEVEL_MEANING: Record<Level, string> = {
  A1: 'I know a few words',
  A2: 'Simple everyday chats',
  B1: 'I can talk about most topics',
  B2: 'Comfortable, a few mistakes',
  C1: 'Fluent, rare mistakes',
  C2: 'Like a native',
};

export function LevelBar({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  return (
    <View style={styles.seg} accessibilityRole="radiogroup">
      {LEVELS.map((l) => (
        // each button sits in its own flex:1 box so the six share the width equally
        <View key={l} style={{ flex: 1 }}>
          <Pressy onPress={() => onChange(l)} scale={0.92} style={[styles.btn, value === l && styles.on]} accessibilityRole="radio" accessibilityState={{ selected: value === l }}>
            <Text style={[styles.text, value === l && styles.textOn]}>{l}</Text>
          </Pressy>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)' },
  btn: { height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(60,0,40,0.18)' },
  text: { color: '#fff', fontWeight: '700', fontSize: 14 },
  textOn: { color: '#D90F2B' },
});
