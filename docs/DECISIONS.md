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
