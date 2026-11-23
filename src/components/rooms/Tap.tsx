/**
 * A card that is tappable only when there is something to open.
 * Opening rooms, lives and lessons arrives in later slices (6, 7, 10); until then the cards are plain,
 * so nothing looks like a button that does nothing (founder: "Every button must work").
 *
 *   <Tap onPress={openRoom} scale={0.98} style={…}>…</Tap>     onPress missing → a plain View
 */
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Pressy } from '../Pressy';

type Props = { onPress?: () => void; scale?: number; style?: StyleProp<ViewStyle>; accessibilityLabel?: string; highlight?: string; children: React.ReactNode };

export function Tap({ onPress, scale = 0.98, style, accessibilityLabel, highlight, children }: Props) {
  if (!onPress) return <View style={style} accessibilityLabel={accessibilityLabel}>{children}</View>;
  return <Pressy onPress={onPress} scale={scale} style={style} accessibilityLabel={accessibilityLabel} highlight={highlight}>{children}</Pressy>;
}
