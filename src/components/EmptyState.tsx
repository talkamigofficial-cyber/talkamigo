/**
 * "Nothing here yet" — the empty screen design the founder picked (option B, 23 Nov 2026):
 * a small line icon in a soft red square, a bold title, one short sentence, and at most one red button
 * for the next step. Used on every list that can be empty (Chats, Connect, Flicks, Rooms, My Flicks…).
 *
 *   <EmptyState icon="chat" title="No chats yet"
 *               text="Find someone who speaks the language you’re learning and say hi."
 *               button="Find a partner" onPress={() => router.navigate('/connect')} />
 *
 * Only give a button when its feature exists. No button is better than a button that does nothing.
 * Texts are translated automatically.
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useColors, useScheme } from '../theme/colors';
import { Icon, type IconName } from './Icon';
import { T } from './T';
import { Button } from './Button';

type Props = {
  icon: IconName;
  title: string;
  text?: string;
  button?: string;
  onPress?: () => void;
  /** a dark background behind it (e.g. the Flicks feed) whatever the theme */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon, title, text, button, onPress, onDark, style }: Props) {
  const c = useColors();
  const scheme = useScheme();
  const dark = onDark || scheme === 'dark';
  return (
    <View style={[styles.wrap, style]} accessibilityRole="summary">
      <View style={[styles.tile, { backgroundColor: dark ? 'rgba(238,22,38,0.14)' : '#FFF0F1' }]}>
        <Icon name={icon} size={30} color={dark ? '#FF5A66' : '#C20E1B'} />
      </View>
      <T style={[styles.title, { color: onDark ? '#F4F4F6' : c.ink }]}>{title}</T>
      {text ? <T style={[styles.text, { color: onDark ? '#9A9AA6' : c.muted }]}>{text}</T> : null}
      {button && onPress ? <Button title={button} onPress={onPress} small style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40, gap: 12 },
  tile: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  text: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 300 },
  button: { marginTop: 4, paddingHorizontal: 20 },
});
