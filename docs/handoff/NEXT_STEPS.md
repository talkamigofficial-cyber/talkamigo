# TalkAmigo — instructions for the next coding round

Written 23 Nov 2026, from the founder's screen recording and screenshots of the real app (Expo Go build, slice 1).
Read this together with `HANDOFF.md`, `CLAUDE.txt`, `talkamigo-beta.html` and the two translation files. The prototype stays the reference for layout, wording and behaviour.

The founder is not a developer. Explain in plain English, ask when unsure, and say how to check each change on the iPhone.

## 1. Where we are and what we want

- The real app exists as slice 1: sign-up, profile, main screen of the 5 tabs, with demo content.
- We are NOT publishing yet. My business partner and I will test privately on our own iPhones first.
- The app must look and behave like a real, finished app, but EMPTY: no invented people or content. Only real people who sign up appear.

## 2. Fix these mistakes first

### Sign-up
1. Remove the word "demo" everywhere. Seen: "Signed up with Apple (demo)", "Record my intro (demo)".
2. Birthday: tapping it must close the keyboard first, then show the full date picker. Today the keyboard stays open and the picker is cut in half.
3. The name and username boxes trigger the iPhone's saved-password bar ("password for expo.dev"). Set the correct field types so that bar does not appear.
4. "Add a profile photo": the two buttons beside the photo are blank white boxes. Their labels (take a photo / choose from library) are invisible, white on white.
5. Flags: use real flag pictures cropped to a circle with a thin dark ring, not emoji. Emoji flags are cut off inside the circle. Same size and position as the prototype: bottom-left of the profile photo, and a small one before the city.

### Main app
6. Bottom tab bar:
   - each tab is an icon with its label under it: Chats, Connect, Flicks, Rooms, Me;
   - centred in the bar, the active one red;
   - the bar sits above the iPhone home bar (safe area);
   - page content must end above the bar. Today cards show through it and overlap the icons;
   - the unread badge sits on the top-right of the Chats icon.
7. Me: "My Flicks" is one huge empty box with "New Flick" far down. Make it a small empty card.
8. Messages such as "Coming in the next update" appear on top of other content. See section 4: that message must go.
9. The blue gear button on every screen: confirm it is the Expo testing tool and not ours. If it is ours, remove it.

## 3. Empty the app

- Remove ALL invented content: people, chats, rooms, lives, lessons, Flicks, offers ("2× coins until Sunday"), Room alerts ("Aiko is live"), TalkAmigo Team messages, follower and view numbers.
- A new account starts with 0 coins, 0 diamonds, 0 following, 0 followers, 0 views, no chats.
- Every list and screen needs a designed "nothing here yet" state: one short sentence and one button for the next step (find partners, open a room, post a Flick, start a chat). Show me picture options before building the design.
- Room alerts and TalkAmigo Team stay as places, but empty until something real happens.

## 4. No "demo", no "coming soon" that pretends

- The word "demo" must not appear anywhere.
- If a feature is not built yet, hide its button. Do not show "Coming in the next update".
- Coins and Plus: use Apple's sandbox test purchases during testing, so the real purchase screen appears and no money is taken.
- Cash-out, teacher payouts and ID checks: show "Available soon" for now (see section 6).

## 5. How we will test: one app, with a hidden test mode

Everything lives in the SAME application. There is no separate test app.

### Two worlds inside the app
- **Live**: the real app. Empty at the start, real people only.
- **Test**: a separate set of data with about 30 test people, busy talk rooms and lives, long chat lists, Flicks with many comments, every language and flag. Used to check screens that two phones cannot fill.

### Who can enter the Test world
- Only "team" accounts. My account and my partner's account are marked as team on the server.
- Access is tied to the account on the server, NOT to a secret code typed in the app. I must be able to add or remove a tester at any time.
- A team account sees a hidden switch in Settings: "Test mode". Normal users never see it and cannot reach it.

### Rules for Test mode
1. While it is on, a clear "TEST" banner shows on every screen.
2. The two worlds never mix: test people cannot message, follow, gift or appear to real users, and nothing done in Test shows in Live. Switching back returns me to my real, untouched account.
3. Test people are clearly marked as test accounts. They must never appear in Live or be presented as real members.
4. No real money in Test mode. Purchases use Apple's sandbox only.
5. A test menu inside Test mode: add coins and diamonds, make a test person send me a message or a gift, fill a room with listeners, simulate a bad connection, wipe all Test data and refill it.
6. Before we publish, confirm what Apple requires us to tell its reviewers about this hidden mode, and tell me.

### Real-people testing
- My partner and I test every slice on two iPhones with our own accounts, in Live and in Test.
- A few extra real accounts each (other emails or numbers) to test groups, rooms with several people, co-hosts, blocking and reporting.
- When rooms and lives work, we invite 10 to 20 friends for a planned test evening.
- Before launch, Live is wiped so it starts empty.

### After each slice
Tell me exactly how to open it on both phones, and give me a short checklist of what to try in Live and in Test.

## 6. Later, in this order

1. **Stripe**: we have no company yet. We will create the company, then open the Stripe account. Build so payouts and ID checks can be plugged in later without redoing screens.
2. **Admin site**: built after the customer app. From now on, save what it will need: reports, blocks, teacher applications, purchases, and for each sign-up the country, city, languages and "how did you find us".

## 7. Build order from here

Each slice must work between two real phones before the next one starts.

1. Fixes in section 2, and emptying the app (section 3).
2. Real accounts and database; sign-in on a second phone; profiles; follow; block; report. Team accounts and the hidden Test mode (section 5) are part of this slice.
3. Chats: 1-to-1, groups, corrections, translation, message requests, notifications.
4. Connect: search, filters, profiles.
5. Flicks: post, feed, comments, corrections, gifts on Flicks and comments.
6. Talk rooms: stage and seats, co-hosts, host away, audience row, gifts, mini window.
7. Live video rooms: guests on camera, camera on/off, host away, summary.
8. Voice and video calls.
9. Coins, gifts, boosts, Plus (Apple sandbox first).
10. Teachers: application, paid lessons. Approval, payouts and ID checks wait for Stripe and the admin site.

## 8. Money rules for building

- Free plans only for now. Tell me before anything costs money, with the price.
- Live audio and video are billed per person per minute. Keep that in mind:
  - cap video at HD, not Full HD;
  - keep the daily room-time limit for free users (it is in the prototype);
  - show me a rough monthly cost before turning on any paid service.
- Check current prices before I sign up for anything. Do not rely on remembered prices.

## 9. Rules that always apply

- Match the prototype's screens, wording and behaviour unless I say otherwise.
- 8 languages: English, French (always "tu"), Spanish, Portuguese, German, Italian, Japanese, Arabic (right-to-left). Use the translation files.
- Red brand, iPhone feel, light and dark mode.
- HelloTalk is a reference for behaviour only. Never copy its wording or designs.
- For any design change, show me picture options first and build only the one I pick.
- Every button must work. No dead buttons.
- Work in small slices. After each one, report in plain English:
  1. what was wrong or missing;
  2. what is done;
  3. steps to check it on my iPhone;
  4. what was tested and what was not.
- Be honest about anything not finished or not tested.

## 10. Start here

1. Read all the attached files.
2. Tell me in plain English what you will do first and what you need from me (accounts to create, keys to enter through the secure form).
3. Do section 2 and section 3, then show me on my iPhone.
