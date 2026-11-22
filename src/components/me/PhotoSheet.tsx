/**
 * "Change photo": pick from the phone's photos (system picker, no permission needed — CLAUDE.md
 * "Permissions in context"), take a photo, or use one of the 6 demo photos. Every photo will be
 * checked automatically once there's a server (slice 2).
 */
import { StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import lists from '../../data/generated/lists.json';
import { useApp } from '../../state/store';
import { useColors } from '../../theme/colors';
import { Sheet } from '../Sheet';
import { Button } from '../Button';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { toast } from '../Toast';

const DEMO = lists.demoPhotos as [string, string][];

export function PhotoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  const photo = useApp((s) => s.me.photo);
  const setPhoto = (p: Parameters<ReturnType<typeof useApp.getState>['updateMe']>[0]['photo']) => {
    useApp.getState().updateMe({ photo: p });
    onClose();
    toast('Photo updated', { icon: 'check' });
  };

  const fromLibrary = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled && r.assets[0]) setPhoto({ uri: r.assets[0].uri });
  };
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { toast('Camera is off', { sub: 'You said “Don’t Allow” earlier. To use this, turn it on in iPhone Settings → TalkAmigo.', icon: 'camera' }); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled && r.assets[0]) setPhoto({ uri: r.assets[0].uri });
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Change photo">
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}><Button kind="glass" small icon="image" title="Choose photo" onPress={fromLibrary} /></View>
        <View style={{ flex: 1 }}><Button kind="glass" small icon="camera" title="Take photo" onPress={takePhoto} /></View>
      </View>
      <View style={styles.demos}>
        {DEMO.map(([emoji, bg], i) => {
          const on = !!photo && 'emoji' in photo && photo.emoji === emoji;
          return (
            <Pressy key={i} onPress={() => setPhoto({ emoji, bg })} scale={0.9} accessibilityLabel={`Demo photo ${i + 1}`} style={[styles.demo, { backgroundImage: bg, borderColor: on ? c.brand : 'transparent' }]}>
              <Text style={{ fontSize: 26 }}>{emoji}</Text>
            </Pressy>
          );
        })}
      </View>
      <T style={{ fontSize: 12.5, color: c.muted, textAlign: 'center' }}>Demo photos. In the app you pick from your library or take a photo. Every photo is checked.</T>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  demos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  demo: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
