# Decisions log

Date · decision · why. Newest at the bottom.

## 23 Nov 2026 — slice 1

- **Stack: React Native + Expo (SDK 58) with Expo Router**, one codebase for iPhone and Android.
  Replaces "Swift + SwiftUI, Kotlin later" in CLAUDE.md §2 (founder's request; also noted in the handoff entry of CLAUDE.md, 22 Nov).
  The other choices in §2 (Supabase, LiveKit, RevenueCat, Stripe Connect, DeepL…) stay.
- **Testing on the iPhone with Expo Go**, links published with EAS Update. No Apple Developer account needed yet. TestFlight later.
- **Code kept on GitHub** (private repo, founder's account).
- **When the prototype and CLAUDE.md disagree, the prototype (v106) wins** because it is the latest (e.g. sign-up step count, final tab bar look).
- **Translation fixes** on top of the handoff CSVs (all in `scripts/translation-fixes.json`):
  - French "vous/votre" → "tu/ton" in 4 texts with changing parts (w10b, w2b, rtd, rlvup). Founder rule: always "tu".
  - Separate wording when a **live** (not a room) has 10 or 2 minutes left (w10aLive, w10bLive, w2bLive); before, every language said "room" for lives.
  - Delete-account warning: the sentence "Cash out first if you want the money." was missing in all 7 languages (loseCash).
  - The Connect tab is "Rencontrer" (fr) and "つながる" (ja); the profile-boost text used "Connecter" / "コネクト" (bprof).
  - Italian tab "Flick" → "Flicks", like the 18 other Italian texts.
  - New text "Coming in the next update" for buttons whose feature arrives in a later slice.
- **App name, icon, launch screen:** "TalkAmigo", the red logo icon from the prototype (480 px, scaled to 1024; a 1024 px original is needed before the App Store), red launch screen.
- **Bundle id** `com.talkamigo.app` (iPhone and Android). Can be changed until the first store upload.
- **New translations** (texts the prototype showed in English in every language): sign-up username rules, "No language found", "Photo added · we check every photo", "+50 coins · enjoy TalkAmigo!", "Add “…”" for your own interest, "Say hi 👋", "Create a group", "Online partners", "No requests right now.", "You’re all caught up.", "Invite to Duo", "Gift: …", "goal reached 🎉", Rooms empty state, "Connecting to Google…", "Checking…", "Welcome back, Sam!".
- **Sign-up counter says "of 9"** everywhere (the Join page said "of 8" while later steps said "of 9": the v88 "How did you find TalkAmigo?" step was never counted on Join).
- **Prototype bugs fixed while building:** "Continue as" showed the untranslated word "phone"; the French "Following" button said "Abonnements" (the tab name); the Chats title no longer cuts to "Discussi…" on small phones; Arabic settings rows line up on the reading side; Arabic Join demo correction no longer runs off the edge.
- **Kept for later slices (show "Coming in the next update"):** opening a chat, joining rooms/lives/lessons, comments, gifts, share, Wallet/Shop/Plans, boosts, posting a Flick, teacher sign-up, most Settings pages. Flicks "Learn" shows Flicks in your language but not the practice cards yet (they need speech services).

## 23 Nov 2026 — round 2 (NEXT_STEPS §2–4)

- **Empty-state design B** picked by the founder (icon in a soft red square, title, one sentence, at most one red button). Shared component `src/components/EmptyState.tsx`.
- **The app is empty:** no invented people, chats, rooms, lives, lessons, Flicks, offers, Room alerts or Team messages, no demo numbers. A new account starts at 0. "Try the demo" removed. All lists read from `src/data/live.ts` (empty until the server in slice 2). The prototype demo content stays in `src/data/generated/demo.json`, unused, as the seed for the hidden Test world (slice 2).
- **No "demo" and no "Coming in the next update":** buttons for features that aren't built are hidden. Where a next step doesn't exist yet (open a room, post a Flick), the empty state has no button.
- **Real flags** (country-flag-icons, MIT): square flags cropped to a circle with a thin dark ring.
- **Sign-up fixes:** birthday closes the keyboard first and shows the full wheel; name/username boxes no longer trigger the iPhone password bar; red sign-up screens use fixed colours (the photo buttons were white-on-white in dark mode); log-in with no account on this phone offers to create one (no fake "approve on your other phone"); intro video records for real with the iPhone camera (30 s) or is chosen from the phone; the teacher sign-up card is hidden until slice 7.
- **Join page:** the example chat stays (illustration of corrections), but the 5 faces and "Native speakers from 190+ countries are waiting to chat" were removed (invented people, untrue claim for an empty app).
- **Tour:** "Post your own Flick" and "Open your own room" cards are switched off until those features exist (10 cards).
- **Tab bar:** icon over label, badge on the Chats icon, pages clipped above the bar. Not reproducible in the browser: to be confirmed on the founder's iPhone.
- **Blue gear button:** it is Expo Go's own tools button, not TalkAmigo's; it does not exist in the real app.

## 23 Nov 2026 — step 1 of BUILD_EXACT_COPY.md (pack 3)

- **The app is the beta, full screen** (`src/web/BetaApp.tsx`), bundled inside the app (works without internet). Every screen, pop-up, button and demo content of v106 is there. Round 2's emptying is postponed (founder, pack 3).
- **Changes on top of the beta** (all listed in `scripts/build-web.mjs`; the beta file itself is never edited):
  - Real round flag pictures instead of emoji flags (founder: "use real flags").
  - iPhone space: nothing sits under the clock / Dynamic Island, and nothing at the bottom sits on the home bar or under the tab bar (the beta never had a real top space and its lists ended 6 px under the tab bar).
  - Wording fixes from slice 1 (French "tu", live vs room time warnings, delete-account sentence, Connect names, Italian Flicks, "Phone number" in Continue as, sign-up counter 9/14).
- **Defaults used** (founder didn't pick; can be changed): keep the beta's "demo" words for now; hide the iPhone ˄ ˅ Done bar over the keyboard (the beta has its own Done).
- Native screens from slices 1–2 stay in `src/app/` for step 2, unused for now.
- **Live rooms, 23 Nov (founder):** people in the audience see a **raised hand** to ask to go on stage (was a mic). Once the host accepts, it becomes the **mic button** (starts off, on/off as they like). The host can still mute anyone on stage (tap their square → Mute mic). Guest cameras: not built, waiting for the founder's yes on cost.
