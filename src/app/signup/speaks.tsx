/**
 * Sign-up step 5 of 9 — "Which languages do you speak fluently?" (prototype step 2).
 * 1 to 3 languages; the country's main language may already be picked (v51).
 */
import { useApp } from '../../state/store';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { LanguagePicker } from '../../components/signup/LanguagePicker';
import { goNext, signupSession } from '../../components/signup/flow';

export default function SpeaksStep() {
  const me = useApp((s) => s.me);
  const update = useApp((s) => s.updateMe);
  return (
    <SignupFrame
      step="speaks"
      title="Which languages do you speak fluently?"
      sub="Choose 1 to 3. People learning these will find you."
      reason={me.natives.length ? '' : 'Pick at least one language you speak'}
      onNext={() => goNext('speaks')}
      fixed
    >
      <LanguagePicker
        selected={me.natives}
        exclude={me.langs}
        onChange={(natives) => { signupSession.nativesTouched = true; update({ natives }); }}
      />
    </SignupFrame>
  );
}
