/**
 * Sign-up step 9 of 9 — "Say hi on video" (prototype step 6, recBox(), 'rec-start' / 'rec-stop').
 * Optional for learners: "Skip for now & finish" is always available; it can be added later from Me.
 *
 * SLICE 1: recording is pretended, like the prototype's "(demo)": the timer counts to 30 s quickly and
 * marks the intro as saved. Real recording (camera + microphone, upload, check before it's public)
 * comes with the server.
 */
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { goNext } from '../../components/signup/flow';

export default function VideoStep() {
  const t = useT();
  const hasVideo = useApp((s) => s.me.video);
  const update = useApp((s) => s.updateMe);
  const [secs, setSecs] = useState<number | null>(null); // null = not recording
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setSecs(null);
    update({ video: true });
  };
  const start = () => {
    setSecs(0);
    timer.current = setInterval(() => {
      setSecs((s) => {
        const n = (s ?? 0) + 1;
        if (n >= 30) setTimeout(stop, 0); // 30 seconds maximum
        return n;
      });
    }, 150);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  return (
    <SignupFrame
      step="video"
      title="Say hi on video"
      sub="Optional · up to 30 seconds. Profiles with an intro video get more replies. It plays when people tap your photo."
      reason=""
      canContinue={secs === null}
      button={hasVideo ? 'Finish' : 'Skip for now & finish'}
      onNext={() => goNext('video')}
    >
      <View style={styles.box}>
        <Avatar id="me" size={110} noFlag />
        {secs !== null ? (
          <Text style={[styles.tag, { backgroundColor: '#E0101F' }]}>● REC {secs}s / 30s</Text>
        ) : hasVideo ? (
          <View style={[styles.tagRow, { backgroundColor: '#14804A' }]}>
            <Icon name="check" size={13} color="#fff" strokeWidth={3} />
            <Text style={styles.tagText}>{t('Intro video saved')}</Text>
          </View>
        ) : null}
        <Text style={styles.tip}>💡 {t('Say your name, where you’re from and what you’re learning')}</Text>
      </View>

      {secs !== null ? (
        <Button kind="white" icon="stop" title="Stop" onPress={stop} />
      ) : (
        <Button kind={hasVideo ? 'outlineWhite' : 'white'} title={hasVideo ? 'Record again' : '● ' + t('Record my intro (demo)')} raw={!hasVideo} onPress={start} />
      )}

      <View style={styles.rulesRow}>
        <Icon name="shield" size={14} color="rgba(255,255,255,0.82)" />
        <Text style={styles.rules}>{t('Same rules as photos: keep it appropriate. Every video is checked before it’s shown.')}</Text>
      </View>
    </SignupFrame>
  );
}

const styles = StyleSheet.create({
  box: { height: 280, borderRadius: 26, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundImage: 'radial-gradient(90% 60% at 50% 30%, #4A1A3A, #120812)' },
  tag: { position: 'absolute', top: 12, start: 12, color: '#fff', fontSize: 12, fontWeight: '800', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10, overflow: 'hidden' },
  tagRow: { position: 'absolute', top: 12, start: 12, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  tip: { position: 'absolute', start: 12, end: 12, bottom: 12, color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 18, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, overflow: 'hidden' },
  rulesRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  rules: { flex: 1, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.82)' },
});
