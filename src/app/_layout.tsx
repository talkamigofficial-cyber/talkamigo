/**
 * The root of the app: wraps every page.
 * - waits until the saved data is loaded from the phone,
 * - sets right-to-left for Arabic and the light/dark colours,
 * - shows pop-up messages (toasts) above everything.
 *
 * Pages slide in from the side and go back with the iPhone edge swipe (native stack).
 */
import { useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';

// The navigation library sets a style the web preview doesn't know; harmless, only in the browser preview.
LogBox.ignoreLogs(['Invalid style property of "direction"']);
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useApp } from '../state/store';
import { useLang } from '../i18n';
import { useColors, useScheme } from '../theme/colors';
import { ToastHost } from '../components/Toast';
import { Direction } from '../components/Direction';

export default function RootLayout() {
  const [ready, setReady] = useState(useApp.persist.hasHydrated());
  useEffect(() => useApp.persist.onFinishHydration(() => setReady(true)), []);
  useEffect(() => { if (useApp.persist.hasHydrated()) setReady(true); }, []);

  const lang = useLang();
  const c = useColors();
  const scheme = useScheme();
  const onboarded = useApp((s) => s.onboarded);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#850612' }} />;

  return (
    <SafeAreaProvider>
      {/* Arabic flips the whole layout; phone numbers and the logo stay left-to-right where they are drawn */}
      <Direction rtl={lang === 'ar'} style={{ flex: 1, backgroundColor: c.bg }}>
        <StatusBar style={!onboarded || scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: c.bg },
            gestureEnabled: true,
            fullScreenGestureEnabled: false, // only from the edge, like iPhone
            animation: 'slide_from_right',
          }}
        />
        <ToastHost />
      </Direction>
    </SafeAreaProvider>
  );
}
