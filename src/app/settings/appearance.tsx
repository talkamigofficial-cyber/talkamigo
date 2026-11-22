/**
 * Settings → Appearance: Light · Dark · Match phone (default). Changes apply straight away.
 */
import { ScrollView } from 'react-native';
import { useColors } from '../../theme/colors';
import { Screen, TopBar } from '../../components/Screen';
import { T } from '../../components/T';
import { ThemeCards } from '../../components/settings/ThemeCards';

export default function Appearance() {
  const c = useColors();
  return (
    <Screen>
      <TopBar title="Appearance" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, gap: 12 }}>
        <ThemeCards />
        <T style={{ fontSize: 13, lineHeight: 19.5, color: c.muted }}>Match phone follows your iPhone’s light or dark setting. Light is white & red, Dark is black & red.</T>
      </ScrollView>
    </Screen>
  );
}
