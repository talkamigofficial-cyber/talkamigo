/**
 * Buttons, in the prototype's styles.
 *
 *   <Button title="Continue" onPress={…} />                       red, full width (the main action)
 *   <Button title="Not now" kind="ghost" onPress={…} />           grey
 *   <Button title="Log in" kind="glass" icon="lock" />            white card with a border
 *   <Button title="Create account" kind="white" />                white with red text (on the red screens)
 *   <Button title="Log in" kind="outlineWhite" />                 see-through with a white border (on the red screens)
 *
 * The title is translated automatically. Pass `raw` if it is already final text.
 */
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Pressy } from './Pressy';
import { Icon, type IconName } from './Icon';
import { useT } from '../i18n';
import { BRAND_GRADIENT, onRed, useColors } from '../theme/colors';

export type ButtonKind = 'primary' | 'ghost' | 'glass' | 'white' | 'outlineWhite';

type Props = {
  title: string;
  onPress?: () => void;
  kind?: ButtonKind;
  icon?: IconName;
  disabled?: boolean;
  busy?: boolean;
  small?: boolean;
  raw?: boolean;
  style?: StyleProp<ViewStyle>;
  left?: React.ReactNode; // e.g. the Google logo
};

export function Button({ title, onPress, kind = 'primary', icon, disabled, busy, small, raw, style, left }: Props) {
  const c = useColors();
  const t = useT();

  const looks: Record<ButtonKind, { box: ViewStyle; text: string }> = {
    primary: { box: { backgroundImage: BRAND_GRADIENT, boxShadow: '0 10px 24px rgba(224,16,31,0.32)' }, text: '#fff' },
    ghost: { box: { backgroundColor: c.chip }, text: c.ink },
    glass: { box: { backgroundColor: c.card, borderWidth: 1, borderColor: c.line }, text: c.ink },
    white: { box: { backgroundColor: '#fff', boxShadow: '0 12px 30px rgba(70,0,40,0.3)' }, text: onRed.buttonText },
    outlineWhite: { box: { backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' }, text: '#fff' },
  };
  let look = looks[kind];
  if (disabled) {
    look = kind === 'white' || kind === 'outlineWhite'
      ? { box: { backgroundColor: onRed.disabled }, text: onRed.disabledText }
      : { box: { backgroundColor: c.chip }, text: c.muted };
  }

  return (
    <Pressy onPress={onPress} disabled={disabled || busy} scale={small ? 0.94 : 0.955} style={[styles.base, small && styles.small, look.box, style]} accessibilityLabel={raw ? title : t(title)}>
      <View style={styles.row}>
        {busy ? <ActivityIndicator color={look.text} /> : left ?? (icon ? <Icon name={icon} size={19} color={look.text} strokeWidth={2.2} /> : null)}
        <Text style={[styles.text, small && { fontSize: 14 }, { color: look.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {raw ? title : t(title)}
        </Text>
      </View>
    </Pressy>
  );
}

const styles = StyleSheet.create({
  base: { height: 54, borderRadius: 18, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  small: { height: 42, borderRadius: 14, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontWeight: '800', fontSize: 16 },
});
