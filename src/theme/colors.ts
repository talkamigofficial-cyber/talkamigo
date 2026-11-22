/**
 * Colours of the app, light and dark, taken from the prototype (docs/handoff/talkamigo-beta.html, ":root").
 *
 * Use them through the hook:   const c = useColors();   style={{ color: c.ink }}
 * Never type a colour code in a screen when one of these fits.
 */
import { useColorScheme } from 'react-native';
import { useApp } from '../state/store';

export const light = {
  bg: '#FFFFFF', // page background
  ink: '#111114', // main text
  muted: '#6B6B76', // secondary text
  soft: '#3E3E47', // body text a bit lighter than ink
  card: '#FFFFFF', // cards, sheets ("glass" in the prototype)
  cardStrong: '#FFFFFF',
  line: '#ECECF0', // borders, dividers
  chip: '#F4F4F6', // grey fills: chips, inputs, inactive buttons
  brand: '#E0101F', // red: actions only
  brandText: '#E0101F', // red used as text on the page
  tint: '#FFF0F1', // soft red pill background
  tintText: '#C20E1B', // red text on white (accessible)
  good: '#14804A', // green: online, corrections
  goodBg: '#E9F7EF',
  roomCard: '#F4F4F6', // light-grey room cards on the white page
  wallet: '#141418',
  shadow: 'rgba(17,17,20,0.05)',
};

export type Colors = typeof light;

export const dark: Colors = {
  bg: '#0B0B0E',
  ink: '#F4F4F6',
  muted: '#9A9AA6',
  soft: '#C9C9D2',
  card: '#16161B',
  cardStrong: '#1B1B21',
  line: 'rgba(255,255,255,0.08)',
  chip: 'rgba(255,255,255,0.06)',
  brand: '#E0101F',
  brandText: '#FF4651', // brighter red for small red text on black (v57)
  tint: 'rgba(238,22,38,0.14)',
  tintText: '#FF5A66',
  good: '#4ADE80',
  goodBg: 'rgba(74,222,128,0.10)',
  roomCard: '#1C1C22',
  wallet: '#1B1B21',
  shadow: 'transparent',
};

/** The red button / active tab gradient. */
export const BRAND_GRADIENT = 'linear-gradient(180deg, #EE1626, #D90D1C)';

/**
 * Background of the welcome, log-in and sign-up screens: the logo's own red,
 * bright top-left fading to almost black-red bottom-right (decided 6 Nov 2026, v46).
 */
export const WELCOME_GRADIENT = 'radial-gradient(120% 75% at 12% 0%, #FF3B2F 0%, #EC1423 28%, #C20A1A 52%, #850612 76%, #3E0309 100%)';

/** Colours used on top of the red welcome / sign-up background. */
export const onRed = {
  text: '#FFFFFF',
  textSoft: 'rgba(255,255,255,0.9)',
  glass: 'rgba(255,255,255,0.16)',
  glassBorder: 'rgba(255,255,255,0.35)',
  buttonText: '#D90F2B', // red text on the white button
  disabled: 'rgba(255,255,255,0.25)',
  disabledText: 'rgba(255,255,255,0.75)',
  card: 'rgba(255,255,255,0.96)', // white cards people read or type in
  cardInk: '#16161D',
  cardMuted: '#6B6B76',
  gold: '#FFE3A3', // highlighted words in titles
};

/** 'light' or 'dark' right now (Settings → Appearance: Light / Dark / Match phone). */
export function useScheme(): 'light' | 'dark' {
  const phone = useColorScheme();
  const theme = useApp((s) => s.theme);
  if (theme === 'light' || theme === 'dark') return theme;
  return phone === 'dark' ? 'dark' : 'light';
}

export function useColors(): Colors {
  return useScheme() === 'dark' ? dark : light;
}
