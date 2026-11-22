/**
 * Sign-up step 8 of 9 — "Add a profile photo" (prototype step 5, 'ob-photo', 'ob-promise'; layout from v87).
 * Photo with "Choose photo" / "Take photo" beside it, six demo photos, then the community promise tick
 * right under the photo (required), then the photo rules in one short line.
 * The button says "Skip photo" until a photo is chosen; it only works once the promise is ticked.
 *
 * Choose photo = the iPhone photo picker (no permission needed). Take photo = our explanation first,
 * then the iPhone camera permission (CLAUDE.md "Permissions in context"). Photos are checked by our
 * team / moderation API from slice 2; in slice 1 they stay on the phone.
 */
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import lists from '../../data/generated/lists.json';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Pressy } from '../../components/Pressy';
import { Sheet } from '../../components/Sheet';
import { toast } from '../../components/Toast';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { goNext, signupSession } from '../../components/signup/flow';
import { useColors } from '../../theme/colors';

const DEMO = lists.demoPhotos as [string, string][];

export default function PhotoStep() {
  const t = useT();
  const c = useColors();
  const me = useApp((s) => s.me);
  const update = useApp((s) => s.updateMe);
  const [promise, setPromise] = useState(signupSession.promise);
  const [askCamera, setAskCamera] = useState(false);

  const tick = () => { signupSession.promise = !promise; setPromise(!promise); };
  const added = () => toast('Photo added · we check every photo', { icon: 'check' });

  const choose = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled && r.assets[0]) { update({ photo: { uri: r.assets[0].uri } }); added(); }
  };
  const takePhoto = async () => {
    setAskCamera(false);
    if (Platform.OS === 'web') return choose(); // no camera in the web preview
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return; // "Don't Allow" is respected
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled && r.assets[0]) { update({ photo: { uri: r.assets[0].uri } }); added(); }
  };

  return (
    <SignupFrame
      step="photo"
      title="Add a profile photo"
      sub="Show your face so partners know who they’re talking to."
      reason={promise ? '' : 'Tick the community promise to continue'}
      button={me.photo ? 'Continue' : 'Skip photo'}
      onNext={() => goNext('photo')}
    >
      <View style={styles.row}>
        <Avatar id="me" size={84} />
        <View style={styles.buttons}>
          <Button kind="glass" small icon="photo" title="Choose photo" onPress={choose} style={styles.btn} />
          <Button kind="glass" small icon="camera" title="Take photo" onPress={() => setAskCamera(true)} style={styles.btn} />
        </View>
      </View>

      <View style={styles.demo}>
        {DEMO.map(([emoji, bg], i) => {
          const on = !!me.photo && 'emoji' in me.photo && me.photo.emoji === emoji;
          return (
            <Pressy key={emoji} scale={0.9} onPress={() => { update({ photo: { emoji, bg } }); added(); }} accessibilityLabel={`Demo photo ${i + 1}`} style={[styles.demoBtn, { backgroundImage: bg, borderColor: on ? '#fff' : 'transparent' }]}>
              <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </Pressy>
          );
        })}
      </View>

      {/* the community promise sits right under the photo (v87) */}
      <Pressy onPress={tick} scale={0.98} style={styles.promise} accessibilityRole="checkbox" accessibilityState={{ checked: promise }}>
        <View style={[styles.tick, promise && styles.tickOn]}>{promise ? <Icon name="check" size={15} color="#fff" strokeWidth={3} /> : null}</View>
        <Text style={styles.promiseText}>
          <Text style={{ fontWeight: '800' }}>{t('I agree to the community promise:')}</Text> {t('be kind and patient, keep it respectful, be the real you.')}
        </Text>
      </Pressy>
      <Text style={styles.rules}>{t('No nudity, violence, hate, drugs or photos of children. Every photo is checked.')}</Text>

      <Sheet visible={askCamera} onClose={() => setAskCamera(false)}>
        <View style={styles.perm}>
          <View style={[styles.picon, { backgroundColor: c.tint }]}><Icon name="camera" size={30} color={c.tintText} /></View>
          <Text style={[styles.permTitle, { color: c.ink }]}>{t('Allow your camera')}</Text>
          <Text style={[styles.permText, { color: c.muted }]}>{t('So you can go live, video-call and record your intro. The camera is never switched on without you.')}</Text>
          <Button title="Continue" onPress={takePhoto} style={{ alignSelf: 'stretch' }} />
          <Button kind="ghost" title="Not now" onPress={() => setAskCamera(false)} style={{ alignSelf: 'stretch' }} />
        </View>
      </Sheet>
    </SignupFrame>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  buttons: { flex: 1, gap: 8, minWidth: 0 },
  btn: { height: 44, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 0 },
  demo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  promise: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 11, paddingHorizontal: 12 },
  tick: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: '#C9C9D1', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tickOn: { backgroundColor: '#E0101F', borderColor: '#E0101F' },
  promiseText: { flex: 1, color: '#16161D', fontSize: 13.5, lineHeight: 19 },
  rules: { fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.82)' },
  perm: { alignItems: 'center', gap: 10, paddingVertical: 6 },
  picon: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFF0F1', alignItems: 'center', justifyContent: 'center' },
  permTitle: { fontSize: 20, fontWeight: '700', color: '#111114', textAlign: 'center' },
  permText: { fontSize: 14.5, lineHeight: 21, color: '#6B6B76', textAlign: 'center' },
});
