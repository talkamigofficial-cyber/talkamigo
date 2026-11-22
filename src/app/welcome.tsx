// Placeholder: replaced while building slice 1.
import { View } from 'react-native';
import { Screen } from '../components/Screen';
import { T } from '../components/T';
import { Button } from '../components/Button';
import { LogoPlate } from '../components/Logo';
import { useApp } from '../state/store';
import { router } from 'expo-router';
export default function Welcome() {
  return (
    <Screen red withLogo>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 20 }}>
        <LogoPlate big />
        <T style={{ color: '#fff' }}>Create account</T>
        <Button kind="white" title="Just looking? Try the demo" onPress={() => { useApp.getState().tryDemo(); router.replace('/'); }} />
      </View>
    </Screen>
  );
}
