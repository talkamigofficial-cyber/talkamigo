/**
 * Step 1 of BUILD_EXACT_COPY.md: the beta itself, full screen, as the app.
 *
 * Shows src/web/page.ts (the founder's beta + the small changes listed in scripts/build-web.mjs)
 * in a web view that fills the whole iPhone screen, edge to edge. The page draws everything itself,
 * including its own tab bar and the space for the clock and the home bar.
 *
 * What this file adds around the page (and only this):
 *  - saved data stays between launches (the page's browser storage, kept by the phone);
 *  - no rubber-band bounce, no pinch zoom, no link previews, no iPhone ˄ ˅ Done bar over the keyboard
 *    (the beta has its own Done button, v93);
 *  - microphone requests show the normal iPhone permission prompt (voice notes);
 *  - links to other apps (WhatsApp, Messages, web pages) open in the right iPhone app;
 *  - the page's Share button opens the iPhone share sheet;
 *  - the status bar text turns light or dark to match what is under it;
 *  - the red launch screen stays until the page is ready, so there is no white flash.
 * The keyboard is left to the web view, exactly like Safari: the page moves its own typing boxes.
 */
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, Share, StyleSheet, View } from 'react-native';
import { initialWindowMetrics, useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import { PAGE_HTML } from './page';

// The page's address inside the app. Its saved data belongs to this address:
// never change it, or everyone's saved data would start empty again.
const BASE_URL = 'https://app.talkamigo.local/';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Runs inside the page before the beta's own code. Small bridges only; it changes nothing on screen. */
const BRIDGE = `
(function () {
  var post = function (m) { try { window.ReactNativeWebView.postMessage(JSON.stringify(m)); } catch (e) {} };

  // Share button → the iPhone share sheet
  navigator.share = function (d) { post({ type: 'share', title: d && d.title, text: d && d.text, url: d && d.url }); return Promise.resolve(); };
  navigator.canShare = function () { return true; };

  // no pinch zoom (iPhone ignores the page's own setting inside apps)
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('DOMContentLoaded', function () {
    var m = document.querySelector('meta[name=viewport]');
    if (m) m.setAttribute('content', 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
  });

  // status bar: light text over dark or red screens, dark text over light ones
  var last = '';
  function luminance(c) { var m = c.match(/\\d+(\\.\\d+)?/g); if (!m) return 1; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; }
  function statusStyle() {
    var y = 6, x = window.innerWidth / 2, el = document.elementFromPoint(x, y), style = 'dark';
    while (el && el !== document.documentElement) {
      var cs = getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && cs.backgroundImage.indexOf('gradient') >= 0) { style = 'light'; break; }
      var bg = cs.backgroundColor;
      if (bg && bg !== 'transparent' && !/rgba\\([^)]*,\\s*0\\)/.test(bg)) { style = luminance(bg) < 0.5 ? 'light' : 'dark'; break; }
      el = el.parentElement;
    }
    if (style !== last) { last = style; post({ type: 'status', style: style }); }
  }
  var timer = null;
  function soon() { if (timer) return; timer = setTimeout(function () { timer = null; statusStyle(); }, 120); }
  document.addEventListener('DOMContentLoaded', function () {
    new MutationObserver(soon).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'data-theme'] });
    document.addEventListener('scroll', soon, true);
    statusStyle();
    post({ type: 'ready' });
  });
})();
true;
`;

/**
 * The iPhone's clock area (top) and home bar (bottom), in points, handed to the page as --sa-top, --sa-bottom…
 * The page uses these instead of the web view's own safe-area values, which were wrong on a real iPhone
 * (the page sat ~59 pt too low and the tab bar labels were cut off).
 */
function insetsJs(i: EdgeInsets) {
  return `(function(){var s=document.documentElement.style;s.setProperty('--sa-top','${i.top}px');s.setProperty('--sa-bottom','${i.bottom}px');s.setProperty('--sa-left','${i.left}px');s.setProperty('--sa-right','${i.right}px');window.dispatchEvent(new Event('resize'));})();true;`;
}
const FIRST_INSETS: EdgeInsets = initialWindowMetrics?.insets ?? { top: 0, bottom: 0, left: 0, right: 0 };

export function BetaApp() {
  const insets = useSafeAreaInsets();
  const web = useRef<React.ComponentRef<typeof WebView>>(null);
  // the page gets the sizes before its first drawing (below), then again whenever they change (e.g. rotation)
  const firstJs = useRef(insetsJs(FIRST_INSETS) + BRIDGE).current;
  useEffect(() => { web.current?.injectJavaScript(insetsJs(insets)); }, [insets]);

  const [statusStyle, setStatusStyle] = useState<'light' | 'dark'>('light');
  const ready = useRef(false);

  const showPage = useCallback(() => {
    if (ready.current) return;
    ready.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // never keep the launch screen for more than 4 s, even if the page doesn't say it's ready
  useEffect(() => {
    const t = setTimeout(showPage, 4000);
    return () => clearTimeout(t);
  }, [showPage]);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    let m: { type?: string; style?: 'light' | 'dark'; title?: string; text?: string; url?: string };
    try { m = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (m.type === 'ready') showPage();
    if (m.type === 'status' && m.style) setStatusStyle(m.style);
    if (m.type === 'share') {
      const message = [m.text, Platform.OS === 'android' ? m.url : null].filter(Boolean).join(' ');
      Share.share({ title: m.title, message, url: m.url }).catch(() => {});
    }
  }, [showPage]);

  /** Links that leave the page (WhatsApp, Messages, web pages) open in the right iPhone app. */
  const openOutside = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {});
  }, []);

  const onShouldStartLoad = useCallback((req: WebViewNavigation) => {
    const url = req.url || '';
    if (url.startsWith(BASE_URL) || url.startsWith('about:') || url.startsWith('data:') || url.startsWith('blob:')) return true;
    openOutside(url);
    return false;
  }, [openOutside]);

  return (
    <View style={styles.root}>
      <StatusBar style={statusStyle} />
      <WebView
        ref={web}
        style={styles.web}
        containerStyle={styles.web}
        source={{ html: PAGE_HTML, baseUrl: BASE_URL }}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={firstJs}
        onMessage={onMessage}
        onShouldStartLoadWithRequest={onShouldStartLoad}
        onOpenWindow={(e) => openOutside(e.nativeEvent.targetUrl)}
        setSupportMultipleWindows
        // saved data kept between launches
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        incognito={false}
        // edge to edge: the page handles the notch and home bar itself
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        // feels like an app, not a web page
        bounces={false}
        overScrollMode="never"
        allowsLinkPreview={false}
        allowsBackForwardNavigationGestures={false}
        dataDetectorTypes="none"
        hideKeyboardAccessoryView
        keyboardDisplayRequiresUserAction={false}
        pullToRefreshEnabled={false}
        // microphone (voice notes) and sounds, played inside the page
        mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        // Android equivalents
        textZoom={100}
        setBuiltInZoomControls={false}
        onLoadEnd={() => { web.current?.injectJavaScript(insetsJs(insets)); showPage(); }}
        contentInset={{ top: 0, bottom: 0, left: 0, right: 0 }}

      />
    </View>
  );
}

const styles = StyleSheet.create({
  // red like the launch screen, so the moment the page appears never flashes white
  // covers the whole screen exactly, from the very top to the very bottom, whatever is around it
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#C20A1A' },
  web: { flex: 1, backgroundColor: 'transparent' },
});
