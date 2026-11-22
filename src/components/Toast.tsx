/**
 * Short pop-up messages ("toasts"), redesigned in v53: a compact dark capsule with a small icon,
 * a bold first line and an optional lighter second line. It sits just above the bottom bar
 * (or at the top on the welcome and sign-up screens) and disappears after a few seconds.
 *
 * Show one from anywhere:
 *   toast('Pick at least one interest');
 *   toast('You’re on stage', { sub: 'Your mic is off: tap the mic to talk.', icon: 'mic' });
 * Text is translated automatically.
 */
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { useT } from '../i18n';
import { useApp } from '../state/store';
import { Icon, type IconName } from './Icon';

type ToastState = { text: string; sub?: string; icon?: IconName; at: number; top?: boolean };
const useToast = create<{ current: ToastState | null }>(() => ({ current: null }));

export function toast(text: string, opts: { sub?: string; icon?: IconName; top?: boolean } = {}) {
  useToast.setState({ current: { text, ...opts, at: Date.now() } });
}

/** Put once at the root of the app. `bottomGap` = height of the tab bar or text box underneath. */
export function ToastHost() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const cur = useToast((s) => s.current);
  // on the welcome and sign-up pages messages sit at the top (v53); in the app, above the bottom bar
  const inSignup = !useApp((s) => s.onboarded);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!cur) return;
    const native = Platform.OS !== 'web';
    fade.setValue(0);
    Animated.spring(fade, { toValue: 1, useNativeDriver: native, speed: 18, bounciness: 8 }).start();
    const ms = Math.min(5000, 2200 + (cur.text.length + (cur.sub?.length ?? 0)) * 25);
    const h = setTimeout(() => Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: native }).start(() => useToast.setState({ current: null })), ms);
    return () => clearTimeout(h);
  }, [cur, fade]);

  if (!cur) return null;
  const place = cur.top ?? inSignup ? { top: insets.top + 12 } : { bottom: insets.bottom + 96 };
  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, place, { opacity: fade, transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }]}>
      <View style={styles.pill} accessibilityLiveRegion="polite" accessibilityRole="alert">
        <View style={styles.iconBox}>
          <Icon name={cur.icon ?? 'info'} size={16} color="#fff" strokeWidth={2.2} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.text}>{t(cur.text)}</Text>
          {cur.sub ? <Text style={styles.sub}>{t(cur.sub)}</Text> : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 100 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: 400, paddingVertical: 10, paddingStart: 10, paddingEnd: 16, borderRadius: 22, backgroundColor: 'rgba(28,24,30,0.94)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' },
  iconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E0101F', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 1 },
});

/** For buttons whose feature is built in a later slice (chat screen, rooms, wallet…). */
export function comingSoon() {
  toast('Coming in the next update', { icon: 'clock' });
}
