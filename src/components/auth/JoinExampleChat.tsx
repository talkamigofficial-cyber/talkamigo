/**
 * The mini chat that plays in on the Join page (prototype joinDemo(), an example conversation, v45/v46):
 * Noah asks a question, you answer with a mistake, a green correction appears, Noah suggests a call.
 * It is always in English (v46) and is NOT translated: it shows a real conversation.
 * Underneath: 5 faces + "Native speakers from 190+ countries are waiting to chat".
 */
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Direction } from '../Direction';
import { useT } from '../../i18n';

const LINES = [
  { kind: 'them', text: 'Hi! Are you learning English?', at: 250 },
  { kind: 'me', text: 'Yes! I learn since 3 months 😅', at: 1050 },
  { kind: 'fix', wrong: 'I learn since', right: 'I’ve been learning for', at: 1900 },
  { kind: 'them', text: 'Nice! Want to call tonight? 📞', at: 2600 },
] as const;

export function JoinExampleChat() {
  const t = useT();
  return (
    <View style={styles.card}>
      <View style={{ gap: 7 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {LINES.map((line, i) => (
          <PlayIn key={i} delay={line.at} style={[styles.row, line.kind === 'me' && { justifyContent: 'flex-end' }]}>
            {line.kind === 'them' ? <Avatar id="noah" size={30} /> : null}
            {line.kind === 'fix' ? (
              // the correction is English, so it reads left-to-right even in Arabic
              <Direction rtl={false} style={styles.fix}>
                <Text style={styles.wrong}>{line.wrong}</Text>
                <Text style={styles.fixText}> → </Text>
                <Text style={[styles.fixText, { fontWeight: '800' }]}>{line.right} </Text>
                <Icon name="check" size={14} color="#15803D" strokeWidth={2.6} />
              </Direction>
            ) : (
              <Text style={[styles.bubble, line.kind === 'me' ? styles.me : styles.them]}>{line.text}</Text>
            )}
          </PlayIn>
        ))}
      </View>
      <View style={styles.foot}>
        <View style={styles.crowd}>
          {['camille', 'kenji', 'lucia', 'tunde', 'aiko'].map((id, i) => (
            <View key={id} style={[styles.face, i > 0 && { marginStart: -9 }]}><Avatar id={id} size={26} /></View>
          ))}
        </View>
        <Text style={styles.footText}>{t('Native speakers from 190+ countries are waiting to chat')}</Text>
      </View>
    </View>
  );
}

/** Fades and springs a chat line in after `delay` ms. */
function PlayIn({ delay, style, children }: { delay: number; style: object; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: 1, delay, useNativeDriver: Platform.OS !== 'web', speed: 14, bounciness: 8 }).start();
  }, [delay, v]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 22, paddingTop: 14, paddingHorizontal: 14, paddingBottom: 12, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubble: { fontSize: 14, lineHeight: 19, paddingVertical: 8, paddingHorizontal: 12, maxWidth: '78%', overflow: 'hidden' },
  them: { backgroundColor: '#fff', color: '#16161D', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 5 },
  me: { backgroundColor: '#1A0B14', color: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 5 },
  fix: { marginStart: 38, flexShrink: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#E9FBEF', borderColor: '#BDEFCD', borderWidth: 1, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10 },
  wrong: { fontSize: 13, color: '#B42318', opacity: 0.8, textDecorationLine: 'line-through' },
  fixText: { fontSize: 13, color: '#15803D' },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.22)', paddingTop: 10 },
  crowd: { flexDirection: 'row', paddingStart: 8 },
  face: { borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.0)' },
  footText: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 18 },
});
