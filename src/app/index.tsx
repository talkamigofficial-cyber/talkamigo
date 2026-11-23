/**
 * Start-up.
 *
 * STEP 1 of docs/handoff/BUILD_EXACT_COPY.md (23 Nov 2026): the app IS the beta, full screen (src/web/BetaApp.tsx).
 * The native screens built in slices 1–2 stay in this folder for step 2 (rebuilding the beta screen by screen,
 * natively) but nothing opens them yet. The earlier start-up rules (Welcome → sign-up → tabs) are in git history
 * (commit "Slice 1 screens…") and come back screen by screen in step 2.
 */
import { BetaApp } from '../web/BetaApp';

export default function Start() {
  return <BetaApp />;
}
