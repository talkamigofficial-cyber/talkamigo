/**
 * What happens after someone taps Google / Apple or verifies their phone (prototype authDone()).
 *
 * No server yet (slice 1): nothing is really checked. The rules copied from the prototype:
 *   Sign up (mode 'create')  → a brand-new account, then sign-up step "Hi! Who are you?"
 *   Log in  (mode 'signin')  → if the account saved on this phone used this way to log in, open it;
 *                               otherwise "Approve on your other phone" (one phone per account, v31 Oct).
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
    else router.push({ pathname: '/auth/login', params: { step: 'approve', m: method } });
    return;
  }
  useApp.getState().startSignup(method);
  if (phone) useApp.setState({ authPhone: phone.replace(/\D/g, '') });
  goFresh('/signup/who');
}

/**
 * "Approve on my other phone (demo)": in the prototype an approved log-in with no account
 * saved on this phone opens the demo account (Sam), as if it came from the other phone.
 */
export function approveOnOtherPhone(method: AuthMethod) {
  const choice = useApp.getState().welcomeLangChoice;
  useApp.getState().tryDemo();
  useApp.setState({ lastAuth: method, ...(choice ? { appLangChoice: choice } : {}) });
  goFresh('/');
  toast('Approved. Your other phone has been logged out.');
}
