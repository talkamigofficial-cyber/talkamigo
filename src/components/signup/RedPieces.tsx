/**
 * Small building blocks for the red sign-up screens (".obx" styles in the prototype):
 *   <RedChip>            translucent chip; selected = white with red text
 *   <SearchBox>          white search field with a magnifier
 *   <FieldLabel>         "Display name" + "Required" tag
 *   <WhiteInput>         white text box (anything people type in stays a clean white card, v41)
 *   <Hint>               small line under a field (yellow = problem, green = OK)
 *   <SectionLabel>       small capitals label ("POPULAR")
 */
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Pressy } from '../Pressy';
import { Icon } from '../Icon';
import { useT } from '../../i18n';
import { onRed } from '../../theme/colors';

export function RedChip({ label, on, onPress, raw, a11y }: { label: string; on?: boolean; onPress: () => void; raw?: boolean; a11y?: string }) {
  const t = useT();
  return (
    <Pressy onPress={onPress} style={[styles.chip, on && styles.chipOn]} accessibilityState={{ selected: !!on }} accessibilityLabel={a11y}>
      <Text style={[styles.chipText, on && { color: onRed.buttonText }]} numberOfLines={1}>{raw ? label : t(label)}</Text>
    </Pressy>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const t = useT();
  return (
    <View style={styles.search}>
      <Icon name="search" size={19} color="#8A8A95" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={t(placeholder)}
        placeholderTextColor="#9A9AA5"
        autoCorrect={false}
        autoComplete="off"
        style={styles.searchInput}
        accessibilityLabel={t(placeholder)}
      />
    </View>
  );
}

export function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  const t = useT();
  return (
    <View style={styles.flab}>
      <Text style={styles.flabText}>{t(label)}</Text>
      {required ? <Text style={styles.req}>{t('Required')}</Text> : null}
    </View>
  );
}

export function WhiteInput(props: TextInputProps) {
  return <TextInput placeholderTextColor="#9A9AA5" {...props} style={[styles.input, props.style]} />;
}

export function Hint({ text, kind, raw }: { text: string; kind?: 'bad' | 'ok'; raw?: boolean }) {
  const t = useT();
  if (!text) return null;
  return <Text style={[styles.hint, kind === 'bad' && styles.hintBad, kind === 'ok' && styles.hintOk]}>{raw ? text : t(text)}</Text>;
}

export function SectionLabel({ text }: { text: string }) {
  const t = useT();
  return <Text style={styles.label}>{t(text).toLocaleUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center' },
  chipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  chipText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  search: { height: 50, borderRadius: 16, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, boxShadow: '0 8px 22px rgba(60,0,40,0.15)' },
  searchInput: { flex: 1, fontSize: 16, color: '#16161D', height: '100%' },
  flab: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  flabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.92)' },
  req: { fontSize: 11, fontWeight: '800', color: '#FFE1E3', backgroundColor: 'rgba(255,255,255,0.16)', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8, overflow: 'hidden' },
  input: { height: 48, borderRadius: 16, backgroundColor: '#fff', paddingHorizontal: 14, fontSize: 16, color: '#16161D' },
  hint: { fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.82)', lineHeight: 17 },
  hintBad: { color: '#FFE08A', fontWeight: '800' },
  hintOk: { color: '#B8FFD0', fontWeight: '800' },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1, color: 'rgba(255,255,255,0.92)' },
});
