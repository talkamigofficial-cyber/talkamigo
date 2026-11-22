/**
 * The welcome tour (v44; prototype TOUR, placeTour0() and the 'tour-*' handlers).
 * 12 cards, one idea each. Nothing moves until the person taps: Next, "Open Chats"-style buttons
 * (which open that tab), or the highlighted spot itself. ‹ goes back, Skip is always there (except on
 * the last card), step dots at the top. Finishing gives +50 coins once.
 *
 * Mount it once, full-screen, on top of the tabs:   <Tour />
 * It shows by itself for a new account after "Your AI helpers", and never again once finished or skipped.
 * Spotlight targets are marked with <TourTarget id=…> (see TourTarget.tsx for the ids).
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Pressy } from '../Pressy';
import { toast } from '../Toast';
import { measureTarget, type TourTargetId } from './TourTarget';

type Tab = '/flicks' | '/chats' | '/connect' | '/rooms' | '/me';
type Step = { target?: TourTargetId; title: string; points: string[]; go?: Tab; button?: string; last?: boolean };

/** The cards, word for word from the prototype. `go` = this card's button opens that tab. */
export const TOUR_STEPS: Step[] = [
  { title: 'Welcome to TalkAmigo', points: ['Here’s a quick look at the essentials. It takes about a minute.', 'Tap Next when you’re ready. You can go back or skip at any time.'] },
  { target: 'tab-flicks', title: 'Flicks', points: ['Short posts from people learning languages, like you.', 'Swipe up for the next one. Tap any word to see what it means.', 'Stuck? Tap Translate under the caption.'] },
  { target: 'flicks-post', title: 'Post your own Flick', points: ['Write in the language you’re learning.', 'Mistakes are welcome: others can send you a kind correction.'] },
  { target: 'tab-chats', title: 'Chats', points: ['Your 1-to-1 chats and group chats.', 'People you don’t follow land in Requests first. You decide who gets in.'], go: '/chats', button: 'Open Chats' },
  { target: 'tab-connect', title: 'Connect', points: ['Find partners who speak the language you’re learning, and learn yours.', 'Tap 👋 to say hi. Use the filter for level, online people and more.'], go: '/connect', button: 'Open Connect' },
  { target: 'tab-rooms', title: 'Rooms', points: ['Talk rooms are voice only: join and just listen, or ask to speak.', 'Live rooms: one person on camera, everyone else comments.', 'Lessons: small classes with checked teachers, paid once.'], go: '/rooms', button: 'Open Rooms' },
  { target: 'rooms-open', title: 'Open your own room', points: ['Start a talk room or a live room whenever you like. You’re the host.'] },
  { target: 'tab-me', title: 'Me', points: ['Your profile, your levels, your Flicks and your settings.'], go: '/me', button: 'Open Me' },
  { target: 'me-langcard', title: 'Your language card', points: ['Your level in each language and your real practice time this week.', 'Change your levels any time in Settings → Learning.'] },
  { target: 'me-coins', title: 'Coins', points: ['Coins are what you buy, in the Wallet.', 'You spend them on gifts and boosts.', 'Coins can’t be turned into money.'] },
  { target: 'me-diamonds', title: 'Diamonds', points: ['Diamonds are what you receive when someone sends you a gift (a quarter of the gift’s coins).', 'From 1,000 Diamonds you can cash out to your bank, or turn them into Coins.'] },
  { target: 'me-settings', title: 'Settings & safety', points: ['Privacy, who can message you, app language and light or dark look.', 'Press and hold a message, or tap •••, to report or block someone. We review every report.'], last: true },
];

/** Which tab card `i` is on: the tab opened by the last "Open …" button before it. */
const tabFor = (i: number): Tab => {
  let tab: Tab = '/flicks';
  for (let j = 0; j < i; j++) if (TOUR_STEPS[j].go) tab = TOUR_STEPS[j].go!;
  return tab;
};

type Rect = { x: number; y: number; width: number; height: number };
const PAD = 6; // the spotlight is a little bigger than the thing it shows

export function Tour() {
  const show = useApp((s) => s.onboarded && !s.toured && s.lookChosen && s.aiOK !== null);
  if (!show) return null;
  return <TourOverlay />;
}

function TourOverlay() {
  const t = useT();
  const c = useColors();
  const { width: W, height: H } = useWindowDimensions();
  const [k, setK] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const step = TOUR_STEPS[k];

  // after each move, wait for the page to settle, then find the target and fade the card in
  useEffect(() => {
    let alive = true;
    fade.setValue(0);
    setRect(null);
    const find = async (tries: number) => {
      const r = step.target ? await measureTarget(step.target) : null;
      if (!alive) return;
      if (!r && step.target && tries > 0) return setTimeout(() => find(tries - 1), 150);
      setRect(r ? { x: r.x - PAD, y: r.y - PAD, width: Math.min(r.width + PAD * 2, W - 12), height: r.height + PAD * 2 } : null);
      Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: Platform.OS !== 'web' }).start();
    };
    const h = setTimeout(() => find(6), 350);
    return () => { alive = false; clearTimeout(h); };
  }, [k, step.target, W, fade]);

  const next = () => {
    if (step.last) {
      useApp.getState().finishTour(true);
      toast('+50 coins · enjoy TalkAmigo!', { icon: 'check' });
      return;
    }
    if (step.go) router.navigate(step.go);
    setK(k + 1);
  };
  const back = () => {
    const tab = tabFor(k - 1);
    if (tab !== tabFor(k)) router.navigate(tab);
    setK(k - 1);
  };
  const skip = () => useApp.getState().finishTour(false);

  // place the card under the spotlight when the spotlight is in the top half, otherwise above it
  const below = rect ? rect.y + rect.height / 2 < H / 2 : false;
  const cardPos = !rect ? { top: H * 0.3 } : below ? { top: rect.y + rect.height + 12 } : { bottom: H - rect.y + 12 };
  const dim = 'rgba(10,6,10,0.62)';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {rect ? (
        <>
          {/* four dark panels around the spotlight */}
          <View style={[styles.dim, { backgroundColor: dim, top: 0, left: 0, right: 0, height: Math.max(0, rect.y) }]} />
          <View style={[styles.dim, { backgroundColor: dim, top: rect.y + rect.height, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.dim, { backgroundColor: dim, top: rect.y, left: 0, width: Math.max(0, rect.x), height: rect.height }]} />
          <View style={[styles.dim, { backgroundColor: dim, top: rect.y, left: rect.x + rect.width, right: 0, height: rect.height }]} />
          {/* tapping the highlighted spot does what the main button does */}
          <Pressable onPress={next} accessibilityLabel={t(step.title)} style={[styles.hole, { left: rect.x, top: rect.y, width: rect.width, height: rect.height }]} />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: dim }]} />
      )}

      <Animated.View style={[styles.card, cardPos, { backgroundColor: c.cardStrong, opacity: fade }]} accessibilityViewIsModal>
        <View style={styles.cardHead}>
          <Text style={[styles.label, { color: c.tintText }]}>{t(`Tour · ${k + 1} of ${TOUR_STEPS.length}`).toLocaleUpperCase()}</Text>{/* i18n-ignore: numbers, matched by the 'tour' pattern */}
          <View style={styles.dots}>
            {TOUR_STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: c.line }, i < k && { backgroundColor: c.tintText, opacity: 0.45 }, i === k && { width: 16, backgroundColor: c.brand }]} />
            ))}
          </View>
        </View>
        <Text style={[styles.title, { color: c.ink }]}>{t(step.title)}</Text>
        <View style={{ gap: 8 }}>
          {step.points.map((p) => (
            <View key={p} style={styles.point}>
              <View style={[styles.bullet, { backgroundColor: c.brand }]} />
              <Text style={[styles.pointText, { color: c.soft }]}>{t(p)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.buttons}>
          {k > 0 ? (
            <Pressy onPress={back} scale={0.9} style={[styles.back, { backgroundColor: c.card, borderColor: c.line }]} accessibilityLabel={t('Back')}>
              <Icon name="back" size={18} color={c.ink} />
            </Pressy>
          ) : null}
          {!step.last ? (
            <Pressy onPress={skip} style={styles.skip} accessibilityLabel={t('Skip tour')}>
              <Text style={[styles.skipText, { color: c.muted }]} numberOfLines={1}>{t('Skip')}</Text>
            </Pressy>
          ) : null}
          <View style={{ flex: 1 }} />
          <Button small title={step.last ? 'Finish · +50 coins' : step.button ?? 'Next'} onPress={next} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { position: 'absolute' },
  hole: { position: 'absolute', borderRadius: 18, borderWidth: 2, borderColor: '#fff' },
  card: { position: 'absolute', left: 16, right: 16, borderRadius: 22, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 16, gap: 10, boxShadow: '0 14px 40px rgba(0,0,0,0.3)' },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  title: { fontSize: 21, fontWeight: '700' },
  point: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  pointText: { flex: 1, fontSize: 15, lineHeight: 21 },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  back: { width: 44, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4, flexShrink: 1 },
  skipText: { fontSize: 14, fontWeight: '700' },
});
