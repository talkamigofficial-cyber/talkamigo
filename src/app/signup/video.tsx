/**
 * Sign-up step 9 of 9 — "Say hi on video" (prototype step 6, recBox(), 'rec-start').
 * Optional for learners: "Skip for now & finish" is always available; it can be added later from Me.
 *
 * Real recording with the iPhone camera, up to 30 seconds (expo-image-picker), after our own camera
 * explanation first (CLAUDE.md "Permissions in context"); or "Choose a video" from the phone's videos.
 * The video stays on this phone for now (signupSession.introVideoUri); uploading it and checking it before
 * it's public comes with the server (slice 2). No "(demo)" anywhere (NEXT_STEPS §4).
 */
import { useState } from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Sheet } from '../../components/Sheet';
import { toast } from '../../components/Toast';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { goNext, signupSession } from '../../components/signup/flow';
import { useColors } from '../../theme/colors';

const MAX_SECONDS = 30;

export default function VideoStep() {
  const t = useT();
  const c = useColors(); // only for the camera sheet, which follows the phone's light/dark look
  const hasVideo = useApp((s) => s.me.video);
  const update = useApp((s) => s.updateMe);
  const [askCamera, setAskCamera] = useState(false);
  // small phones get a shorter preview so both buttons fit without scrolling (v87 "every step fits the screen")
  const screenH = useWindowDimensions().height;
  const small = screenH < 700;
  const tiny = screenH < 620; // iPhone SE size

  const saved = (r: ImagePicker.ImagePickerResult) => {
    if (r.canceled || !r.assets[0]) return;
    signupSession.introVideoUri = r.assets[0].uri;
    update({ video: true });
    toast('Video added · we check every video', { icon: 'check' });
  };
  const choose = async () => {
    saved(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], videoMaxDuration: MAX_SECONDS, allowsEditing: true }));
  };
  const record = async () => {
    setAskCamera(false);
    if (Platform.OS === 'web') return choose(); // no camera in the web preview
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return; // "Don't Allow" is respected
    saved(await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], videoMaxDuration: MAX_SECONDS, cameraType: ImagePicker.CameraType.front }));
  };

  return (
    <SignupFrame
      step="video"
      title="Say hi on video"
      sub="Optional · up to 30 seconds. Profiles with an intro video get more replies. It plays when people tap your photo."
      reason=""
      button={hasVideo ? 'Finish' : 'Skip for now & finish'}
      onNext={() => goNext('video')}
    >
      <View style={[styles.box, small && { height: tiny ? 92 : 150 }]}>
        <Avatar id="me" size={tiny ? 48 : small ? 70 : 110} noFlag />
        {hasVideo ? (
          <View style={[styles.tagRow, { backgroundColor: '#14804A' }]}>
            <Icon name="check" size={13} color="#fff" strokeWidth={3} />
            <Text style={styles.tagText}>{t('Intro video saved')}</Text>
          </View>
        ) : null}
        {/* on the smallest phones the tip moves under the box as one line, so the box can be short */}
        {!tiny ? <Text style={styles.tip}>💡 {t('Say your name, where you’re from and what you’re learning')}</Text> : null}
      </View>

      <Button kind={hasVideo ? 'outlineWhite' : 'white'} icon="video" title={hasVideo ? 'Record again' : 'Record my intro'} small={tiny} onPress={() => setAskCamera(true)} />
      <Button kind="outlineWhite" icon="folder" title="Choose a video" small={tiny} onPress={choose} />

      <View style={styles.rulesRow}>
        <Icon name="shield" size={14} color="rgba(255,255,255,0.82)" />
        <Text style={styles.rules}>{t('Same rules as photos: keep it appropriate. Every video is checked before it’s shown.')}</Text>
      </View>

      {/* our explanation first, then the iPhone's own camera permission */}
      <Sheet visible={askCamera} onClose={() => setAskCamera(false)}>
        <View style={styles.perm}>
          <View style={[styles.picon, { backgroundColor: c.tint }]}><Icon name="camera" size={30} color={c.tintText} /></View>
          <Text style={[styles.permTitle, { color: c.ink }]}>{t('Allow your camera')}</Text>
          <Text style={[styles.permText, { color: c.muted }]}>{t('So you can go live, video-call and record your intro. The camera is never switched on without you.')}</Text>
          <Button title="Continue" onPress={record} style={{ alignSelf: 'stretch' }} />
          <Button kind="ghost" title="Not now" onPress={() => setAskCamera(false)} style={{ alignSelf: 'stretch' }} />
        </View>
      </Sheet>
    </SignupFrame>
  );
}

const styles = StyleSheet.create({
  box: { height: 250, borderRadius: 26, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundImage: 'radial-gradient(90% 60% at 50% 30%, #4A1A3A, #120812)' },
  tagRow: { position: 'absolute', top: 12, start: 12, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  tip: { position: 'absolute', start: 12, end: 12, bottom: 12, color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 18, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, overflow: 'hidden' },
  rulesRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  rules: { flex: 1, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.82)' },
  perm: { alignItems: 'center', gap: 12, paddingBottom: 6 },
  picon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  permTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  permText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
