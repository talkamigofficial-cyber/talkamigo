/**
 * A pop-up sheet that slides up from the bottom (like the prototype's sheets / iPhone sheets).
 * Closes with the × button, by tapping the dimmed background, or by dragging it down.
 *
 *   <Sheet visible={open} onClose={() => setOpen(false)} title="App language">
 *     …content…
 *   </Sheet>
 *
 * The title stays at the top while the content scrolls (v57).
 */
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../theme/colors';
import { useLang } from '../i18n';
import { T } from './T';
import { Pressy } from './Pressy';
import { Icon } from './Icon';
import { Direction } from './Direction';

type Props = { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode; scroll?: boolean };

export function Sheet({ visible, onClose, title, children, scroll = true }: Props) {
  const c = useColors();
  const rtl = useLang() === 'ar';
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(0)).current;
  const native = Platform.OS !== 'web';

  useEffect(() => { if (visible) y.setValue(0); }, [visible, y]);

  // drag down to close: past 120 px (or a quick flick) closes, otherwise it springs back
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => { if (g.dy > 0) y.setValue(g.dy); },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > 120 || g.vy > 1.2) Animated.timing(y, { toValue: Dimensions.get('window').height, duration: 180, useNativeDriver: native }).start(onClose);
        else Animated.spring(y, { toValue: 0, useNativeDriver: native }).start();
      },
      onPanResponderTerminate: () => Animated.spring(y, { toValue: 0, useNativeDriver: native }).start(),
    }),
  ).current;

  const Body = scroll ? ScrollView : View;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Direction rtl={rtl} style={styles.veil}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <Animated.View style={[styles.sheet, { backgroundColor: c.cardStrong, borderColor: c.line, paddingBottom: Math.max(insets.bottom, 16) + 10, transform: [{ translateY: y }] }]}>
          <View {...pan.panHandlers} style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: c.line }]} />
            {title ? (
              <View style={styles.head}>
                <T style={styles.title}>{title}</T>
                <Pressy onPress={onClose} scale={0.9} style={[styles.close, { backgroundColor: c.card, borderColor: c.line }]} accessibilityLabel="Close">
                  <Icon name="close" size={21} color={c.ink} />
                </Pressy>
              </View>
            ) : null}
          </View>
          <Body {...(scroll ? { contentContainerStyle: { gap: 14 }, keyboardShouldPersistTaps: 'handled' as const } : { style: { gap: 14 } })}>{children}</Body>
        </Animated.View>
      </Direction>
    </Modal>
  );
}

const styles = StyleSheet.create({
  veil: { flex: 1, backgroundColor: 'rgba(10,4,8,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderBottomWidth: 0, paddingHorizontal: 20, maxHeight: '86%' },
  handleArea: { paddingTop: 10, paddingBottom: 6, gap: 10 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 6 },
  title: { flex: 1, fontSize: 21, fontWeight: '700' },
  close: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
