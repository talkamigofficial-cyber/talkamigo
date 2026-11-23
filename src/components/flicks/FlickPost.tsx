/**
 * One full-screen Flick in the feed (prototype flickPost()).
 *
 * Layers, from back to front: colour background → big photo / slideshow / video poster (or big text for
 * text posts) → dark fade at the bottom → caption block (bottom-left) → button rail (right; left in Arabic)
 * → "Add a comment or a correction…" bar.
 *
 * Gestures (v2 Nov): tap = sound on/off (a speaker flashes), double tap = like with a big heart (only likes,
 * never unlikes). Tapping a word, comments, gift, share and ••• arrive in a later slice.
 */
import { memo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { useT, useLang } from '../../i18n';
import { getPerson } from '../../data/people';
import { Avatar, Flag } from '../Avatar';
import { Icon } from '../Icon';
import { Pressy } from '../Pressy';
import { fmtCount } from '../rooms/money';
import { SOUNDS, useFlickUI, type Flick } from './flicksData';
import { FLICK_LAYOUT as L } from './layout';
import { cssBackground } from '../../theme/background';

type Props = { flick: Flick; isNew: boolean; height: number };

export const FlickPost = memo(function FlickPost({ flick: m, isNew, height }: Props) {
  const t = useT();
  const lang = useLang();
  const rtl = lang === 'ar';
  const me = useApp((s) => s.me);
  const followed = useApp((s) => !!s.follows[m.by]);
  const liked = useFlickUI((s) => !!s.liked[m.id]);
  const open = useFlickUI((s) => !!s.translated[m.id]);
  const soundOn = useFlickUI((s) => s.soundOn);
  const hinted = useFlickUI((s) => s.soundHinted);
  const slide = useFlickUI((s) => s.slide[m.id] ?? 0);
  const mine = m.by === 'me';
  const person = mine ? null : getPerson(m.by);
  const name = mine ? me.name : person?.name ?? '';
  const isText = !m.photo && !(m.photos && m.photos.length);
  const sound = m.snd ? SOUNDS[m.snd] : null;

  // ---- tap / double tap on the picture ----
  const lastTap = useRef(0);
  const heart = useRef(new Animated.Value(0)).current;
  const speaker = useRef(new Animated.Value(0)).current;
  const [heartAt, setHeartAt] = useState({ x: 0, y: 0 });
  const native = Platform.OS !== 'web';
  const onMediaPress = (e: { nativeEvent: { locationX: number; locationY: number } }) => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      useFlickUI.getState().like(m.id);
      setHeartAt({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY });
      heart.setValue(0);
      Animated.sequence([Animated.spring(heart, { toValue: 1, useNativeDriver: native, speed: 20, bounciness: 14 }), Animated.timing(heart, { toValue: 0, duration: 350, delay: 250, useNativeDriver: native })]).start();
    } else if (m.snd) {
      useFlickUI.getState().toggleSound();
      speaker.setValue(1);
      Animated.timing(speaker, { toValue: 0, duration: 700, delay: 200, useNativeDriver: native }).start();
    }
    lastTap.current = now;
  };

  const side = rtl ? { left: L.railSide } : { right: L.railSide };
  const metaSide = rtl ? { right: 14, left: L.metaGap } : { left: 14, right: L.metaGap };

  return (
    <View style={{ height, overflow: 'hidden', ...cssBackground(m.bg) }} accessibilityLabel={withName(t, `Flick by ${name}`, name)}>
      {/* picture / slideshow / video poster; tapping it toggles sound, double tap likes */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onMediaPress} accessibilityLabel={m.video ? t('Play or pause video') : undefined}>
        {!isText && <Media m={m} slide={slide} />}
      </Pressable>

      {isText && (
        <View style={[styles.ptxt, rtl ? { right: 24, left: 80 } : { left: 24, right: 80 }]} pointerEvents="box-none">
          <Text style={styles.kindp}>{t(m.kind)}</Text>
          <Words text={m.text} style={styles.bigText} />
        </View>
      )}

      <View style={styles.shade} pointerEvents="none" />

      {sound && !soundOn && (
        <View style={[styles.muteh, rtl ? { right: 14 } : { left: 14 }]} pointerEvents="none">
          <Icon name="mute" size={15} color="#fff" />
          {!hinted && <Text style={styles.mutehText}>{t('Tap for sound')}</Text>}
        </View>
      )}

      {/* speaker flash in the middle when sound is switched */}
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: speaker }]}>
        <Icon name={soundOn ? 'speaker' : 'mute'} size={34} color="#fff" />
      </Animated.View>

      {/* big heart where you double-tapped */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: heartAt.x - 60, top: heartAt.y - 60, opacity: heart, transform: [{ scale: heart.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.1] }) }] }}>
        <Text style={{ fontSize: 110 }}>❤️</Text>
      </Animated.View>

      {/* caption block */}
      <View style={[styles.meta, metaSide, { bottom: L.metaBottom }]} pointerEvents="box-none">
        <View style={styles.who}>
          <Pressy scale={0.96} onPress={() => (mine ? router.navigate('/me') : router.push(`/user/${m.by}`))} style={styles.nameBtn} accessibilityLabel={withName(t, `${name}’s profile`, name)}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {!mine && person ? <Flag cc={person.cc} size={15} /> : null}
          </Pressy>
          {!mine && (
            <Pressy scale={0.94} onPress={() => useApp.getState().toggleFollow(m.by)} style={[styles.fol, followed && styles.folOn]}>
              <Text style={[styles.folText, followed && { color: 'rgba(255,255,255,0.75)' }]}>{followed ? followingWord(t) : t('Follow')}</Text>
            </Pressy>
          )}
        </View>
        {m.lang ? (
          <View style={styles.tags}>
            {isNew && <Text style={[styles.tag, styles.newTag]}>{t('New for you')}</Text>}
            <Text style={styles.tag}>{t(m.lang)}</Text>
            <Text style={styles.tag}>{t(m.lvl || 'All levels')}</Text>
          </View>
        ) : null}
        <Text style={styles.cap} numberOfLines={3}>
          {isText ? <Text>{m.cap}</Text> : <Words text={m.text} inline />}
          {!isText && m.cap ? <Text style={{ opacity: 0.85 }}>{' · '}{m.cap}</Text> : null}
        </Text>
        {open && <Text style={styles.tr}>{m.tr || ''}</Text>}
        <View style={styles.tools}>
          <Pressy scale={0.94} onPress={() => useFlickUI.getState().toggleTranslate(m.id)} style={styles.trBtn}>
            <Icon name="tr" size={13} color="#fff" strokeWidth={2.4} />
            <Text style={styles.trText}>{t(open ? 'Hide translation' : 'Translate')}</Text>
          </Pressy>
        </View>
        {sound && (
          <View style={styles.snd}>
            <Icon name="music" size={12} color="#fff" strokeWidth={2.2} />
            <Text style={styles.sndText} numberOfLines={1}>{`${sound} · TalkAmigo Sounds`}</Text>
          </View>
        )}
      </View>

      {/* right rail (left in Arabic) */}
      <View style={[styles.rail, side, { bottom: L.railBottom }]} pointerEvents="box-none">
        {!mine && (
          <View style={styles.rav}>
            <Pressy scale={0.92} onPress={() => router.push(`/user/${m.by}`)} accessibilityLabel={withName(t, `${name}’s profile`, name)}>
              <Avatar id={m.by} size={42} />
            </Pressy>
            {!followed && (
              <View style={styles.plusPos}>
                <Pressy scale={0.85} onPress={() => useApp.getState().toggleFollow(m.by)} style={styles.plus} hitSlop={12} accessibilityLabel={withName(t, `Follow ${name}`, name)}>
                  <Text style={styles.plusText}>+</Text>
                </Pressy>
              </View>
            )}
          </View>
        )}
        <RailButton icon="heart" label={fmtCount(m.likes + (liked ? 1 : 0), lang)} filled={liked} onPress={() => useFlickUI.getState().toggleLike(m.id)} a11y="Like" />
        {/* Comments, gifts, share, boost, ••• and the comment bar arrive with slice 5 (Flicks); hidden until then
            so no button does nothing (NEXT_STEPS §4). */}
      </View>
    </View>
  );
});

/**
 * The "Following" button word. The plain "Following" translation is the TAB name in some languages
 * (French "Abonnements" = subscriptions), so we use the button wording from "Following ✓" without the tick.
 */
export const followingWord = (t: (s: string) => string) => t('Following ✓').replace(/\s*✓$/, '');

/**
 * Screen-reader labels like "Follow Kenji" use a lone "$" for the name in the translation table
 * ("Suivre $"); the shared translator only fills "$1", so fill the name here.
 */
export const withName = (t: (s: string) => string, en: string, name: string) => t(en).replace(/\$(?!\d)/, name);

/** The photo (big emoji), slideshow with dots + "1/4", or video poster with play button and length. */
function Media({ m, slide }: { m: Flick; slide: number }) {
  const photos = m.photos && m.photos.length > 1 ? m.photos : null;
  const emoji = photos ? photos[slide % photos.length] : m.photo;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={styles.mbig} pointerEvents="none">
        <Text style={styles.mem}>{emoji}</Text>
        {m.video ? (
          <View style={styles.vplay}>
            <Icon name="play" size={30} color="#fff" fill="#fff" />
          </View>
        ) : null}
      </View>
      {photos && (
        <>
          <View style={styles.dots} pointerEvents="none">
            {photos.map((_, k) => <View key={k} style={[styles.dot, k === slide % photos.length && styles.dotOn]} />)}
          </View>
          <View style={styles.countPos}>
            <Pressy scale={0.94} onPress={() => useFlickUI.getState().nextSlide(m.id, photos.length)} style={styles.count} accessibilityLabel="Next photo">
              <Text style={styles.countText}>{`${(slide % photos.length) + 1}/${photos.length}`}</Text>
            </Pressy>
          </View>
        </>
      )}
      {m.video ? (
        <>
          <View style={[styles.vprog, { bottom: L.progressBottom }]} pointerEvents="none"><View style={styles.vprogFill} /></View>
          <Text style={[styles.vlen, { bottom: L.progressBottom + 10 }]}>{m.video}</Text>
        </>
      ) : null}
    </View>
  );
}

/** A Flick's text. In slice 5 every word becomes tappable (word sheet: meaning, Hear it, save to notebook). */
function Words({ text, style, inline }: { text: string; style?: object; inline?: boolean }) {
  return inline ? <>{text}</> : <Text style={style}>{text}</Text>;
}

function RailButton({ icon, label, onPress, a11y, filled, dots }: { icon?: 'heart' | 'chat' | 'gift' | 'share' | 'rocket'; label?: string; onPress: () => void; a11y: string; filled?: boolean; dots?: boolean }) {
  const t = useT();
  // short phones (iPhone SE): smaller circles so the rail never covers the top bar (prototype max-height 700 rule)
  const short = useWindowDimensions().height < 700;
  return (
    <Pressy scale={0.88} onPress={onPress} style={[styles.railBtn, short && { minHeight: 40 }]} accessibilityLabel={t(a11y)}>
      <View style={[styles.circ, short && { width: 36, height: 36, borderRadius: 18 }]}>
        {dots ? <Text style={styles.dots3}>•••</Text> : <Icon name={icon!} size={20} color={filled ? '#FF2D4A' : '#fff'} fill={filled ? '#FF2D4A' : 'none'} />}
      </View>
      {label ? <Text style={styles.railLabel}>{label}</Text> : null}
    </Pressy>
  );
}

const styles = StyleSheet.create({
  mbig: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  mem: { fontSize: 230, lineHeight: 260, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 20 }, textShadowRadius: 40, transform: [{ translateY: -30 }] },
  vplay: { position: 'absolute', width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', paddingStart: 4 },
  vprog: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  vprogFill: { width: '12%', height: '100%', backgroundColor: '#fff' },
  vlen: { position: 'absolute', end: 14, fontSize: 12, fontWeight: '800', color: '#fff', backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  dots: { position: 'absolute', top: 64, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotOn: { width: 16, backgroundColor: '#fff' },
  countPos: { position: 'absolute', top: 60, end: 14 },
  count: { backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  countText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  ptxt: { position: 'absolute', top: '20%', gap: 14 },
  kindp: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.92)', color: '#1A1418' },
  bigText: { color: '#fff', fontSize: 34, fontWeight: '700', lineHeight: 38, letterSpacing: -0.5 },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '52%', backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.7))' },
  muteh: { position: 'absolute', top: 118, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.35)' },
  mutehText: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  flash: { position: 'absolute', alignSelf: 'center', top: '42%', width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  meta: { position: 'absolute', gap: 7, zIndex: 2 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  name: { color: '#fff', fontSize: 17, fontWeight: '800', flexShrink: 1 },
  fol: { height: 30, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1.5, borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' },
  folOn: { borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'transparent' },
  folText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  tags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { fontSize: 11.5, fontWeight: '800', color: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)' },
  newTag: { backgroundColor: '#E0101F' },
  cap: { color: '#fff', fontSize: 15, lineHeight: 21, textAlign: 'auto' },
  tr: { color: '#fff', fontSize: 14, lineHeight: 19.6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.35)' },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  trText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  hint: { color: '#fff', fontSize: 11.5, opacity: 0.7, flexShrink: 1 },
  snd: { alignSelf: 'flex-start', maxWidth: '62%', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, opacity: 0.9 },
  sndText: { color: '#fff', fontSize: 11.5, fontWeight: '700', flexShrink: 1 },
  rail: { position: 'absolute', alignItems: 'center', gap: 8, zIndex: 3 },
  rav: { marginBottom: 6 },
  plusPos: { position: 'absolute', start: 11, bottom: -8 },
  plus: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E0101F', alignItems: 'center', justifyContent: 'center' },
  plusText: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 17 },
  railBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', gap: 3 },
  circ: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  dots3: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  railLabel: { color: '#fff', fontSize: 11, fontWeight: '800' },
  cbarPos: { position: 'absolute', left: 14, right: 14 },
  cbar: { height: 46, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(0,0,0,0.22)', justifyContent: 'center', paddingHorizontal: 18 },
  cbarText: { color: 'rgba(255,255,255,0.88)', fontSize: 14, fontWeight: '600', textAlign: 'auto' },
});
