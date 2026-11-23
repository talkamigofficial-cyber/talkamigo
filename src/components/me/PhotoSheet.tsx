/**
 * "Change photo": pick from the phone's photos (system picker, no permission needed — CLAUDE.md
 * "Permissions in context"), take a photo, or use one of the 6 ready-made pictures. Every photo will be
 * checked automatically once there's a server (slice 2).
 */
import { StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import lists from '../../data/generated/lists.json';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Sheet } from '../Sheet';
import { Button } from '../Button';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { toast } from '../Toast';

/** Ready-made pictures (an emoji on a colour), for people who'd rather not use a photo of themselves. */
const READY = lists.demoPhotos as [string, string][];

export function PhotoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  const t = useT();
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
      <View style={styles.ready}>
        {READY.map(([emoji, bg], i) => {
          const on = !!photo && 'emoji' in photo && photo.emoji === emoji;
          return (
            <Pressy key={i} onPress={() => setPhoto({ emoji, bg })} scale={0.9} accessibilityLabel={`${t('Photo')} ${i + 1}`} style={[styles.pic, { backgroundImage: bg, borderColor: on ? c.brand : 'transparent' }]}>
              <Text style={{ fontSize: 26 }}>{emoji}</Text>
            </Pressy>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  ready: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  pic: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
