# Analysis before "exact copy of the beta" (BUILD_EXACT_COPY.md), 23 Nov 2026

No code changed. Sent to the founder for answers before step 1.

## The beta itself, walked screen by screen
- 18 main screens and pop-ups opened in light and dark (Chats, Connect, Flicks, Rooms, Me, a chat, a talk room, a live, Flick comments, Settings, Wallet, Plans, Search, Activity, Edit profile, Open room, gift sheet, a profile): no errors.
- HANDOFF.md lists 62 screens and 56 pop-ups.

## Two beta problems that only appear on a real iPhone (not inside the Claude app)
1. **Top:** the beta's top bars have no space for the clock / Dynamic Island (`.top` padding 16px, no `env(safe-area-inset-top)`). Full-screen on an iPhone, buttons sit under the Dynamic Island. Picture: `iphone-top-under-dynamic-island.png`.
2. **Bottom:** the tab bar is `68px + home-bar` = 102 px tall, lists end 96 px above the bottom (`.withtabs`), so the last item is 6 px under the bar. Also fixed 82–96 px from the bottom without the home bar: minimised room card (`.mcard`), minimised call bar (`.mini`), video Flick progress line and length (`.vprog`, `.vlen2`). Picture: `iphone-bottom-under-tab-bar.png`.

## What the beta needs from the app shell (step 1)
Microphone (voice notes: getUserMedia + MediaRecorder), Web Share, clipboard, speech (Hear it), Web Audio, localStorage, `online`/`offline` events, `wa.me` and `sms:` links opened with a target=_blank link. No file uploads.

## Current native app vs the beta
Covers about 19 of 62 screens, most only partly, and few pop-ups; round 2 also emptied it and hid unbuilt buttons (NEXT_STEPS §3–4, now postponed by BUILD_EXACT_COPY).

## Small errors in the pack
- HANDOFF "Settings · live — “Chats”" lists the Chats tab buttons (crawler slip).
- HANDOFF labels the intro-video step "(teacher)" but learners have it too; welcome / log-in / phone / code screens are not in section 4.
- CLAUDE.txt §5 says "Step 1 of 8", the beta says "Step 1 of 8" on Join then "Step 2 of 9".
- Known text slips in the beta (fixed in the native app earlier): French "vous" in 4 pattern texts, lives called "rooms" in 3 texts, missing "Cash out first…" sentence, "Connecter"/"コネクト" vs the Connect tab name, Italian "Flick" vs "Flicks", "Continue as … · phone" untranslated, French "Following" button says "Abonnements".
- BUILD_EXACT_COPY asks for round picture flags, never emoji; the beta draws 12 flags and uses emoji for every other country.
