/**
 * The red background of the Welcome, log-in and sign-up screens (".welx / .obx" in the prototype):
 * the logo's red, bright top-left to almost-black red bottom-right, with soft swooshes and thin curved lines.
 * Optionally the big faded app icon behind (Welcome only).
 */
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { WELCOME_GRADIENT } from '../theme/colors';
import { LOGO } from './Logo';

export function RedBackground({ withLogo }: { withLogo?: boolean }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundImage: WELCOME_GRADIENT, overflow: 'hidden' }]} pointerEvents="none">
      {/* soft lighter glow top-left, like ".obx::before" */}
      <View style={[StyleSheet.absoluteFill, { backgroundImage: 'radial-gradient(55% 35% at 0% 0%, rgba(255,120,80,0.40), transparent 70%)' }]} />
      {withLogo && (
        <Image
          source={LOGO}
          style={{ position: 'absolute', alignSelf: 'center', top: '18%', width: 560, height: 560, borderRadius: 120, opacity: 0.3, transform: [{ rotate: '-14deg' }] }}
          blurRadius={2}
        />
      )}
      <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Path d="M-40 150C90 70 250 250 440 120L440 250C250 360 110 190 -40 290Z" fill="rgba(255,90,80,0.16)" />
        <Path d="M-40 300C120 200 260 420 440 300" fill="none" stroke="rgba(255,150,130,0.35)" strokeWidth={1.6} />
        <Path d="M-40 470C130 380 270 560 440 440L440 520C280 640 120 470 -40 570Z" fill="rgba(255,70,70,0.10)" />
        <Path d="M-40 610C150 520 250 720 440 590" fill="none" stroke="rgba(255,140,120,0.25)" strokeWidth={1.4} />
        <Path d="M-40 690C120 620 300 780 440 680L440 820L-40 820Z" fill="rgba(30,0,6,0.28)" />
      </Svg>
      {withLogo && <View style={[StyleSheet.absoluteFill, { backgroundImage: 'radial-gradient(120% 60% at 50% 42%, rgba(255,255,255,0.18), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(30,0,6,0.35) 100%)' }]} />}
    </View>
  );
}
