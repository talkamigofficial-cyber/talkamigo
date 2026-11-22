/**
 * Start-up: decides which page to open.
 *   nobody logged in           → Welcome
 *   sign-up not finished       → the step where they stopped (v87: "reopening the app goes back to the same step")
 *   signed up, steps after it  → Choose your look → Your AI helpers → the app (the tour runs on top of Flicks)
 *   otherwise                  → the app, on Flicks (CLAUDE.md §4: "The app opens on Flicks")
 */
import { Redirect } from 'expo-router';
import { useApp } from '../state/store';

export default function Start() {
  const { account, onboarded, signupStep, lookChosen, aiOK } = useApp();
  if (!account) return <Redirect href="/welcome" />;
  if (!onboarded) return <Redirect href={`/signup/${signupStep ?? 'who'}`} />;
  if (!lookChosen) return <Redirect href="/look" />;
  if (aiOK === null) return <Redirect href="/ai-helpers" />;
  return <Redirect href="/flicks" />;
}
