/**
 * The 5 tabs at the bottom: Chats · Connect · Flicks · Rooms · Me (CLAUDE.md §4).
 * The active tab has a red icon and label (no filled pill). Chats shows the unread count
 * (people + groups, v106). Tapping the tab you're already on scrolls that page back to the top.
 */
import { Tabs } from 'expo-router/js-tabs';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, type Tab } from '../../state/store';
import { useT } from '../../i18n';
import { useColors, useScheme } from '../../theme/colors';
import { Icon, type IconName } from '../../components/Icon';
import { Pressy } from '../../components/Pressy';
import { Tour } from '../../components/tour/Tour';
import { TourTarget, type TourTargetId } from '../../components/tour/TourTarget';

const TABS: { route: string; tab: Tab; label: string; icon: IconName; target: TourTargetId }[] = [
  { route: 'chats', tab: 'chats', label: 'Chats', icon: 'chat', target: 'tab-chats' },
  { route: 'connect', tab: 'connect', label: 'Connect', icon: 'people', target: 'tab-connect' },
  { route: 'flicks', tab: 'flicks', label: 'Flicks', icon: 'mom', target: 'tab-flicks' },
  { route: 'rooms', tab: 'rooms', label: 'Rooms', icon: 'micvid', target: 'tab-rooms' },
  { route: 'me', tab: 'me', label: 'Me', icon: 'user', target: 'tab-me' },
];

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      {/* sceneStyle overflow hidden: a page can never draw over the tab bar (founder's iPhone, NEXT_STEPS §2.6) */}
      <Tabs screenOptions={{ headerShown: false, sceneStyle: { overflow: 'hidden' } }} tabBar={(props) => <TabBar {...props} />}>
        {TABS.map((t) => <Tabs.Screen key={t.route} name={t.route} />)}
      </Tabs>
      {/* the welcome tour runs once, right after sign-up, on top of the tabs */}
      <Tour />
    </View>
  );
}

function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const c = useColors();
  const scheme = useScheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const chats = useApp((s) => s.chats);
  const groups = useApp((s) => s.groups);
  const unread = Object.values(chats).reduce((a, ch: any) => a + (ch.unread || 0), 0) + Object.values(groups).reduce((a, g: any) => a + (g.unread || 0), 0);
  const current = state.routes[state.index]?.name;
  // Flicks has a dark full-screen feed, so the bar turns dark there
  const onFlicks = current === 'flicks';
  const bg = onFlicks ? '#0B0B0E' : scheme === 'dark' ? '#1B1B21' : '#FFFFFF';
  const idle = onFlicks ? 'rgba(255,255,255,0.6)' : c.muted;
  const active = onFlicks ? '#FFFFFF' : c.brandText;

  return (
    <View style={[styles.bar, { backgroundColor: bg, borderTopColor: onFlicks ? 'rgba(255,255,255,0.08)' : c.line, paddingBottom: Math.max(insets.bottom, 12) }]} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const on = current === tab.route;
        const badge = tab.tab === 'chats' && unread > 0 && !on ? unread : 0;
        return (
          <TourTarget key={tab.route} id={tab.target} style={{ flex: 1 }}>
          <Pressy
            scale={0.9}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t(tab.label)}
            onPress={() => {
              const route = state.routes.find((r) => r.name === tab.route)!;
              const ev = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!on && !ev.defaultPrevented) navigateToTab(route.key);
              useApp.getState().setTab(tab.tab);
            }}
          >
            {/* the icon box is the anchor for the unread badge (top-right of the icon) */}
            <View style={styles.iconBox}>
              <Icon name={tab.icon} size={tab.tab === 'rooms' ? 27 : 25} color={on ? active : idle} strokeWidth={tab.tab === 'rooms' ? (on ? 1.85 : 1.55) : on ? 2.4 : 2} />
              {badge ? (
                <View style={[styles.dot, { borderColor: bg }]}>
                  <Text style={styles.dotText}>{badge > 99 ? '99+' : badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, { color: on ? active : idle }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
              {t(tab.label)}
            </Text>
          </Pressy>
          </TourTarget>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // the bar is a solid strip in the normal page flow, under the pages and above the iPhone home bar
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, paddingHorizontal: 4, paddingTop: 6, zIndex: 10, elevation: 10 },
  tab: { flex: 1, minWidth: 0, height: 54, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconBox: { width: 30, height: 28, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: -0.1, maxWidth: '100%' },
  dot: { position: 'absolute', top: -5, right: -9, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: '#E0101F', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});
