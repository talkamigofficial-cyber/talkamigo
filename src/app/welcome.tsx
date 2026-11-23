/**
 * Welcome: the first screen (prototype vWelcome(); design decided in v39, v45, v46).
 *
 * Red logo background with the big faded app icon, the white TalkAmigo plate, greeting bubbles that
 * pop in and float, the tagline chips, then Create account / Log in and the trust strip.
 * (The prototype's "Just looking? Try the demo" link is removed: the app has no invented content, NEXT_STEPS §3–4.)
 * If someone used this phone before, a "Continue as Sam" card opens their account in one tap and the
 * second button becomes "Use another account".
 * The 🌐 button picks the app language for AFTER sign-up; the welcome and sign-up pages always follow
 * the phone's language (v57).
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';
import { LogoPlate } from '../components/Logo';
import { Button } from '../components/Button';
import { Pressy } from '../components/Pressy';
import { Icon, type IconName } from '../components/Icon';
import { Avatar, Flag } from '../components/Avatar';
import { toast } from '../components/Toast';
import { AppLanguageSheet } from '../components/auth/AuthSheets';
import { openSavedAccount } from '../components/auth/authFlow';
import { LANG_NAME, pickLang, useT } from '../i18n';
import { useApp } from '../state/store';

/** Greeting bubbles: country, word (never translated), position in the 300 px stage. */
const BUBBLES: { cc: string; word: string; pos: object; tailEnd?: boolean }[] = [
  { cc: 'FR', word: 'Bonjour !', pos: { start: '1%', top: '9%' } },
  { cc: 'GB', word: 'Hello!', pos: { start: '37%', top: '0%' }, tailEnd: true },
  { cc: 'ES', word: '¡Hola!', pos: { end: '1%', top: '12%' } },
  { cc: 'JP', word: 'こんにちは', pos: { start: '3%', top: '84%' }, tailEnd: true },
  { cc: 'BR', word: 'Olá!', pos: { end: '5%', top: '81%' } },
];

export default function Welcome() {
  const t = useT();
  const me = useApp((s) => s.me);
  const lastAuth = useApp((s) => s.lastAuth);
  const welcomeLang = useApp((s) => s.welcomeLangChoice);
  const [langOpen, setLangOpen] = useState(false);
  const back = !!lastAuth && !!me.handle; // someone used TalkAmigo on this phone before
  const calm = useReduceMotion();
  const fit = useFit();

  return (
    <Screen red withLogo>
      {/* language pill, top end */}
      <View style={styles.top}>
        <Pressy onPress={() => setLangOpen(true)} scale={0.94} style={styles.lang} accessibilityLabel={t('App language')}>
          <Icon name="globe" size={17} color="#fff" />
          <Text style={styles.langText}>{LANG_NAME[pickLang(welcomeLang)]}</Text>
          <Icon name="down" size={14} color="#fff" />
        </Pressy>
      </View>

      <View style={[styles.mid, fit.small && { gap: 8 }]}>
        <View style={[styles.stage, { height: fit.stage }]}>
          {/* on very short phones the two lower bubbles would cover the tagline, so only the top three show */}
          {BUBBLES.slice(0, fit.small ? 3 : 5).map((b, i) => <Bubble key={b.cc} {...b} index={i} calm={calm} small={fit.small} />)}
          {/* the plate is drawn for a 52 px name; the prototype sizes the name 40–56 px with the screen width */}
          <View style={{ transform: [{ scale: fit.logoScale }] }}>
            <LogoPlate big />
          </View>
          <View style={[styles.tags, fit.small && { marginTop: 8 }]}>
            {['Speak.', 'Connect.', 'Belong.'].map((w) => (
              <View key={w} style={styles.tag}><Text style={styles.tagText}>{t(w)}</Text></View>
            ))}
          </View>
        </View>
        <Text style={[styles.sub, fit.small && { fontSize: 14, lineHeight: 20 }]}>
          {t('Real conversations with real people,')}{'\n'}{t('in the language you’re learning.')}
        </Text>
      </View>

      <View style={[styles.bottom, fit.small && { gap: 8, paddingBottom: 12 }]}>
        {back ? (
          <Pressy onPress={openSavedAccount} scale={0.98} style={styles.quick}>
            <Avatar id="me" size={46} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.quickName} numberOfLines={1}>{t(`Continue as ${me.name}`)}</Text>
              <Text style={styles.quickSub} numberOfLines={1}>@{me.handle} · {lastAuth === 'phone' ? t('Phone number') : lastAuth === 'google' ? 'Google' : 'Apple'}</Text>
            </View>
            <Icon name="chev" size={18} color="#6B6B76" strokeWidth={2.4} />
          </Pressy>
        ) : null}
        <Button kind={back ? 'outlineWhite' : 'white'} title="Create account" onPress={() => router.push('/auth/join')} style={[styles.big, fit.small && styles.bigSmall]} />
        <Button kind="outlineWhite" title={back ? 'Use another account' : 'Log in'} onPress={() => router.push('/auth/login')} style={[styles.big, fit.small && styles.bigSmall]} />
        <View style={styles.trust}>
          {([['user', '18+ only'], ['shield', 'Moderated 24/7'], ['lock', 'No passwords']] as [IconName, string][]).map(([icon, text]) => (
            <View key={text} style={styles.trustItem}>
              <Icon name={icon} size={15} color="#fff" strokeWidth={2.2} />
              <Text style={[styles.trustText, fit.small && { fontSize: 11 }]}>{t(text)}</Text>
            </View>
          ))}
        </View>
      </View>

      <AppLanguageSheet
        visible={langOpen}
        onClose={() => setLangOpen(false)}
        current={welcomeLang ?? 'Phone default'}
        showNote
        onPick={(v) => {
          useApp.getState().setWelcomeLang(v);
          setLangOpen(false);
          toast(`${t('After sign-up, TalkAmigo will be in')} ${LANG_NAME[pickLang(v)]}`, { icon: 'globe', top: true });
        }}
      />
    </Screen>
  );
}

/** A white greeting bubble: pops in one after another, then floats up and down slowly. */
function Bubble({ cc, word, pos, tailEnd, index, calm, small }: { cc: string; word: string; pos: object; tailEnd?: boolean; index: number; calm: boolean; small: boolean }) {
  const pop = useRef(new Animated.Value(calm ? 1 : 0)).current;
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (calm) return;
    const native = Platform.OS !== 'web';
    Animated.spring(pop, { toValue: 1, delay: 350 + index * 180, useNativeDriver: native, speed: 14, bounciness: 10 }).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 2750, delay: index * 300, useNativeDriver: native }),
      Animated.timing(float, { toValue: 0, duration: 2750, useNativeDriver: native }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [calm, index, pop, float]);

  return (
    <Animated.View
      style={[styles.bubble, small && { paddingVertical: 6, paddingHorizontal: 10 }, tailEnd ? styles.tailEnd : styles.tailStart, pos, {
        opacity: pop,
        transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }, { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
      }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Flag cc={cc} size={16} />
      <Text style={[styles.bubbleText, small && { fontSize: 12.5 }]}>{word}</Text>
    </Animated.View>
  );
}

/** Sizes for short and narrow phones, from the prototype's @media (max-height: 700px / 620px) rules. */
function useFit() {
  const { width, height } = useWindowDimensions();
  const nameSize = Math.min(56, Math.max(40, width * 0.125));
  return {
    stage: height <= 620 ? 200 : height <= 700 ? 240 : 300,
    small: height <= 620,
    logoScale: nameSize / 52,
  };
}

/** true when the phone has "Reduce Motion" on: then nothing floats or pops. */
function useReduceMotion() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setOn).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setOn);
    return () => sub.remove();
  }, []);
  return on;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 16, paddingHorizontal: 20, paddingBottom: 12 },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.16)' },
  langText: { color: '#fff', fontWeight: '700', fontSize: 14.5 },
  mid: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, gap: 14 },
  stage: { width: '100%', height: 300, alignItems: 'center', justifyContent: 'center' },
  tags: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  tag: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.17)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  tagText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  sub: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600', lineHeight: 23, textAlign: 'center' },
  bottom: { paddingHorizontal: 20, paddingBottom: 18, gap: 10 },
  big: { height: 56, borderRadius: 28 },
  bigSmall: { height: 50 },
  quick: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)' },
  quickName: { fontSize: 16, fontWeight: '800', color: '#16161D' },
  quickSub: { fontSize: 13, color: '#6B6B76' },
  trust: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, rowGap: 6, paddingTop: 4 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trustText: { color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '700' },
  bubble: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 13, backgroundColor: 'rgba(255,255,255,0.94)', boxShadow: '0 10px 28px rgba(60,0,40,0.28)', zIndex: 2 },
  tailStart: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 5 },
  tailEnd: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 5 },
  bubbleText: { color: '#16161D', fontWeight: '800', fontSize: 14 },
});
