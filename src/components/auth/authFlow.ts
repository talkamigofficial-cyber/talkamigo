/**
 * What happens after someone taps Google / Apple or verifies their phone (prototype authDone()).
 *
 * No server yet (slice 1): nothing is really checked. The rules copied from the prototype:
 *   Sign up (mode 'create')  → a brand-new account, then sign-up step "Hi! Who are you?"
 *   Log in  (mode 'signin')  → if the account saved on this phone used this way to log in, open it;
 *                               otherwise "No account on this phone" with Create account (CLAUDE.md §5:
 *                               "If someone logs in with an account that doesn't exist, offer to create one").
 *   "Continue as…"           → opens the account saved on this phone, no approval needed.
 *
 * In slice 2 the server decides which account belongs to a Google/Apple/phone login.
 */
import { router } from 'expo-router';
import { useApp, type AuthMethod } from '../../state/store';
import { toast } from '../Toast';
import { welcomeBackText } from './AuthParts';

/** Leave the welcome/log-in pages behind so Back can't return to them, then open `href`. */
function goFresh(href: '/' | '/signup/who') {
  if (router.canDismiss()) router.dismissAll();
  router.replace(href);
}

/** Is there an account on this phone that logs in with this method? */
export function hasAccountFor(method: AuthMethod) {
  const s = useApp.getState();
  return s.lastAuth === method && !!s.me.handle;
}

/** Open the account saved on this phone ("Continue as…" or a matching log-in). */
export function openSavedAccount() {
  const s = useApp.getState();
  s.logBackIn();
  goFresh('/');
  toast(welcomeBackText(useApp.getState().appLang(), s.me.name), { icon: 'check' });
}

/** Sign up or log in finished successfully for `method`. */
export function authDone(mode: 'create' | 'signin', method: AuthMethod, phone?: string) {
  if (mode === 'signin') {
    if (hasAccountFor(method)) openSavedAccount();
    else router.push({ pathname: '/auth/login', params: { step: 'none', m: method } });
    return;
  }
  useApp.getState().startSignup(method);
  if (phone) useApp.setState({ authPhone: phone.replace(/\D/g, '') });
  goFresh('/signup/who');
}
