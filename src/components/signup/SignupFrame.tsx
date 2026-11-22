/**
 * The frame every sign-up step uses (prototype vOnboard(), the ".obx" look):
 *   top:    round back button · white progress bar · "Step 3 of 9"
 *   middle: big white title, a short line under it, then the step's content
 *   bottom: one short reason line ("Pick at least one interest") right above a white Continue button.
 *           Continue stays greyed while there's a reason (v87).
 *
 * `fixed` steps don't scroll as a whole: their long list scrolls inside its own box instead,
 * so the title and Continue always fit on an iPhone SE (v87).
 * The current step is saved every time the screen is shown, so reopening the app resumes here (v87).
 */
import { useCallback } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen, BackButton } from '../Screen';
import { Button } from '../Button';
import { stepLabel } from '../auth/AuthParts';
import { useT } from '../../i18n';
import { useApp, type SignupStep } from '../../state/store';
import { STEP_NUMBER, TOTAL_STEPS, goBack } from './flow';

type Props = {
  step: SignupStep;
  title: string;
  sub?: string;
  /** Why Continue can't be pressed yet ('' = it can). Already-English text, translated here. */
  reason: string;
  button?: string;
  /** false = Continue greyed with no reason line (e.g. no country picked yet, like the prototype). */
  canContinue?: boolean;
  onNext: () => void;
  fixed?: boolean;
  children: React.ReactNode;
};

export function SignupFrame({ step, title, sub, reason, button = 'Continue', canContinue = true, onNext, fixed, children }: Props) {
  const t = useT();
  useFocusEffect(useCallback(() => { useApp.getState().setSignupStep(step); }, [step]));
  const n = STEP_NUMBER[step];

  const head = (
    <View style={styles.head}>
      <Text style={styles.title}>{t(title)}</Text>
      {sub ? <Text style={styles.sub}>{t(sub)}</Text> : null}
    </View>
  );

  return (
    <Screen red>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          <BackButton onRed onPress={() => goBack(step)} />
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(n / TOTAL_STEPS) * 100}%` }]} />
          </View>
          <Text style={styles.count}>{stepLabel(t.lang, n, TOTAL_STEPS)}</Text>
        </View>

        {fixed ? (
          <View style={styles.body}>{head}{children}</View>
        ) : (
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" keyboardDismissMode="none">
            {head}
            {children}
          </ScrollView>
        )}

        <View style={styles.foot}>
          {reason ? <Text style={styles.why} accessibilityLiveRegion="polite">{t(reason)}</Text> : null}
          <Button kind="white" title={button} disabled={!!reason || !canContinue} onPress={onNext} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.28)', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: '#fff' },
  count: { color: 'rgba(255,255,255,0.86)', fontSize: 12.5, fontWeight: '700' },
  body: { flexGrow: 1, flex: undefined, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, gap: 16 },
  head: { gap: 8 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.6, lineHeight: 33, textShadowColor: 'rgba(70,0,40,0.25)', textShadowRadius: 24, textShadowOffset: { width: 0, height: 6 } },
  sub: { color: 'rgba(255,255,255,0.86)', fontSize: 15, lineHeight: 21 },
  foot: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  why: { textAlign: 'center', fontSize: 12.5, fontWeight: '800', color: '#FFE1E3', marginBottom: 8 },
});
