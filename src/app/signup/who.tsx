/**
 * Sign-up step 2 of 9 — "Hi! Who are you?" (prototype vOnboard() step 0).
 * Display name (required, no emails/links/phone numbers), @username (checked live, suggestions only
 * when taken), birthday (iPhone wheel, required, 18+). Everything is saved as you type, so going back
 * a step or reopening the app keeps it (v55, v87).
 */
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { toast } from '../../components/Toast';
import { Pressy } from '../../components/Pressy';
import { Icon } from '../../components/Icon';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { FieldLabel, Hint, RedChip, WhiteInput } from '../../components/signup/RedPieces';
import { BirthdayWheel, formatBirthday } from '../../components/signup/BirthdayWheel';
import { ageFrom, nameBad, userCheck, userSuggest } from '../../components/signup/checks';
import { goNext } from '../../components/signup/flow';

/** The reason Continue is greyed, in the same order as the prototype's obWhy(). */
function reasonFor(name: string, handle: string, bday: string | null) {
  if (!name.trim()) return 'Add your display name';
  if (nameBad(name)) return nameBad(name);
  if (!userCheck(handle).ok) return 'Choose an available username';
  if (!bday) return 'Choose your birthday';
  if (ageFrom(bday) < 18) return 'TalkAmigo is 18+';
  return '';
}

export default function WhoStep() {
  const t = useT();
  const me = useApp((s) => s.me);
  const update = useApp((s) => s.updateMe);
  const [wheelOpen, setWheelOpen] = useState(false);

  /**
   * Birthday: close the keyboard FIRST, then show the wheel once the keyboard has gone, so the whole
   * wheel is visible (with the keyboard still up it was cut in half — founder's iPhone, NEXT_STEPS §2.2).
   */
  const openWheel = () => {
    if (!Keyboard.isVisible()) return setWheelOpen(true);
    let done = false;
    const show = () => { if (done) return; done = true; sub.remove(); setWheelOpen(true); };
    const sub = Keyboard.addListener('keyboardDidHide', show);
    Keyboard.dismiss();
    setTimeout(show, 450); // safety net if the "keyboard gone" signal never comes
  };

  const check = userCheck(me.handle);
  const bad = nameBad(me.name);
  const reason = reasonFor(me.name, me.handle, me.bday);

  return (
    <SignupFrame
      step="who"
      title="Hi! Who are you?"
      sub="Only your age is shown. TalkAmigo is 18+."
      reason={reason}
      onNext={() => { update({ name: me.name.trim() }); goNext('who'); }}
    >
      <View style={styles.field}>
        <FieldLabel label="Display name" required />
        {/* NOT a log-in form: these settings stop the iPhone from offering saved passwords (NEXT_STEPS §2.3) */}
        <WhiteInput {...NOT_A_LOGIN} value={me.name} onChangeText={(name) => update({ name })} maxLength={24} autoCapitalize="words" placeholder={t('Your first name')} accessibilityLabel={t('Display name')} />
        <Hint text={bad} kind="bad" />
      </View>

      <View style={styles.field}>
        <FieldLabel label="Username" required />
        <View style={[styles.userBox, { borderColor: me.handle ? (check.ok ? '#14804A' : '#E0101F') : 'transparent' }]}>
          <Text style={styles.at}>@</Text>
          <WhiteInput
            {...NOT_A_LOGIN}
            value={me.handle}
            onChangeText={(handle) => update({ handle })}
            maxLength={20}
            autoCapitalize="none"
            spellCheck={false}
            placeholder="yourname"
            style={styles.userInput}
            accessibilityLabel={t('Username')}
          />
        </View>
        <Hint text={me.handle ? check.msg : '3–20 letters, numbers, _ or .'} kind={me.handle && !check.ok ? 'bad' : me.handle ? 'ok' : undefined} />
        {/* suggestions only appear when the name is taken (v87) */}
        {check.taken ? (
          <View style={styles.suggest}>
            {userSuggest(me.name, me.cc).map((s) => <RedChip key={s} raw label={`@${s}`} onPress={() => update({ handle: s })} />)}
          </View>
        ) : null}
      </View>

      <View style={styles.field}>
        <FieldLabel label="Birthday" required />
        {wheelOpen ? (
          <BirthdayWheel
            value={me.bday}
            onDone={(bday) => {
              update({ bday });
              setWheelOpen(false);
              if (ageFrom(bday) < 18) toast('TalkAmigo is 18+ at launch', { icon: 'alert', top: true });
            }}
          />
        ) : (
          <Pressy onPress={openWheel} scale={0.98} style={styles.bdBtn} accessibilityLabel={t('Choose your birthday')}>
            <Text style={[styles.bdText, !me.bday && { color: '#9A9AA5' }]}>{me.bday ? formatBirthday(me.bday, t.lang) : t('Choose your birthday')}</Text>
            <Icon name="chev" size={18} color="#9A9AA5" />
          </Pressy>
        )}
      </View>
    </SignupFrame>
  );
}

/** Text-box settings for name and username: no saved-password bar, no autofill, no autocorrect. */
const NOT_A_LOGIN = {
  textContentType: 'none',
  autoComplete: 'off',
  autoCorrect: false,
  importantForAutofill: 'no',
} as const;

const styles = StyleSheet.create({
  field: { gap: 7 },
  userBox: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 16, borderWidth: 1.5, backgroundColor: '#fff', paddingStart: 14, overflow: 'hidden' },
  at: { color: '#9A9AA5', fontWeight: '800', fontSize: 16 },
  userInput: { flex: 1, height: 44, paddingHorizontal: 2, borderRadius: 0 },
  suggest: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bdBtn: { height: 48, borderRadius: 16, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  bdText: { fontSize: 16, color: '#16161D' },
});
