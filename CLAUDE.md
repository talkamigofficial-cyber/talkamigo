# TalkAmigo — Project Brief for Claude Code

> **Update 23 Nov 2026 (read first):** the real app is built with **React Native + Expo (SDK 58) + Expo Router**, one codebase for iPhone and Android, tested on the founder's iPhone with **Expo Go** (not Xcode / the Simulator). Wherever this brief says Swift, SwiftUI, Xcode, Simulator, Kotlin or `ios/`, read it as the React Native equivalent. Developer guide: `docs/ARCHITECTURE.md`. The reference for screens and behaviour is the prototype in `docs/handoff/` (v106); when it and this brief disagree, the prototype wins. Decisions: `docs/DECISIONS.md`. **Current instructions for the next rounds: `docs/handoff/NEXT_STEPS.md`.**

> Put this file in the root folder of the TalkAmigo project on the Mac. Claude Code reads `CLAUDE.md` automatically at the start of every session, so this is the single source of truth. When a decision changes, update this file first.

---

## 0. How to work with me (rules for Claude Code)

**Every session starts like this:** read `CLAUDE.md` and `ROADMAP.md`, tell me which step we're on, propose a short plan, wait for my OK. **Every session ends like this:** the app builds, I've tested it in the Simulator, you commit to Git, you tick the step in `ROADMAP.md`. Any new idea I mention mid-session goes into `IDEAS.md`, not into the current work, unless I say "do it now".

1. **I am a founder, not a professional developer.** Explain what you're doing in plain English before big steps, and tell me exactly what to click or type when I need to do something (Xcode, Apple Developer site, Stripe, etc.).
2. **Work in small steps.** One feature at a time. After each feature: it builds, it runs in the iPhone Simulator, tests pass, and you commit to Git with a clear message.
3. **Follow `ROADMAP.md` in order.** Don't start payments before login, profiles and chat work.
4. **Never hard-code** prices, class durations, capacities, currency values, teacher/creator shares or country rules. They live in the `app_config` table (section 9) so they can change without an app update.
5. **Never put secret keys in the app code or in Git.** Use `.env` files (git-ignored) and the backend's secret storage. If I paste a secret into chat, remind me to rotate it.
6. **Ask me before** anything involving money, safety, deleting data, or choosing a paid service. Present 2 options with costs and your recommendation.
7. **Security is enforced on the server**, never only in the app: age, blocks, plan (Plus/Infinity), teacher status, purchases.
8. **Every feature needs:** a short note in `/docs/features/`, the definition of done (section 13), and at least basic tests.
9. If something in this brief is unclear or conflicts, **stop and ask**. Don't guess.
10. Keep a running `/docs/DECISIONS.md` log: date, decision, why.

---

## 1. What TalkAmigo is

A human-first **language-exchange social app** (inspired by HelloTalk and Tandem, but better). People practise languages with real people around the world through chats and calls, live **voice rooms**, a TikTok-style "Flicks" feed, verified teacher classes, Clubs and Duo partnerships.

- **Tagline:** Speak. Connect. Belong.
- **Launch audience:** adults **18+ only**. A separate protected teen mode (12–17) is designed later and stays **switched off** until legal/child-safety review.
- **Launch region:** Europe. Marketing focuses on 2–3 language pairs first (e.g. French ⇄ English, Spanish ⇄ English) so the app feels busy.
- **AI is a helper** (translate, correct, prompts, captions), never a fake friend. No companion chatbot.
- **Voice rooms + Lives, but no group video rooms.** Decisions 25–26 Oct 2026: group rooms are **voice only** (many cameras at once cost 3–4× more). **Lives** are allowed: **one person on camera** broadcasting to viewers who comment and send gifts (like HelloTalk Live / TikTok Live). Video is also used in 1-to-1 calls and teacher classes.

### What makes it different from HelloTalk (the "moat")
- **Peer corrections** shown publicly (green), building reputation.
- **Live voice rooms with live subtitles + translation** so beginners can follow (also in 1-to-1 calls).
- **Duo** partnerships with shared streaks and daily prompts.
- **Verified teacher marketplace** inside the social app.
- **Language Passport**: countries/milestones unlocked through real conversations.
- **Flicks**: full-screen vertical feed (swipe up/down) of people's posts.
- **Gifts people can turn into real money** (Coins → Diamonds → cash-out).
- **Trust & safety** taken seriously from day one.

---

## 2. Tech stack (decided — ask before changing)

| Part | Choice | Why |
|---|---|---|
| iOS app | **Swift + SwiftUI**, iOS 17+, built in **Xcode** on the Mac | Native, best feel |
| Android app | **Kotlin + Jetpack Compose**: **phase 2, after iOS works** | Same backend; build once iOS is proven |
| Backend + database | **Supabase** (Postgres, Auth, Realtime, Storage, Edge Functions) | Fast for a small team, we own the data, row-level security |
| Voice rooms, Lives, 1-to-1 calls, teacher classes | **LiveKit Cloud** (alternative: Agora) | Pay per minute + data; group rooms are voice-only, Lives have one camera |
| In-app purchases | **StoreKit 2** (Apple) + **Google Play Billing**, managed through **RevenueCat** | Subscriptions, Coins, class tickets, restore |
| Paying teachers/creators | **Stripe Connect** (Express accounts) | KYC, bank payouts |
| Push notifications | **APNs** (iOS) via Supabase Edge Function or **OneSignal** | |
| Translation | **DeepL API** (or an LLM API) | Message + Flick translation, corrections |
| Live captions | **Deepgram** or **OpenAI** speech-to-text, then translate | Calls and classes |
| Moderation | Text/image/video moderation API + **human review queue** in admin | Required |
| Admin dashboard | **Next.js** web app (separate folder) using Supabase | Reports, users, payouts, config |
| Crash + analytics | **Sentry** + **PostHog** | |
| Code hosting | **GitHub private repo** | Company owns it |

**Environments:** `dev`, `staging`, `production`: separate Supabase projects and keys.

---

## 3. Brand & design system

The approved design is a Claude canvas called **"TalkAmigo App Screens"** (main theme white & red, dark mode black & red, sign-up flow, 17+ screens). Screenshots are exported into `/design/screens/`. **Match them closely.**

### Logo & mascot
- Logo: red app icon with two smiling speech bubbles (one red/orange, one pink/violet), a globe, and "A / 文 / あ" bubbles. File: `/design/logo.png`.
- **Mascot** = the two smiling bubbles. Variants: normal, Halloween costume, crown. Used in empty states, banners, Plans, settings footer. Files: `/design/mascot*.svg`.

### Colours
> **Decision 26 Oct 2026, clean look (overrides the glow backgrounds below):** Light mode = **pure white `#FFFFFF`** surfaces, near-black text `#111114`, grey lines `#ECECF0`, grey fills `#F4F4F6`. Dark mode = **`#0B0B0E`** background, cards `#16161B`. **Red `#E0101F` is only for actions and features**: primary buttons, active tab (red icon + label, no filled pill), Go live, badges, sent chat bubbles, live dots. No glow blobs or grain on screens; Flicks posts and event banners can stay colourful because they're content. Wallet balance cards are black (`#141418`). App icon = the two smiling bubbles with globe and letters on red (`/design/app-icon.png`); the Welcome screen is white with the icon centred.
**Main theme (light, default):**
| Token | Hex | Use |
|---|---|---|
| `brand` | `#E0101F` | Buttons, active states, banners |
| `brandText` | `#C20E1B` | Red text/links on white (accessible) |
| `ink` | `#16161D` | Main text |
| `muted` | `#6B6B76` | Secondary text |
| `surface` | `#FFFFFF` | Background base |
| `chip` | `#F6F3F3` | Chips, inputs, inactive tabs |
| `line` | `#ECE6E6` | Borders, dividers |
| `tint` / `tintText` | `#FFEDEE` / `#B00C18` | Soft red pills (plan badges, language tags) |
| `success` | `#16A34A` (text `#15803D`) | Online dot, corrections, "booked" |
| `violet` | `#953BFF` | Small accents only |
| `night` | `#2A0508` | Event banners |

**Lively background (both themes):** soft radial glows in the corners, taken from the logo: red top-right, violet bottom-left, coral bottom. Light: red 16% / violet 13% / coral 10% opacity on white. Dark: red 45% / violet 30% on `#0B0B12`. Cards stay solid so text is readable.

**Dark mode:** background `#0B0B12`, cards `#14141C`, lines `#22222C`, muted `#A6A6B3`, accent `#FF1E2D`, deep crimson `#6A0006`.

Settings has **Light / Dark / Match phone**. **Default is Match phone** (changed 5 Nov 2026), chosen right after sign-up and in Settings → Appearance.

**Settings (grouped list like HelloTalk, each row opens its own page):**
- Account: edit profile, email, phone, password, sign-in methods (Apple/Google), delete account
- Notifications: messages, calls, someone I follow goes live, comments & corrections, gifts received, class & event reminders, likes, sound, vibration, quiet hours
- Privacy & safety: who can message me, who can send me gifts, show age / city / online status, appear in nearby search, blocked users
- Chat settings: auto-translate, allow corrections, read receipts, romanisation, text size, chat background
- Learning settings: languages & level, daily goal, live subtitles & subtitle language
- Chat backup (Plus)
- Wallet & payouts · App language · Appearance (Light default / Dark / Match phone)
- Rate TalkAmigo · About (version, terms, privacy policy, community guidelines) · Help & safety centre · Storage (clear cache) · Log out

### Type & shape
- Font: **the iPhone system font (SF Pro)** for a native feel (decided 1 Nov 2026; replaces Plus Jakarta Sans). Big titles 26–30 / 800, body 14–16.
- Corners: cards 18–22, buttons 14–16, chips fully round.
- Touch targets ≥ 44pt. Icons: simple line icons, no emoji as icons.
- Text contrast must pass WCAG AA. Never show errors with red alone.

### Profile pictures always show a **round country flag** badge
The flag shows the country the user is **from** (chosen at sign-up), **not** the language they speak or learn. Use a proper flag icon set covering all countries.

---

## 4. Navigation

**Bottom tab bar (in this order):** **Chats · Connect · Flicks · Rooms · Me** (was Lounge, then Talkroom) (Connect uses a two-people icon; Lounge = voice rooms, Lives, classes and events)
**The app opens on Flicks** (the tab order stays the same).
**Names (decided 29 Oct 2026):** Discover → **Connect**, Moments → **Flicks**, Live tab → **Lounge**. Inside the Lounge, "Voice rooms" and "Lives" keep their names, and the big button still says "Go live".
**Minimise:** in a voice room or Live, a labelled **⌄ Minimise** button at the top left (and swipe-back) **minimises** it to a floating bar above the tab bar, so you keep listening while using the rest of the app; tap the bar to go back in, × to leave. "Leave"/"End" buttons actually leave.
**Chats extras:** an **"In the Lounge now"** row at the top (round avatars with a LIVE or ROOM tag) showing people you follow, people you chat with and your teachers who are in a voice room or Live. Tap to join. The first bubble is "+ Go live". Two **official accounts** are pinned at the top of the chat list: **Lounge alerts** (first: "Aiko is live…", each with a Join button) and **TalkAmigo Team** (second: events, tips, safety, and our offers such as boost coupons and coin deals). Both carry an "Official" badge and can be muted (safety messages still arrive).
**Lounge banner:** a swiping banner at the top of the Lounge (auto-rotates every ~4.5s with dots): events, new classes, and, for Standard users, our offers (coins, Boost, Plus). All banners and Team messages are managed from the admin dashboard (image, text, button, start/end dates, target language/country/plan) with no app update. The Lounge header has a red **🎙 Go live** button.
**Promo screens (our own ads):** for Standard users, a full-screen TalkAmigo offer sometimes shows when the app opens (Profile boost, Plus, coin deals), closable straight away with × (no countdown). There's also a "Sponsored · TalkAmigo" card in the Flicks feed and a "Get seen first" boost card in Connect. **Plus and Infinity never see promo screens.** Never more than one full-screen promo per day. No ads inside rooms, calls or Lives. Marketing push notifications need opt-in (Settings → Notifications → News & offers, off by default); "X is live" alerts can be limited to Close friends.
(The Live tab holds Voice rooms · Lives · Classes · Events, with one big **Go live** button that asks: Voice room or Live video. Clubs are reached from Connect and the inbox.)

**Universal back:** every pushed screen has a back arrow **and** iOS swipe-from-left-edge to go back (like HelloTalk). Use `NavigationStack`; if a custom back button is used, keep the interactive swipe-back gesture working. Tab root screens have no back.

**Deep links:** `talkamigo://room/{id}`, `/user/{id}`, `/class/{id}`, `/club/{id}`, `/moment/{id}`, `/event/{id}`, `/chat/{id}` plus web preview links.

---

## 5. Screens (built from the design canvas)

### Sign-up / onboarding (target 2–3 minutes, decided 30 Oct 2026)
1. **Welcome:** app icon on white, "TalkAmigo", tagline, **Create account** and **Log in** (plus a small "Try the demo" link in the beta only).
2. **Two different screens.**
   - **Create account → "Join TalkAmigo"** (Step 1 of 8): 3 short benefits, then **Sign up with Google / Apple (iCloud) / phone number**, the 18+ and Terms note, and "Already have an account? Log in".
   - **Log in → "Welcome back"**: app icon, "Log in the same way you signed up", **Log in with Google / Apple / phone**, with a **"Last used"** tag on the method used on this phone, "Trouble logging in?", and "New to TalkAmigo? Create an account".
   - Phone uses country code + number → 6-digit SMS code. If someone logs in with an account that doesn't exist, offer to create one; if they sign up with a method that already has an account, just log them in. Apple sign-in must be offered because Google sign-in is.
   - The onboarding steps continue as "Step 2 of 8" to "Step 8 of 8"
3. **Name, @username + birthday.** Users pick a **unique @username** (3–20 characters: lowercase letters, numbers, _ and .; can't start or end with _ or .). It's checked live ("✓ @sam_talks is available" / "@sam is taken") with tappable suggestions. Reserved names (admin, support, talkamigo, official…) are blocked, and it can be changed in Settings at most once every 30 days. Age only is shown, never the birthday. **Under 18 → blocked**, checked on the server.
4. **Where are you from?** Search bar over **every country in the world** (type the first letters; popular countries shown before typing). Once picked, the list collapses to the chosen country, then an optional **City** field with a "Show my city on my profile" switch. The country sets the flag badge and the local currency.
5. **Languages you speak fluently:** choose **1 to 3**, with a search bar over all languages and the popular ones shown first.
6. **Languages you're learning:** choose **up to 3**, each with its own level **A1–C2** (A1–A2 beginner, B1–B2 intermediate, C1–C2 advanced).
7. **Interests & hobbies:** search bar + the most popular shown first (about 100 in the list); **no limit**, at least 1; users can add their own if the search finds nothing.
8. **Profile photo** (choose or take a photo, can be skipped) with a clear warning: no nudity, violence, hate symbols, drugs or photos of children; every photo is checked automatically; breaking the rules can get the account banned. The **community promise** tickbox is on this step and is required. 
8b. **Intro video (optional, Step 8 of 8):** record up to 30 seconds (name, where you're from, what you're learning). **Skip for now & finish** is always available, and it can be added later from the Me page. It plays when people tap the photo and is checked before it's public, like photos.
9. **Interactive tour** instead of an offer screen: a spotlight highlights each part and the user taps it: Flicks (+ to post) → Chats → In the Lounge now → Connect → Lounge → Go live → Me → Language card. Skip at any time; finishing gives **+50 coins**. No full-screen offer on the day you sign up.

### Main tabs
- **Chats (inbox):** filter chips at the top: **All · Unread (count) · Groups · Requests (count) · Online**. The ✎ button opens: New message / **New group** (name + pick members, group chat with names on bubbles and group call) / Message requests (Accept or Decline inline). Earlier notes: header + new-message button; shortcut row (Requests with count, Duo, Translate, Practice); search; filters (All, Online, Unread, Your turn, Rooms & Clubs); rows with avatar + flag + online dot, last message, time, unread badge, "Your turn" pill; official TalkAmigo rows, teacher rows, Duo rows, Club rows.
- **Chat conversation:** header (avatar+flag → profile, online status + local time), voice & video call, Duo streak banner with daily prompt, translation under messages, **correction cards** (strikethrough → green fix + explanation), voice notes (max 5 min), gift button, quick actions (Give me a prompt, Check my French, Duo call), text box that becomes a send button when typing, mic otherwise.
- **Call screen (1-to-1 voice/video):** mute, camera, speaker, end; **live captions + translation** toggle; halfway reminder to switch language; report button.
- **Connect:** search, filter sheet (level, country, show: online/new/same interests/teachers), chips (For you, Online, Teachers, Clubs, Countries), event banner, Live-now voice room cards, partner cards (avatar+flag+online, speaks/learning, interests, Say hi), bell with count → Notifications.
- **Flicks:** full-screen **vertical paging feed (swipe up/down)** like TikTok; tabs Following / For you / My languages; each post has type tag, text/photo/video, poster + flag, language level tag, caption, **See translation**, right-side rail: avatar with follow +, like, comments (sheet with comments + corrections), **gift**, share. **+ Create a Flick** opens a chooser: **Photo** (single photo) · **Slideshow** (2–6 photos, swipe through with dots) · **Video** (record or upload, up to 60s) · **Text only**. Write the caption in the language you're learning; partners can correct it. Your own Flicks have a 🚀 Boost button.
- **Live:** big Go live button (choose Voice room or Live video), top tabs Voice / Lives / Classes / Events, Plans badge, **language filter chips built from the user's own languages**: All my languages · each language · each pair (e.g. Spanish ⇄ French) · + More languages; boosted rooms/Lives first with a "Boosted" tag, event banner, voice room cards (language tag, #topic tag, Official/Teacher/Plus badge, title with sound-wave icon, host avatar+flag+Creator badge, listener avatars with flags, listener count). Empty state with mascot.
- **Me (own profile), "Language card" design (decided 29 Oct 2026, deliberately not like HelloTalk):**
  1. Top row: coin balance chip and 💎 Diamonds chip (→ Wallet), Share, **☰ Settings**.
  2. **Language card** (red top edge): photo (▶ intro video / + to add), name + plan badge, flag · city · @username, then **each language as a 6-step level ladder A1 A2 B1 B2 C1 C2** filled up to the user's level, with the **real time practised in that language this week** underneath (e.g. FR ▰▰▰▱▱▱ B1 · 2h 10m this week). No made-up percentages. The level is the one the user picks for each language in Settings → Learning (and at sign-up); changing it updates the card immediately. Time comes from calls, rooms and Lives in that language, then Following · Followers · Views.
  3. **This week** card: 🔥 day streak · 🗣 time spoken · ✓ corrections given, plus Mon–Sun practice dots.
  2b. **My Flicks** (decided 31 Oct 2026): right under the Language card, one row of **3 small thumbnails** (likes on each, 🚀 if boosted) + **See all ›**. If fewer than 3 Flicks, a "+ New Flick" tile fills the row. "See all" opens a My Flicks page with tabs Flicks · Rooms · About. The Me page itself stays short.
  4. Buttons: **Edit · Shop**. A small "Profile 60% complete" link until 100%.
  4b. **"Get seen first" boost card** (decided 31 Oct 2026): a dark card with a slow light sweep (off when the phone has Reduce Motion), three tiles **⚡ Profile 30 min · 300 / 🎯 Flick 1 h · 150 / 🎙 Lounge 15 min · 100**. An active boost turns its tile white with "23 min left". Lounge: boosts your current room/Live, or opens Go live with "Boost from the start" switched on. Shows free boosts left, or the reminder that boosted content always carries a "Boosted" tag.
  5. Round shortcuts row: Classes · Clubs · Events · Passport · Wallet · Plans · Duo.
- **Shop:** Coins (same packs as the Wallet) and **Profile frames** bought with coins (Ember 300 · Halloween 400 · Gold 500 · Sakura 800), shown around your photo everywhere. Frames are pure profit (coins spent on them don't create Diamonds).
- **Profile views:** everyone sees the **number** and a 7-day chart; **who viewed** is Plus/Infinity only (blurred for Standard with an upgrade button). **Browse privately** (Plus/Infinity, Settings → Privacy): people you view aren't told, and while it's on you can't see who viewed you.

### Detail screens
Voice Room · Create Voice Room · Teacher Class · Class session (video) · Someone else's profile · Topic page · Event · Notifications & message requests · Plans (Standard / Plus / Infinity) · Profile views · Followers/Following · Club · Wallet (Coins, Diamonds, cash-out) · Settings.

- **Voice Room:** header (title, languages, **listener count → tap opens the audience list**: on stage + listening, each with profile and Follow), time left, stage grid (host/co-host/speakers with mic state + flag, open seat), live subtitles card (toggle), activity feed (joins, gifts, questions; names tap to profile), bottom: Raise hand (toggle), Gift sheet, subtitles toggle, Leave. **No cameras.**
- **Create Voice Room:** title (max 70), main + second language, who can join (Public / Followers / Mutuals / Invite+password; the last 3 are Plus), duration, speakers stepper, Schedule or Go live. Voice only.
- **Teacher Class:** title, date/time, length, level chip, teacher card (verified tick, rating, students), what you'll practise, seats booked bar, price + Book seat.
- **Class session:** teacher's video large, students' small tiles, raise hand, chat, captions, gift/tip the teacher, leave.
- **Someone's profile:** same layout as Me (photo + intro video, Flicks/Followers/Following, top supporters, Flicks grid), avatar + flag, Follow / Message, online, age, city, local time, language chips, stats, Hear their voice, Invite to Duo, Send gift, tabs About / Flicks / Rooms, ⋯ menu (share, close friends, **block, report**).
- **Club:** group chat, members, announcements, events (scheduled classes or challenges), rules, Join.

---

## 6. Live: voice rooms, calls and classes (launch values, all configurable)

| Type | Default | Max | Capacity |
|---|---|---|---|
| Free voice room | 2h | 4h | 6 on stage + 100 listening |
| Plus voice room | 3h | 6h | 10 on stage + 200 listening; private / followers-only / mutuals-only / password |
| Teacher class (paid or free, video allowed) | 30/60 min | 2h | teacher + up to 30 students; ticket price covers the cost |
| 1-to-1 voice/video call | — | fair use | 2 people (~$0.20/hour) |
| **Live (one person on camera)** | 1h | 2h (Plus 4h) | 1 host on camera + up to 300 viewers at launch; viewers comment, like and send gifts |
| **Group video rooms** | **Not offered** (too expensive) | | |

- Rough cost: a voice room with 50 people ≈ $1.80/hour on LiveKit. Track minutes and cost per room in admin.
- **Lives cost more because every viewer downloads video:** at 480p (~0.5 Mbps) each viewer costs about $0.06/hour (data + minutes), so 100 viewers for 1 hour ≈ $6, 300 viewers ≈ $18. Guardrails: viewers get 480p (Infinity hosts 720p); who can go live: 18+, phone verified, account at least 7 days old, no recent reports; viewer cap and max length in `app_config`; drop to audio-only on weak networks. Gifts are expected to pay for Lives (one 1,000-coin Rocket ≈ €7–10 to TalkAmigo after fees).
- **Live screen:** full-screen camera, host name + Follow, viewer count, top-3 gifters, comments floating up from the bottom, comment box, like (floating hearts), gift button, live subtitles, share, report. Host sees viewer count, Diamonds earned this live, and can pin a comment, mute/remove a viewer, and end the live with a summary (time, peak viewers, gifts, Diamonds).
- **Gift animations:** every gift shows a banner ("Tunde sent a Rocket 🚀"); big gifts (500+ coins) play a full-screen animation in rooms and Lives.
- Warnings at 10 and 2 minutes left. Host disconnect → co-host takes over, else 5-minute grace then close. Empty rooms close after 2 minutes.
- **Roles:** listener, speaker, host, co-host, moderator. Host approves mic requests, mutes, removes, bans, appoints co-host, ends room.
- **Live subtitles:** transcribe only the person speaking, **once per room/call/class**, and share the text with everyone in it, so the cost doesn't grow with the audience. Free users get a daily subtitle allowance; Plus/Infinity get more (values in `app_config`).
- **Changed 2 Nov 2026: live subtitles (CC) are a Plus/Infinity feature.** For Plus and Infinity they're **on by default** in Talk rooms, Live rooms and calls (the CC button turns them off/on). Standard users see the CC button with a small gold crown; tapping it opens "Live subtitles is a Plus feature · See Plus / Not now", and no subtitles show. (This replaces the free daily subtitle allowance.)
- In classes, students' cameras are off by default; **cameras are never switched on remotely.**

---|---|---|---|
| 1-to-1 voice/video call | — | fair use | 2 people (~$0.20/hour on LiveKit) |
| Teacher class (paid or free) | 30/60 min | 2h | teacher + up to 30 students; ticket price covers the cost |

- Students' cameras are **off by default**; the teacher can invite a student to turn theirs on. **Cameras are never switched on remotely.**
- Warnings at 10 and 2 minutes left. Teacher disconnect → 5-minute grace, then the class ends and refunds/credits follow the class rules.
- **Live captions:** transcribe once per call/class and show to everyone in it. Free users get a daily caption allowance; Plus/Infinity get more (values in `app_config`).
- Track minutes and cost per call/class in admin.

---

## 7. Money: how TalkAmigo gets paid

### The rule (very important)
Anything **digital used inside the app** must be sold through **Apple In-App Purchase** on iPhone and **Google Play Billing** on Android. Stripe **cannot** be used for these inside the app, or the app gets rejected.

| What we sell | How the user pays | How the money reaches us | Who we pay out |
|---|---|---|---|
| **Plus** (€9.99/month, €79.99/year) and **Infinity** (€199.99 once, lifetime) | Apple IAP / Google Play subscription via **RevenueCat** | Apple/Google pay our company bank account monthly | — |
| **Coins** (gift currency, see 7b) | Apple IAP / Google Play **consumable** packs via RevenueCat | Apple/Google → company bank | Receivers cash out **Diamonds** via **Stripe Connect** |
| **Group teacher classes** (€0.99 intro) | Apple IAP / Google Play | Apple/Google → company bank | Teachers get a share via **Stripe Connect** |
| **1-to-1 private lessons** (later) | May use **Stripe** checkout (Apple allows other payment for real-time person-to-person services). **Verify before building** | Stripe → company | Tutor via Stripe Connect |

### Plans: Standard (free) · Plus (monthly/yearly) · ∞ Infinity (lifetime)
| | Standard | Plus | Infinity |
|---|---|---|---|
| Price | Free | €9.99/month or €79.99/year | €199.99 once |
| Voice rooms | 2h, 6 on stage | 6h, 10 on stage | 6h, 10 on stage |
| Private / followers / friends-only rooms | — | ✓ | ✓ |
| Profile views | Number only | Who viewed you | Who viewed you |
| Browse profiles privately | — | ✓ | ✓ |
| Translations, corrections, subtitles | Daily limit | More | More (fair use) |
| Free boosts each month | — | 1 | 3 |
| Live video quality | 480p | 480p | 720p |
| Chat backup | — | ✓ | ✓ |
| Promo screens | Shown | None | None |
| Badge | — | Plus | ∞ Infinity |
Infinity is a **non-consumable** purchase (Apple/Google lifetime unlock, must support Restore Purchases). Keep **fair-use limits** on costly AI features for Infinity, since TalkAmigo pays for them forever. Other perks to consider: advanced Connect filters, Travel Mode, more message requests per day, discount on classes.

### Boosts (paid with Coins)
| Boost | What it does | Duration | Price |
|---|---|---|---|
| Profile boost | First in Connect for people who match your languages | 30 min | 300 coins |
| Room boost | Pinned to the top of the Voice list in the room's languages | 15 min | 100 coins |
| Live boost | Pinned to the top of the Lives grid in the Live's language | 15 min | 200 coins |
| Flick boost | Your latest Flick shown to more people in "For you" | 1 hour | 150 coins |
Rules: always shown with a **"Boosted" tag** (EU rules on paid ranking) · max 2–3 boosted slots at a time, rotated · no boosting while under review or with recent reports · unused time refunded as Coins if a room/Live ends early · after-boost summary (views, followers) · Plus gets 1 free boost a month, Infinity 3. Coins spent on boosts don't create Diamonds. Entry points: Me (Boost button), Connect ("Get seen first"), host bar in your room/Live, and a prompt when your room is quiet.

### Local currency and app language
- **Prices** (coin packs, Plus, Infinity, class tickets) show in the user's local currency. Set a price per country in App Store Connect / Google Play; the app always displays the store's localised price, never a hard-coded one.
- **Cash-outs** are paid in the user's currency by Stripe; keep rounded tiers per currency in `app_config` (e.g. 1,000 Diamonds = €18 / £16 / CHF 17).
- **App language** follows the phone's language by default; users can change it in Settings → App language. Launch with English, French and Spanish, then add more.

### App language follows the phone (rule, 31 Oct 2026)
- From the very first screen, the whole app shows in the phone's language: welcome, sign-up, log-in, SMS code, all 8 onboarding steps, the tour, tabs, banners, offers, settings and messages from the app.
- We use the first language in the phone's list that TalkAmigo supports (beta: English, French, Spanish, Portuguese, German, Italian, Japanese, Arabic). Anything else falls back to English.
- Country, language and interest names are translated too. The phone country code (+33, +34…) and the example number also follow the phone's region.
- Arabic switches the layout to right-to-left. Phone numbers stay left-to-right.
- A 🌐 language button sits on the Welcome screen, so people can change the language before signing up. It's also in Settings → App language, where "📱 Phone language" is the default.
- What other people write (posts, messages, room titles) is never changed automatically. It keeps the Translate button.

### Apple review & EU compliance (decided 31 Oct 2026, all built in the beta)
- **Report everywhere (Apple 1.2):** a ••• menu on every Flick, comment, voice room and Live, and press-and-hold (or right-click) on any chat message: Copy · Hide · Report · Block. Reports have 9 reasons (incl. "Someone may be in danger" → shows "call 112"), an "Also block" switch, hide the content straight away, and show "Thanks for telling us" with the 24h promise.
- **Account status (EU Digital Services Act):** Settings → Privacy & safety → Account status shows whether the account is in good standing, every decision about the user's content (what, reason, which rule) with an **Appeal** button (reviewed by a different person within 7 days), and the status of the user's own reports.
- **Hide offensive words** (on by default) masks swear words and insults in incoming messages and comments.
- **AI consent (Apple 5.1.2(i)):** after sign-up, before the tour, a "Your AI helpers" screen explains what is sent, to whom, that it's never used to train AI or sold, and asks Allow / Not now. If not allowed, Translate, Check my…, auto-translate and live subtitles ask first. Switch in Settings → Privacy & safety → AI helpers. Subtitles stay off without consent.
- **Permissions in context:** a TalkAmigo explanation first, then the iPhone system alert. Microphone when going on stage, starting a call, creating a room or recording; camera when going live, video-calling, taking a photo or recording the intro; notifications after the first message sent (never at launch). "Don't Allow" is respected; later we show "Open iPhone Settings". Info.plist purpose strings: NSMicrophoneUsageDescription, NSCameraUsageDescription, NSFaceIDUsageDescription. Photos use the system picker (no permission needed). No location permission.
- **Plans paywall (Apple 3.1.2):** auto-renew wording with price and period, Terms of Use + Privacy Policy links, **Restore purchases** (Plans and Settings), **Manage subscription** opens Apple's subscription screen (cancel = keeps Plus until the period ends). Infinity says "one-time purchase, not a subscription".
- **Delete account in the app (Apple 5.1.1(v)):** Settings → Account → Your data → Delete account: explains what's lost (coins, Diamonds, subscription is billed by Apple so cancel it, Apple sign-in is revoked), offers "Download my data first", and requires typing DELETE. **Download my data** emails a file within 48h (GDPR).
- **Ratings:** only Apple's own rating pop-up (StoreKit requestReview), shown after a good moment (5th message sent), never on day one, never with a reward. Settings → Rate TalkAmigo opens it too.
- **No fake urgency:** promo screens close immediately (× at the top, no countdown); offers show their real end date ("until Sun 2 Nov"), never "Today only" / "Limited offer" unless true.
- **Terms of Use** state zero tolerance for objectionable content and abusive users (Apple 1.2). Terms, Privacy Policy and Community guidelines open in the app from sign-up, Plans, AI screen and About.
- **Before submitting:** remove every "demo"/"beta" label and the "Try the demo" link; give Apple a test phone number with a fixed SMS code in the review notes; have real official rooms live during review (no fake users or counts); declare trader status in App Store Connect (EU); 18+ age rating; no other apps/platforms named in the store listing.

### One phone at a time, messages on the phone (decided 31 Oct 2026, built in the beta)
- **One phone per account.** Logging in on a new phone needs **approval from the old phone** ("Approve on your other phone"); then the old phone is logged out automatically. The one-tap "Continue as…" on the same phone needs no approval. Settings → Account → Your devices shows "This iPhone · active".
- **No access to the old phone** (lost, broken, stolen): "I don't have my other phone" → contact support, we check identity, log the old phone out and let them in. (Open question: add an automatic fallback such as SMS code + waiting period?)
- **Plan, coins and Diamonds belong to the account**, not the phone: they're there on any phone (subscriptions also restore from the Apple ID).
- **Messages are stored on the phone, not on our servers** (to save storage costs at launch). The server only relays a message until it's delivered. **Logging out deletes messages from the phone**, with a clear warning first ("Log out and delete messages"). Plus/Infinity **Chat backup** keeps them and brings them back on login or on a new phone.
- **Reports still work:** when someone reports a message, the app sends that message and the 10 before it to moderators (said in the report sheet). Nothing else from chats is shared.
- **Swipe to delete:** swipe left on a chat in the Chats list → Mute / Delete ("deleted from this phone, the other person keeps their copy"). Swipe left on a message → Delete for everyone (own messages, shows "Message deleted") or Delete for me. Also in the press-and-hold menu.
- **Leave the stage:** on stage in a voice room, a bar shows "You're on stage · Mute · Leave stage"; tapping the hand button or your own seat opens the same choices (mute mic, leave the stage and keep listening, leave the room).
- **Me page:** a 💎 Diamonds chip sits next to the coins chip and opens the Wallet on the Diamonds tab. (Share button removed from the top row on 2 Nov 2026.)

### Lounges, rooms and chat details (decided 31 Oct 2026, built in the beta)
- **Lounges on Flicks:** Go live has an **"Also show on Flicks"** switch, **on by default**. While the room or Live is running, a full-screen Flick card shows "● LIVE NOW · Voice room/Live video", title, host, how many are listening/watching and a **Join** button (your own shows "Go back in", at the top of your feed). The card disappears when the lounge ends. It has the usual ••• menu (hide/report/block).
- **Boost from the start:** Go live also has a "🚀 Boost from the start" switch (room 100 / Live 200 coins, or a free boost).
- **Empty lounge:** if nobody has joined after a few seconds, the host sees a card "👀 No one here yet · Boost your room to appear first in the Lounge for 15 min, for people learning French" with **🚀 Boost** and **Invite followers**. (Lives show the same card over the video.)
- **Muted when you get on stage:** when someone is invited on stage their mic starts **off**; the stage bar says "mic muted" with **Unmute** and **Leave stage**. Their seat shows a grey mic.
- **Everyone sees everyone (decided 31 Oct 2026):** under the stage, a **"🎧 Listening · 43"** row shows the listeners' round photos with names (you first, as "You"), scrolling sideways, with a **+N See all** bubble that opens the full list (on stage + listening, each with Follow). Tap a face to open their profile. In a Live, a viewers chip next to ● LIVE shows 3 small faces + the count and opens "415 watching" with everyone's profile and Follow.
- **Room chat panel:** the stage has an "🎤 On stage" label, and the comments live in their own framed **"💬 Chat · N"** panel (grey background, own scroll, "Gifts & joins show here too"), clearly separate from the stage and the subtitles card.
- **Keyboard:** in chats and rooms, sliding the conversation up/down closes the keyboard (like iMessage), so the page doesn't drag the keyboard and header along. In the iOS app: `.scrollDismissesKeyboard(.interactively)`.

### Talk rooms, Video rooms and the native feel (decided 1 Nov 2026, built in the beta)
- **New names:** voice rooms are now **Talk rooms** and Lives are **Video rooms** everywhere (Lounge tabs: **Talk · Video · Classes · Events**). The Lounge's red button still says **Go live**. (Older sections of this brief still say "voice room"/"Live": read them as Talk room/Video room.)
- **Talk room design:** dark plum background in the logo colours. (Layout replaced on 1 Nov 2026 by the fixed-stage design in the "Talkroom" section below.)
- **Mic button** sits next to Raise hand in the bottom bar for anyone on stage (and the host): red mic = on, grey crossed mic = off. Joining the stage starts muted.
- **Host controls:** tapping a speaker → **Mute mic / Unmute mic**, Make co-host, Move to audience, Remove. A muted speaker sees "The host muted you · tap the mic to talk" and **can unmute themselves**. Seats show a crossed grey mic when someone is muted.
- **Lounge banner** slides by itself every ~4.5 s with a slide animation whenever nobody is touching it, and can be swiped left/right by hand (it pauses ~6 s after a swipe, then carries on).
- **Text boxes** sit higher above the bottom of the phone (extra space for the iPhone home bar) in chats and rooms.
- **Me page order:** Language card → My Flicks → **the big "Get seen first" boost card** (same design as before: ⚡ Profile · 🎯 Flick · 🎙 Talk room tiles; decided 1 Nov 2026, the slim strip was dropped) → This week → Edit/Shop → shortcuts.
- **Native iPhone feel:** the app uses the iPhone's own font (San Francisco). **Emojis are not used as icons** (buttons, titles, stats, permission screens, trust notes, Boosted tag): clean line icons instead. Emojis stay where people expect them: gifts, reactions and what users write.

### Talkroom (decided 1 Nov 2026, built in the beta)
- **The word "Lounge" is replaced by "Talkroom" everywhere** in the app: the bottom tab (Chats · Connect · Flicks · **Talkroom** · Me), the page title, "In the Talkroom now", "Talkroom alerts", banners and texts, in every language. Rooms inside it are still **Talk rooms** and **Video rooms**. (Older sections of this brief still say Lounge: read it as Talkroom.)
- **Talk room layout (inspired by HelloTalk's voice rooms, cleaner):**
  - Top: title, language chip, "● 48 listening ›" (opens the full audience), •••, Minimise (⌄) and Leave/End.
  - **Fixed stage that never scrolls away**: a grid of 4 seats per row (6 free / 10 Plus). Empty seats are numbered with a seat icon; tapping one raises your hand. The host has a small red crown before their name.
  - Under the seats, a **slim listeners row** (small faces + names, "+38 All") with the top gifters on the right, then the live subtitles line (CC).
  - Only the chat scrolls, below the stage: a pinned "Talkroom rules" notice, then messages as small bubbles with the person's photo and name; gifts and joins as short grey lines.
  - **Quick replies** above the comment box, in our own words (not HelloTalk's): "Hi all 👋", "What are we chatting about?", "Just joined, hello!" (× hides them). They follow the phone/app language (FR: "Salut à tous 👋", "On parle de quoi ?", "J'arrive, bonjour !"), and the message sent is in that language too. The "Talkroom rules" notice is translated as well.
  - Bottom bar: Comment… · mic (when on stage/host) · CC subtitles · raise hand · gift · send.
- **Who's speaking:** no more big red circle. The speaker's photo gets a thin pink outline with two soft rings rippling out, and a tiny sound-wave next to their name. Muted people show a small grey crossed-mic badge. Animations stop when the phone has Reduce Motion on.
- **Keyboard on iPhone:** the app stays pinned to the visible part of the screen when the keyboard opens, so the stage and header no longer slide off.

### Connect and Teacher rooms (decided 1 Nov 2026, built in the beta)
- **Connect layout (inspired by HelloTalk's partner list, in our own words):** header "Connect" with a gold **👑 Plus** chip (Standard only), a filter button and the bell. Scrollable tabs: **All · Online · Nearby · Serious learners · Teachers · 👑 City · 👑 Age**. Language chips under them: My languages · each language I'm learning · All languages.
- **Partner rows:** photo with flag and online ring, name (+ Teacher / Boosted tags), language pair with 6 level dots (FR ●●●●●● ⇄ EN ●●●○○○), "Active now" or "Active 9 min ago", a 2-line bio, small tags (New · Free to chat · Similar age · Serious learner · Teacher) and a red **👋 wave** button (one tap sends a wave in chat; after that it becomes a chat button). The "Get seen first" boost card stays at the top; "Live now" cards sit after the 4th person.
- **Filter sheet:** level range (tap two levels A1–C2), New members only (free for everyone). **Advanced search · Plus 👑:** age range, region, city, show people nearby first.
- **Plus-only (crown 👑):** Advanced search, the City tab and the Age range. Standard users tapping a crowned item get a "This is a Plus feature" sheet with **See Plus / Not now**. Nothing is hidden with fake blur; it's clearly labelled.
- ~~No gender filter~~ Changed 2 Nov 2026: gender filter added in Plus Advanced search (see below).
- **Teacher rooms (paid Talk rooms):** a "✓ Teacher rooms · Paid" section at the top of the Talk tab explains "Small, serious rooms led by verified teachers. A few coins to join, coins back if the teacher doesn't show." Free Talk rooms are listed below.
  - Card: LIVE · language · level (e.g. B1–B2), title, goal · 45 min · 7/10 seats, teacher photo + **blue verified tick** + ★ rating, price in coins (e.g. 🪙 120).
  - Tapping opens a join sheet: teacher, level / length / seats, the goal, **room rules** (room language only, the teacher chooses who speaks, stay on topic), the **refund promise** (coins back automatically if the teacher doesn't start within 10 minutes or ends early), "Join · 120 coins", the balance, and "the teacher receives Diamonds". Not enough coins → Wallet.
  - Paid with **Coins** (100–300 per room, set in `app_config`). Coins spent become Diamonds for the teacher at the normal gift rate (share to confirm, see Open decisions). Once paid, you can come back in for free.
  - Inside: a "Teacher" chip in the header and a pinned "Teacher room · level · goal" notice with the stricter rules instead of the normal Talkroom rules.
  - Only verified teachers (Stripe identity + teacher check) can open paid rooms. Server enforces refunds automatically.

### Rooms tab, Live rooms and room polish (decided 1 Nov 2026, built in the beta)
- **Names:** the bottom tab is now **Rooms** (Chats · Connect · Flicks · **Rooms** · Me) with a mic / camera icon. Video rooms are now **Live rooms**. Rooms inside are **Talk rooms** (voice) and **Live rooms** (one person on camera). "Talkroom" is no longer used: "In a room now", "Room alerts", "Room rules". (This overrides the Talkroom and Video room names above.)
- **Rooms page:** red **Go live** and Plans at the top, then a **big title that shows where you are: "Talk rooms" or "Live rooms"**, the banner, and **two big cards** (🎙 Talk rooms · Speak, listen and practise / 📹 Live rooms · One person live on camera). The chosen card turns red and the title changes. Under them: Rooms (or Live now) · Classes · Events, then the language chips. The choice is remembered.
- **Teacher rooms cost €0.99** (local price from the App Store, e.g. £0.99), always shown on the card and in the section header. Paid through **Apple In-App Purchase**: the App Store pop-up appears (price, Apple Account, confirm with side button / Face ID). One-time payment, not a subscription. Apple Pay itself can't be used for in-app digital items. **No automatic refund:** teachers are verified by us; if something goes wrong the student reports it from the room and our team sorts it out (Apple handles refunds of IAP). This replaces the coins price and refund promise in the section above. Product id: `teacher_room_tier1`.
- **Live room screen:** no more overlapping. Top row = host photo + name + viewers + round **+ Follow** button, top gifters, ⌄ minimise, ×. Second row = ● LIVE · viewer faces + count · language. Third row = the room title.
- **Gifts:** never added to the comment list anymore (comments stay readable). Every gift pops up big in the middle of the screen for everyone (emoji + "Tunde → Rafael · Café"), then fades away; 500+ coin gifts are bigger with a glow. The host also sees "+10 💎".
- **Minimised room (HelloTalk style):** a small square card bottom-right: host photo with a sound-wave, name, and a clear **"🎙 Talk room" or "📹 Live room"** label, × to leave. It can be dragged to the left or right side. Tap to go back in.
- **Talk room floating buttons** (right side, above the comment bar; left side in Arabic): **Go up** (raise hand to go on stage; shows "Raised" / "On stage") and a blue **Plus** button: **who in this room opened your profile**, with a red count. Standard users see blurred faces and "See who with Plus". Raise hand is no longer in the bottom bar.
- **Long titles slide:** room titles that don't fit slowly slide to show the whole title, then slide back (room cards, Live tiles, inside Talk and Live rooms). Off with Reduce Motion.
- **Notifications and pop-ups** (in-app banners and toasts) can be **swiped away up or sideways**, like iPhone.
- **Back swipe:** only from the **left edge** (right edge in Arabic), only from the **middle part** of the edge (not the top or bottom corners), **no arrow**: the page follows your finger like iPhone and goes back when pulled a third of the way or flicked.
- **Scroll memory:** going back to a page (e.g. Me → Events → back) returns to the same spot instead of jumping to the top. Typing no longer makes the page jump.

### Lessons, chats, profile and sounds (decided 2 Nov 2026, built in the beta)
- **Events are removed everywhere** (Rooms tab, Me shortcut, event banner and Team message). Banners now show offers and new lessons.
- **Open room** replaces "Go live" (FR "Ouvrir un salon"); its icon is a mic in Talk rooms and a camera in Live rooms, and the create screen opens on the matching type.
- **Rooms page:** Talk rooms / Live rooms cards, then **Rooms · Lessons**. Room cards are light grey so they stand out from the white page. The Rooms list is for free rooms, with now and then **one "Popular lesson"** mixed in (picked by the algorithm: popularity, language, etc.).
- **Lessons** (follows the Talk/Live choice): **Open now** = teacher rooms happening right now (join for €0.99), **This week** = rooms teachers have planned (day + time box, title, teacher + tick, level, length, seats left). Tap → details → **Reserve · €0.99** → reminder 10 minutes before. Lessons can be Talk or Live rooms.
- **Lessons schedule built for many teachers (decided 2 Nov 2026):** "This week" now has a **7-day strip** (Today + the next 6 days, with a red count on days that have lessons; empty days are faded). Tap a day to see that day's lessons **sorted by time** in compact rows (time + length · title on 2 lines · teacher photo + tick · language · level · seats left · €0.99 or Reserved). Filters: **language** (My languages / each learning language / All languages), **time of day** (Any time / Morning / Afternoon / Evening) and **teacher** (a row of teacher faces + All + Following). If a filter leaves a day empty: "No lessons this day with these filters · See the next one ›". **Open now** becomes one slim line when nothing is live ("No lessons live right now · next today 18:00"); when lessons are live it shows their cards. Dates and weekdays follow the app language.
- **Language chips are exact (decided 2 Nov 2026, replaces "main language"):** in Talk rooms and Live rooms, **English** shows only English-only rooms, **French** only French-only rooms, **French ⇄ English** only French–English exchange rooms (no other pairs), and **All my languages** shows every room whose languages are all ones I speak or learn (so PT⇄FR doesn't appear for someone who doesn't do Portuguese). **+ More languages** shows everything. The **banners at the top follow the chosen language too**: "Teacher live now" and "New lesson" banners only show lessons in that language (offers stay).
- **Lessons, final look (decided 2 Nov 2026, replaces the big "Learn with a verified teacher" card):**
  - **No marketing card.** One quiet line at the top: "Small lessons with checked teachers. £0.99" + **How it works ›**, which opens a simple sheet: 1 Pick a lesson that fits your level · 2 Book your seat (£0.99 once, with Apple, no subscription) · 3 Join at the time (reminder 10 min before, the teacher gives everyone a turn), what a Teacher room vs a Teacher live is, and "All teachers are checked by TalkAmigo".
  - Tabs: **Happening now (N)** · **Schedule (N)** + language chips. Lessons show both kinds.
  - **"LIVE" only for teacher lives.** A teacher **room** that has started says **"Open now"** (mic icon), never LIVE. A teacher **live** says ● LIVE.
  - **Teacher lessons are circles**, so they never look like normal rooms: a round card in **inverted colours** (black with red in light mode, white with red in dark mode): Open now / LIVE label, teacher photo, title, teacher · language · level, red price pill (or Joined). Teacher rooms have a **red ring that fills with the seats taken**; teacher lives have a full red ring. Under each circle: mic/camera icon + seats left. Two circles per row in Happening now; the "Popular lesson" in the Rooms list is one big centred circle.
  - Tapping a circle opens the join sheet with the teacher, **You'll practise**, a student quote and seats.
  - **Schedule** keeps the day strip and filters; each row's time is now a small inverted circle with a red edge.
  - **Inside a teacher room** the header no longer shows "N listening" (it wrapped over the buttons and doesn't fit a lesson): just title, language chip and "Teacher".
  - Not chosen: a first-lesson-free offer (it costs us the teacher's pay; revisit later).
- **All real-money payments** (lessons, reserving, coins, Plus, Infinity) open **Apple's purchase sheet** (Apple Account card, "Double-click to pay", Face ID). On TestFlight and in the App Store this is the real Apple payment, charged to the card on the person's Apple Account. Real Apple Pay is only allowed for 1-to-1 private lessons (Apple rule).
- **Notifications look like iMessage:** frosted white banner, photo, name in bold, message, "now". No "TalkAmigo" label. Swipe up or sideways to dismiss.
- **Messages:** every message shows its time. Own messages show **✓ sent (grey) → ✓✓ delivered (grey) → ✓✓ read (red)**. If read receipts are off, read isn't shown.
- **Chat header:** slim back arrow, photo + name, then call, video and **•••** (Chat settings).
- **Chat settings (like HelloTalk, own words):** big photo + name, Notifications · Chat files · Search chat history · Pin to top of Chats · Chat bubbles (Classic/Round/Soft) · Chat background (Plus) · Translate into · Hide their Flicks · Hide my Flicks from them · Allow voice & video calls · Clear chat history · Block · Report. The **+** at the top right sends this person's profile to a friend.
- **Composer:** text box with mic (turns into send when typing), and a tool row: **+** (photo, share a room, prompt, check my French, voice/video call) · photo · emoji · gift · translate what I typed · prompt (poll in groups). **Voice notes:** tap the mic → recording bar with timer and waveform → send or bin (max 5 min). Voice bubbles have play + waveform + length.
- **Shared rooms in chat:** sharing a room sends a card (language tag, topic, title, host, **Join** or **Ended**), like HelloTalk's.
- **Group chats:** same header as 1-to-1 (group photo, members · online, poll, voice call, video call, •••), same composer, gifts to a chosen member, **polls** (question + 2–4 answers, live % with voter faces), and a **group call in a FaceTime-style layout** (tiles with names, speaker outline, your own small tile, Speaker · Camera · Mute · Flip · Subtitles · Leave, minimise to a green pill).
- **Me:** a pencil next to the name opens **Edit profile** (cover photo, photo, completion ring, About me, Languages, Interests, Personal info: MBTI, zodiac, hometown, job, school; Other: TalkAmigo ID, country, gender, age) with a **Preview** button showing the profile as others see it. The old Edit button is gone (account settings stay in Settings). Followers and Views show a red **+N** (white text) until opened.
- **My Flicks** grid like Instagram: 3 columns, tall tiles, likes bottom-left, icons for pinned/slideshow/video, icon tabs (grid · rooms · about).
- **Sounds on Flicks:** a small library of **original TalkAmigo sounds** (Café Lo-fi, Paris Morning, Tokyo Night Drive, Samba Sol, Study Rain, Lagos Sunshine) to add when posting, with preview. Flicks show the sound name and a spinning disc; a speaker button in Flicks turns sound on/off. Tapping the sound opens a **TikTok-style sound page**: cover + play, number of posts, Save, grid of Flicks using it ("Original" first) and **Use sound**. Only our own licensed music, never copyrighted songs.
- **Connect search (like HelloTalk):** full page with partner's native language, partner's learning language, level slider (A1–C2), age slider (18–90+, free), new members; **Advanced search · Plus**: people nearby first, **gender (Everyone / Women / Men)**, region, city. Gender is an optional profile field ("Prefer not to say" allowed). *(Decided 2 Nov 2026: this replaces the earlier "no gender filter" rule.)*
- **Back swipe:** the page follows the finger and the previous page is visible underneath (slight slide + dim), like iPhone; let go past a third (or flick) to go back.

### Notification banners, each with its own look (decided 2 Nov 2026, built in the beta)
All banners share the iMessage base (frosted card, photo, bold name, text, "now", swipe away), but each type looks different so people know what it is at a glance:
- **Message:** plain white banner (the base).
- **Incoming call (like iPhone):** dark banner with photo, name, "TalkAmigo Audio/Video", a **red decline** and a pulsing **green answer** button. It rings until answered, declined or 20 s (then "📞 Missed call" in the chat). Swiping it away = declined quietly. The ringing is tied to the banner: the banner stays on top of everything (sheets, pages) and if it's gone the ringing stops, so you never hear a call you can't see (bug fixed 2 Nov 2026). Respects "Allow calls" per chat, Calls notifications switch and Quiet hours.
- **Live room:** red ring round the photo, red camera badge, red **LIVE** tag, "is live: “title”".
- **Talk room:** purple ring, purple mic badge, **TALK ROOM** tag, "opened a talk room: “title”".
- **Gift:** warm gold card, gift badge, the gift emoji big and bouncing on the right, Diamonds amount in gold, rounded font.
- **Correction:** green bar on the left, green tick badge, **CORRECTION** tag, text in italics.
- **Comment:** green chat badge, comment in italics.
- **Likes:** pink heart badge and a little stack of the other likers' faces.
- **Lesson reminder:** blue calendar tile, title in a serif font, **10 MIN** chip ("Starts in 10 min … Tap to get ready"). Sent 10 minutes before a reserved lesson.
- **Safety (reports, appeals):** dark card with a shield tile and **SAFETY** tag.
- **Offer (opt-in only):** orange-to-red card, coin tile, **OFFER** tag, always with the real end date (never "today only").

### Flicks, gifts and corrections upgrade (decided 2 Nov 2026, built in the beta)
- **Brand colour stays red.** Purple/brown leftovers removed; sound covers now use the red/plum palette. Red = brand and actions; colours on Flicks posts are content.
- **Flicks feed:** photos and videos fill the whole screen (layouts differ for photo, slideshow with dots + 1/4 counter, video with play button + progress bar + length, and text posts with big text). A dark fade at the bottom holds a **compact caption**: creator name + **Follow** button, language + level tags (e.g. French · Beginner), caption (3 lines), a **Translate** pill right under the caption, and a small sound label.
- **Tap a word** in any Flick text or caption → sheet with the word, **Hear it** (phone's text-to-speech in the right accent), meaning, and **Save to my notebook**.
- **Right rail:** see "Flicks profile, Saved and Add sound" below (Save moved to •••, disc removed).
- **Top tabs:** Following · For you · **Learn** (was "My languages"), plain text with a thin underline for the selected one. Following shows only people you follow; Learn shows posts in the languages you're learning.
- **Flick editor** after picking Photo / Slideshow (now **2–20 photos**) / Video (now **up to 3 min**) / Text: live preview, tools **Crop (9:16, 4:5, 1:1) · Text on the Flick · Filters (None, Warm, Cool, Mono, Vivid) · Trim · Speed (0.5×–2×) · Subtitles (automatic, viewers can translate and tap words) · Voiceover (record yourself reading the caption) · Music volume**, then **Language spoken** and **Level (Beginner / Intermediate / Advanced)**. Videos without a sound get "Original sound · name".
- **Sound discovery:** search (name, mood, genre), categories **Trending · Relaxing · Study · Afro · French · Spanish · Saved**, preview before using, bookmark to save. Counts show the **real number of Flicks** using a sound (no made-up figures).
- **Gifts:** categories (All · Popular · Love · Luxury · Seasonal), gently animated gift icons, a clear value box ("Kenji receives 125 Diamonds · that's 25% of the gift's coins · coins have no cash value · gifts can't be refunded once sent"), a **daily gift limit** (20,000 coins, in `app_config`), a **confirm step for gifts of 500+ coins**, and Face ID/PIN from 1,000+ (as before). Server must also block self-gifting and multi-account gifting (see 7b).
- **Comments vs Corrections:** two tabs. Corrections show "Instead of ~~…~~ you could say **…**", a **"French native"** badge when the corrector speaks that language natively, likes, Reply and **Save**. When writing, pick **Comment** or **Correction** (correction mode pre-fills the original sentence to edit).
- **My notebook** (Me → Notebook): saved words and corrections, filter All / Words / Corrections, **Hear it** and delete. Lessons replaces Classes in the Me shortcuts.

### Flicks profile, Saved and Add sound (decided 2 Nov 2026, built in the beta)
- **Right rail is lighter:** profile photo with red + to follow, like, comments, gift, share, •••. Buttons are smaller (40 px circles, 44 pt touch areas), evenly spaced, and kept clear of the caption, tab bar and iPhone home bar; on short phones they shrink a little instead of overlapping.
- **No spinning disc.** The sound now sits at the bottom of the caption as a small music-note icon + "Sound name · TalkAmigo Sounds" (or the creator's name). Tapping it opens the sound page.
- **Save moved into the ••• menu** of each Flick ("Save" / "Remove from saved"), next to **Add to a collection**. Sound pages keep their own Save button.
- **Flicks profile shortcut:** a round button with your photo sits beside the red + at the top of Flicks. It opens your **Flicks profile**: photo, name, @username, Flicks · Followers · Following · Likes, Edit profile and Share profile, and icon tabs **My Flicks · Saved · Liked · About**.
- **Saved ("Enregistrés") is private:** a lock note says "Only you can see this". Sub-tabs **Flicks · Sounds · Collections**. Liked is private too. Other people only see your public Flicks and profile info.
- **Collections** organise saved Flicks by what you're learning (suggestions: French vocabulary, Spanish pronunciation, Grammar lessons, Phrases to try, or your own name). Add from ••• → Add to a collection; each collection has its own page and can be deleted.
- **Add a sound** (when posting) opens a menu with three choices: **My saved sounds** · **Create a sound** · **Music library** (search + categories). Create a sound = record (up to 60 s, timer + waveform) → play it back → trim → name it → switch **"Others can use this sound"** (on by default; your name is always shown as the creator) → Save sound. It's saved to your sounds and added to the Flick straight away.
- **Own sounds:** the sound page shows "Original sound · your name" and lets you switch reuse on/off later. If a creator keeps their sound private, others see "The creator keeps this sound for their own Flicks" instead of Use sound. Saved sounds appear both in Saved → Sounds and in Add sound → My saved sounds.
- All new labels follow the phone language (French: Enregistrer, Ajouter à une collection, Mes sons enregistrés, Créer un son, Bibliothèque musicale…).

### Flicks tabs, Learn practice and sending to people (decided 2 Nov 2026, built in the beta)
- **New Flicks tab icon:** a phone outline with a play button, the side buttons and caption lines (drawn as a line icon from the founder's picture, red when selected).
- **No speaker button at the top of Flicks** (it pushed the + off small screens). **Tap a Flick to mute/unmute** (a speaker icon flashes in the middle, like Instagram Reels); a small "Tap for sound" hint shows until the first tap. **Double tap to like:** a big heart pops where you tapped; double tap only likes, never unlikes.
- **Abonnements (Following) = mutuals only:** Flicks (and live rooms) from people you follow **who follow you back**. People you follow who don't follow back only show in Pour toi. Following someone shows a toast explaining which tab they'll appear in.
- **Pour toi (For you):** a mix of everything, with people you haven't met yet shown first and tagged **"New for you"**.
- **Apprendre (Learn):** focused on one language you're learning (chips at the top to switch, plus "N done today"). The feed mixes practice cards with Flicks in that language:
  - **Listening challenge** (play, Slower, pick what you heard), **Fill in the missing word**, **Repeat after me** (hear it, record yourself, play yours back, "Sounded right / Try again"). Answers show right/wrong, Hear it and Save to my notebook.
  - Exercises come from **both** sources: built automatically from real Flicks ("Made from a Flick by Kenji ›", opens that Flick) and TalkAmigo's own practice, **plus exercises posted by verified teachers** of that language.
  - **Verified teachers** of that language also post **tips** and **lesson invites** (live now → Join · €0.99; planned → Reserve · €0.99), with their photo, follow +, like, share and ••• (report/block/hide).
  - Open decision: "Repeat after me" is self-checked in the beta. Automatic pronunciation scoring would need speech recognition (a paid service).
- **Share = send to people, everywhere:** every share button opens the same **"Send to"** sheet: your recent chats and groups, then people you follow, a search box, tap several people (red tick), add a message, **Send (N)**. Someone you follow who hasn't chatted with you and doesn't follow you gets it as a **Request**. Used for Flicks (rail + •••), Talk/Live rooms (•••), sounds, your profile (Me, Flicks profile), other people's profiles (••• and chat settings +) and lessons ("Share this lesson").
  - The person receives a **card in their chat**: a Flick thumbnail they can tap to watch (TikTok style), or a room, sound, profile or lesson card. Chats list shows "Sent a Flick" etc.
  - A small row at the bottom still offers **Copy link · Messages · WhatsApp · More** (the iPhone share sheet) to bring in people who aren't on TalkAmigo yet.
- Flick tiles in profile grids now open that exact Flick full screen (with back), instead of the feed.

### Activity, search, drafts and cleaner settings (decided 2 Nov 2026, built in the beta)
- **Me page:** the share button at the top is gone (top row = coins · Diamonds · Settings). Sharing your profile stays in your Flicks profile.
- **Chats:** the Duo card at the top of the Chats list is removed to give the list more room (Duo still lives inside the chat).
- **Settings colours:** every settings list (Settings, Chat settings, Edit profile, sheets) now uses **plain grey icon squares with dark icons**, like the rest of the app. Only danger rows (Clear history, Block…) use a light red square with a red icon. No more blue/purple/green tiles.
- **Tab bar:** five equal columns; every icon is the same size and every label sits on the same line, in all languages (long words like "Discussions" fit without pushing the others).
- **Edit profile:** the top bar turns solid once you scroll past the cover photo, so the title no longer overlaps the content.
- **Activity centre ("Activité")**, opened from the bell (Chats and Connect, with a red count): tabs **All · Flicks · Rooms · Social** with unread counts. Shows likes, corrections, comments, gifts, follows ("Follow back" button), rooms opening / lives starting (Join), lessons (See lesson), and safety updates (report reviewed). **New** and **Earlier** sections, "Mark all as read", time ago ("4 min ago"), Flick thumbnails on the right, message requests at the top. Every banner notification is also logged here. The filter button opens notification settings.
- **One search for everything:** a search button in Chats and Connect (removed from Rooms on 2 Nov 2026) opens one page: "Search people, languages, Flicks, rooms". Tabs **All · People · Teachers · Flicks · Rooms · Languages**; results show what each one is (Profile, Teacher, Flick, Talk room, Live room, Lesson, Language). A language result opens a sheet with its native speakers, rooms and Flicks. Recent searches (clearable) and suggestions when empty.
- **Drafts:** closing a Flick you've started asks **Save draft / Keep editing / Discard**; there's also a "Save as draft" button above Post. Drafts are private and appear as a **Drafts** tile first in your Flicks profile grid → Drafts page (Continue / delete).
- **Data saver** (Settings → Storage): Flick videos don't play until tapped and load in lower quality ("Data saver" tag), and Live rooms open **audio only** with a "Turn on video" button.
- **Mute (without blocking):** profile ••• → Mute / Unmute. Muted people's Flicks and live cards disappear from your feeds and their notifications are silenced; you can still chat and they aren't told. Settings → Privacy & safety → **Muted people** lists them with Unmute.
- **Translation choice** (Settings → Chat settings → Translations): **Tap to translate** (default) or **Automatic** — automatic translates incoming messages and Flick captions straight away.
- Backend items from the same review (security, payments ledger, moderation dashboard, performance, backups, legal) are already in sections 2, 7, 8 and 13 of this brief and get built in the real app.

### Every setting must do something (rule, 31 Oct 2026)
No placeholder switches. Each setting changes what the user or others see, enforced **on the server** (privacy) and in the app:
- **Privacy:** Show my age / city / when I'm online change the profile everyone sees (and "See how others see you" previews it). Appear in Nearby is reciprocal: off = you don't appear and can't browse Nearby (only city + rough distance, never exact location). Private account → "Request to follow", Flicks hidden from non-followers. Who can message me / send me gifts are enforced when someone tries. Browse privately (Plus) hides your visits and hides your own viewer list.
- **Blocking:** blocked people disappear from Connect, Chats, the Lounge row and alerts; they can't see you, message you, gift you or join your rooms, and aren't told. Settings → Blocked people lists them with Unblock. Close friends (⭐ from a profile's ••• menu) power "Lounge alerts from: Close friends only".
- **Notifications:** every switch maps to a push type (messages, calls, someone goes live, comments & corrections, gifts, class reminders, likes, news & offers). Quiet hours mute everything in that window; sound and vibration are respected. "Send me a test notification" shows only enabled types.
- **Chat:** auto-translate shows translations under incoming messages; read receipts show "Seen ✓✓"/"Delivered" (if off, you don't send or see them); romanisation shows romaji/pinyin under Japanese, Chinese, Korean, Arabic; text size and chat background apply instantly.
- **Learning:** levels per language update the Language card; the daily goal shows "Today 12 / 20 min"; subtitle language "Mine only" vs "Both languages" changes room, Live and call subtitles.
- **Account:** edit name, @username (availability check), city, photo; country and birthday are fixed (support only); "Ways to log in" links/unlinks Google, Apple, phone (at least one must stay).
- **App language:** the whole UI switches immediately (Phone default, English, Français, Español, Português, Deutsch, Italiano, 日本語, العربية with right-to-left layout). All UI text lives in translation files from day one, never hard-coded.

### Sign-in experience (decided 31 Oct 2026)
- **Welcome:** app icon with floating "Bonjour / ¡Hola! / こんにちは / Olá / Hello" bubbles, tagline "Real conversations with real people, in the language you're learning", **Create account** and **Log in**, and a trust strip: 18+ only · Moderated 24/7 · No passwords.
- **Returning on the same phone:** a one-tap **"Continue as Sam · @username · Apple"** card on the Welcome and Log in screens (log in with the method used last time), plus "Use another account".
- **Google/Apple buttons** show "Connecting to Google…" with a spinner while the sign-in sheet opens.
- **Trust notes** on the sign-up screen: we never post anything or see your Google/Apple password; Apple can hide your real email; your phone number is never shown; 18+ and moderated. Terms and Privacy Policy are tappable links.
- **Phone:** country-code picker with search (flag, name, +code), defaulting to the phone's region; the number is formatted as you type; "Only used to log in. No ads or spam by text, ever."
- **Code screen:** 6 boxes, iOS/Android **auto-fill from the SMS** (one-time-code), **auto-checks when the 6th digit is entered**, "Resend in 0:30" countdown, "Change number" link, and an anti-scam warning: **"Never share this code. TalkAmigo staff will never ask you for it."**
- **Trouble logging in?** opens help: use the method marked "Last used", what to do with a new phone number, contact support.

### Login security (decided 30 Oct 2026)
- **No passwords.** Sign-up and log-in use Google, Apple (iCloud) or phone number + 6-digit SMS code.
- **Face ID / PIN for money:** every **cash-out** and any **gift or spend of 1,000+ coins** needs Face ID (Touch ID or Android fingerprint) or a **4-digit payment PIN**. The PIN is created the first time it's needed; obvious PINs are refused (1234, 0000, 1111…); 5 wrong tries → 15-minute lock. Settings → Privacy & safety → Payments shows this and lets people change the PIN. (Apple/Google purchases already ask for Face ID themselves.)
- **SMS protection (backend, must have):** max 5 codes per number per hour and per device per day, codes expire after 10 minutes, block virtual/VoIP numbers at sign-up, one account per phone number (stops banned users coming back), and a budget alert in admin if SMS spend spikes ("SMS pumping" fraud). Each SMS costs about €0.03–0.10.
- Not chosen for now (can add later): optional app lock, new-device login alerts, backup-login reminder.

### Decisions 26 Oct 2026
- **No "verified tick" feature.** (Stripe's own identity check for cash-out stays: it's legally required and done on Stripe's page.)
- Settings is opened with a labelled **☰ Settings** button (the gear looked like "change colours").

### Setup
- **RevenueCat:** products `plus_monthly`, `plus_yearly`, `infinity_lifetime`, `coins_60`, `coins_310`, `coins_630`, `coins_3200`, `coins_6500`, `class_ticket_tier1` (configure in App Store Connect + RevenueCat). The backend listens to **RevenueCat webhooks** and is the source of truth for who has Plus or Infinity. Must support **Restore Purchases**.
- **Apple Small Business Program:** apply. Commission 15% instead of 30% while under $1M/year.
- **Our own ledger is the truth**, not Stripe's dashboard. Every money event has an idempotency key; webhooks can't double-credit. Refunded purchase → Coins/plan/ticket revoked.

### 7b. Gifts: Coins and Diamonds (final names)

**Where gifts can be sent:** voice rooms (to the host or anyone on stage), chats, Flicks and profiles, plus to the teacher during/after a class. **Anyone 18+ who receives a gift earns Diamonds**, wherever the gift was sent.

| | **Coins** (you buy them) | **Diamonds** (you receive them) |
|---|---|---|
| How you get them | Buy packs with Apple/Google | Someone sends you a gift. **Every gift turns into Diamonds at 25% of its coin price** (20 coins → 5 Diamonds) |
| What you can do | Send gifts only | (a) Cash out from **1,000 Diamonds** via Stripe Connect, or (b) turn into Coins **1:1** to re-gift |
| Cash value | **None.** Never withdrawable, never expire | Set by the cash-out tiers below (in `app_config`) |

**Coin packs (starting point, inspired by HelloTalk; keep bonuses small):** €0.99 = 60 · €4.99 = 310 · €9.99 = 630 · €49.99 = 3,200 · €99.99 = 6,500. Product IDs `coins_60`, `coins_310`, `coins_630`, `coins_3200`, `coins_6500`.

**Gift catalogue (starting point, inspired by TikTok Live; prices are multiples of 4 so Diamonds are whole numbers):**

| Gift | Coins | Receiver gets |
|---|---|---|
| Wave 👋 | 4 | 1 Diamond |
| Rose 🌹 | 20 | 5 |
| Café ☕ | 40 | 10 |
| Ghost 👻 (seasonal) | 100 | 25 |
| Big heart 💖 | 200 | 50 |
| Mic drop 🎤 | 500 | 125 |
| Rocket 🚀 | 1,000 | 250 |
| Crown 👑 | 3,000 | 750 |

Gifts live in a `gifts` table (name, animation, coin price, active dates for seasonal ones), so new or seasonal gifts need no app update. The 25% rate is one value in `app_config.diamond_rate`. **No random/"lucky"/mystery-box gifts at launch** (loot-box rules in Belgium and the Netherlands; Apple requires published odds).

**Cash-out tiers (starting point):**

| Diamonds | User receives | ≈ per 1,000 |
|---|---|---|
| 1,000 (minimum) | €18 | €18 |
| 5,000 | €95 | €19 |
| 10,000 | €200 | €20 |
| 25,000 | €510 | €20.40 |

**Why these numbers are safe:** 1,000 Diamonds = 4,000 coins of gifts, i.e. senders paid about €61–66. After VAT and the store fee TalkAmigo receives about **€44** normally (20% VAT, 15% Apple) or **€34** in the worst case (27% VAT, 30% fee). At €18–20.40 per 1,000 we keep money on every cash-out, even in the worst case and after Stripe fees.

**Why two currencies:** the price a buyer pays isn't what we receive (VAT and store fees come off first). Separate, non-cashable Coins also stop TalkAmigo looking like a money-transfer service (which needs a financial licence) and block the stolen-card → gift an accomplice → cash out fraud.

**Cash-out rules (all configurable):** 18+ only · identity verified through Stripe Connect · supported country · minimum 1,000 Diamonds · max 2 cash-outs per month · Diamonds become withdrawable after a **14–30 day hold** (shown as "pending" in the Wallet) · refunded purchases claw back the matching Diamonds · no gifting to yourself or your own linked accounts · suspicious patterns go to an admin review queue · Diamonds never expire · tax reporting where required (e.g. EU DAC7: confirm with an accountant).

**Cash-out countries at launch:** EU/EEA, UK, Switzerland. Store the list in `app_config.cashout_countries`. Others can still receive gifts, keep Diamonds and re-gift them; the Cash out button says "coming soon in your country".

**Cash-out flow (Stripe Connect Express, "top-ups and transfers" funds flow):**
1. First cash-out → app opens **Stripe's hosted onboarding** (Account Link). The user enters legal name, date of birth, address, ID/selfie if Stripe asks, and IBAN **on Stripe's page**. TalkAmigo never sees or stores bank details or ID documents.
2. Webhook `account.updated` → save `stripe_account_id`; allow cash-out only when `payouts_enabled = true`.
3. User picks a tier → server checks: 18+, Diamonds past hold, tier available, no open reports or fraud flags, Stripe legal name matches the account. Auto-approve below a threshold; above it, or on a first cash-out, it goes to the **admin review queue**.
4. On approval, lock the Diamonds in the ledger, then create a Stripe **Transfer** (platform balance → connected account) with an idempotency key.
5. Stripe pays the bank automatically on its payout schedule. Webhooks `payout.paid` / `payout.failed` update status; on failure, give the Diamonds back.
6. Keep enough money in the Stripe platform balance (top up from the business bank, where Apple/Google pay).

**Economics check:** the admin dashboard shows TalkAmigo's margin per 1,000 Diamonds for every coin pack and cash-out tier, and warns if any combination drops our share below 30% in the worst case (27% VAT, 30% store fee, biggest bonus pack). Stripe charges ~$2 per active account per month + 0.25% + $0.25 per payout.

**Ledger:** `coin_wallets`, `diamond_wallets`, `currency_transactions` (type: purchase | gift_sent | gift_received | diamond_to_coin | cashout | refund_clawback | admin_adjust), each row with an idempotency key. Balances are always calculated from the ledger, never edited directly.

### Accounts the company needs (owned by the company, not a person)
Apple Developer Program (~$99/year) · Google Play Console (one-time ~$25) · App Store Connect banking & tax · Stripe account with Connect · RevenueCat · Supabase · LiveKit · GitHub · domain `talkamigo.*` · business bank account.

---

## 8. Safety (non-negotiable)

- 18+ at launch; age checked on the server; teen mode feature-flagged **off**.
- **Block** hides people from each other everywhere (DMs, calls, rooms, classes, discovery, Flicks, gifts).
- **Report** from profile, message, call, room, Flick, comment, class, Club, with category + evidence reference.
- Message requests for strangers; rate limits; option to disable media and calls from people you don't follow.
- Calls: both sides must accept; a new account can't video-call strangers until it's X days old or verified.
- Moderation queue in admin with severity; child-safety and threat reports are top priority; human review for serious cases.
- No precise location, ever. City or country only.
- Data export and account deletion in Settings (GDPR).
- In-app Community Guidelines, Terms, Privacy, Teacher Terms, Creator/Payout Terms.

---

## 9. Data model (starting point — Postgres)

`users` (id, email, birthdate, country_code, city, show_city, display_name, username, bio, avatar_url, voice_intro_url, is_vip, vip_until, is_teacher, role, created_at)
`user_languages` (user_id, language_code, kind: native|learning, level A1–C2)
`interests`, `user_interests`, `follows`, `blocks`, `reports`
`conversations`, `conversation_members`, `messages` (type: text|voice|image|correction|gift|system, original_text, translated_text, corrected_text, reply_to)
`message_requests`, `calls` (caller, callee, type, started_at, ended_at, livekit_room_name)
`duos` (user_a, user_b, streak_days, last_practice_at, status)
`moments` (author_id, kind, text, media_url, language_code, created_at), `moment_likes`, `moment_comments` (is_correction)
`rooms` (host_id, title, language_main, language_second, topic, access: public|followers|mutuals|private, max_speakers, capacity, starts_at, ends_at, status, livekit_room_name), `room_participants` (role), `room_events`
`clubs`, `club_members`, `events`
`teacher_profiles`, `classes` (teacher_id, title, language, level, starts_at, length_min, capacity, price_tier, livekit_room_name, status), `class_tickets`, `reviews`
`coin_wallets`, `diamond_wallets`, `currency_transactions`, `gifts`, `payouts` (see 7b)
`subscriptions` (from RevenueCat webhooks)
`notifications`, `push_tokens`
`app_config` (key, value json): prices, durations, capacities, shares, feature flags, country rules
`passport_stamps`, `achievements`, `referrals`

Use **Row Level Security** on every table. Write the permissions matrix (adult / host / co-host / room moderator / Plus / Infinity / teacher / Club admin / admin) in `/docs/permissions.md`.

---

## 10. Folder structure

```
talkamigo/
  CLAUDE.md  ROADMAP.md  IDEAS.md
  design/            logo, mascots, screen screenshots, flag icons
  docs/              DECISIONS.md, permissions.md, features/
  ios/               Xcode project (SwiftUI)
    TalkAmigo/
      App/           entry, tab bar, navigation, deep links
      DesignSystem/  colours, fonts, background glows, buttons, chips, Avatar+Flag
      Features/      Onboarding, Chats, Calls, Connect, Flicks, Live (Rooms), Classes, Profile, Wallet, Settings, Plans, Teacher, Club, Notifications
      Services/      Supabase, LiveKit, RevenueCat, Translation, Push
      Models/
    TalkAmigoTests/
  android/           (phase 2)
  supabase/          migrations/, functions/ (webhooks, moderation, push), seed.sql
  admin/             Next.js admin dashboard
```

---

## 11. Mac setup checklist (tell me step by step when we start)

1. Install **Xcode** (App Store), open it once, accept the licence, install the iOS Simulator.
2. Install **Homebrew**, then `git`, `node`, and the **Supabase CLI**.
3. Install **Claude Code** and open the `talkamigo` folder.
4. Create the private **GitHub** repo and connect it.
5. Create the Supabase `dev` project; put keys in `.env` (never commit).
6. Later: Apple Developer account (needed for TestFlight, push and payments testing).

---

## 12. Build order

See **`ROADMAP.md`**. Work through it top to bottom.

---

## 13. Definition of done (every feature)

- Matches the design (light **and** dark mode).
- Works with VoiceOver basics and large text.
- Server enforces permissions; blocked users can't interact.
- Handles no internet, loading and empty states (empty states use the mascot + friendly copy).
- Has tests for the logic; money features have tests for duplicates, refunds and restores.
- Committed to Git with a note in `/docs/features/`.

---

## 14. Open decisions (ask me, don't assume)

- Final Plus / Infinity prices and perks; boost prices.
- ~~Currency names~~ Decided: **Coins** (bought) and **Diamonds** (received).
- Teacher and creator share % (and who pays store fees/VAT).
- Which 2–3 language pairs and countries we launch in.
- Moderation staffing and support response time.
- Trademark/domain for "TalkAmigo".
- When (if ever) to build teen mode.

## Smooth horizontal rows
- Chip/scroll rows (language chips, lesson filters, teacher faces, day strip, tabs) keep their sideways position when you tap something — no jump back to the left.
- A selected chip is only slid into view (smoothly) if it is off-screen.

## Open room screen, room modes and room level (decided 2 Nov 2026, built in the beta)
Inspired by HelloTalk's "Create a Room", in our own words and red brand.
- **Open room screen = grouped cards**, white & red in light mode, black & red in dark: Talk room / Live room switch · title ("What will you talk about?") · Language › · **Mode** (Talk rooms only) · Topic › · Who can join · How long · **Room notice** (up to 300 characters, **Pin** tick, #topic tag) · **Boost from the start** card. Fixed at the bottom: round **Background** button, the big **Open talk room** button, and under it "Also show on Flicks" (ticked by default) + Schedule. A **★ Lv.N** chip top right opens Room level.
- **Room modes:** **Chat** (classic) · **Music** (the host picks one of TalkAmigo's own sounds; it plays softly under the talk and can be paused; never copyrighted songs) · **Whiteboard** (the host draws/writes in colours with an eraser and clear; everyone sees it, only the host draws) · **Word game** (the host gets a word in the room's language and describes it without saying it; listeners guess in the chat, a correct guess scores a point and the next word comes up; top 3 scores shown). A "How modes work" sheet explains each one.
- **Pinned notice** shows at the top of the room chat as "Pinned by the host", above the room rules. The topic shows as a #tag in the host's room header.
- **Backgrounds:** Plum and Night free; Ember (Lv.2), Dusk (Lv.3), Café (Lv.4), Sunset (Lv.5) unlock with room level.
- **Boost social proof = your own results only:** "Your last boost: +N listeners · Today". We never show other people's boost results (avoids fake-looking claims). Boosted rooms always carry the "Boosted" tag.
- **Room level:** your room earns XP and levels up (Lv.1 needs 100 XP, Lv.2 200, and so on). Page: level card with mascot + XP bar, **Check in every day** (7-day row: +10, +10, +15, +20, +20, +30 XP, day 7 = free 15-min boost; rewards are **never coins**, so they can't be turned into Diamonds), **Today's room tasks** (Open a talk room +15 · Pin a notice +5 · Keep your room open 5 min +20 · 5 listening +5 · 15 listening +10 · 3 on stage with you +10; each Go → Claim → Done, reset daily), and **What levels unlock** (backgrounds, a level badge on your room card). XP, check-ins and tasks are checked on the server in the real app.

## My languages: native language can be changed (decided 2 Nov 2026, built in the beta)
- Edit profile → any language row (Native, Learning, + Add a language) and Settings → Learning open one page: **My languages**.
- **I speak natively:** 1 to 3 languages; the first is the **Main** one (shown on the profile, decides who sees you as a partner). Add with a search over all languages, remove with ×.
- **I'm learning:** up to 3 (Plus/Infinity: 5), each with its own level A1–C2; the first is your main language for Flicks, rooms and lessons; ↑ moves one up.
- A language can't be both: adding a learning language as native moves it across (and the reverse), with a short note. At least one native and one learning language must stay.
- **Changes are a draft until you tap Done** (FR "OK"). Done applies everything at once: profile and Language card, Connect matching, room and lesson language chips (reset to "All my languages"), lesson filters, Flicks Learn tab, Flick editor default language and translations. Toast: "Languages updated everywhere". Leaving with unsaved changes (back arrow or swipe) asks **Save changes / Discard / Keep editing**.
- The **flag does not change**: it shows the country you're from, not your language.
- In the real app the server saves the new languages in `user_languages` in one transaction.

## Person card in rooms and stage invites (decided 2 Nov 2026, built in the beta)
- **Tapping anyone in a Talk room** (a seat, the listeners row, the audience list, a raised hand) opens one **person card**: big photo with flag, name, role (Host · Co-host · On stage · In the audience) · country · city, two tiles **Speaks** / **Learning** (with level dots), a 2-line bio, **Follow** (+ Message and Gift buttons for guests), **View full profile ›** and **Report**.
- **Host sees controls as round icons:** for someone on stage: **Mute/Unmute mic · Make co-host · To audience · Remove**; for someone in the audience: **Invite to stage · Message · Gift · Remove**. Remove is always red.
- **Invite to stage = they accept first.** The listener gets a white banner "Sam invites you on stage · Your mic starts off" with **Not now / Join stage**. Nobody is put on stage without saying yes, and their mic always starts off. Chat shows "You invited X to the stage" then "X joined the stage 🎤". If the stage is full: "The stage is full".
- **Empty seat (host)** opens the audience list, where each listener has an **Invite** button (→ "Invited").
- **Raise hand** now also ends in the same invite banner (the host invites you, you accept), instead of putting you on stage automatically.
- The #topic chip in the room header stays on one line (cut with … if long).
- **Boost prompts in rooms can be closed (2 Nov 2026):** the "No one here yet" card (Talk and Live rooms) and the "Only N here. Boost?" bar have a round **×** at the top left (top right in Arabic). Closing hides it for that room; a toast reminds that the rocket button still boosts.

## Stress test with simulated users (3 Nov 2026)
- The beta was run by **300 simulated users** in 4 rounds (all 8 languages, phone widths 360–430, light/dark, Standard/Plus/Infinity). Each hosted or joined Talk rooms of every mode (Chat, Music, Whiteboard, Word game), Live rooms, teacher lessons, chats and calls, changed languages, then tapped around at random. Every tap was checked for crashes, text like "undefined", pages that scroll sideways, buttons off the screen, rooms left running with no way back, and calls ringing with no banner.
- **Bugs found and fixed:**
  1. An incoming call banner was wiped by any other notification while the call kept ringing. Calls now stay on top; other banners wait.
  2. Starting a call from inside a room left the room running underneath (two screens mixed). **Decided 3 Nov 2026: the room pauses during a call**: you're muted, room music stops, the room is minimised (card hidden during the call), and when the call ends you're put back in the room with your mic off ("Back in the room · your mic is off"). Works for incoming and outgoing calls.
  3. "Message" on someone in a room lost the room's floating card. It now minimises properly. Safety net: a running room always shows its card.
  4. WhatsApp / Messages share buttons didn't open anything (the app's own `open` function replaced the browser's). Fixed with a separate link opener.
  5. "Live now · See all" (Connect) and the Lives tab switch crashed (a locked value was being changed).
  6. The "Starts in 10 min" lesson reminder opened nothing; it now opens Lessons.
  7. Rooms page crashed when no banner matched your language (Plus users); the banner area now hides.
  8. Appearance settings: a theme preview floated at the bottom and pushed the page sideways (class name clash with the minimised-room card).
  9. Search page and the Flicks top bar went off-screen on small phones (360 px), and the group-call buttons cut off "Leave".
  10. Taps could be lost in calls, live rooms and while a group call was minimised, because the whole screen redrew every second. Timers now update only their own text, and any redraw waits until the finger is lifted.
  11. "Copy link" threw an error when the phone refused clipboard access.
- **In the real iPhone app:** keep the same rules: a call pauses any room you're in (mute + leave audio, back in after the call), call banners have priority, timers never redraw whole screens, every list and button must fit at 320–360 pt widths in the longest language (French, German, Portuguese).
- The test tool lives in `beta/sim/sim.py`; run it again after big changes.

- **Added after the crowd tests (3 Nov 2026):**
  - **Room time limits now work:** your Talk room / Live room ends when its chosen length is up. At 10 min left: a toast with the end time, a chat line and a red "10 min left" chip in the header; at 2 min: "2 min left · say goodbye 👋"; at 0: "Time's up · your room has ended" (the Live goes into your past rooms). Server enforces this in the real app.
  - **Room chat keeps the latest 60 messages on screen** (120 in memory), so very busy rooms stay smooth.
  - **Offline:** a dark bar at the top says "You're offline · we'll reconnect automatically" ("Connection lost · reconnecting to the room…" in rooms). Messages sent offline show a small clock ("Waiting to send") and go out automatically when the connection is back ("Back online · 1 waiting message sent").
  - **Calls first:** while a call is ringing or on, other banners don't show (they still go into Activity).
- **Blank-screen release (3 Nov 2026, version 32):** a last-minute cleanup edit, made after the tests ran, left a broken quote and the beta showed nothing. Fixed in version 33. Rule now: the build checks the code parses and refuses to ship otherwise (keeps the last good version), and nothing is published without re-running the tests after the final edit. In the real app the same rule is CI: no build ships if it doesn't compile and pass tests.
- The brand name "TalkAmigo" is never translated (French showed "ParoleAmigo"); it's marked not-to-translate everywhere.

## Test content: many rooms in the beta (3 Nov 2026)
- The beta now has **45 talk rooms and 15 live rooms** (40 + 12 added, with 12 extra people as hosts and speakers) so long lists can be checked while scrolling. They cover English, French, Spanish and the pairs FR⇄EN, ES⇄EN, ES⇄FR (plus a few JA, PT, DE), every room mode (Chat, Music, Whiteboard, Word game), Plus and Boosted rooms, a full 10-seat stage, and edge cases (very long titles, emoji titles, 1 to 4,800 listeners, 3 to 12,000 viewers). They're added once to existing phones too. In the real app these are replaced by real rooms.
- Checked: every language chip has rooms, scrolling the whole list is clean, all 60 rooms/lives open without a problem (EN, FR, AR, DE, JA; 360–430 px; light and dark), and 24 more simulated users found nothing.
- Fixed while checking: on live tiles the yellow Boosted badge was pushed off the edge by long viewer counts (e.g. "132 spectateurs"), and the price pill overlapped it; the badges now wrap in one row and the Boosted badge is a rocket icon instead of an emoji. "Popular lesson" on live tiles is now translated.

## Chat fixes (v35, 3 Nov)
- Keyboard: visualViewport fit only pins .stage when keyboard shrinks viewport >80px (iOS iframe pans itself otherwise); focusin on composer inputs → scrollIntoView after 320ms. Not verifiable in Chromium — user tests on iPhone.
- Long-press never selects text: #phone * user-select:none + -webkit-touch-callout:none; inputs/textareas set back to text.
- "Press and hold" tip line removed; replaced by one-time .lphint bubble under first incoming message, fades after 3.5s, sets S.lpTip (also set on first long-press).

## Games, calls and speed (v36, 4 Nov 2026)
- **Guess the word is the only room game.** The mode is now called "Guess the word" everywhere (create screen, room, How modes work, room cards). No other games for now.
- **Calls behave like a real phone app:**
  - The 1-to-1 call screen has a **⌄ minimise** button (top left) → green pill at the top with name + timer; tap to go back. Buttons: Subtitles · Speaker · Mute (real toggles, labelled) · End.
  - **Weak connection:** "Camille has a weak connection" shows on the call screen for ~5 s (as a 5 s toast if minimised; pill turns orange). If *your* phone is offline: "Your connection is weak · reconnecting…". Offline for 20 s → the call ends: "Call dropped · the connection was lost" (5 s toast + line in the chat). Same for group calls.
  - **Not available during a call** (5 s toast, own wording): recording or playing voice notes, starting another call ("You're already on a call"), opening a Talk/Live room, going live, raising your hand, recording a sound or intro video, sound previews, Hear it. Any recording in progress stops when a call starts. Flick sounds don't play during a call.
  - Group calls now also pause the room you're in (like 1-to-1 calls) and put you back after.
  - In the real app: LiveKit's connection-quality events drive the weak-connection notice; the 20 s drop rule is a config value.
- **Speed:** the Rooms list draws the first 10 rooms/lives and adds 10 more as you scroll. Tabs are pre-drawn once in the background when the phone is idle, so first opens are much faster (slow-phone test: Rooms ~1 s → ~0.5 s at 6× slower CPU; other tabs 0.1–0.3 s).
- Test tool `sim/sim.py` has a new `j_callbusy` journey and checks: call screen/pill always visible, no sound or recording during a call, rooms paused during calls.
- Fixed in the same round: a room could still open during a call through side doors (accepting a call right after leaving a room, joining from cards). Now nothing can open a room while a call is on, and leftover room screens are cleared when a call starts. "Use sound" from inside a room now minimises the room properly. Published as v36 after 4 test rounds (~95 simulated users, crowd tests, all regression tests).

## Smoothness and bug sweep (v37, 4 Nov 2026)
- **No more flashing on taps:** every redraw used to replay the fade-in of overlays (call screen, sheets, toasts…), so the page underneath flashed for a frame. Now an overlay only animates the first time it appears; looping animations (speaking rings, marquee titles) keep their place instead of restarting. Rule for the real app: never re-create a screen just to change one button; update in place.
- **New call screen:** three 68 px round buttons (Mute · Speaker · Subtitles, white when on, crown on Subtitles for Standard) + a wide red **End call** button. Built so iOS can't squash them into ovals.
- **Minimised call = full-width green bar** at the top (photo, name, "Voice call · 0:49", mute and red end buttons), pushing the page down instead of covering the header. Orange when the connection is weak. Same bar for group calls.
- **Bugs found and fixed in the sweep:**
  1. Opening a chat with an account that no longer exists saved a broken chat, after which the **Chats tab crashed every time**. Now: "This account is no longer available", and broken entries are cleaned on start. Same guards for rooms that ended, deleted groups and lessons.
  2. **Payment race:** cancelling an Apple payment and starting another within a second could complete the cancelled one. Fixed.
  3. Closing your own Live from the minimised card left a ghost "live" in the list. Now it ends properly and goes into your past rooms.
  4. Text could be translated twice (German "Mode" → "Modus"). Each piece of text is now translated once.
  5. Arabic: French/English messages showed punctuation on the wrong side. Messages, corrections and room chat now follow their own writing direction.
  6. ~70 app texts were still English in other languages (safety tips, help, how gifts work, post types, new chat menu, intro video, boosts, privacy preview…). All translated.
  7. Small phones (320 px): Connect / Chats headers, the Settings button on Me, the Duo banner and lesson seat labels went off-screen. Fixed.
  8. Dark mode: "OPEN NOW" / "LIVE" on lesson circles were hard to read.
- **Safety nets:** if a screen or sheet ever fails to draw, the app goes back one step with "Something went wrong. We took you back." instead of a blank screen. Any button without an action is logged (the crowd test flags it as a dead button).
- New checks used: untranslated-text scan (all screens, EN vs FR), off-screen scan at 320 px (DE/FR/PT), contrast scan (light/dark), timer-leak test (400 random taps, no timers left), reopen-the-app tests (in a call, room, sheet, deep pages), race tests (leave/cancel right after starting something), stale links (deleted rooms, people, groups).

## Co-hosts (decided 4 Nov 2026, built in the beta v38)
- **Badge:** a co-host has a **silver crown** before their name on their seat (the host keeps the red crown), a silver **Co-host** tag next to their name in the room chat, "Co-host" in the audience list and on their person card.
- **Making one:** host taps someone on stage → **Make co-host** (tap again to remove). Chat line "Tunde is now co-host 👑". Moving them to the audience or removing them ends co-host.
- **Co-host runs the room when the host leaves:** if the host leaves while a co-host is on stage, a sheet asks **Leave · Tunde runs it** / **End room for everyone** / Stay. Handing over keeps the room going (listed with "Tunde is running it") until its time is up; then it ends by itself ("Your room has ended · Tunde kept it going for you") and goes into past rooms. The host's button says "Leave" instead of "End" when there's a co-host. Coming back = in charge again ("Welcome back · you're in charge again").
- **Co-host can:** manage the stage (invite up, mute/unmute, move to audience, raise-hand requests), **remove people** (never the host or another co-host) and **switch the room mode** (new "Mode ›" button in the room for host and co-host; music/word/whiteboard controls follow whoever runs the room).
- **Host only:** end the room, edit the notice/topic/title, make co-hosts, boosts. A co-host trying gets "Only the host can do that". Server must enforce these roles in the real app.
- Beta demo of the other side: if you're on stage in someone else's room for a while, the host makes you co-host; later they "step away" and you run the room, then they come back.
- Also fixed: room chat lines ("X joined the stage", "X raised a hand") stayed in English when the chat refreshed; people's own messages in room chat are never auto-translated.

## Welcome screen redesign (decided 4 Nov 2026, beta v39)
- Replaces the white Welcome screen (section 5, step 1). Full-screen gradient in the logo's colours (coral #FF6B3D → red #F0242E → magenta #D3105E → violet #6A24C9) with soft drifting glows.
- **The logo is in the background:** the app icon very large, tilted, faded into the colours (globe, 文/A/あ bubbles and the two smiling bubbles visible), slowly moving.
- **"TalkAmigo" big in the middle** in white ("Amigo" with a light gold-to-pink shine), the tagline as three chips **Speak. · Connect. · Belong.**, greeting bubbles (Bonjour ! · Hello! · ¡Hola! · こんにちは · Olá!) popping in and floating around it, then "Real conversations with real people, in the language you're learning."
- Bottom: white **Create account** button (red text), see-through **Log in**, trust strip and "Just looking? Try the demo" in white. Language button is a frosted pill top right.
- Animations stop with Reduce Motion. Fits down to iPhone SE (320×568) in every language.

## Full polish pass (beta v40, 5 Nov 2026)
**Keyboard & typing**
- Tapping send, an emoji, the emoji button or a quick reply keeps the keyboard open (no close-and-reopen jump). A conversation that was at the latest message stays pinned to the bottom when the keyboard opens/closes. A tiny finger wobble no longer closes the keyboard (needs a real ~14 px drag). All text fields are 16 px so iOS never zooms in on focus.
**iPhone feel**
- No double-tap zoom / tap delay anywhere (touch-action: manipulation). Pressed states work on iPhone (:active needs a touchstart listener). Images can't be dragged.
- Tapping the tab you're already on scrolls that page back to the top (iOS convention).
- A fast accidental double tap on Back or on a link no longer goes back two pages / opens the same page twice (real taps only, 300 ms).
**Layers never cover each other**
- Top stack is fixed order: call bar → offline bar → notification banners → toast. A toast can no longer hide an incoming-call banner.
- The minimised room card sits above the message box on chat pages instead of covering it. Its × now shows.
- Room: top gifters stay fixed on the right; only listeners scroll (fade at the edge). Floating Go up / Plus buttons sit side by side on short phones so they don't cover the music/whiteboard card. Header fits 320 px ("listening" word hides, buttons slimmer).
**Bugs found**
- Voice messages: the play button was placed at the screen's top-left corner (CSS name clash with the Flick video play icon) and blocked the Back button in chats with a voice note. Renamed the Flick one (fvplay).
- The CC button's Plus crown was invisible (white on cream) in rooms.
- Group preview showed "You: undefined" when the last message was a gift.
- Expired offer: "2× coins … ends Sun 2 Nov" was still shown after that date. Offers now always show a real upcoming end date (next Sunday ≥ 3 days away), in each language's own date format.
- Leftover names: "Class & event reminders" → Lesson reminders; "Rooms, calls and classes" → lessons; "Class" page → Lesson; "Rooms & Lives" → Past rooms; Team subtitle without "events".
- Learning settings showed language names in English in other app languages.
- Emoji used as icons (🔒 🔕 🔔 🗑 ✅ ⚠️ 📒 👁) replaced with the app's line icons (Plus-only options now show the gold crown).
- Settings rows: long labels and values no longer collide; banner text never runs under the coin/rocket art; Chats rows stay one line ("Équipe TalkAmigo…").
- Small text links (Translate, Correct, Read all, names, sound) have a larger invisible tap area; a missing rule had attached those tap areas to the wrong element.
**Speed**
- Saving is batched (once per burst, always flushed when the app is hidden) instead of on every redraw; the sideways-scroll memory only checks containers, not every icon. Typical actions 60–150 ms on a phone 4× slower than normal.
**New audit tools used (re-run after big changes):** overlapping-text scan (visible text only), layer-combination test (toast/banner/offline/call bar/mini card/sheet), icon visibility scan, tap-target scan, absolute-elements-stuck-in-a-corner scan, per-action timing at 4× slower CPU, keyboard focus test.
- Also in v40: Connect now draws the first 10 partners and adds more as you scroll (slow-phone open: up to 0.9 s → ~0.1 s); Rooms list starts with 6 cards. Crowd test's "nothing to tap" check now waits for the slide-in animation before flagging. Published as v40 after all checks (13 regression tests, 60 rooms/lives, 36 simulated users, busy-room and slow-phone crowd tests, layer, keyboard, race, reload and stale-link tests).

## Sign-up in the welcome colours (decided 5 Nov 2026, beta v41)
- Every sign-up and log-in screen (Join TalkAmigo, Welcome back, phone number, SMS code, onboarding steps 2–8 incl. intro video) uses the **same coral → red → magenta → violet gradient and glows as the Welcome screen**.
- On the gradient: white titles and text, white progress bar on a translucent track, frosted back button, "Amigo" in the title in light gold.
- **Anything people read or type in stays a clean white card** with dark text: fields, search boxes, country list, trust notes, "Never share this code". Google and phone buttons are white, Apple stays black.
- **Continue** = white button with red text (like Create account); disabled = translucent. Chips: translucent white, selected = white with red text; level picker selected = white with red text. OTP boxes translucent, filled = white.
- "Take photo" uses a camera line icon (no 📷). French text keeps "?", "!", ":" on the same line as the word before (non-breaking space).
- The Welcome screen and sign-up now look like one continuous flow; the app itself (after sign-up) keeps the clean white & red look.

## Reply to one message (decided 5 Nov 2026, beta v42)
- **Press and hold a message → Reply** (first item in the menu), or **swipe the message to the right**. Works on text, voice notes, photos, shared rooms/Flicks/cards, in 1-to-1 chats and group chats.
- A **"Reply to Camille"** bar (red line on the left, a short preview of the message, × to cancel) sits above the text box and the keyboard opens. Replying to your own message says "Reply to yourself". Voice notes preview as "🎤 Voice message · 0:08", photos as "📷 Photo".
- The sent message carries a small **quote** of the original at the top of the bubble (name + 2 lines). **Tapping the quote scrolls to the original and makes it flash.** If it was deleted: "This message is no longer here".
- Voice notes recorded while replying carry the quote too. Changing tab cancels the reply. "Copy text" only shows for text messages.
- Real app: `messages.reply_to` (already in the data model) stores the original message id; the quote preview is stored with the message so it still shows if the original is deleted on one phone.

## Choose your look + listen before sending (decided 5 Nov 2026, beta v43)
- **Theme follows the phone by default** for new accounts ("Match phone" is now the default in Settings → Appearance; replaces "Default is Light"). The welcome and sign-up screens keep their gradient in both modes.
- **"Choose your look" screen right after sign-up**, before "Your AI helpers" and the tour: three previews **Light · Dark · Match phone** (the phone's setting pre-selected, with "Your phone is in dark/light mode"), tapping one switches the app instantly, then **Continue**. Not counted as a sign-up step. Changeable any time in Settings → Appearance.
- **Voice notes: listen before sending** (like WhatsApp, own design). While recording: bin · red dot + timer · moving waveform · **■ stop** · send. Tap ■ → preview bar: bin · **▶ play/pause** (the waveform fills in red as it plays) · length · **mic = record more** (adds to the same note) · send. Send works from both states. Max 5 min in total ("5 min max · listen, then send").
- The microphone permission is now asked before the first voice note (it wasn't before). The mic is switched off as soon as you send, delete, leave the chat or a call starts.
- In the beta the preview plays your real recording (and so does your own sent bubble until the page is reloaded). Real app: record with AVAudioRecorder (pause/resume for "record more"), preview with AVAudioPlayer, upload only on send.

## Welcome tour = essentials, plus first-time guides (decided 6 Nov 2026, beta v44)
- **The welcome tour is slower and only covers the essentials** (replaces section 5 step 9). 12 cards, one idea each, 1–3 short points per card. Nothing moves until the person taps: **Next** (or "Open Chats / Open Connect / Open Rooms / Open Me", or tapping the highlighted spot). A **‹ back** button on every card after the first, **Skip** always there, step dots at the top, and the card fades in after the spotlight moves.
  1. Welcome (about a minute, go back or skip any time) · 2. Flicks (swipe up, tap a word, Translate) · 3. Post your own Flick (write in the language you learn, corrections are kind) · 4. Chats (1-to-1 and groups, Requests for people you don't follow) · 5. Connect (partners, 👋, filter) · 6. Rooms (talk = voice only, live = one camera, lessons with checked teachers) · 7. Open your own room · 8. Me · 9. Language card (levels + real practice time, change in Settings → Learning) · 10. **Coins** (what you buy in the Wallet, spent on gifts and boosts, can't become money) · 11. **Diamonds** (what you receive from gifts, a quarter of the gift's coins; from 1,000 cash out to your bank or turn into Coins) · 12. Settings & safety (privacy, who can message you, language, look; press and hold or ••• to report/block). Finish = +50 coins (only once).
  - The old Rooms card still said "classes and events"; fixed.
- **First-time guides** (a sheet with 5–6 rows, icon + title + one line, "Got it"), shown once each, 0.7 s after the screen opens, never during a call, the tour or another sheet:
  - **First chat** (1-to-1 or group): Translate · Correct · Reply to one message · Voice notes (■ to listen before sending) · Calls (the other person accepts) · Stay safe (never share passwords/bank details, press and hold → Report).
  - **First talk room as a listener:** the stage and crowns · you join muted in the audience · Want to speak? Go up → host invites → accept, mic starts off · chat & gifts · ⌄ shrink or × leave.
  - **First room you host:** tap anyone (invite, mute, co-host, remove) · raised hands · co-host · time limit and warnings · boost if quiet.
  - **First live room as a viewer:** only the host is on camera (yours never turns on) · comment · like · gifts give the host Diamonds · ⌄ or ×.
- **Settings → Help → Getting started:** "Replay the welcome tour" and "Show first-time tips again".
- Fits iPhone SE (320×568) in all 8 languages: the card moves above/below the highlight to stay on screen.
- Real app: store `seen` flags on the account (so they don't show again on a new phone); tour copy lives in the translation files.

## The TalkAmigo signature + new Join page (decided 6 Nov 2026, beta v45)
- **Signature (brand rule):** the name is always written **"Talk" in near-black + "Amigo" in brand red (#E0101F)**, heavy bold, never translated (Arabic once showed "حديث" for "Talk"; fixed). In dark mode on dark screens "Talk" turns white, "Amigo" stays red.
- **On the gradient screens** (Welcome, Join, Welcome back) black/red would disappear on red, so the name sits on a **white rounded logo plate** (with the app icon on Join and Welcome back, name only and large on Welcome). Also used in the promo screen header and Settings → About.
- **Join page (Step 1 of 8):** "Join [TalkAmigo plate]", "Free to join · about 2 minutes.", then a frosted card with a **mini chat that plays in**: a native speaker asks a question, you answer with a mistake, a **green correction** appears, and they suggest a call. It's in the language you're learning (English phone: learning French with Camille; other phones: learning English with Noah). Under it: faces + "Native speakers from 190+ countries are waiting to chat". Then the Google / Apple / phone buttons, trust notes and Terms as before. On very short phones the mini chat shows two lines only.
- Welcome back: logo plate above the title instead of the bare icon.

## Background taken from the logo (decided 6 Nov 2026, beta v46)
- **Welcome, Join, Welcome back, phone/code and onboarding steps 2–8 now use the logo's own background** instead of the coral → violet gradient (replaces the colours in the v39 and v41 sections): bright red top-left (#FF3B2F → #EC1423) fading to deep crimson (#850612) and almost black red (#3E0309) bottom-right, with the logo's soft lighter-red swooshes and thin curved lines across the screen. No violet or orange glows. The white TalkAmigo plate, white cards and white buttons stay.
- **Join page mini chat is always in English** (Noah asks "Hi! Are you learning English?", the correction is "I learn since → I've been learning for").
- Phone number screen: the two notes now sit in a white card (the lock icon was invisible), and the 🚫 emoji became a line icon.

## Buttons that react, swipe fix and bug hunt (decided 6 Nov 2026, beta v47)
**Feel**
- **Every button reacts to the finger** (works on iPhone, where the browser's pressed state is unreliable): normal buttons shrink slightly (96%), round icon buttons and tab icons a bit more (88–90%), big cards 98%, list rows get a soft grey highlight instead. They spring back when you let go; if you start scrolling, the press is cancelled so nothing "sticks". Off with Reduce Motion (just a light fade).
- **Small "pop" reactions** on like, follow, wave, save, switches and the tab you tap. Switches slide their knob across. A light vibration where the phone supports it (Android; iPhone web can't).
- **Sheets close by dragging them down** (like iOS), from anywhere on the sheet when it's scrolled to the top; a short pull snaps back. Toasts appear with a small spring.
- Switches: iOS-style grey when off (visible in dark mode too), brand red when on. Segmented controls (Coins/Diamonds, Rooms/Lessons, Flicks/About…) now clearly show the selected side in dark mode.
- Keyboard focus ring for accessibility.
**Swipe on a chat (the bug from the screenshot)**
- Swiping a chat left showed the row's text through the Mute button (the pressed row became see-through) and the icons were huge black shapes. Now the row stays solid and slides cleanly, Mute (grey) and Delete (red) are solid with small white line icons, and a muted chat shows a small crossed-speaker next to the name and a grey unread badge.
**Overlaps fixed (checked in 8 languages, 320–430 px, light/dark)**
- Offer banners: the big title ran over the "OFFER" tag on small phones; titles now shrink and wrap to 3 lines max, and in Arabic the coin picture moves to the left so it no longer covers the text.
- Flicks top tabs (Following / For you / Learn) were cut by the profile button on small phones in French.
- Bottom tab labels ("Discussions") were cut with "…" on small phones; each label now shrinks just enough to fit.
- "Report this undefined" title fixed.
**Bug found by the crowd test (had shown up for days):** opening "Open room" from Live rooms after backing out of a Talk room draft kept the old Talk room type, so "Go live" opened a talk room. The screen now always opens on the type you're looking at.

## Dark mode rooms fix + stronger button reactions (decided 6 Nov 2026, beta v48)
- **Room cards in dark mode:** they could show as light cards with white (invisible) titles, names and language tags. Cause: the page hosting the beta can change the theme marker on the page, which turned on dark text but left the light card colour. The app now always sets its own theme (Light, Dark or the phone's) and puts it back if anything else changes it. Rule confirmed by the founder: **light mode = normal room cards light grey with dark text, teacher lesson circles black; dark mode = the opposite (normal room cards dark with white text, teacher circles white).**
- Room card tags now wrap onto a second line instead of running off the card (e.g. "Your room" + "Tunde is running it").
- **Button reactions are stronger and quicker everywhere, including Welcome and sign-up:** buttons dip to 94% in 0.07 s with a light darkening (or lightening on dark buttons such as "Sign up with Apple" and in dark mode), then spring back. Big buttons (Create account, Continue, Sign up with Google/Apple/phone) dip to 95.5% and dim slightly; list rows get a clearer grey highlight.
- Checked: text contrast scan on 60 screens and pop-ups in light, dark and "match phone" modes (EN, FR) found no unreadable text.

## Smarter rooms and chats (decided 6 Nov 2026, beta v49)
- **No more "You're on stage · Leave stage" bar** (it overlapped the floating buttons and felt clunky). When you're on stage, the round hand button turns green and says **On stage**; tapping it opens Mute my mic / Leave the stage / Leave the room. Your seat and the mic button in the bottom bar already show your mic state, and "The host muted you" comes as a short message.
- **Floating room buttons (Go up / Plus) always sit above whatever is at the bottom** (quick replies, invite banner, raised-hand request, boost bar, comment box), so they can never cover them, on every screen size.
- **Swipe to reply feels instant:** the message follows the finger with a soft resistance, a reply arrow appears beside it and turns red with a tiny pop when you've pulled far enough (about 56 px); let go and the message springs back while the "Reply to…" bar slides in and the keyboard opens straight away (focus happens in the same tap, so iPhone doesn't delay it). A short pull does nothing.
- **Typing indicator:** after you send, the other person's header says "typing…" and three bouncing dots appear before their answer.
- **Jump to latest:** reading older messages, a round ↓ button appears above the message box; new messages no longer yank you down while you read, they add a red count on that button instead. Tap it to slide to the newest message.

## Room chat stays readable with games and co-host tools (decided 7 Nov 2026, beta v50)
- Problem: as co-host in a "Guess the word" room, the stage, game card, Mode button and co-host bar took the whole screen and the chat showed one line.
- **Guess the word card is compact:** one header line (game name + top-3 scores), then the word and a small red **Next word** pill on the same line (guessers: the blanks + hint on one line). Tapping the header folds the card into one line ("Guess the word · kitchen · Next") and back.
- **Mode and co-host share one slim row:** "Mode · Guess the word ›" and a small silver **Co-host** chip (tap it for "You're co-host · you can manage the stage"; when the host has stepped away it says "Running the room").
- **Room rules notice is 2 lines** (tap to read all); on small screens 1 line.
- **The room fits itself to the phone:** if the chat area would be shorter than ~200 px, the room switches to a tighter layout (seats 80 % size, game card folded, live-subtitle line hidden, and on very short phones the quick replies hide); it goes back to normal when there's room again. Result: chat area at iPhone SE size went from ~70 px to ~110–150 px, and at 375×667 from 1–2 messages to 3–4; on normal phones nothing is cut.


## Long words, sign-up defaults and the "Continue as" card (decided 7 Nov 2026, beta v51)
- **Long words never push the screen sideways:** a message like "Dddddddddffffgggg…" with no spaces used to stretch the bubble and you had to scroll left/right. All user text (room chat, chats, groups, reply previews, comments, captions, bios) now wraps inside its bubble.
- **City suggestion follows the country:** the City field shows the capital of the country you picked as the example ("e.g. Paris" for France, "e.g. Tokyo" for Japan, "e.g. Rabat" for Morocco…), for all 200 countries, instead of always "e.g. Stockholm". The field stays empty so people type their own city.
- **First language is pre-selected from the country:** picking a country pre-selects its main language on the next step ("Which languages do you speak fluently?"), e.g. France → French, Japan → Japanese, Morocco → Arabic, Brazil → Portuguese. People can remove or change it; once they've changed it themselves, picking another country no longer overrides their choice. Countries whose main language isn't in our list get no pre-selection.
- **"Continue as Sam" card after logging out:** the name and @username were white on the white card (invisible). Now dark text, with the photo letter still white.
- Flick editor caption placeholder now follows the language you're writing in ("Hoy he…", "Today I…", "Heute habe ich…") instead of always French.
- **Long names and bios wrap too:** a long display name, city, @username or bio (up to the 24-character name limit, on a 320 px phone) used to be cut off on the Me card, the Flicks profile, the Settings account row and Edit profile. They now wrap onto the next line.

## Co-host needs your yes (decided 7 Nov 2026, beta v52)
- **Nobody becomes co-host without accepting** (replaces "Making one" in the v38 Co-hosts section). When the host picks you, a banner says "Reem asks you to be co-host · You'd help run the stage · you can say no" with **Not now / Accept**. Not now = you stay on stage as a normal speaker, the host is told, and you aren't asked again in that room.
- **Running the room also needs your yes:** when the host has to step away, a banner asks "Reem needs to step away · Run the room until they're back?" with **Not now / Run the room**. Not now = the host stays in charge.
- **Host side, same rule:** Make co-host now sends a request ("You asked Tunde to be co-host"; the button shows "Asked"), and the person becomes co-host only after they accept ("Tunde accepted · now co-host 👑"). Removing a co-host is still instant.
- Only one of these banners shows at a time (a raised-hand request waits until you've answered), so the chat stays readable. Translated in all 8 languages.
- Real app: the server stores the co-host request and only changes the role when the person accepts.
- Also fixed: starting a call could leave an older room screen underneath it (found by the crowd test: room → tap someone → Message → video call). Every room screen is now cleared when a call starts. The "Rose" gift name was still in English in Spanish, Japanese, Arabic and others; now translated.
- The share sheet button "More" is now "More apps" (it was translated as "a larger amount" in Japanese and Arabic), and "Send (2)" is translated in every language.

## Room buttons, new pop-up messages and separate accounts (decided 7 Nov 2026, beta v53)
**Room buttons never cover the chat**
- The raised-hand (Go up / Raised / On stage) and Plus buttons no longer float over the chat. They now sit in a slim row just above the comment box, on the end of the quick-replies row (which scrolls and fades at the edge). If the quick replies are hidden, the row holds only these buttons. Replaces the "floating buttons" in the v49 and Rooms-tab sections.
**Pop-up messages (toasts) redesigned**
- The big white centred card ("You're on stage. Your mic is off: tap the mic to talk.") is replaced by a compact dark frosted capsule like iPhone's own system notices: a small coloured icon that matches the message (mic, warning, gift, crown, check, wifi…), a short bold first line and the rest in a lighter second line ("You're on stage" / "Your mic is off: tap the mic to talk").
- **Position:** just above the bottom bar (tab bar, message box or comment box), so they never cover titles, names or buttons at the top. With a sheet open they sit just above the sheet; on the welcome and sign-up screens they stay at the top.
**Several accounts on one phone (found by signing up 5 accounts on one phone)**
- Bugs fixed: a second account inherited the first one's coins, Diamonds, Plus plan, follows, Flicks and blocked list; "Use another account" logged straight back into the same account; "Try the demo" opened the last real account; checking the SMS code twice (auto-check + Verify) crashed.
- Now: each account keeps its own data on the phone, saved when you log out (messages only if chat backup is on). **Create account** starts a truly new account: 0 coins (the tour still gives +50), Standard plan, nothing followed, no Flicks, no chats, no demo notifications, room level 1. **Use another account** with Google/Apple/phone opens the account that uses that log-in; if more than one account on this phone uses it, a **Choose an account** screen lists them; if none, the "Approve on your other phone" step as before. **Continue as** opens the last account. **Try the demo** is always the separate demo account.
- New accounts no longer show demo numbers: Following was "86 + …", "In a room now" counted every teacher as a friend, Profile views showed a fake chart and viewers ("No views yet · Post a Flick or join a room so people find you"), "+ 86 more" under Following.
- Also fixed: the "Turn on notifications?" sheet could pop up on the welcome screen after logging out; "No one here yet" was English in other languages; the Profile views and This week day letters (M T W…) now follow the app language; the Chats title no longer cuts to "Discussi…" in French.
- Real app: accounts live on the server; the phone only remembers which accounts were used on it for the "Continue as" card and the chooser.

## Report a problem (decided 7 Nov 2026, beta v54)
- **Settings → Report a problem** (bug icon, next to Help & safety centre; also Help & safety centre → Get help → Report a problem). One page:
  - **What kind of problem?** Something doesn't work · Looks wrong · Too slow · Wrong translation · Other.
  - **Where did it happen?** Chats · Connect · Flicks · Rooms · Me · Calls · Sign-up · Somewhere else (pre-selected from the screen you came from).
  - **What happened?** free text (up to 1,000 characters). **Send report** stays disabled until a kind is picked and a few words are written.
  - **Include technical details** (on by default, can be switched off): app version, screen size, app language, look, plan and the last 10 buttons tapped. Never messages, photos or contacts.
  - **Your reports** list with a status: Sent to the team · Saved on this phone (sends later) · Fixed · thank you! A tester also gets "One of your reports was fixed" when the team marks it fixed.
- **Reports from testers** (only the beta's owner sees this row in Settings): every report with kind, place, time, text, who sent it, the technical details and last taps, and **Mark as fixed / not fixed**.
- How it works in the beta: reports go into the beta page's own private database. Each tester can only write and read their own reports; only the owner (and Editors) can read them all. People who opened the beta as view-only can't write to it, so their reports stay "Saved on this phone": to receive reports, share the beta with testers as **Contributors**. Claude can also read the reports when asked ("fix what testers reported").
- Real app: reports go to the admin dashboard's support queue (with an optional screenshot), and testers get the status update as a notification.

## Typed text never disappears (decided 7 Nov 2026, beta v55)
- Bug (founder's screenshot): on "Hi! Who are you?", typing a display name and then tapping a suggested username wiped the name. The birthday also jumped back to 14 Mar 1999 whenever the screen redrew.
- Same bug found elsewhere by a new check (type in every box on every screen, then redraw): the **Open room title** was wiped when you then picked a language, mode or other option; in **Settings → Account**, typing a username wiped a name or city you'd just edited; the **chat message** you were typing was lost while a sheet (e.g. a poll) was open.
- Fix, once for the whole app: when the screen redraws, every box you've typed in keeps its text, unless the app deliberately changes it (message box emptied after sending, city cleared when you change country, search × button). Name, birthday and city on sign-up are also saved as you type, so going back a step keeps them.
- Rule for the real app: form fields hold their own state (SwiftUI @State / @Binding); never rebuild a form from saved data while the person is typing.

## Seeing the conversation while typing (decided 7 Nov 2026, beta v56)
- Bug (founder's screenshots): in a new group chat, tapping the message box hid the whole conversation and the header; you couldn't see what people said while writing. Two causes: (1) messages started at the top of the chat area, so a short conversation sat far above the message box; (2) inside the Claude app on iPhone the keyboard pushes the whole page up, so the top (header + first messages) slid out of view.
- Fixes:
  - **Messages sit at the bottom**, just above the message box (like WhatsApp/iMessage), in 1-to-1 chats and groups; long chats still scroll and open at the newest message.
  - **When the keyboard pushes the page up**, the app shrinks to the part still visible: header at the top, conversation in the middle, message box just above the keyboard. Same in chats, groups, talk rooms and live rooms, and Flick comments.
  - **Rooms while typing:** with the keyboard open, the room hides the extras (listeners row, subtitles line, game card, rules notice, quick replies, Mode row) and shrinks the seats, so the room chat gets the space; everything comes back when the keyboard closes.
  - Room and live chats now also stay at the latest message when the keyboard opens (a helper pointed at the wrong chat names and did nothing).
- Checked with a simulated keyboard in both ways iPhones behave (screen shrinks / page pushed up): header visible, message box above the keyboard, latest message visible, in chat, group, talk room and live room. Not testable here on a real iPhone keyboard: please try it on the phone.
- Real app (SwiftUI): use the keyboard-safe area (`.safeAreaInset(edge: .bottom)` for the composer, `ScrollViewReader` to keep the newest message in view, `defaultScrollAnchor(.bottom)`).

## Bug hunt and smoothness pass (beta v57, 7 Nov 2026)
No tester reports had arrived yet in "Report a problem", so this round started from automatic checks: a robot tapped every button on every screen (about 1,000 taps), then journeys done well and done badly, in 8 languages, on phones 320–430 px wide, light and dark.
**Buttons**
- **Reset demo crashed** (Settings → Reset demo). Fixed.
- **Fast double taps:** tapping something twice quickly could open two pages, or land the second tap on the page that just opened. Now, for a moment after a page or sheet opens, extra taps are ignored (like iPhone during a transition). Checked on 41 links in every tab.
- **Swipe-back that also tapped:** after swiping back, lifting the finger could "tap" whatever was underneath (on a sound page it opened Flicks and lost your place). Swipes never count as taps now.
- **Drags that ended off the edge:** dragging a sheet down past the bottom of the screen (or swiping a banner, the minimised room card, a chat row, swipe-back, the whiteboard) and lifting the finger off the edge left it half-moved. They now always finish.
- Checked: all 54 sheets close with ×/Cancel/Not now **and** by dragging down; swipe-back works on 22 kinds of pages (left edge, right edge in Arabic).
- Flicks top tabs (Following / For you / Learn) have a 44 px tap area even when the word is short (Arabic "For you").
- Old links to a settings page that doesn't exist open Settings instead of an error.
- The gift sheet no longer fails if the person you were gifting has left (after reopening the app, or tapping Gift then leaving the room): it picks someone still on stage, or closes.
**Keyboard and typing**
- **Forms kept the box you type in behind the keyboard** on small phones (Open room, Report a problem, Settings → Account, sign-up, posting a Flick, Flick comments). Now the box you're typing in is always scrolled into view above the keyboard, in both iPhone keyboard behaviours, on SE and big phones.
- **Sheet titles stay at the top** while you scroll a sheet (like iPhone sheets), so the × and title stay visible with the keyboard open.
- Checked: Return sends in chats, groups, rooms, lives and comments and keeps the keyboard open; Return in a title closes the keyboard; Return in long texts (room notice, report) makes a new line. Text you're typing survives an incoming notification, a call (accept → end → your draft is still there), and closing a Flick with "Keep editing".
**Accounts**
- Several accounts on one phone re-checked (Google, Apple, phone; log out, switch, restart): nothing leaks, new accounts show no demo numbers.
**Looks and languages**
- **French now always says "tu"** (35 texts still said "vous": room tasks, My languages, co-host request, sign-up errors…). Apple's own pop-ups keep their wording.
- Translated the **correction sheet** ("Their message", "Your correction", "Why? (optional)", "Send correction", "Correct Camille") and the demo photo-picker note in all languages.
- **Red text in dark mode is slightly brighter** (#FF4651) so small red words (active tab, "View full profile ›", links) are easy to read; red buttons keep the brand red. The grey "Mute" swipe button is darker so its white text reads well.
**Smoothness**
- Every redraw used to measure every box on the screen (to keep sideways rows in place) and re-measure the 5 tab labels. Now it only looks at rows that can scroll sideways, and the tab labels are measured once per language and screen size. Looping animations are only re-synced when one was running.
- Speed on a phone 6× slower than normal (time to do the action and lay out the screen, median of 9): posting a Flick 277 → 229 ms (≈412 → 360 ms of total work); every other action 50–120 ms (about 10–20 ms on a real phone), within run-to-run noise of before.
**Rule for the real app:** a tap during a page transition is ignored; a swipe never ends as a tap; drags finish even if the finger leaves the screen; the focused field is always above the keyboard (SwiftUI does this with the keyboard safe area; check every form on iPhone SE).

- **Flag badges fit their circle (7 Nov 2026):** on iPhone the flag is an emoji (a rectangle), which spilled over the round badge on room cards and avatars. It is now cropped to the circle and sized to fill it, everywhere a profile photo shows a flag.

## Subtitles fixed (8 Nov 2026, beta v57)
- Bug (founder): subtitles didn't work. Three causes:
  1. **Talk rooms hid the subtitle line on most iPhones.** The compact room layout (used when the chat would be short, i.e. phones up to 390×844) switched subtitles off to save space. They now always show when CC is on: a slim box, and on the smallest phones one line for the speaker and one for the translation (cut with … if long). Seats shrink a bit more on iPhone SE to keep room for the chat. Subtitles only hide while the keyboard is open.
  2. **Live rooms had no CC button**, so you couldn't turn subtitles on or off there. A small **CC** chip now sits next to ● LIVE · viewers · language (white when on; gold crown for Standard, which opens "Live subtitles is a Plus feature").
  3. **Allowing AI helpers turned subtitles straight back off:** a Plus user who hadn't allowed AI helpers tapped CC → "Allow AI helpers" → subtitles came on and the same tap then switched them off. Now they stay on ("Subtitles on").
- Also fixed: when the room switched to its compact layout, the room chat stayed on the oldest message with the newest one cut off. Chats, rooms and lives now keep the newest message in view whenever their area changes size, unless you've scrolled up to read older messages.
- Checked: Plus / Standard × AI allowed / not × talk room, live room, 1-to-1 call × small and big phones.

## Who follows you is real (8 Nov 2026, beta v57)
- Bug (founder): following Camille said "You follow each other now" although she hadn't followed back. Cause: the beta had one fixed list of 5 people who "follow you" (made for the demo) and used it for **every** account, including brand-new ones; a new account's Followers page also listed everyone.
- Now each account has its own followers: the demo keeps its sample followers, a new account starts with nobody. Following someone who doesn't follow you says **"You're now following · Their Flicks show in Following once they follow you back"**; only a real mutual follow says **"You follow each other · Their Flicks now show in Following"**. Profiles show a small grey **"Follows you"** tag when that person follows you.
- Writing fixes: pop-up messages always start their second line with a capital letter; French no longer guesses the person is male ("quand elle/il te suivra" → "cette personne… quand elle te suivra aussi"); language names inside sentences are lowercase in French, Spanish, Portuguese and Italian ("Parle français", "Apprend : anglais B1", "Habla francés"; German keeps capitals as its grammar requires). On small phones the profile's "Abonnés / Abonnements" labels no longer run into each other.
- Real app: followers come from the `follows` table on the server; "Follows you" = a row from them to you.

## Boosts cost coins, with gentle nudges (decided 8 Nov 2026, beta v57)
- **Replaces "Plus gets 1 free boost a month, Infinity 3"** (sections 7 Plans table and Boosts rules). Founder: boosts should be paid with coins, like HelloTalk.
- **Free boosts now only come from two places:**
  1. **Welcome boost:** the first time an account gets Plus or Infinity, it gets **one free 30-minute boost, once ever** (Profile, Flick or Talk room). Cancelling and buying again doesn't give another. After that, every boost costs coins.
  2. **Room check-in reward:** day 7 of the room check-in streak gives a free 15-min boost, **for Talk rooms only** (to push people to open rooms). It can't be used on Profile or Flick boosts.
- Plans table row is now "Boosts · Coins · First one free · First one free". Plus sales copy says "a free first boost" (all 8 languages).
- **One-tap top-up:** if you don't have enough coins, the boost sheet shows "You have 120 coins" and **Top up and boost · 310 coins · £3.99** (the smallest pack that covers it, local price). Paying with Apple adds the coins and starts the boost straight away. "Other coin packs" opens the Wallet. Standard users who've never had Plus also see "Plus: your first boost is free".
- **Boost results:** when a boost ends, a banner says what it brought ("Your boost ended · +40 profile views · Tap to boost again"; also likes on your Flick, listeners or viewers joined). Tapping boosts again. It's also kept in Activity. Only shown if the boost brought something.
- **Gentle nudges, at most once a day each, never during a call or the tour:**
  - right after posting a Flick: "Want more people to see it? · Boost your Flick for 1 h · 150 coins" (or "Your first boost is free"); tap → the boost sheet.
  - a Standard host's room or live at 10 minutes left: "Want longer rooms? · Plus rooms last up to 6 hours" (lives: 4 hours); tap → Plans.
  - the existing "No one here yet · Boost" card in a quiet room stays.
- Also fixed: the boost sheet's descriptions, "Shown with a Boosted tag…", "15 minutes" and the Room/Live boost names were English in every language; now translated.
- Real app: the welcome boost and check-in rewards are granted and checked on the server; boost results come from real analytics (views, likes, joins during the boost window).

## Sheets never replay or jump when you tap inside them (8 Nov 2026, beta v57)
- Bug (founder's screen recording, Photo Flick editor): after scrolling down to the caption, every tap inside the sheet (a photo, French/English, Beginner/Intermediate/Advanced) or closing the keyboard made the whole sheet slide up again as if it was opening for the first time, and it jumped back to the top.
- Cause: every redraw threw the open sheet away and built a brand-new one, even when only one chip changed. The new sheet started at the top, and on iPhone Safari rebuilt its blurred background too, which looked like the sheet opening again. The earlier fix (v37, "an overlay only animates the first time") stopped the animation in Chrome, but the sheet was still rebuilt, so the scroll position was lost and the iPhone redrew it.
- Fix, once for the whole app: when the same sheet is still open after a redraw, the app **keeps that sheet** and only swaps its contents. Its scroll position, its finished opening animation and its blurred background stay exactly as they were. Any other scroll area inside a sheet or page (lists, grids) also keeps its position. A sheet only animates when it first opens, when a different sheet replaces it, or when it closes.
- Same bug found in other sheets by the new test: comments (switching Comments/Corrections, liking, replying), Add sound, the chat "+" menu, and the video/slideshow/text Flick editors.
- New test (`t88`): opens 33 sheets and pages (every sheet reachable from a button, the 4 Flick editors, Add sound, gifts, comments, boost, Open room, My languages, Report a problem, Edit profile, settings pages, search, lessons, wallet, Plans, room level…), scrolls partway down, then taps around inside like a person (226 taps). It fails if a sheet is rebuilt, re-animates, or loses its scroll position, on iPhone SE and big phone sizes, with the keyboard open and closed. It was checked against the old version and does catch the bug.
- Not testable here: Safari's own engine (iPhone). Please check on the phone.
- Rule for the real app (SwiftUI): a sheet is one view with its own state; changing a choice inside it updates that choice only. Never re-present a sheet (.sheet item identity must stay the same) to change what's inside it.

## Typing in a room, like HelloTalk (decided 8 Nov 2026, beta v57)
- Founder: when typing in a Talk room, you must still see who's in the room, like HelloTalk. On the iPhone the room scrolled up behind the top bar: only the chat and the comment box were left.
- Causes: (1) inside the Claude app on iPhone, the keyboard makes the whole beta window shorter, a third keyboard behaviour the app didn't detect, so the room stayed full size and the phone scrolled it up to reach the comment box; (2) the v56 "typing mode" hid the listeners row on purpose.
- **Replaces the v56 "Rooms while typing" rule.** Now, as soon as you tap the comment box in a Talk room (whatever the keyboard does), the room switches to a compact typing layout, top to bottom: room title and buttons · the seats (smaller) · the listeners row (who's in the room) · the latest messages, right above the comment box. Hidden while typing: quick replies and Go up/Plus row, game card, room rules, subtitles line, Mode row. On iPhone SE size the empty numbered seats also hide (only the people on stage show, on one row) so a few chat lines stay visible. Everything comes back when the keyboard closes.
- The room can't be scrolled up behind the top bar while you type, and the comment bar loses its home-bar gap while the keyboard covers it.
- Live rooms checked too: host, Leave, viewer count and the comment box stay visible while typing.
- New test (`t89`): Talk and Live rooms × the 3 keyboard behaviours (screen shrinks, page pushed up, window gets shorter) × iPhone SE / 8 / 14 / Pro Max sizes: title, seats, listeners and the comment box must all be on screen, the chat at least 60 px and at its latest message.
- Real app (SwiftUI): the room is one VStack; the comment bar uses the keyboard safe area; when the text field is focused, collapse the extras and keep the stage + listeners pinned at the top (never inside the scroll view).

- **Correction (8 Nov 2026, founder):** making room chat messages sit at the bottom left an empty gap under the game card when the keyboard is closed. Reverted: room chat is back to normal (messages start under the stage). Only the typing layout changed.
- **The real cause of "I can't see who's in the room while typing":** inside the Claude app on iPhone, when the keyboard opens the app slides the whole beta up behind its top bar **without telling the beta**, so none of the keyboard checks fired. The beta now measures how much of its top is really hidden (a full-height invisible marker watched by the browser's visibility tracker) and moves the room into the part you can see: title and buttons, seats, listeners, latest messages and the comment box, all above the keyboard. It adjusts within 50 ms.
- New test (`t90`): puts the beta inside an outer page like the Claude app, opens the keyboard and slides the beta up by the keyboard height without any signal, on iPhone SE / 14 / Pro Max sizes. The title, seats, listeners and comment box must be in the visible part. The previous version fails it exactly like the founder's screenshot.

## Typing in a talk room — stage stays visible (blind mode)
- On the real iPhone the Claude app slides the whole beta up when the keyboard opens and tells the page nothing. So the page can't "see" the keyboard.
- Fix: when you tap the comment box in a room, the room is stacked from the bottom: seats and listeners, then a short strip of the latest messages, then the comment box. Whatever part slides out of view at the top is only the empty space, so the stage stays visible above the keyboard, like HelloTalk.
- Small phones / full stages: the title hides and the seats sit on one row you can swipe sideways.
- Test: t91 (4 phone sizes × plain/game/full room).

## Typing in a room: even sizes, keyboard stays open, smooth (decided 8 Nov 2026, beta v57)
- Founder (iPhone screenshot): the stage now showed while typing, but it looked buggy (title cut at the start, seats and listeners tiny next to the chat, "Cami…"), and sliding the chat closed the keyboard and wasn't smooth.
- **Even sizes while typing in a Talk room:** the title stops sliding and starts at its first letter, ending with "…" if too long. Seats sit on one row (sideways scroll if there are more than 4) at a set size close to the chat photos (seat photos ~42 px, names 12 px), and the listeners row stays at its normal size (30 px photos, names 11 px) instead of being shrunk. Names are no longer cut when there's room.
- If space is short, the room steps down in a fixed order instead of shrinking everything: 1 listener names hide (photos stay) · 2 seats and listeners share one sideways row, separated by a thin line · 3 (only if still too short, e.g. iPhone SE inside the Claude app) the title row hides.
- **Sliding a chat or list never closes the keyboard any more** (replaces the 31 Oct rule "sliding the conversation closes the keyboard (like iMessage)"): everywhere (chats, groups, rooms, lives, comments, forms, search). The keyboard closes when you **tap outside the text box** (empty space, a message, a button elsewhere). Tapping send, emoji or quick replies keeps it open.
- **Nothing changes size while you scroll or when new messages arrive:** the room picks its typing layout once and keeps it; before, every redraw showed one frame of the full layout, and every screen movement recalculated the layout.
- **Opening and closing the keyboard glides:** the stage, chat and comment box slide to their new places in about a quarter of a second and the hidden parts fade back in (off with Reduce Motion).
- Tests: `t92` (Talk rooms: plain / game / full stage × iPhone SE / 8 / 14 / Pro Max × English, French, Arabic: title, sizes, names, no change while scrolling, drag keeps keyboard, tap outside closes, glide back; the previous version fails 8 of these checks) and `t93` (chat, group, live, room, comments, Open room, Report a problem, search, Settings → Account, Photo Flick: drag keeps keyboard, nothing changes size, tap outside closes).
- Not testable here: the real iPhone keyboard. Please check on the phone.
- Real app (SwiftUI): `.scrollDismissesKeyboard(.never)` on chats and lists, plus a tap gesture outside the field to dismiss; keep the room's stage in a fixed header with set sizes (no scaling); animate keyboard changes with the keyboard's own animation.

## Room overlap and chat gap fixed (8 Nov 2026, beta v57)
- Founder (iPhone screenshots): (1) typing in a Talk room, the listeners' photos and names were drawn on top of each other, with an empty band under the stage; (2) in a chat with only a couple of messages there was a big empty space above them.
- (1) The overlap came from the step that put seats and listeners on **one sideways row**: iPhone Safari lays that row out differently from Chrome (it can't be tested here). That step is **removed**. When space is short the room now keeps two simple rows: smaller seats (photos ~31 px, names 11 px), then the listeners' photos (~26 px, no names). The order is now: 1 listener names hide · 2 seats a bit smaller, padding tighter · 3 (only if still too short) the title row hides. Rule: no nested sideways-scrolling rows in the typing layout.
- (2) Since v56 messages were pinned to the bottom of the chat (so they'd stay visible while typing), which left an empty space above a short conversation. Now **messages start right under the header**, and only move down next to the message box **while you're typing** (so the latest ones stay above the keyboard). Same in group chats. Long chats still open at the newest message.
- New test `t94` (short 1-to-1 and group chat, iPhone SE and 14: no space above when the keyboard is closed, messages just above the box while typing); it fails on the previous version.

## Daily room time (decided 8 Nov 2026, beta v57)
- **Replaces** the per-room lengths (sections 6 and 7: "Free voice room 2h / Plus 6h", Live "1h, max 2h (Plus 4h)", the Plans row "Voice rooms 2h / 6h", and the "How long" choice on Open room).
- **Standard: 3 hours of rooms a day.** Talk rooms and Live rooms share the same 3 hours (founder didn't pick between shared / separate / talk-only, so the recommended "shared" was used; easy to change). **Plus and Infinity: no time limit** (founder: "Plus should be no limit as well").
- **The time carries over through the day:** close a room after 1 hour, open another later, it starts with 2 hours left. Time only runs while one of your rooms is open (also while a co-host runs it for you). **At midnight it's back to 3 hours.**
- **Open room screen:** "How long" is removed. Standard sees "Room time today · 2 h 15 min" with "Talk and live rooms share 3 hours a day. Your time comes back at midnight." and a gold-crown "Plus: no time limit" link; Plus/Infinity see "Room time · No limit". With no time left it says "Used up" and the room doesn't open ("You've used today's 3 hours of rooms · More at midnight · Plus has no time limit", plus a gentle Plus notice at most once a day).
- **Clock for the host and co-host** (not listeners): a small clock chip in the room header (first in the row under the title; in Live rooms next to the title) counting down "2:14:59", turning red under 10 minutes. Plus/Infinity hosts have no clock. If a Standard host gets Plus during a room, the clock disappears.
- **When the time runs out:** warnings at 10 and 2 minutes as before (chat line + toast, and at 10 min a gentle "Plus rooms have no time limit" notice), then the room ends: "Time's up · your room has ended" + "You've used today's 3 hours of rooms · More at midnight".
- Plans table: "Room time · 3 h a day · 6 on stage / No limit · 10 on stage / No limit · 10 on stage". Plus copy now says "rooms with no time limit" instead of "6-hour rooms". All in 8 languages.
- New test `t95` (English 390 px and French 320 px): no How long, today's time shown, host clock, time kept after closing and reopening, Live rooms share it, red under 10 min, 10/2-min warnings, room ends at 0, can't open when used up, back to 3 h after midnight, Plus no limit and no clock, upgrade mid-room removes the clock, listener has no clock, co-host has one.
- Real app: the server keeps each account's `room_seconds_used` per day in the user's own time zone (midnight local), counts time from LiveKit room open/close events, ends the room when the time runs out, and is the only source of truth (the app's clock is display only).

## Teacher accounts and separate apps (advice, 8 Nov 2026, not built)
- Founder asked whether to have separate apps for teachers, admin and customers. Advice given: **one app for learners and teachers** (one codebase, a server-checked "Teacher" role; fewer bugs than two copies, avoids Apple's duplicate-app rule 4.3, teachers also learn) + **admin stays a separate website** (already planned, Next.js).
- Suggested teacher flow: "Create a teacher account" at sign-up → "Teacher · under review" with Standard features → approved in the admin site (ID + teaching check) → teacher perks (no room time limit, paid lessons, blue tick). Never give Infinity just for ticking "teacher". Waiting for the founder's go-ahead before adding it to the beta.

## Teacher accounts, language at sign-up, weekly Plus (decided 9 Nov 2026, beta v57)
**Teacher sign-up (founder: "their sign in process must be very complete and proper", payouts via Stripe)**
- Join page: a card "Do you teach a language? · Sign up as a teacher and give paid lessons" switches the page to teacher mode ("As a teacher" tag, what teachers get: paid lessons, teacher badge, safe payouts with Stripe; "Not a teacher?" switches back). Teacher sign-up has **13 steps** instead of 8.
- Steps 2–7 as for everyone (name, country, languages, interests, photo). **Intro video is required for teachers** (students watch it before booking).
- Teacher steps: **What do you teach?** (1–3 languages you speak natively or at C1–C2, levels A1–C2, lesson types: Conversation, Grammar, Pronunciation, Exam prep, Business, Beginners from zero) → **Your teaching experience** (years, qualifications incl. CELTA/TEFL/TESOL, DELF/DALF examiner, teaching licence, "None yet"; optional certificate photo; teacher bio, 60–500 characters) → **Confirm it's you** (Stripe Identity: passport / ID card / driving licence + selfie; TalkAmigo only gets "verified") → **Get paid** (Stripe Connect Express: legal name, date of birth, address, IBAN, checked format; TalkAmigo never sees bank details) → **The teacher promise** (5 ticks: really teach what I chose; lessons only on TalkAmigo, never paid outside the app; kind + community guidelines; responsible for declaring earnings; Teacher Terms + Stripe payout terms) → Send my application.
- After sending: **"Teacher · under review"** (Standard features only) with a card on Me. In the beta, approval comes automatically ~15 s later (after the tour); in the real app our team approves it in the admin site (ID, payouts, experience).
- **Approved teachers:** blue **✓ Teacher** badge next to their name (Me, Flicks profile, Open room); Settings shows the plan as "Teacher"; Plans page shows "Your teacher account · every feature is included … Nothing to buy". **Internally they have every Infinity feature** (no room time limit, who viewed you, private rooms, HD lives, no promos…), but the word Infinity is never shown to them (founder: they must think it's because of the teacher badge).
- **Teacher tools** card on Me: "Paid lesson now" (opens Open room with **Paid lesson** switched on + level Beginner/Intermediate/Advanced → the room becomes a teacher room students pay to join) and "Plan a lesson" (title, day in the next 7 days, time, length 30/45/60, seats 6/10/20, level, talk or live). Planned lessons appear in Lessons → Schedule like other teachers'; opening your own shows "Your lesson · 0/10 seats reserved". Payout account shown as "FR •••• 0189".
- Real app: teacher application stored on the server (`teacher_profiles`), Stripe Identity + Stripe Connect Express (hosted pages, webhooks `identity.verification_session.verified`, `account.updated` with `payouts_enabled`), status `review → approved / rejected` set by the admin team; teacher perks enforced on the server by role, not by an Infinity purchase.

**Language at sign-up (founder: sign-up must be in the phone's language so people understand everything)**
- Welcome, log-in and all sign-up steps **always use the phone's language**. The 🌐 button on Welcome now chooses the **app language for after sign-up** (the button shows it; the sheet explains "Sign-up stays in your phone's language … After that, TalkAmigo uses the language you pick here"). The Join page says "Sign-up is in your phone's language. Inside the app: Español · change it any time in Settings."
- Why the founder saw English on a French phone: the account had English chosen as its app language, and the Welcome screen used to follow it. (Inside the Claude app, the beta can only read the language the Claude app reports; the real iPhone app reads the phone's language directly.)
- Also fixed: the empty Following tab ("When you and someone follow each other…") stayed in English, because it reused the style of people's own text Flicks, which are never auto-translated.

**Weekly Plus:** €2.99 a week (product `plus_weekly`), next to Monthly €9.99 and Yearly €79.99, with the Apple sheet ("Weekly · renews automatically"), renewal text and Manage subscription in all 8 languages. Plans table now has separate rows "Room time" (3 h a day / No limit / No limit) and "On stage" (6 / 10 / 10).
- New test `t96` (French 320 px and English 390 px): language rule, full teacher sign-up incl. every "can't skip" check (video, bio length, ID, payouts, bad IBAN, promise), review, approval, badge, no "Infinity" anywhere for teachers, paid lesson room, planned lesson in the schedule, weekly Plus.

## "Plan for later" is a tick box (decided 9 Nov 2026, beta v57)
- Founder: the "Schedule" / "Plan for later" text link on Open room wasn't noticeable. It's now a **tick box "Plan for later"** under "Also show on Flicks", same style.
- Ticking it slides in a **When** card at the top of the form: time picker + the next 7 days (Today, Tue 10…), with "Your followers get a reminder, and you get one when it's time to open it." The big button becomes **Plan talk room / Plan live room** (teachers with Paid lesson on: **Plan lesson**). A time in the past is refused.
- A planned room shows on the Rooms page (Talk or Live) under **Planned by you**: day + time, title, language, **Open now** and × to cancel. At the planned time you get a notification "Time for your talk room “…” · tap to open it" that opens it straight away (if quiet hours are on, the reminder waits until they end; the card says "It's time"). Opening uses your room time for that day as usual.
- Teachers' paid lessons planned this way go into Lessons → Schedule (same as Teacher tools → Plan a lesson).
- New test `t97` (English 390, French 320, Arabic 360; talk and live rooms): tick box visible, When card, button text, past time refused, planned card on Rooms, not opened early, reminder opens it, cancel works, teacher lesson planned into the schedule.
- Real app: planned rooms are stored on the server with the host's time zone; push reminders to the host and followers are sent by the server at the planned time.

## Full bug hunt + polish pass, all 8 languages (9 Nov 2026, beta v71)
Founder's prompt: focus on everything, zero language mistakes in every language, fix every bug, add effects where they help.
**How it was checked (new tools, re-run after big changes)**
- `t98` language crawler: every page (2 links deep from every tab and sub-tab) and every sheet, in all 7 non-English languages × 3 accounts (demo, brand-new, approved teacher), compared with English. Flags app text left in English (visible text AND the labels VoiceOver reads), and any Latin word in Japanese/Arabic that isn't a name or brand. People's own words (names, room titles, messages, captions, bios, notices) are skipped.
- `t99` static check: every fixed pop-up text in the code must have a translation in every language.
- `t100` tap-every-button robot (~800–970 taps per run: fr 390, ar 320, de 375): JS errors, pop-ups/banners left in English. `t103` re-checks every button the robot thought "did nothing" from a clean page load (110 checked, all work).
- `t101` money test: 220 random money actions per run (gifts, boosts, packs, Diamonds→coins, cash-outs, Plus) + special cases.
- `t102` layout sweep at 320 px in de / fr / pt / ar / ja: overlapping text, app text cut with "…", things off the edge, sideways scrolling.
- Screenshots read by hand in ja, ar, fr, de (main screens, sign-up, small phones).
**Bugs fixed (what you'd notice)**
- **Gifts of 1,000+ coins (Rocket, Crown) could never be sent**: after Face ID it went back to "Are you sure?" in a loop. Fixed.
- **The daily gift limit never reset**: after 20,000 coins of gifts in total you could never gift again. Now it starts again every day, and a cancelled Face ID no longer counts against it.
- You can no longer pick yourself as a gift recipient.
- Chats list on small phones: the "✓ Official" pill pushed names off and the time of group rows went past the edge. Names now shorten with "…", times stay visible, "Official" becomes a ✓ badge under 360 px.
- Arabic live room header cut the host's name from the wrong end ("…ille").
- Sign-up / Settings username box overflowed the screen on 320 px phones.
- Arabic day strips (lessons, Plan for later) squeezed long weekday names together: now the short everyday names.
**Languages**
- Everything VoiceOver reads (button labels, flags, "Follow Camille", "Flick by Kenji"…) was English in every language: now translated (country names localised too).
- Numbers, prices and short counts follow each language: 1 208 (fr), 1.208 (de), 8,99 £ (fr/de), "1,3 k"; pound/dollar signs are just £ / $ (no "UK£" / "£GB"); Arabic keeps Western digits.
- ~70 more texts translated (pop-ups like "Comment posted", "Profile saved", "Enter a valid phone number"; Chat backup page; club page; Wallet "Nothing yet"; "Say hi to Camille! They speak…"; close friends; frames; linked accounts; intro video; blocked; gift received…).
- One word per idea in each language: talk rooms are always "salon de parole" (fr), "sala de charla" (es), "sala de conversa" (pt), "Talk-Raum" (de), "stanza di conversazione" (it), "トークルーム" (ja), "غرفة الحديث" (ar); German coins always "Münzen".
- French "tu" everywhere (7 more "vous" fixed); no guessed gender in French, Spanish, Portuguese, Italian or Arabic for other people ("Tu as bloqué Kenji…", "$1 rejoint la scène", "Tu as invité…"; Arabic third-person lines rewritten as neutral phrases).
- Delete account asks you to type the word in your language (SUPPRIMER, LÖSCHEN, 削除, حذف…; DELETE still works).
- Singular forms: "1 seat left", "1 room", "1 person wants to practise with you".
- "Guess the word" hints stay in the room's language (it's the practice), like room titles.
- Round 2: ~45 more VoiceOver labels translated (Comments, Send gift, Close, Room title, Emoji, Group settings, Write a comment…), "Share Kenji's profile" was read as a mix of English and the language: fixed; "Unfollow Camille" translated; minutes/hours in Japanese (45分, 3時間0分) and Arabic (45 د); "Version 0.3 (beta)", Clubs, Corrections, "Optional" translated.
- `t104` checks these (fails on the old version).
- Teachers never see "Infinity" (delete-account sheet fixed).
**Effects added**: new chat / room messages slide in once (never replay on redraw); coin and Diamond balances give a small pop when they change. Both off with Reduce Motion.
**Not testable here**: real iPhone Safari and keyboard.

## Chats lines + talk room cards redesign (9 Nov 2026, beta v72)
Founder asked (with HelloTalk screenshot): a line between people in Messages in the logo's colours for a more organised feel, and a better talk room design before entering, in light and dark. Chosen by the founder: "Soft red line" and "Red edge + glow".
- Chats list: thin soft-red line between rows, starting after the profile photo (like iOS/HelloTalk); deeper red in dark mode; no line under the last row or before a section label; mirrored in Arabic.
- Talk room cards (Rooms tab): white card (dark grey in dark mode) with a red stripe on the side, a soft red glow (stronger for Boosted/Official rooms) and a red "Join" pill (translated: Rejoindre, Unirse, Entrar, Beitreten, Entra, 参加, انضم). The whole card still opens the room, as before. Host name / topic shorten with "…"; on phones under 360 px the small listener faces hide so Join fits.
- Bug fixed on the way: in Arabic, English room titles were cut at the START ("s the word: food…"). Room/live titles now keep their own direction.
- `t105` checks lines, colours, Join, light/dark, 320/390, en/fr/ar (fails on the old version).

## Talk room cards: design C (9 Nov 2026, beta v73)
Founder disliked the red glow of v72 cards; shown 3 mockups (light + dark), picked "C: solid red for featured".
- Boosted and Official talk rooms are solid red cards (red gradient) with white text, white LIVE dot and a white Join button, in light and dark mode.
- Other talk rooms: plain card with the thin red stripe on the side and a red Join button. No glow anywhere.
- Chats red divider lines from v72 unchanged (founder: "perfect").
- t105 updated (checks no glow, featured = red with white Join, others = side stripe).

## Talk room cards: style S4 (9 Nov 2026, beta v74)
Founder disliked v73 (solid red Boosted cards) and the overall style; sent HelloTalk voiceroom screenshots for the feel; shown 2 + 4 mockups (pictures only, nothing built until chosen), picked **S4**.
- Every talk room card: clean card (white / black in dark mode) with a **thin red-to-pink outline** (#E0101F → #FF5C8A). Top row: language chip (black, white in dark), **# topic** chip in red, then Boosted / Official / Plus / Teacher / Your room / co-host tags. Title. Bottom: host photo + flag and name, up to 4 people on stage (small faces) and a round listener count.
- **Boosted = only the small Boosted tag + pinned at the top** (founder). No glow, no solid red, no Join button (tap the card), no LIVE label (every room listed is live).
- Chats red divider lines (v72) unchanged.
- t105 updated for S4 (fails on v73).

## Talk room cards: design A, final (9 Nov 2026, beta v75)
Founder looked at S4 then chose mockup A instead ("even if it is boosted put it the same way, and do not put live"). Replaces v72–v74.
- Every talk room card: white card (dark grey in dark mode), thin soft-red border, **red stripe on the side**, language chip + tags, title, host photo · name · # topic, up to 3 faces on stage, listener count and a red **Join** pill (translated; the whole card opens the room).
- **No glow, no LIVE label. Boosted/Official rooms look exactly like the others**: only the small Boosted / Official tag, and Boosted rooms stay pinned first.
- Under 360 px the small faces hide so Join fits.
- t105 updated (fails on v74 and v73).

## Talk room cards: design 6 "host ring", final (10 Nov 2026, beta v76)
Founder: design A "misses something"; wanted a sign it is live, no red border around the card, no Join; then asked for designs with a red glow but readable in dark mode, and picked **design 6 (host ring)** from 6 mockups. Replaces v72–v75.
- Every talk room card: clean card (white / dark grey), thin grey border, **faint red glow at the bottom** (6% light, 10% dark so text stays readable), **red ring round the host photo**, **small moving red sound bars before the title** (the live sign; still with Reduce Motion).
- No side bar, no LIVE label, no Join button (tap the card). **Boosted/Official look the same as other rooms**: only their small tag; Boosted stay pinned first.
- The small faces on stage show again on small phones (no Join to make room for).
- t105 updated (fails on v75).

## Live rooms, keyboard everywhere, room comments, pages open at the top (13 Nov 2026, beta v78)
Founder (iPhone screenshots, inside the Claude app): Live rooms "don't make sense"; host must be able to bring people up 1-on-1; keyboard bugs everywhere, no arrow to put the keyboard down; Flicks "Add a comment" too low and the keyboard hides it; in talk rooms you can't tap people in the comments to see their profile; the Me tab opened at the bottom.
**Live room (design "Option A" picked from mockups; big gifts kept big as asked)**
- Top is 2 rows: host photo + name + Follow, with language · title under the name; then LIVE · CC (· timer · Diamonds earned for the host). Top gifters moved into the viewers list.
- Bottom buttons have words under them: viewers get Join · Gift · Like; the host gets Invite · Boost · End.
- **Guest (1-on-1, voice only, decided by the founder):** a viewer taps Join → "Join Camille's live?" (voice only, camera stays off, host has to accept, mic starts off) → Ask to join. The host sees "Lucía asks to join your live" with Not now / Accept. The host can also open the viewers list and tap **Invite** next to anyone; the viewer gets "Camille invites you to join the live" with Not now / Join. Nobody joins without saying yes. One guest at a time.
- The guest shows as a round bubble under the top rows (green ring when talking, crossed mic when muted). Host taps the guest → Mute mic · To audience · Remove. The guest can mute themselves or go back to the audience.
- Comments: bigger, with photos; tap a photo or name to open that person's card (Follow, Message, View full profile; for the host: Invite to join).
- Translated: "Camera preview (demo)", "N earned".
- At the start of your own live the first viewers arrive after a few seconds and appear in the viewers list (it said "1 watching" with an empty list).
**Keyboard (all pages)**
- Inside the Claude app on iPhone the keyboard says nothing to the page and covers the bottom. The app now notices this (a touch phone, a text box focused, no keyboard signal) and fits itself into the part above the keyboard, using the keyboard height of that iPhone size. So the box you type in sits right above the keyboard on every page: Live comments, Flick comments, chats, groups, talk rooms, Open room, search, settings, sign-up. Phones that do report the keyboard use their own signal. The app remembers which kind of phone it is.
- **A ⌄ button to put the keyboard down**, everywhere you type: a small round button next to the box (top corner, or the free edge when buttons are in the way), white on dark screens. On forms it says "Done". Tapping it closes the keyboard. Send, emoji and quick replies still keep it open; tapping outside still closes it.
- Room opening/closing the keyboard still glides.
**Flicks**: the "Add a comment or a correction…" bar and the caption sit above the tab bar on every iPhone (they ignored the home-bar space). Comment sheets keep a gap for the home bar.
**Talk rooms**: tapping a person's photo or name in the room comments opens their card (with View full profile).
**Pages open at the right place**: a tab opened from the tab bar, and any page opened fresh, start at the top (the Me tab could open at the bottom because a scroll position was remembered for "Me" and reused). Going back returns where you were; tapping the current tab scrolls to top. One rule for the whole app: every page in the history has its own scroll memory.
**Also fixed**: a long press on a voice message right after the keyboard closed was cancelled (the app's own scroll to the newest message counted as a finger scroll).
Tests: t106 (pages open at top / back keeps place), t107 (⌄/Done button on every form, closes the keyboard), t109 (keyboard that tells the page nothing: box above the keyboard on 7 pages × 3 iPhone sizes, back to normal after), t110 (tap people in room/live comments; live guest: ask, invite, accept first, one guest, mute, to audience; nothing off screen, translated). Each fails on the old version.

## Live split screen, up to 4 people (13 Nov 2026, beta v79)
Founder: "how many people can go on live, 4 is enough, split screen like TikTok: 2 half half, 3 two on top and the third at the bottom, 4 split equally"; the Like button did not fit. Mockup shown and approved; guests stay **voice only** (founder chose "Voice only, photo in tile").
- A live holds the host + **up to 3 guests** (4 on screen). With a guest on, the screen splits: **2** = side by side, **3** = two on top + the third across the bottom, **4** = four equal squares. Host square: red "Host" tag + green outline; guests show their photo, name and a crossed mic when muted.
- Tap a square: host gets Mute mic · To audience · Remove; your own square (as a guest) opens Mic on/off · Back to the audience. Same accept-first rules: viewers ask (Join) or the host invites; nobody joins without yes; mic starts off. When 4 are on: "The live is full · 4 people max".
- Live bottom bar: smaller round buttons (46 px, 42 px on small phones) so Like never touches the edge; the guest mic label is just "Mic" (French "Micro coupé" was cut).
- Real app: LiveKit room with the host video track + up to 3 audio-only guests; 4-person cap in app_config.
- t110 updated (2, 3, 4 layouts, equal squares, 4th guest refused, bottom bar fits; fails on v78). t88 fixed (its marker was removed by the keep-the-typing-box update, not a real rebuild).

## Live: hide comments (13 Nov 2026, beta v80)
Founder: "they need an option to hide comments like Instagram". Mockup shown; founder chose: button only, keep gifts and hearts, only for this live.
- A **Comments** button next to CC in every Live (icon only for the host, and on phones under 360 px). Tap → the comment list disappears, the button turns white "Comments off"; tap again → "Comments are back". Gifts pop-ups and hearts still show; you can still type and send a comment. Comes back on when you open another live.
- Split screen: the comments now stay under the squares (they covered the guests names on a real iPhone).
- Bottom bar labels never run into each other (German on 320 px: "Beitreten / Geschenk / Gefällt mir").
- t111 (fails on v79).

## Flicks: sound label no longer overlaps the comment bar (14 Nov 2026, beta v83)
Founder (iPhone screenshot): on Flicks the sound label ("Café Lo-fi · TalkAmigo Sounds") sat on top of "Add a comment or a correction…".
**Cause**: on iPhones with a home bar, the comment bar is raised by the home-bar gap (34 px) but the caption block above it was not, so they overlapped. Even without the gap, the sound label's invisible tap area reached into the comment bar, so a tap on the bar could open the sound page instead.
**Now**: the caption block (name, tags, caption, Translate, sound label) moves up with the home-bar gap and always keeps a clear space above the comment bar; the sound label's tap area no longer reaches the bar.
- t113: every Flick in 5 languages, 320–430 px, with and without the home-bar gap and with the translation open: caption and side buttons must stay above the comment bar, the bar must open comments, and the keyboard button must not stay on screen afterwards. Fails on v82.

## Rooms round: one ••• menu, room settings, typing like HelloTalk, Lives cleaned up (decided 14 Nov 2026, beta v84)
Founder sent HelloTalk recordings (room settings, keyboard/typing, comment menu, iPhone Mail menu) and picked from mockups (rooms_mock_1–3).
**Talk rooms**
- Top bar = title (+ language / listening) · **top 3 gifters** (tap → gifter ranking, tap a person → their card) · **•••**. No Leave / ⌄ buttons in the bar any more; swiping back still minimises. The gifters left the listeners row.
- **••• opens a floating menu like the iPhone Mail menu (option A)**: three tiles **Share · Minimise · Open a room**, then rows. Host: Room settings · Boost room · End room (red). Co-host: Room settings (mode only) · Leave room. Listener: Report this room · Block [host] · Leave room (red). Same menu in Live rooms (Live settings · Boost live · End live for the host).
- **Room settings (host)**: title, topic, pinned notice (+ Pin), mode (Chat / Music / Whiteboard / Guess the word), co-hosts (2 max, add from people on stage, they must accept, × removes), who can join (Followers/Friends = Plus), seats 4/6/8/10 (more than 6 = Plus), background (level-locked). Save applies everything. Co-hosts can open it but only change the mode.
- **Up to 2 co-hosts** per room (both get the silver crown). A third is refused: "2 co-hosts max · remove one first".
- **Rooms follow light / dark mode** (founder picked A): light = white room, light-grey cards and bubbles, dark text, red for actions; dark = the plum room as before. Chosen backgrounds become a soft tint in light mode.
**Typing in rooms (Talk and Live), like HelloTalk**
- Before typing: comment box + the room buttons (mic, CC, gift / Live: CC, hide comments, Join, gift). **No send button until you type.**
- While typing the bar becomes: emoji · text · @ · translate · send (red). The room buttons step aside.
- **Emoji**: the smiley swaps the keyboard for an emoji panel (the phone's own emojis, so Apple's on iPhone); the keyboard icon brings the keyboard back.
- **@mention**: type @ (or tap @) → people in the room (host, co-host, on stage, listening/watching) → tap to insert. **Holding someone's name** in the chat also inserts @Name. Messages that mention you get a red outline (no notification).
- **Translate before sending**: turns your text into the room's language (in a two-language room, the one you're learning) → Keep mine / Use this.
**Press and hold a room comment** (Talk and Live): the room blurs, the comment lifts, menu **Reply · Translate · Copy · Report** (host/co-host also **Remove comment**). Reply shows a "Reply to …" bar; the sent comment carries a small quote. Translate shows the translation under the comment.
**Live rooms**
- Top: host · viewers · ••• (minimise / close moved into •••). The second row keeps ● LIVE (+ host's time and Diamonds, co-host chip).
- **Likes removed completely** (founder: they gave hosts nothing). The side button is now the Plus "who viewed your profile" eye; Share moved to •••.
- Bottom bar: comment box + **CC · Hide comments · Join (mic) · Gift** in one line, all centred on the comment box (founder: the box sat higher than the buttons). Host: CC · Hide comments · Invite.
- **Modes in Lives**: Chat, Music, Guess the word (no whiteboard over a camera). The card floats over the top of the video.
- **Host chooses the look before going live**: Full screen or Framed (video in a rounded box, comments under it); can change it later in Live settings. Viewers keep all their buttons in both.
- **Live co-hosts (2 max)**: helpers, no camera needed. Host picks them from a person's card ("Make co-host") or Live settings; they must accept. A co-host can remove comments, invite people to join and remove viewers.
- **Boost live** is in the host's ••• (and the "No one here yet" card).
- **Minimised Live = a tall video rectangle** (LIVE tag, ×, host · viewers). Minimised Talk rooms keep the square card.
**Everywhere**
- Tap a person in a room: their card now has **Block** next to Report (also still in •••).
- Every Share sheet for a room or live has **Post to my Flicks**: it appears in your For you feed as a card with Join (tag "Shared by you") while it's open, and disappears when it ends.
- Answers to the founder: "Hide this room/Live" only hides it from your own lists (no one is told); likes in Lives gave nothing, so they were removed.
- Bug found while building: hiding the room buttons with :focus-within made a tap on CC hit nothing (the button disappeared as it got focus). The bar now switches only when the text box itself has focus or has text.
- Tests: t114 (whole round, 9 scenarios), t112 rewritten (no likes, eye on the side, Share in •••), t111 updated (hide-comments button moved to the bottom bar), t54 uses the ••• menu to leave; sim taps Leave/Minimise through •••.
- Real app: the ••• menu = SwiftUI `Menu` with a `ControlGroup` for the three tiles; room settings is a sheet saved on the server (co-host changes need the other person's acceptance); emoji panel replaces the keyboard via a custom input view; mentions are stored as user ids, not names.

## Language card levels in one row again (14 Nov 2026, beta v85)
Founder (iPhone screenshot): on Me, the A1 A2 B1 B2 C1 C2 labels under each language were stacked one under the other.
**Cause**: a name clash. The level labels used the class name "lb2", and the Live room bottom-bar buttons (v80) use the same name with "stack vertically, 50 px wide" rules, which took over.
**Now**: the labels have their own name and sit in one row, left to right, each under its own bar (A1 under the first bar … C2 under the last); the current level is red.
- t115: Me page at 320/393/430 px in German, English and Arabic: 6 labels on one line, each centred under its bar. Fails on v84.

## Sign-up you can understand without scrolling (decided 15 Nov 2026, beta v87)
Founder (iPhone screenshots): "Display name shouldn't be optional" and explanations must sit where people need them, without scrolling. He picked from mockups (signup_mock): birthday = **B (iPhone date wheel)**, levels = **A (level bar right under each language)**, promise = **A (right under the photo)**, plus all four extras.
**What was wrong**
- An empty display name was silently saved as "Sam".
- The birthday came pre-filled (14 Mar 1999), so people could skip their real age.
- "Your levels" and the A1–C2 explanation sat under the long language list; on a small phone the step was ~460 px taller than the screen, and the title got scrolled away (his screenshot).
- On the photo step the required community promise was below the fold; people only learnt about it from an error.
- On small phones the birthday, the country list, interests and the intro video needed scrolling.
**Now**
- **Display name and birthday are required** ("Required" tag). Continue stays greyed with **one short reason line right above it**: "Add your display name" → "Choose an available username" → "Choose your birthday" → ("TalkAmigo is 18+"). Same reason line on every step ("Pick at least one language to learn", "Tick the community promise to continue"…).
- **Name check**: emails, links or phone numbers in the display name are refused with a friendly line.
- **Birthday = iPhone-style wheel** (day · month · year, in the app language), empty until chosen; Done sets it.
- **Username**: rules right under the box; suggestions only appear when the name is taken.
- **Learning step**: each chosen language is a card with its **level bar right under it** and the level **in words** ("A1 · I know a few words" … "C2 · Like a native"); the A1–C2 line sits in the first card. The popular list folds behind "+ Add another language".
- **Photo step**: photo with Choose / Take photo beside it, demo photos, then the **promise tick right under the photo**, then the rules in one short line. Continue/Skip photo only works once the promise is ticked.
- **Every step fits the screen** at 320×470, 375×560 and 393×739 (iPhone SE / small / normal inside the Claude app) in English, French, German and Arabic; long lists scroll inside their own box. Small phones get a tighter layout automatically.
- **Leaving mid sign-up**: reopening the app goes back to the same step with everything filled in.
- **Same rule elsewhere** (sweep): the gift sheet's Send button and Delete account's DELETE box + button stay pinned at the bottom of the sheet; Report a problem's Send button is pinned with its own reason line ("Pick what kind of problem it is"). Room settings, Open room, Boost, Plans and Wallet already showed their main button.
- Tests: t117 (fit at 3 sizes × 4 languages × 8 step states; required name/birthday + reason line; email in name; wheel sets the date; under 18 blocked; level words; add another language; promise required and under the photo; resume after reload; pinned buttons in gift / delete account / report a problem). Fails on v86. t67, t71, t96 updated for the wheel and the promise.
- Real app: SwiftUI `DatePicker(.wheel)` with no default; the reason line is computed from the same validation the server applies; sign-up progress is saved on the account so it resumes on any phone.

## v88 — Keyboard bar on forms + sign-up data for the admin site (15 Nov)
Asked: the floating "Done" covered the "Required" tag when typing; collect simple sign-up data (learners AND teachers) for a separate admin site, to see where users come from.
Founder picked: A (iPhone-style bar on top of the keyboard), forms only; a skippable "How did you find TalkAmigo?"; invite/ad links kept; where people stop recorded; a privacy line; a ready-to-send record (admin site comes later).
- Keyboard: on forms (sign-up, edit profile, settings, teacher application, search…) a full-width bar sits on top of the keyboard: ˄ ˅ move to the previous/next box, "Done" closes the keyboard. It never covers the box being typed in (its list scrolls up if needed). Chat, comment and room bars keep their small keyboard-down icon. On a computer (no on-screen keyboard) nothing is shown.
  How the keyboard top is found: real signal (Safari / Android shrink the screen) → bottom of what's visible; Claude app on iPhone (keyboard says nothing) → screen height minus the usual keyboard height for that iPhone (kbEst), moved by any slide. window.kbTopY(). Tests can fake a keyboard with window.__kbSim=<px>.
- New sign-up screen right after "Where are you from?": "How did you find TalkAmigo?" — TikTok, Instagram, YouTube, A friend, App Store / Google Play, Google search, School or teacher, Other. One tap, button says Skip until something is picked. Privacy line: "Only used to improve TalkAmigo. Never sold. Your name and birthday are never shared." It's a sub-step of step 1 (UI.obSrc), so step numbers in code didn't move; the counter shows one more step (learners 9, teachers 14). Resumes there if the app is closed.
- Invite / ad links: if the app is opened with ?ref= / ?invite= / ?code= / utm_source / utm_medium / utm_campaign / utm_content (in the address or after #), the first one is kept on the phone (localStorage ta_acq) and goes into the record.
- Sign-up record ("for the admin site"): built at every step and at the end (S.signupRec), queued in S.adminOutbox (last 20). When ADMIN_URL (top of the sign-up data code in src.html) is set, records are POSTed there as {"signups":[…]} and removed once the server answers OK. It's empty for now, so nothing leaves the phone.
  Sign-up record fields: v (1), id, created, updated, status (in_progress / finished), lastStep (who, country, found_us, speaks, learns, interests, photo, video, teach, experience, id_check, payouts, teacher_promise, done), accountType (learner / teacher), country (2 letters), city (only if typed), foundVia (tiktok, instagram, youtube, friend, appstore, google, school, other or null), invite {ref, source, medium, campaign, content, at} or null, speaks [languages], learns [{lang, level}], interests, ageGroup (18-24, 25-34, 35-44, 45-54, 55+), signUpWith (apple / google / phone / email), device (iPhone / iPad / Android / Computer), phoneLanguage, timeZone, teacher {teaches, levels, lessonTypes, years, qualifications, idChecked, payoutsReady} or null.
  Never in it: name, username, birthday, email, phone number, photo, ID documents, bank details.
  Europe: the privacy policy must say this is collected (country, age group, how they found us, device) and why. No consent box needed for this kind of first-party use, but if ads/tracking partners are ever added, that needs a cookie/tracking consent screen.
- Tests: t118 (bar on every sign-up box in EN/FR/AR, arrows, Done, lower boxes stay visible, chat keeps its icon, no bar on a computer; found-us screen, skip, back, counter, record contents and privacy, invite link, resume, finished record). t107 updated for the bar.

## v89 — Keyboard bar sat too high in the Claude app (15 Nov)
Founder's iPhone screenshot: the ˄ ˅ Done bar floated about 90 points above the keyboard, over the birthday box.
Cause: in the Claude app the iPhone slides the page up when the keyboard opens and tells the page nothing, so v88's guess (screen minus usual keyboard height) missed the slide.
Fix (window.kbTopY): the iPhone slides the page so the box being typed in sits in the middle of what stays visible (or as low as the page allows). So the keyboard line = middle of the box + half of (screen − keyboard height), never above the old guess and never below the screen. Measured against both founder screenshots: within 6–9 points. If the hidden bottom or the slide can be measured, those win. The box's middle is taken once per focus, before any scrolling.
Test: t118 part A4 (phone-mode browser, no fake keyboard: bar under the box, inside the screen, lower box → lower bar).

## v90 — Paid lives are circles · keyboard the HelloTalk way · comment bars higher · taps after the keyboard (16 Nov)
Founder asked: paid live rooms need something significant (paid talk rooms are circles); keyboard in rooms should pop up like HelloTalk (nothing in the room moves or shrinks); comment bar a bit too low; buttons like Continue not working after typing (video of the country step).
Founder picked (from real screenshots pvA/pvB/pvC + before/after pictures): A circle; HelloTalk way everywhere with a typing bar (rooms, lives, chats); raise ~24pt.
- Paid live = circle (paidLiveCircle): same idea as paid talk lessons — round video circle, "● LIVE · Lesson", host, title, level, price, red ring that fills as seats go, "N seats left" under it. In the Live grid it's full width and comes after 2 tiles (no empty half row). Search rows (red ring icon + "Lesson · £0.99", opens the lesson join), Flicks live posts ("LIVE NOW · Lesson", red ring on the host, "Join · £0.99"), and the minimised live window (red ring) are marked too. Still one suggested paid live in the Live list; the rest are in Lessons.
- Comment bars: live bar 34px from the bottom (was 10), comments and the eye rail moved up with it; talk room bar padding 50px (was 26).
- Keyboard ("still" mode, touch phones): typing in a talk room, live room or chat no longer uses the old shrink/stack layout (kbopen). The screen stays exactly as it is; only the typing bar (lives: bar + comments; talk rooms: bar, quick replies hidden while typing) is lifted to rest on the keyboard, and the chat list gets a spacer so the newest lines sit above the bar.
  The lift happens right after the tap lands (not on touch-down, which made the tap miss the box), before the keyboard is up, so the box is already above the keyboard and the iPhone doesn't slide the page. Keyboard line: Safari/Android tell us; Claude app on iPhone → usual keyboard height (kbEst). If a slide is measured, the screen is moved back down by it. Code: stillCtx / stillOn / stillOff / stillAgain (re-applied after every render while typing). Tests fake a keyboard with window.__kbSim.
- Taps after the keyboard closes: iPhone draws the page back but kept tapping as if it were still slid up (Continue hit the city box and reopened the keyboard). On every focusout on touch phones the page is nudged (scroll + 1px layout nudge, 3 times over 0.65 s) so taps line up again (UI.kbClosedAt). The form bar (˄ ˅ Done) now disappears the moment the box loses focus; its arrows no longer scroll the page.
- Tests: t119 (circle in EN/FR/AR, after 2 tiles, opens the lesson; search, Flicks, mini window marked; bar ≥30px from the bottom; rooms/lives/chats don't move or shrink when the keyboard opens, while typing, or after it closes; bar rests on the keyboard; newest line above the bar; nudge runs; form bar hides at once).
- Tests retired: t91 and t92 (they assumed the iPhone always slides the page and the room must squeeze into the strip above the keyboard — the old layout the founder asked to replace). t89/t90 updated: when a slide IS measured, the room is moved back down so the header, seats and listeners sit at the top of what you can see (t90's "head" is now the room's top bar; rooms have no back button any more). Computers also use the "nothing moves" behaviour (no keyboard, so no lift).
- Keyboard-down icon on typing bars now stays above the keyboard line; if every spot above the bar is busy it may sit over the room above (never over the box). Split-screen live comments keep clear of the squares with the higher bar.

## v91 — Keyboard opens like "version 1" of the keyboard test (16 Nov)
Founder's iPhone recordings of v90: in the Claude app the room vanished and the comment bar flew to the top. The iPhone slid the page up (the box was still at the bottom when it got focus) and the app also lifted the bar, so it moved twice.
Keyboard test page (artifact "TalkAmigo keyboard test", /home/claude/talkamigo/kbtest): 1 = bar jumps onto the keyboard line first, then focus without scrolling; 2 = let the iPhone slide, move the room back; 3 = bar rises with the keyboard and page scrolling is undone. Founder picked 1.
- Now: on a phone, when the finger lifts off a talk room / live / chat typing box (touchend), the app stops the normal tap, lifts the bar instantly to the keyboard line (stillOn without animation), then focuses the box with preventScroll. The box is already above the keyboard, so the iPhone has nothing to slide. Closing: bar glides down over 0.32 s.
- t119: also checks the bar is up within 40 ms of the tap.

## v92 — Done bar on forms sits on the real keyboard line (16 Nov)
Founder's iPhone, keyboard test page: with the box visible the Claude app does not slide the page at all (scroll 0, hidden top 0, inner 739 on a 852 screen). Tab 4: with City selected, Done did not close the keyboard, and ˅ jumped from Display name straight to City.
Causes: (1) v89's "the iPhone centres the box" guess put the keyboard line too low for middle boxes, so the ˄ ˅ Done bar sat behind the keyboard; (2) the arrow could act twice for one press; (3) if a box couldn't be scrolled up, the bar was moved under it (behind the keyboard).
Fix: kbTopY in the Claude app = screen − usual keyboard height (+ any measured slide); the bar always stays on that line; while typing in a form a spacer is added at the end of its list so the box can always scroll above the bar (removed when the keyboard closes); one arrow move per press (150 ms guard).
Taking a screenshot closes the keyboard in the Claude app — that's the iPhone/Claude app, not TalkAmigo (use screen recording to capture it).
Test: t120 (3 iPhone sizes: name, username and city boxes → bar exactly on the keyboard line, box above it, Done closes; doubled ˅ press moves one box). Fails on v90's build (City line 579 on a 739 screen).

## v93 — Done at the top + the keyboard's own Next/Done key (16 Nov)
The ˄ ˅ Done bar on the keyboard kept failing on the founder's iPhone in the Claude app. Founder picked A + B (mockups): 
- A: the keyboard's blue key says "Next" while there is another box below on the same screen/sheet (goes to it, no page scroll) and "Done" on the last box (closes). formFields / formNext / formHints (run after every render). Boxes inside chat/comment bars and search boxes keep their own key (Send / Search).
- B: while typing in a form, a white "Done" button (.kbtop) shows at the top: in sign-up it takes the place of "Step x of 9"; on a bottom sheet it sits just above the sheet (or over the sheet header's top-right button if the sheet is full height); on other screens over the top-right of the header. Whatever it covers is hidden only while typing and comes back after. In Arabic it's on the left.
- The floating bar on the keyboard is gone (still created but never shown). The box being typed in is still scrolled above the keyboard line (spacer at the end of the list while typing).
- Tests: t118 (keyboard part rewritten: key hints, Next moves one box, Done key closes, top Done in place of the counter, translated, left in Arabic, lower boxes above the keyboard, chats keep their icon), t120 and t107 rewritten for the top Done.
- v93 extras: the top Done only ever covers a button (never the box being typed in or its container — the Search box lives in the header); if no button fits it uses empty header space, else just under the header (never over the box). Key hints are worked out once per screen/sheet per redraw (was once per box — slowed redraws on long forms).

## v94 — Search lists in A–Z order (17 Nov)
Founder: typing "U" in "Which languages do you speak" showed Portuguese, Russian, Turkish, Urdu… — not alphabetical.
Fix: qRank(items, q, nameOf) — names that start with what you typed come first, then names with a word starting with it, then names that contain it, each group A–Z in the app's language (localeCompare), accents ignored (é = e). English names count only after every match on the name you see (so in French "u" gives Ukrainien first, not Ourdou). Used for: languages you speak, languages you learn (both pickers), countries, interests.
Test: t121 (EN + FR; languages "u"/"a", countries "s", interests "c"). Fails on v93.

## v95 — Teacher part fixed + approval notices (19 Nov)
Founder: payout page lagged when scrolling up while typing; Open room (as a teacher) had its top buttons hidden upward; "fix the teacher part properly"; "when teachers got accepted by us give them a notice".
Bugs found and fixed:
- Open room top bar had the class of the little sound-bars icon ("sbar"), which forced it to 16px tall, so the close button, title and Lv button overflowed upward under the Claude bar. Now just .crtop.
- Typing on the payout page (and any form): every scroll pulled the box back above the keyboard, fighting the finger. Now that happens once, when the box is tapped; the top Done is placed once per box too.
- Teacher sign-up "Add a photo of a certificate" was white text on white (blank box). Now readable on the red sign-up.
- Payout page: date of birth was empty during sign-up (now from the sign-up birthday, written out, e.g. 2 February 1995); Postcode box was cut off on the right.
- Paid lesson ("Paid lesson now" or ticking Paid lesson) opened in the language you're learning; now a language you teach.
- The application no longer approves itself after 15 s.
Decisions (founder picked: A + B notice, "we need something" notices too, hidden test switch):
- teachDecide('approved' | 'needs', 'id'|'pay' | 'declined','exp'). Approved: full-screen welcome once ("You're a TalkAmigo teacher" · Plan my first lesson · Paid lesson now · Later) + banner + item in Notifications + red dot on Me (gone when Me opens). Needs: same notice with what to resend (ID photo → Stripe ID check; bank details → payouts); doing it sends the application back to review. Declined: notice with the reason + Teacher Terms; profile card says not approved; teacher perks removed.
- The notice waits if another sheet/menu, a call, the tour or sign-up is open, and shows when it's free (S.teachNote).
- Beta only: Settings → Beta tools (shown once you've applied): Approve / Ask for a new ID photo / Ask to fix payouts / Don't approve. In the real app our team does this on the admin site — it should call the same three outcomes.
- Test: t122 (EN/FR/AR). t96 updated (no automatic approval).

## v96 — Rooms + gifts round (19 Nov)
Founder's list (answers: keyboard closes only in rooms/lives/comments; if the co-host in charge leaves, another co-host on stage takes over, else it ends in 2 min and the host is told; live host away = photo + "Back soon"; Flick comments "sometimes don't open").
- Send closes the keyboard in talk rooms, lives and Flick comments (chats keep it open to keep typing). In the submit handler.
- Mini live window: the X is now a separate round button just outside the top corner, like the talk-room mini (.mcard.mlive .mc-x).
- Host steps away (HelloTalk way), talk rooms AND lives, only while a co-host is on stage (talk: a speaker; live: a guest on camera) — awayCo(x,R). Talk: Leave / X on the mini; Live: End live / X on the mini → "Leave · Tunde runs it" / "End … for everyone" / Stay. While away: x.away, a bar above the tabs "Your room/live is running · Tunde is in charge · Go back" (awayBar). Co-host in charge leaves → another co-host on stage takes over (notice), else "No one is running your room · ends in 2 minutes" and the bar turns warning; expireAway ends it (rooms and lives). Coming back to a live restores its guests. Beta: Settings → Beta tools → "My co-host leaves the stage".
- Live: tapping a guest's name/square on stage opens their mini profile — it never worked: the dark shading over the video (.stream .shade) caught the taps. Now pointer-events:none.
- Live: camera on/off button for the host next to the comment box (lv-cam, R.camOff): off → "Camera off · viewers see your photo" and an icon on the host square.
- Talk room empty seats: listener → "Ask to speak?" sheet (seatask → raises the hand); co-host in the audience → goes up at once; host / co-host on stage → invite someone (as before).
- Flick comments "sometimes don't open" (and any tap "sometimes" lost): a redraw that was waiting for the finger ran the instant it lifted — on iPhone the tap arrives after that, so the tapped button had been replaced. Now the waiting redraw runs 320 ms after the finger lifts.
- Gifts on Flicks: a gift to the Flick's owner (Gift button on the Flick) shows as a line in its comments for everyone ("Lucía sent a gift to Kenji 🌹 Rose"); each comment has a Gift button, and a gift to a commenter shows as a badge under that comment ("☕ Café · from Tunde"). S.fgifts[flickId] = [{by,to,g,ck,at}] (ck = comment key "who|first 40 chars"); FGIFT_SEED shows examples on m1/m2.
- Gifts received outside a room (Flick, profile, chat): giftIn(from,gift,where,away). In the app: a banner "Reem sent you a gift: Rose 🌹 · on your profile" — tap → Activity; also written to Activity. Away from the app (S.lastSeen > 20 min): listed in Activity "… · while you were away" when you come back (giftAwayCheck). Demo: one gift from Reem ~70 s into the day's first session.
- All new text in 8 languages (+ RX/PAT patterns for the dynamic lines).
- Test t123. Fails on v95.
- Tests: t78 now expects the keyboard to close after Send in rooms/lives/comments (stays open in chats). Simulated users (sim.py) now clear old button labels before each tap — stale labels on the gift banner caused fake "tap failed".

## v97 — Flick comment box behind the keyboard (20 Nov)
- Founder (screenshot): first tap on "Add a comment…" in Flick comments → keyboard covers the box, panel doesn't move.
- Cause: rooms/lives/chats lift their typing bar onto the keyboard themselves ("still" mode, v90/v91), but the comments panel relied on the iPhone sliding the page — and in the Claude app it doesn't.
- Fix: the comments panel joins still mode (stillCtx kind 'sheet'): on tap, the whole panel rides up so the box sits right on the keyboard; if that would push its top off the screen, the panel gets shorter (list scrolls to the newest, box at the bottom). Keyboard closes (Send / tap away) → panel slides back down. Marked with data-kbl on the .sheet; stillOff resets it.
- Test t124 (few + many comments, 844 and 667 screens, send → back down, second tap). Fails on v96.

## v98 — Me card: stats above the language levels (20 Nov)
- Founder: "place follow etc above language levels" — it looked odd under them. Mockups sent (A/B, then A/C/D, then E/F/G); founder said C's tiles were good but numbers too big, picked F.
- F = three small tiles (Following · Followers · Views) right under name/city/Online, above the levels: soft grey tile, 15.5px number with a small red icon (user / people / eye), label under it, all three numbers on one line. The red +1 / +12 sits on the tile's top corner like an app badge (pops in once; reads "+12" in Arabic too).
- Classes .mstats / .mst / .mplus (old inline stat row removed). Taps still open Following / Followers / Views.
- Test t125 (390/320, English/Arabic/French: above levels, lined up, icons, no cut labels, badges, taps).

## v99 — Flick comments jumped too high from the "Add a comment…" bar (20 Nov)
- Founder (screenshot): comments panel pushed up to the top with a big gap above the keyboard.
- Cause: the "Add a comment or a correction…" bar under a Flick opens comments straight into typing (UI.focusId='cmt'). That focus came before the v97 lift and let the page scroll, so the iPhone slid the whole page up AND the panel was lifted on top = double.
- Fix: window.stillPre(el) — for app-made focus on a typing bar/comment box, lift first (no opening slide-in for the panel, so it is already in place), then focus with preventScroll. Used in render()'s UI.focusId step; other auto-focus boxes (phone number, search) unchanged.
- t124 extended: opening from the bar, the box must already be above the keyboard at the moment it gets focus. Fails on v98.

## v100 — Send closes the keyboard everywhere (20 Nov)
- Founder re-sent the "App idea" list with a HelloTalk recording (type in a room → send → keyboard goes, room stays put) and "This should be universally the same everywhere". No option picked when asked, so took the list's wording: Send now closes the keyboard in chats and groups too (v96 kept chats open), plus rooms, lives, Flick comments and the correction sheet. Submit handler: kid falls back to the input of any .composer2 / correct form.
- Rest of the list (v96) re-checked by t123: all working.
- Tests changed to the new rule: t78, t108 (box still kept + emptied, no longer focused), t123 (chat expects closed).

## v101 — Teacher messages first in Chats (21 Nov)
- Founder: teachers paid, so their messages must not be missed. Mockups 1 (pinned "Your teachers") / 2 (pinned + red banner); picked 2 "but Room alerts can stay first".
- Chats → All: Room alerts row first; then, while a teacher message is unread (and that chat isn't muted), a red banner "From your teacher · now — Aiko: … [Open]" (+N more if several); then teacher chats always pinned (small red pin before the name); then TalkAmigo Team, requests, groups, other chats. Unread filter: teachers before groups/others.
- Demo: one new teacher message ("Class reminder: Tuesday 19:00…") is added once (S.tbanDemo) so the banner shows.
- Room alerts redesign (chat-style feed like HelloTalk's "Live & Voiceroom"): waiting for founder's screenshot; "More rooms ›" will open the Rooms tab in that card's language.
- Test t126.

## v102 — Room alerts redesigned (21 Nov)
- Founder: Room alerts should look like HelloTalk's "Live & Voiceroom" feed. Mockups A/B, then 1/2, D, D2 (+ Live video / Talk room label), F (D2 + B's cover pictures), F2 (ended = grey). Picked F2.
- Room alerts page is now a feed like a chat: times between cards, oldest at the top, newest at the bottom, opens at the newest. Each card: cover (live: room/live colour, "LIVE" + 👥 count; ended: plain grey stripes, "Ended · 40 min"), a red "📹 Live video" or white "🎙 Talk room" label, language + topic chips (+ "Teacher"), big title, host photo with flag + name (tap → profile), time, red Join (live only; paid lives open the payment sheet as elsewhere). Ended cards: dimmed, grey photo and labels, no Join. "More rooms ›" under each → Rooms tab, talk or live mode, filtered to that card's language(s). Bottom: "Who alerts me" (Settings → Notifications) and "Mute 8 h" / "Unmute".
- Data: S.ralerts [{k:'live'|'room', id, at, end?}], ended ones dropped after 7 days. Seed: Kenji live (ended), Lucía room (ended), Camille room (live), Aiko live (live). Functions ralerts / alObj / alTime / alDur / alertsFeed; actions al-more, al-mute (timed mute, expires at load).
- 8 languages (+ RX for "Ended · …"). Test t127.

## v103 — Talk room audience: swipe through everyone (21 Nov)
- Founder: "slide left to right to see people in the audience, or something better" — mockups A (swipe the whole audience) / B (pull-down grid panel); picked A.
- The audience row under the stage now holds the whole audience (was 5 + "+38 All") and swipes sideways; the red "43 All" sits fixed at the end (opens the list, which now shows everyone, not just 5). Little page dots under the row show where you are; soft fades on the edges show there's more. Position is kept when the room redraws (UI.tlisX, per room). Dots take no extra height (t89 small-screen chat space) and hide while typing.
- tdots() + a scroll listener on .tlisS. Test t128.

## v104 — Room fixes from founder screenshots (21 Nov)
- Top gifters (3 circles top-right of a talk room): the 1 and 2 badges were hidden under the next photo. Now 1st sits in front, then 2nd, then 3rd (z-index) — all three badges visible.
- Gift animation (big emoji + "Tunde → Noah · Café" banner) played over the open room menu. Now, while a menu/sheet is open, it waits and plays right after it closes (last 3 kept, dropped if you leave the room). giftFx queue UI.fxQ + fxNext().
- MY v103 MISTAKE: the audience dots used class "tdots", already used by the room's ••• button and the welcome-tour dots → the ••• button was squashed to 4 px and tour dots shrank. Renamed mine to "tadots". Lesson: grep a class name before using it.
- Test t129 (badges visible, ••• size, gift waits/plays/drops, tour dots). Fails on v103.

## v105 — Full audit (22 Nov)
- Founder asked for a full re-analysis to fix bugs. Audit tools (kept: beta/audit_crawl.py): a crawler that opens every screen/sheet it can reach and taps every button (7,399 taps over 54 screens and 55 sheets, at 390x780 English, 375x667 English/French, 320x568 Arabic): 0 code errors, 0 dead buttons. Plus: untranslated-text scan (Arabic, Japanese), contrast / off-screen / overlapping scan (light+dark, 5 configs), redraw speed (all screens under 70 ms on a 4x-slowed CPU), saved data size (20 KB), leftover timers after rooms (0).
- Bugs found and fixed:
  1. Edit profile: the "change cover" button could not be tapped at all — the avatar row lay on top of it (.eav pointer-events).
  2. Gift sheet on shorter iPhones (667 px tall and less): the "send to" people row was squashed to nothing behind the category tabs (flex-shrink).
  3. Five texts stayed in English in every language (buy coins sheet, Face ID / PIN sheet).
  4. Small text buttons (comment Like / Reply / Gift, gift categories, See all, More rooms, Restore purchases, Plus link, Plan-for-later tick) had tap areas 15–29 px tall → invisible bigger tap area, nothing moves.
  5. Two icon buttons on the room mini profile had no screen-reader name.
- NOT covered by the crawler (covered by the older tests only): sign-up forms, teacher application, hosting your own room/live in depth, calls.
- Test t130.

## v106 — Audit round 2: roles, sign-up, empty and heavy data (22 Nov)
- Founder pasted the handoff prompt here ("update it, keep everything"). Finished step 1 on the "still not checked" list.
- Checked: every sign-up + teacher step in 8 languages (320 and 390 wide); hosting own talk room and own live; voice and video calls; teacher approved / needs / review; Plus member; blocked user; 430-wide in German, Spanish, Portuguese, Italian; empty account; extreme data (very long names, huge numbers); coins/diamonds arithmetic; the whole translation table (2,186 lines); 20 of 30 unreached pop-ups opened directly. ~2,600 more robot taps: 0 errors, 0 dead buttons. audit_crawl.py now accepts role set-ups ("JS:label::code" roots, @file).
- Bugs found and fixed:
  1. A Plus member whose teacher application was declined lost Plus options (S.vip forced false while S.plan stayed plus). Now S.vip follows the plan.
  2. Chats tab red number counted only 1-to-1 messages. Founder chose: chats + groups (Room alerts / Team keep their own badges).
  3. Room alerts was a blank page with no alerts → "No room alerts yet…" message.
  4. French used "vous/votre" in 6 texts → "tu/ton".
  5. Five duplicate translation keys ("Talk room" with two different translations, "Get seen first", etc.) → one line each, original wording kept ("Salon de parole").
- For developers: Plus is stored in TWO flags (S.plan and S.vip) — use one in the real app. Follower/following/view totals are demo numbers larger than the demo lists ("+ 86 more").
- Not checked: keyboard on a real iPhone; 10 pop-ups that only appear mid-flow (rhold, gconfirm, gpick, gmembers, ctrs, guide, lres, perm, permoff, sharep).
- Still to do from the prompt: step 3 (one keyboard rule), step 4 (native feel, needs mockups), step 5 (what's missing), step 6 (handoff pack).
- Test t131.

## Handoff pack written (22 Nov)
- Founder will build the real app in Claude Code (React Native + Expo), testing privately on their iPhone before any publishing. Has a Mac and an iPhone; no GitHub or Apple Developer account yet.
- handoff/ folder: HANDOFF.md (what the prototype fakes, rules and numbers, every screen and pop-up with its buttons, stored data, acceptance checks, build order), talkamigo-beta.html, CLAUDE.txt, translations.csv, translations_patterns.csv. Regenerate with /tmp/claude-0/aud/inv.py + the handoff script after any new version.

## Real app plan (23 Nov)
- Real app is being built in a Claude Code session (Expo Go, slice 1 done). Founder sent a recording; mistakes and next steps are in handoff/NEXT_STEPS.md (send it with the 5 handoff files).
- Decisions: app must be EMPTY (no invented people); no word "demo", no "coming in the next update"; testing happens inside the same app through a hidden Test mode for team accounts only (server flag, TEST banner, ~30 marked test people, never mixed with Live); Apple sandbox purchases; Stripe later once the company exists; admin site after the customer app; free plans only until told.
