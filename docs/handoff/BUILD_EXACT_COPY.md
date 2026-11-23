# TalkAmigo — build the real app as an EXACT copy of the beta

Written 23 Nov 2026. **This file comes first. It replaces the earlier plan for now.**

## What went wrong so far

The first real-app build was a new, partial app: only some screens, buttons that say "Coming in the next update", things removed (Settings and others), different flags, a different bottom bar.

That is not what I asked for. I do not want a new app inspired by the beta. I want **the beta itself, as a real app**: every screen, every pop-up, every button, the same wording, the same look, the same behaviour.

## The goal of this round, in one sentence

When I open the real app on my iPhone and the beta side by side, I must not be able to tell them apart, and every button that works in the beta works in the real app.

- Keep everything the beta has, including its demo people and content, for now. Emptying the app and the hidden test mode come AFTER this round (they are in `NEXT_STEPS.md`). Do not start them yet.
- Remove nothing. Hide nothing. No "Coming in the next update". No "coming soon".
- Do not redesign, rename, reorder or "improve" anything.

## Before you write any code: analyse first, then tell me, then ask

Be very careful with what I give you. Do not start coding straight away.

1. **Read everything in the pack**, fully: this file, `HANDOFF.md`, `CLAUDE.txt`, the translation files.
2. **Open `talkamigo-beta.html` and go through it yourself**: every tab, every screen, every pop-up, in light and dark mode. Do not rely on a summary of it.
3. **Look at what you already built** and compare it with the beta, screen by screen.
4. **Then send me, before coding:**
   - what you understood I want, in a few plain sentences;
   - every difference you found between your current app and the beta (missing screens, missing buttons, wrong look, wrong wording);
   - any error, contradiction or unclear point you noticed in my files or in the beta itself;
   - your questions.
5. **Wait for my answers.** Start coding only when I say go.

While coding, the same rule applies: if you notice an error, something that does not match, or something you are not sure about, stop and tell me. Ask instead of guessing. Never work around a problem silently.

Known problem to fix, still there in the last build: **the bottom bar overlaps buttons and content at the bottom of the screen.** Nothing may sit under or behind the bar.

## How to do it: two steps

### Step 1 (do this first, today): put the beta itself inside the app

`talkamigo-beta.html` is a complete, working, single-file app (about 1.7 MB, no outside files, no server). Ship it as it is, inside the Expo app, full screen in a web view. This gives me the exact beta as an app on my iPhone immediately, with every button working, because it IS the beta.

Requirements:
1. Bundle `talkamigo-beta.html` inside the app. Do not load it from the internet and do not edit its contents.
2. Full screen, edge to edge. The page handles the notch and home bar itself (it uses the safe-area values), so make sure those values reach the page. No extra header, no extra tab bar, no margins added by the app.
3. No bounce or rubber-band scrolling of the whole page, no pinch zoom, no text selection callouts beyond what the page does, no link previews.
4. What I do in the app must still be there after I close and reopen it (the page saves to browser storage; make sure that storage persists).
5. Microphone and camera requests from the page must show the normal iPhone permission prompt and work inline (no full-screen video player taking over).
6. Links the page opens to the outside (share, WhatsApp, SMS, web pages) must open in the right iPhone app, not inside the web view.
7. The keyboard must behave as on a normal web page: the page receives the real viewport size when the keyboard opens. Do not add your own keyboard-avoiding wrapper on top; the page already moves its typing boxes.
8. Status bar style follows the page's light or dark mode.
9. The page looks for an optional `window.claude` helper (used only for the beta's bug-report box). It is not there in the app; the page already copes with that. Do not add a fake one.
10. App icon and launch screen: use the TalkAmigo logo that is inside the HTML, red brand.

Check before you tell me it is done:
- Go through `HANDOFF.md` sections 4 and 5 (every screen and pop-up with its buttons) and confirm each one opens and each button responds, on a real iPhone or simulator, in light and dark mode.
- Type in a chat, in a talk room, in a live, in Flick comments and in sign-up: the typing box must sit on the keyboard and nothing may jump.
- Close and reopen the app: my data is still there.

Then give me the link or QR code to open it in Expo Go and wait for my answer.

### Step 2 (only after I confirm step 1): make it native, one screen at a time

Replace the web view screen by screen with real native screens, without changing anything I can see.

Rules for every screen you convert:
1. **Start from the beta's own code, not from memory.** Find the screen in `talkamigo-beta.html` (the screen functions are named `v…`, for example `vChats`, `vProfile`; pop-ups are in the sheet function by `sh.t`; every button's behaviour is in the big `switch(a)` under its action name). `HANDOFF.md` lists the action name for every button.
2. **Copy the exact values**: colours, sizes, spacing, corner radius, font sizes and weights, icons (the beta's own icon drawings), flags (round pictures, never emoji), order of elements, wording.
3. **Copy the exact behaviour** of every button, including small things: what closes, what opens, what number changes, which message appears.
4. **All 8 languages** from `translations.csv` and `translations_patterns.csv`. Arabic is right-to-left. French uses "tu".
5. **A screen is finished only when** every button listed for it in `HANDOFF.md` does the same thing as in the beta. Make a checklist per screen and show it to me ticked.
6. **Show me a side-by-side picture** (beta on the left, native on the right) for each converted screen, in light and dark mode. I approve it before you move on.
7. If something is hard to do natively, keep that screen in the web view and tell me. Never replace a working button with a message, and never remove it.
8. Order: the 5 tabs and their main screens first (Chats, Connect, Flicks, Rooms, Me), then the screens they open, then the pop-ups.

## What must never happen again

- A button that does nothing or shows "Coming in the next update".
- A screen, setting or button from the beta that is missing.
- Emoji flags, a bottom bar without labels, content showing through the bottom bar.
- The word "demo" added by you. (Where the beta itself says "demo", for example on payment sheets, leave it for now; we will replace those when real payments are added.)
- Changing a design without showing me picture options first.

## What comes later (do not start yet)

In this order, each only when I say so. Details are in `NEXT_STEPS.md` and `HANDOFF.md`:
1. Real accounts and a database, so two phones see each other.
2. Emptying the app of demo content and adding the hidden test mode for team accounts.
3. Real chat, rooms, live video, calls.
4. Real purchases (Apple sandbox first).
5. Stripe payouts, once our company exists.
6. The admin site.

Free plans only. Tell me before anything costs money.

Note for publishing later: an app that is only a web page in a wrapper may not pass Apple's review. That is why step 2 exists. For private testing in Expo Go it does not matter.

## How to report to me

I am not a developer. Plain English, no code:
1. What you did.
2. Exactly how I open it on my iPhone.
3. What you checked, and what you could not check.
4. Anything that differs from the beta, however small. If nothing differs, say so.

## Start now

1. Do the analysis described in "Before you write any code".
2. Send me your understanding, the differences and errors you found, and your questions.
3. Wait for my go. Then do step 1 only, and show me.
