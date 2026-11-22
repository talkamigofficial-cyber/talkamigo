/**
 * The little gold coin and blue Diamond drawings used next to balances (prototype COIN() and GEM()),
 * and the round balance chips at the top of the Me tab.
 */
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Pressy } from '../Pressy';
import { useColors } from '../../theme/colors';

export function Coin({ size = 18 }: { size?: number }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundImage: 'radial-gradient(circle at 35% 30%, #FFF2B0, #FFC531 45%, #E08A00)',
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(160,90,0,0.25)',
      }}
    />
  );
}

export function Gem({ size = 18 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M6 3h12l4 6-10 12L2 9z" fill="#8FD8FF" />
      <Path d="M2 9h20L12 21z" fill="#5B8CFF" />
      <Path d="M6 3l3 6 3-6 3 6 3-6" fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={1.2} />
    </Svg>
  );
}

/** Grey rounded chip with a coin or Diamond and the balance. */
export function BalanceChip({ kind, value, onPress, label }: { kind: 'coin' | 'gem'; value: string; onPress: () => void; label: string }) {
  const c = useColors();
  return (
    <Pressy onPress={onPress} accessibilityLabel={label} style={{ height: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.chip }}>
      {kind === 'coin' ? <Coin /> : <Gem />}
      <Text style={{ fontWeight: '800', fontSize: 14, color: c.ink }}>{value}</Text>
    </Pressy>
  );
}
