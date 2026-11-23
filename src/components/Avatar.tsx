/**
 * Profile picture with the round country flag badge (bottom-left), like the prototype's av().
 *
 *   <Avatar id="camille" size={52} />          a demo person
 *   <Avatar id="me" size={46} />               the person using the app
 *   <Avatar id="kenji" size={52} ring />       red/violet ring when they're online
 *
 * The flag shows the country the person is FROM, never the language (CLAUDE.md §3).
 */
import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as squareFlags from 'country-flag-icons/string/1x1';
import { countryName, useLang } from '../i18n';
import { useApp } from '../state/store';
import { getPerson } from '../data/people';
import { Icon } from './Icon';
import { useColors } from '../theme/colors';

/** Square flag drawings for every country (country-flag-icons, MIT licence), cropped to a circle below. */
const FLAG_SVGS = squareFlags as Record<string, string>;

/** Emoji flag for a 2-letter country code ('FR' → 🇫🇷). Only used as a fallback for codes with no drawing. */
export const emojiFlag = (cc: string) => cc.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));

/**
 * A real flag picture, cropped to a circle with a thin dark ring (founder, NEXT_STEPS §2.5).
 * Used on profile photos (bottom-left), before cities, in country lists and the phone-code picker.
 */
export const Flag = memo(function Flag({ cc, size = 18 }: { cc: string; size?: number }) {
  const lang = useLang();
  if (!cc) return null;
  const svg = FLAG_SVGS[cc.toUpperCase()];
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.35)', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="image"
      accessibilityLabel={countryName(cc.toUpperCase(), lang)}
    >
      {svg ? (
        <SvgXml xml={svg} width={size} height={size} preserveAspectRatio="xMidYMid slice" />
      ) : (
        <Text style={{ fontSize: size * 0.8 }}>{emojiFlag(cc)}</Text>
      )}
    </View>
  );
});

type Props = { id: string; size?: number; ring?: boolean; noFlag?: boolean; online?: boolean };

export const Avatar = memo(function Avatar({ id, size = 48, ring, noFlag, online }: Props) {
  const c = useColors();
  const me = useApp((s) => s.me);
  const isMe = id === 'me';
  const person = isMe ? null : getPerson(id);
  const name = isMe ? me.name : person?.name ?? '';
  const cc = isMe ? me.cc : person?.cc ?? '';
  const color = isMe ? 'linear-gradient(135deg,#FF4A2E,#B4004E)' : person?.color ?? '#999';
  const photo = isMe ? me.photo : null;
  const showRing = !!ring && !!person?.online;
  const flagSize = Math.max(14, Math.round(size * 0.38));
  const inner = showRing ? size - 5 : size;

  const face = (
    <View style={[styles.face, { width: inner, height: inner, borderRadius: inner / 2, backgroundImage: photo && 'bg' in photo ? photo.bg : color }, showRing && { borderWidth: 2, borderColor: c.bg }]}>
      {photo && 'uri' in photo ? (
        <Image source={{ uri: photo.uri }} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
      ) : photo && 'emoji' in photo ? (
        <Text style={{ fontSize: size * 0.5 }}>{photo.emoji}</Text>
      ) : name ? (
        <Text style={[styles.initial, { fontSize: Math.round(size * 0.4) }]}>{name[0]}</Text>
      ) : (
        <Icon name="user" size={size * 0.46} color="#fff" />
      )}
    </View>
  );

  return (
    <View style={{ width: size, height: size }} accessibilityLabel={name}>
      <View style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, showRing && { backgroundImage: 'linear-gradient(135deg,#FF4A2E,#E0101F 50%,#8B3BFF)' }]}>
        {face}
      </View>
      {!noFlag && cc ? (
        <View style={[styles.flag, { borderColor: c.bg, borderRadius: flagSize / 2 }]}>
          <Flag cc={cc} size={flagSize - 4} />
        </View>
      ) : null}
      {online && person?.online ? <View style={[styles.dot, { borderColor: c.bg }]} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: 'inset 0 -6px 14px rgba(0,0,0,0.18)' },
  initial: { color: '#fff', fontWeight: '800' },
  flag: { position: 'absolute', left: -2, // bottom-left in every language, like the prototype
    bottom: -2, borderWidth: 2, overflow: 'hidden' },
  dot: { position: 'absolute', end: 0, bottom: 0, width: 13, height: 13, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2 },
});
