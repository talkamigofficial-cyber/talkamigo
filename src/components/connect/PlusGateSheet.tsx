/**
 * "This is a Plus feature" sheet, opened by crowned items (City, Age, Advanced search…) for Standard members.
 * Nothing is hidden with fake blur: it is clearly labelled (decided 1 Nov 2026).
 */
import { StyleSheet, View } from 'react-native';
import { Sheet } from '../Sheet';
import { T } from '../T';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { comingSoon } from '../Toast';
import { useColors } from '../../theme/colors';

export function PlusGateSheet({ feature, onClose }: { feature: string | null; onClose: () => void }) {
  const c = useColors();
  return (
    <Sheet visible={!!feature} onClose={onClose}>
      <View style={s.box}>
        <View style={s.icon}><Icon name="crown" size={30} color="#F5A300" fill="#F5A300" strokeWidth={0} /></View>
        <T style={[s.h3, { color: c.ink }]}>{`${feature ?? 'This'} is a Plus feature`}</T>
        <T style={[s.text, { color: c.muted }]}>Plus also unlocks who viewed you, private rooms, rooms with no time limit, a free first boost and no promo screens.</T>
        <View style={{ alignSelf: 'stretch', gap: 10 }}>
          <Button title="See Plus" onPress={() => { onClose(); comingSoon(); }} />
          <Button title="Not now" kind="ghost" onPress={onClose} />
        </View>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  box: { alignItems: 'center', gap: 10, paddingVertical: 4 },
  icon: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFF1D6', alignItems: 'center', justifyContent: 'center' },
  h3: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  text: { fontSize: 14.5, lineHeight: 22, textAlign: 'center' },
});
