/**
 * Sign-up: the order of the steps, the step counter, and moving between steps.
 *
 * Learners see "Step 2 of 9" … "Step 9 of 9" (step 1 is the Join page; "How did you find TalkAmigo?"
 * was added in v88 as a sub-step of "Where are you from?", which is why the counter shows 9).
 * Prototype: obPos() and the 'ob-next' / 'ob-back' handlers in docs/handoff/talkamigo-beta.html.
 */
import { router } from 'expo-router';
import { SIGNUP_STEPS, type SignupStep, useApp } from '../../state/store';

export { SIGNUP_TOTAL as TOTAL_STEPS } from '../auth/AuthParts'; // shared with the Join page ("Step 1 of 9")

/** "Step N of 9" number for each screen. */
export const STEP_NUMBER: Record<SignupStep, number> = {
  who: 2, country: 3, foundUs: 4, speaks: 5, learns: 6, interests: 7, photo: 8, video: 9,
};

/** Go forward one step (push, so the iPhone edge swipe goes back). The last step finishes sign-up. */
export function goNext(step: SignupStep) {
  const i = SIGNUP_STEPS.indexOf(step);
  const next = SIGNUP_STEPS[i + 1];
  if (!next) {
    useApp.getState().finishSignup();
    router.replace('/look');
    return;
  }
  useApp.getState().setSignupStep(next);
  router.push(`/signup/${next}`);
}

/** Go back one step. The first step goes back to the Join page (Step 1 of 9). */
export function goBack(step: SignupStep) {
  const i = SIGNUP_STEPS.indexOf(step);
  const prev = SIGNUP_STEPS[i - 1];
  if (!prev) return router.replace('/auth/join');
  useApp.getState().setSignupStep(prev);
  if (router.canGoBack()) router.back();
  else router.replace(`/signup/${prev}`);
}

/**
 * Remembers, for this sign-up, whether the person changed "languages I speak" themselves.
 * Until they do, picking a country pre-selects its main language (v51); after that it no longer overrides.
 */
export const signupSession = {
  nativesTouched: false,
  /** the community promise tick on the photo step (kept while moving between steps) */
  promise: false,
  /**
   * The intro video recorded or chosen on the last step (a file on this phone). The store only keeps
   * `me.video = true`; the file itself is uploaded and checked by the server from slice 2.
   */
  introVideoUri: null as string | null,
};
