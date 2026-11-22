# TalkAmigo — handoff pack for developers

Made on 22 Nov 2026 from beta version 106. Four files travel together:

| File | What it is |
|---|---|
| `HANDOFF.md` (this file) | What to build, the rules and numbers, every screen and pop-up, what the prototype fakes |
| `talkamigo-beta.html` | The working prototype. Open it in a browser. It is the reference for layout, wording and behaviour |
| `CLAUDE.txt` | The founder's decisions, version by version (v57 to v106). When this file and the prototype disagree with a guess, they win |
| `translations.csv`, `translations_patterns.csv` | Every text in 8 languages (2182 fixed texts, 283 texts with changing parts) |

## 1. What TalkAmigo is

A language-exchange social app for iPhone and Android. People find partners, chat with corrections and translation, post short videos ("Flicks"), talk in audio "talk rooms", go live on video, book paid lessons with verified teachers, and send gifts bought with coins.

- 5 tabs: Chats, Connect, Flicks, Rooms, Me.
- 8 app languages: English, French (always "tu"), Spanish, Portuguese, German, Italian, Japanese, Arabic (right-to-left).
- Red brand, iPhone look, light and dark mode.
- HelloTalk is a reference for behaviour only. Never copy its wording or designs.
- The founder is not a developer and tests on an iPhone. Show changes on the phone, explain in plain English, show design options as pictures before building.
- The app is NOT to be published yet. It must first be tested privately on the founder's iPhone.

## 2. What the prototype fakes (the real app must build these)

The prototype has no server. Everything is saved on the phone (browser storage, about 20 KB) and is lost if the app is removed.

| Area | In the prototype | The real app needs |
|---|---|---|
| People, messages, rooms, lives, Flicks, followers | 26 demo people, 48 demo rooms, 17 demo lives, scripted replies. Follower / following / view totals are demo numbers bigger than the demo lists ("+ 86 more") | Real accounts, a database, real-time chat, feeds, search |
| Sign-up and login | Phone / Apple / Google buttons that always succeed, no SMS | Real phone codes, Apple and Google sign-in, login on a new phone, lost phone, change number, log out everywhere |
| Talk rooms and live video | No real sound or video. Speaking indicators, listeners, guests on camera and viewers are simulated | A live audio/video service, seats and roles enforced by the server, recording rules, moderation |
| Voice and video calls | Simulated call screen | Real calls, call notifications |
| Translation, corrections, captions (CC), "hear it" | Canned results or the browser's voice | Translation and speech services, per-language |
| Coins, Plus, lessons | "Beta demo · no payment is taken". Demo coins button | Apple and Google in-app purchases, receipts, refunds, restore purchases, failed payments |
| Diamonds cash-out, teacher payouts, ID check | Fake Stripe sheets, cash-out always "requested" | Real payouts, identity checks, tax forms, fraud limits |
| Teacher approval | Auto-approves after a few seconds; "Beta tools" in Settings can force approve / needs changes / decline | Admin site where staff review applications |
| Notifications | In-app banners only | Push notifications, quiet hours, per-person settings |
| Reports, blocking, appeals | Stored on the phone only | Server-side blocking, a moderation queue, appeals, rules for under-18s |
| Sign-up data for marketing | A "ready to send" record per sign-up (country, city, languages, how they found us); `ADMIN_URL` is empty | Send to the admin site |
| Bug reports | Stored in the artifact's small database | Support inbox |
| Live host steps away | Host side works. Viewers seeing the host's photo and "Back soon" is NOT built | Build it |
| Plus membership | Stored in two fields (`plan` and `vip`) | Use one source of truth |

## 3. Rules and numbers

### Coins (bought) and Diamonds (earned)
- Coin packs (USD base; the prototype shows local currency): 60 coins = $0.99, 310 coins = $4.99 (+2% bonus), 630 coins = $9.99 (+4% bonus), 3200 coins = $49.99 (+6% bonus), 6500 coins = $99.99 (+7% bonus).
- A gift gives the receiver Diamonds worth 25% of its coin price (20-coin Rose → 5 Diamonds).
- Daily gift limit: 20,000 coins sent per day.
- Money actions (cash-out and similar) ask for Face ID or a PIN.
- Cash-out tiers: see the Wallet → Diamonds screen in the prototype.

### Gifts
| Gift | Coins | Receiver gets (Diamonds) |
|---|---|---|
| 👋 Wave | 4 | 1 |
| 🌹 Rose | 20 | 5 |
| ☕ Café | 40 | 10 |
| 👻 Ghost | 100 | 25 |
| 💖 Big heart | 200 | 50 |
| 🎤 Mic drop | 500 | 125 |
| 🚀 Rocket | 1000 | 250 |
| 👑 Crown | 3000 | 750 |

Gifts can be sent in talk rooms, lives, chats, on profiles, on a Flick (shows as a line in its comments for everyone) and on a comment (shows as a badge under that comment, "from X"). A gift received outside a room shows a banner and is logged in Activity; gifts received while away are listed in Activity "while you were away". While a menu is open, the gift animation waits and plays after it closes.

### Boosts (paid with coins)
| Boost | Lasts | Coins | What it does |
|---|---|---|---|
| Profile boost | 30 min | 300 | Show up first in Connect for people who match your languages. |
| Room boost | 15 min | 100 | Pin your talk room to the top of the Rooms list, for people in your room’s languages. |
| Live boost | 15 min | 200 | Pin your live room to the top of Live rooms, for people in its language. |
| Flick boost | 60 min | 150 | Show your latest Flick to more people in “For you” for 1 hour. |

The first boost is free for new Plus members.

### Plans
- Standard (free). Plus: $2.99 a week, $9.99 a month or $79.99 a year. Infinity (lifetime): $199.99, one payment.
- Approved teachers get Infinity for free while they are teachers. If a teacher is later declined, they go back to the plan they had before.
- Plus unlocks, among others: advanced Connect filters, seeing who viewed you, some room options, no room time limit, subtitles. Search the prototype for "Plus" gates (`plusgate`).

### Talk rooms
- Roles: host, co-hosts (moderators), speakers on stage, listeners.
- Empty seat: a listener asks to speak; a co-host in the audience goes straight up; the host or a co-host on stage invites someone.
- Host can step away only while a co-host is on stage. That co-host is in charge; if they leave, another co-host on stage takes over; if none, the room ends after 2 minutes and the host is told.
- One room at a time: joining another asks to leave the first. A room can be minimised to a small floating window.
- Audience row swipes through everyone; "All" opens the full list. Top 3 gifters are shown at the top.
- Standard users have a daily room-time allowance (see "Daily room time" in CLAUDE.txt); Plus has no limit.
- Paid rooms and paid lessons show a price and open a payment sheet before joining.
- Typing in a room: the stage stays visible, the comment box sits on the keyboard, Send closes the keyboard.

### Live video rooms
- Host on camera plus up to 3 guests (4 people on screen).
- Host has camera on/off, hide comments, subtitles, end live with a summary.
- Tapping a guest's name opens their mini profile.
- Same host-away rule as talk rooms, with a guest co-host on camera.

### Chats
- Order of the Chats list: Room alerts, then a red banner while a teacher message is unread, then teacher chats (always pinned), then TalkAmigo Team, message requests, groups, other chats.
- The tab badge counts unread messages from people and groups.
- Send closes the keyboard everywhere.
- Room alerts is a feed (newest at the bottom): live cards have a coloured cover, "LIVE", people count and Join; ended cards are grey with "Ended · 40 min"; each card says "Live video" or "Talk room"; "More rooms ›" opens Rooms in that language; ended alerts are removed after 7 days; "Mute 8 h".

### Teachers
- Application: languages and levels taught, lesson types, experience, qualifications, intro, certificate (optional), ID check, payout details, promises (real identity, payments stay in the app, kindness, taxes, terms).
- Outcomes: approved (welcome screen, badge, can give paid lessons), needs changes (ID photo again or bank details again), declined (can re-apply after 30 days).
- Teacher messages must never be missed (see Chats order).

### Safety and privacy
- Report and block are available on profiles, chats, rooms, lives, Flicks and comments. Blocked people cannot see the profile, message, gift or join rooms, and are not told. Settings → Privacy & safety → Blocked people lists them.
- Account: download my data, delete account (type DELETE), log out.

## 4. Every screen

Button names are as the prototype shows them in English. The "action name" is the handler in the prototype's code, useful for finding the exact behaviour.

### Chats tab — “Chats”
| Button (as shown) | Action name in the prototype |
|---|---|
| Search | `go:search` |
| Activity | `go:notif` |
| New chat or group | `sheet:newchat` |
| All | `chatf:all` |
| Unread 5 | `chatf:unread` |
| Groups | `chatf:groups` |
| Requests 3 | `chatf:requests` |
| Online | `chatf:online` |
| + Open room | `go:create` |
| Aiko is live | `go:live` |
| Lucía is in a talk room | `go:room` |
| Room alerts Official now 🎙 Aiko is li | `go:official` |
| A FROM YOUR TEACHER · NOW Aiko: Remind | `go:chat` |
| Mute | `chat-mute:aiko` |
| Delete | `sheet:chatdel` |
| C M French practice crew 4 now Marc: P | `go:group` |
| Mute | `chat-mute:camille` |
| Mute | `chat-mute:kenji` |
| Mute | `chat-mute:lucia` |
| Chats | `tab:chats` |
| Connect | `tab:discover` |
| Flicks | `tab:moments` |
| Rooms | `tab:live` |
| Me | `tab:profile` |

### Connect tab — “Connect”
| Button (as shown) | Action name in the prototype |
|---|---|
| Plus | `go:vip` |
| Search | `go:search` |
| Filters | `go:dfilter` |
| Activity | `go:notif` |
| All | `discf:all` |
| Online | `discf:online` |
| Nearby | `discf:nearby` |
| Serious learners | `discf:serious` |
| Teachers | `discf:teachers` |
| City | `plusgate:City search` |
| Age | `plusgate:Age range` |
| My languages | `dlang:mine` |
| French | `dlang:French` |
| Spanish | `dlang:Spanish` |
| All languages | `dlang:all` |
| 🚀 Get seen first Top of Connect for 3 | `boost:profile` |
| C Camille FR ⇄ EN Active now Cinema ne | `go:user` |
| Wave at Camille | `wave:camille` |
| Wave at Élodie | `wave:elodie` |
| Wave at Pablo | `wave:pablo` |
| Wave at Léa | `wave:lea` |
| See all | `livetab-go:lives` |
| A LIVE IELTS speaking: band 7 phrases | `go:live` |
| Wave at Diego | `wave:diego` |
| Wave at Carmen | `wave:carmen` |
| Wave at Marc | `wave:marc` |
| Wave at Noah | `wave:noah` |
| Wave at Inès | `wave:ines` |
| Wave at Mateo | `wave:mateo` |
| Chats | `tab:chats` |
| Connect | `tab:discover` |
| Flicks | `tab:moments` |
| Rooms | `tab:live` |
| Me | `tab:profile` |

### Flicks tab
| Button (as shown) | Action name in the prototype |
|---|---|
| Kenji | `go:user` |
| Follow | `follow:kenji` |
| Aujourd’hui, | `word:aujourd’hui|French` |
| j’ai | `word:j’ai|French` |
| commandé | `word:commandé|French` |
| un | `word:un|French` |
| café | `word:café|French` |
| en | `word:en|French` |
| français | `word:français|French` |
| pour | `word:pour|French` |
| la | `word:la|French` |
| première | `word:première|French` |
| fois | `word:fois|French` |
| Translate | `mtr:m1` |
| Open sound | `go:sound` |
| Like | `like:m1` |
| Comments | `comments:m1` |
| Send gift | `gift-open:kenji` |
| Share | `share:flick|m1` |
| More options | `cmenu:flick|m1|kenji` |
| Join · £0.99 | `tjoin:l1` |
| More options | `cmenu:live|l1|aiko` |
| ¿Cuál | `word:cuál|Spanish` |
| es | `word:es|Spanish` |
| la | `word:la|Spanish` |
| palabra | `word:palabra|Spanish` |
| más | `word:más|Spanish` |
| bonita | `word:bonita|Spanish` |
| en | `word:en|Spanish` |
| tu | `word:tu|Spanish` |
| idioma? | `word:idioma|Spanish` |
| Follow | `follow:lucia` |
| Translate | `mtr:m3` |
| Like | `like:m3` |
| Comments | `comments:m3` |
| Send gift | `gift-open:lucia` |
| Share | `share:flick|m3` |
| More options | `cmenu:flick|m3|lucia` |
| See Plus | `go:vip` |
| Play or pause video | `vtoggle:m4` |

### Rooms tab — “Talk rooms”
| Button (as shown) | Action name in the prototype |
|---|---|
| Plans | `go:vip` |
| Open room | `go:create` |
| OFFER 🪙 2× coins until Sunday Top up  | `bnr:0` |
| Talk rooms Speak, listen and practise | `rmode:talk` |
| Live rooms One person live on camera | `rmode:live` |
| Rooms | `livetab:rooms` |
| Lessons | `livetab:classes` |
| All my languages | `livelang:All` |
| English | `livelang:L` |
| English ⇄ French | `livelang:P` |
| + More languages | `livelang:More` |
| EN # Guess the word Boosted Guess the  | `go:room` |
| Les faux amis : stop the mistakes | `tjoin:t1` |
| Chats | `tab:chats` |
| Connect | `tab:discover` |
| Flicks | `tab:moments` |
| Rooms | `tab:live` |
| Me | `tab:profile` |

### Me tab
| Button (as shown) | Action name in the prototype |
|---|---|
| Coins | `go:wallet` |
| Diamonds | `go-dia` |
| Settings | `go:settings` |
| Add an intro video | `sheet:intro` |
| Edit profile | `go:editp` |
| 87 Following | `go:follows` |
| +12 1.3k Views | `go:views` |
| See all › | `go:myflicks` |
| ⚡ Profile 30 min · 150 | `boost:profile` |
| 🎯 Flick 1 h · 150 | `boost:flick` |
| 🎙 Talk room 15 min · 100 | `boostlounge` |
| Shop | `go:shop` |
| Notebook | `go:notebook` |
| Lessons | `livetab-go:classes` |
| Clubs | `go:club` |
| Passport | `go:passport` |
| Plans | `go:vip` |
| Duo | `go:chat` |
| Chats | `tab:chats` |
| Connect | `tab:discover` |
| Flicks | `tab:moments` |
| Rooms | `tab:live` |
| Me | `tab:profile` |

### Chat (1-to-1)
Typing boxes: Write in French…
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| K Kenji Online now · Osaka | `go:user` |
| Voice call | `call:kenji` |
| Chat settings | `go:cset` |
| Play voice note | `vplay:21` |
| Correct | `sheet:correct` |
| Latest messages | `jmp` |
| Record a voice message | `vrec:kenji` |
| More | `sheet:cplus` |
| Send a photo | `sendimg:kenji` |
| Emoji | `emo-t:kenji` |
| Send a gift | `gift-open:kenji` |
| Translate what I typed | `ctr:msg-kenji` |
| Give me a prompt | `prompt:kenji` |

### Chat with a teacher
Typing boxes: Write in French…
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| A Aiko Active today · Tokyo | `go:user` |
| Voice call | `call:aiko` |
| Chat settings | `go:cset` |
| Translate | `tr:aiko` |
| Correct | `sheet:correct` |
| Latest messages | `jmp` |
| Record a voice message | `vrec:aiko` |
| More | `sheet:cplus` |
| Send a photo | `sendimg:aiko` |
| Emoji | `emo-t:aiko` |
| Send a gift | `gift-open:aiko` |
| Translate what I typed | `ctr:msg-aiko` |
| Give me a prompt | `prompt:aiko` |

### Chat settings
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Share Kenji’s profile | `share:profile|kenji` |
| K Kenji @kenji · Osaka | `go:user` |
| Notifications | `cs-tg:kenji` |
| Chat files | `go:cfiles` |
| Search chat history | `go:csearch` |
| Chat bubbles Classic | `sheet:cbub` |
| Chat background Plus | `sheet:cbg` |
| Translate into English | `sheet:ctl` |
| Clear chat history | `sheet:cclear` |
| Block | `block:kenji` |
| Report | `rep:user|kenji|kenji` |

### Room alerts
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Mute | `offmute:lounge` |
| K Kenji | `go:user` |
| More rooms › | `al-more:live|L` |
| More rooms › | `al-more:talk|P` |
| Join | `go:room` |
| Join | `tjoin:l1` |
| Who alerts me | `go:set` |
| Mute 8 h | `al-mute` |

### TalkAmigo Team
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Mute | `offmute:team` |
| Use my coupon | `boost:profile` |
| Top up | `go:wallet` |
| Safety tips | `go:set` |

### New group — “New group”
Typing boxes: e.g. Spanish Sunday club
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| C Camille French → English | `gpick:camille` |
| K Kenji Japanese → French | `gpick:kenji` |
| L Lucía Spanish → English | `gpick:lucia` |
| É Élodie French → English | `gpick:elodie` |
| P 🇲🇽 Pablo Spanish → English | `gpick:pablo` |
| L 🇧🇪 Léa French → English | `gpick:lea` |
| D 🇦🇷 Diego Spanish → English | `gpick:diego` |
| C Carmen Spanish → English | `gpick:carmen` |
| M Marc French → English | `gpick:marc` |
| A Aiko Japanese → English | `gpick:aiko` |
| R Rafael Portuguese → French | `gpick:rafael` |
| J Jade French → English | `gpick:jade` |
| T Tunde Yoruba → French | `gpick:tunde` |
| R Reem Arabic → English | `gpick:reem` |
| N Noah English → Spanish | `gpick:noah` |
| I Inès French → Spanish | `gpick:ines` |
| M 🇦🇷 Mateo Spanish → French | `gpick:mateo` |
| E 🇺🇸 Emma English → French | `gpick:emma` |
| S 🇲🇽 Sofía Spanish → English | `gpick:sofia` |
| H 🇧🇪 Hugo French → English | `gpick:hugo` |
| O 🇦🇺 Olivia English → Spanish | `gpick:olivia` |
| P Pierre French → Spanish | `gpick:pierre` |
| V 🇨🇴 Valentina Spanish → English | `gpick:valentina` |
| J 🇮🇪 James English → French | `gpick:james` |
| C 🇨🇭 Chloé French → English | `gpick:chloe` |
| R 🇨🇱 Rodrigo Spanish → French | `gpick:diegoR` |
| Create group | `gcreate` |

### Search
Typing boxes: Search people, languages, Flicks, rooms
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| All | `gstab:all` |
| People | `gstab:people` |
| Teachers | `gstab:teachers` |
| Flicks | `gstab:flicks` |
| Rooms | `gstab:rooms` |
| Languages | `gstab:langs` |
| French | `gs-q:French` |
| Spanish | `gs-q:Spanish` |
| Japanese | `gs-q:Japanese` |
| Café | `gs-q:Café` |
| IELTS | `gs-q:IELTS` |
| Marc | `gs-q:Marc` |
| Teacher | `gs-q:Teacher` |

### Activity — “Activity”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Notification settings | `go:set` |
| All 6 | `acttab:all` |
| Flicks 3 | `acttab:flicks` |
| Rooms 2 | `acttab:rooms` |
| Social 1 | `acttab:social` |
| Accept | `accept:tunde` |
| Accept | `accept:reem` |
| Accept | `accept:rafael` |
| Mark all as read | `act-readall` |
| K Kenji and 40 others liked your Flick | `go:flick` |
| T Tunde sent you a Rose 🌹 on your Fli | `go:wallet` |
| L Lucía started following you 2 h ago  | `go:user` |
| Follow back | `follow:lucia` |
| C Camille opened a talk room: “Café fr | `go:room` |
| M Marc planned a lesson: “Order like a | `sheet:lres` |
| Follow back | `follow:kenji` |
| A Aiko started a live: “IELTS speaking | `go:live` |

### Someone's profile — “Kenji”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| More options | `sheet:usermenu` |
| Intro video | `toast:Playing Kenji’s intro video (demo)` |
| Message | `go:chat` |
| Follow | `follow:kenji` |
| Send gift | `gift-open:kenji` |
| T 1 800 | `go:user` |
| Flicks | `proftab:moments` |
| About | `proftab:about` |
| ☕ 1.3k | `go:flick` |

### Teacher's profile — “Aiko”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| More options | `sheet:usermenu` |
| Intro video | `toast:Playing Aiko’s intro video (demo)` |
| Message | `go:chat` |
| Follow | `follow:aiko` |
| Send gift | `gift-open:aiko` |
| T 1 800 | `go:user` |
| Flicks | `proftab:moments` |
| About | `proftab:about` |
| 🏯 3.1k | `go:flick` |

### Talk room (listener)
Typing boxes: Comment…
| Button (as shown) | Action name in the prototype |
|---|---|
| FR ⇄ EN 48 listening › | `sheet:audience` |
| Top gifters | `sheet:gifters` |
| More | `rpop` |
| C Camille | `sheet:rp` |
| Empty seat 6 | `seat-tap:5` |
| S You | `toast:That’s you. Raise your hand to speak.` |
| Whiteboard Tap to see what the host is | `sheet:board` |
| Room rules Speak French and English, b | `rules-t` |
| Hi all 👋 | `quick-say:Hi all 👋` |
| What are we chatting about? | `quick-say:What are we chatting about?` |
| Just joined, hello! | `quick-say:Just joined, hello!` |
| Hide suggestions | `quick-x` |
| Who checked your profile here (Plus) | `rviews` |
| Raise hand to speak | `hand` |
| Subtitles | `captions` |
| Send gift | `gift-open:camille` |

### Live room (viewer)
Typing boxes: Add a comment…
| Button (as shown) | Action name in the prototype |
|---|---|
| C Camille FR · Ratatouille en français | `sheet:rp` |
| Unfollow Camille | `follow:camille` |
| See who’s watching | `sheet:viewers` |
| More | `rpop` |
| Who checked your profile here (Plus) | `rviews` |
| Subtitles | `captions` |
| Hide comments | `lv-hidecm` |
| Ask to join | `lg-join` |
| Send gift | `gift-open:camille` |

### Open a room
Typing boxes: What will you talk about?, Tell people what this room is for. Beginners welcome? Speak slowly?
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `back` |
| Lv.2 | `go:roomlv` |
| Talk room | `cr:voice` |
| Live room | `cr:live` |
| Language French | `sheet:crlang` |
| How modes work | `sheet:crmodes` |
| Chat Talk freely | `cr:chat` |
| Music Our sounds play softly | `cr:music` |
| Whiteboard Draw and write together | `cr:board` |
| Guess the word Describe it, others gue | `cr:game` |
| Topic #Language practice | `sheet:crtopic` |
| Everyone | `cr:public` |
| Followers | `cr:followers` |
| Friends | `cr:mutuals` |
| Plus: no time limit | `go:vip` |
| Pin | `crt:pin` |
| Boost from the start | `crt:boost` |
| Room background | `sheet:crbg` |
| Open talk room | `golive` |
| Also show on Flicks | `crt:flicks` |
| Plan for later | `crt:later` |

### My Flicks — “Flicks”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Edit profile | `go:editp` |
| 1.3k Followers | `go:follows` |
| Share profile | `share:profile|me` |
| My Flicks | `fptab:flicks` |
| Saved | `fptab:saved` |
| Liked | `fptab:liked` |
| About | `fptab:about` |
| New Flick | `post-open` |
| 🥐 212 | `go:flick` |

### Drafts — “Drafts”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |

### One Flick
| Button (as shown) | Action name in the prototype |
|---|---|
| Kenji | `go:user` |
| Follow | `follow:kenji` |
| Aujourd’hui, | `word:aujourd’hui|French` |
| j’ai | `word:j’ai|French` |
| commandé | `word:commandé|French` |
| un | `word:un|French` |
| café | `word:café|French` |
| en | `word:en|French` |
| français | `word:français|French` |
| pour | `word:pour|French` |
| la | `word:la|French` |
| première | `word:première|French` |
| fois | `word:fois|French` |
| Translate | `mtr:m1` |
| Open sound | `go:sound` |
| Like | `like:m1` |
| Comments | `comments:m1` |
| Send gift | `gift-open:kenji` |
| Share | `share:flick|m1` |
| More options | `cmenu:flick|m1|kenji` |
| Back | `back` |

### Settings — “Settings”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| S Sam Profile, username and ways to lo | `go:set` |
| Plans Standard | `go:vip` |
| Wallet & payouts 600 | `go:wallet` |
| Restore purchases | `restore` |
| Manage subscription — | `sheet:applesubs` |
| Rate TalkAmigo | `rate-open` |
| Report a problem | `go:bugrep` |
| Log out | `sheet:logout` |
| Reset demo | `reset` |

### Wallet — “Wallet”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| How gifts work | `sheet:howgifts` |
| Coins | `wtab:coins` |
| Diamonds | `wtab:diamonds` |
| 60 £0.99 | `buy:60` |
| +2% 310 £3.99 | `buy:310` |
| +4% 630 £8.99 | `buy:630` |
| +6% 3,200 £42.99 | `buy:3200` |
| +7% 6,500 £86.99 | `buy:6500` |

### Shop — “Shop”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| 600 | `go:wallet` |
| Coins | `stab:coins` |
| Profile frames | `stab:frames` |
| 60 £0.99 | `buy:60` |
| +2% 310 £3.99 | `buy:310` |
| +4% 630 £8.99 | `buy:630` |
| +6% 3,200 £42.99 | `buy:3200` |
| +7% 6,500 £86.99 | `buy:6500` |

### Plans (Plus) — “Plans”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Plus | `ptab:plus` |
| ∞ Infinity | `ptab:infinity` |
| Yearly Save 33% ≈ £5.80 a month £69.99 | `plan:year` |
| Monthly Billed monthly £8.99 | `plan:month` |
| Weekly Billed weekly · try it for a we | `plan:week` |
| Start Plus · £69.99/year | `plan-buy:plus` |
| Terms of Use | `sheet:legal` |
| Restore purchases | `restore` |

### Edit profile — “About me”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Change cover photo | `cover-next` |
| Change photo | `sheet:intro` |
| Edit | `sheet:ed` |
| Native English | `go:mylangs` |
| Edit | `go:set` |
| Preview | `go:preview` |

### My languages — “I speak natively”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `lg-back` |
| Done | `lg-save` |
| + Add a native language | `lg-open:speak` |
| Remove French | `lg-del:French` |
| A1 | `lg-lvl:A1` |
| A2 | `lg-lvl:A2` |
| B1 | `lg-lvl:B1` |
| B2 | `lg-lvl:B2` |
| C1 | `lg-lvl:C1` |
| C2 | `lg-lvl:C2` |
| Move up | `lg-up:Spanish` |
| Remove Spanish | `lg-del:Spanish` |
| + Add a language | `lg-open:learn` |

### Followers — “Sam”
Typing boxes: Search
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| 1.3k followers | `follows:followers` |
| 87 following | `follows:following` |
| C Camille French → English | `go:user` |
| Following | `follow:camille` |
| Follow | `follow:kenji` |
| Follow | `follow:lucia` |
| Follow | `follow:elodie` |
| Follow | `follow:pablo` |
| Follow | `follow:lea` |
| Follow | `follow:diego` |
| Follow | `follow:carmen` |
| Follow | `follow:marc` |
| Follow | `follow:aiko` |
| Follow | `follow:rafael` |
| Follow | `follow:jade` |
| Follow | `follow:tunde` |
| Follow | `follow:reem` |
| Follow | `follow:noah` |
| Follow | `follow:ines` |
| Follow | `follow:mateo` |
| Follow | `follow:emma` |
| Follow | `follow:sofia` |
| Follow | `follow:hugo` |
| Follow | `follow:olivia` |
| Follow | `follow:pierre` |
| Follow | `follow:valentina` |
| Follow | `follow:james` |
| Follow | `follow:chloe` |
| Follow | `follow:diegoR` |

### Following — “Sam”
Typing boxes: Search
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| 1.3k followers | `follows:followers` |
| 87 following | `follows:following` |
| C Camille French → English | `go:user` |
| Following | `follow:camille` |

### Profile views — “Profile views”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| C Camille 2 h ago | `go:user` |
| Following | `follow:camille` |
| Follow | `follow:kenji` |
| Follow | `follow:rafael` |
| Follow | `follow:reem` |
| Follow | `follow:lucia` |
| Follow | `follow:tunde` |
| See who viewed you with Plus | `go:vip` |

### Connect filters — “Advanced search Plus”
Typing boxes: range, range, range, range
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Reset | `flt-reset` |
| Partner’s native language All | `sheet:lpick` |
| New members only | `flt-tg:newOnly` |
| Show people nearby first | `flt-tg:nearbyFirst` |
| Everyone | `flt-g:all` |
| Women | `flt-g:Woman` |
| Men | `flt-g:Man` |
| Partner’s region All | `flt-cyc:region` |
| Partner’s city All | `flt-cyc:city` |
| Unlock advanced search with Plus | `plusgate:Advanced search` |
| Search | `flt-go` |

### Profile preview — “Your profile (preview)”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Message | `toast:Anyone can message you` |
| Follow | `toast:Follow (preview)` |
| Gift | `toast:Anyone can send you gifts` |
| 🥐 212 | `go:flick` |

### Report a bug — “Report a problem”
Typing boxes: e.g. I tapped Send and nothing happened
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Something doesn’t work | `bug-kind:broken` |
| Looks wrong | `bug-kind:looks` |
| Too slow | `bug-kind:slow` |
| Wrong translation | `bug-kind:tr` |
| Other | `bug-kind:other` |
| Chats | `bug-where:Chats` |
| Connect | `bug-where:Connect` |
| Flicks | `bug-where:Flicks` |
| Rooms | `bug-where:Rooms` |
| Me | `bug-where:Me` |
| Calls | `bug-where:Calls` |
| Sign-up | `bug-where:Sign-up` |
| Somewhere else | `bug-where:Somewhere else` |
| Include technical details | `bug-tech` |
| Send report | `bug-send` |

### Settings · account — “Account”
Typing boxes: set-name, set-user, Optional
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Change photo | `sheet:photopick` |
| Save profile | `saveprof` |
| Country United Kingdom | `toast:Your country sets your flag and currency. Contact support to change it.` |
| Currency GBP | `toast:Prices and cash-outs use your country’s currency` |
| Birthday 3/14/1999 | `toast:Your birthday can’t be changed. Only your age is shown.` |
| Google Link | `link:google` |
| Apple Linked ✓ | `link:apple` |
| Phone number Link | `link:phone` |
| Download my data | `sheet:mydata` |
| Delete account | `sheet:delacct` |

### Settings · privacy — “Privacy & safety”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| S See how others see you Check your pr | `go:preview` |
| Everyone | `prefv:everyone` |
| People I follow | `prefv:follow` |
| No one | `prefv:none` |
| Confirm money actions Face ID / PIN | `toast:Cash-outs and gifts of 1,000+ coins always need Face ID or your PIN` |
| Payment PIN Not set | `toast:You’ll create it the first time you need it` |
| Show my age | `pref:showAge` |
| Show my city | `pref:showCity` |
| Show when I’m online | `pref:showOnline` |
| Appear in “Nearby” | `pref:nearby` |
| Browse profiles privately | `pref:ghost` |
| Private account | `pref:privateAcc` |
| AI translation, corrections & subtitle | `set:aiOK` |
| What AI helpers see | `sheet:legal` |
| Account status 1 decision | `go:set` |
| Hide offensive words | `pref:filterWords` |
| Blocked people None | `go:blocked` |
| Muted people None | `go:muted` |
| Safety tips Read | `sheet:safety` |

### Settings · notif — “Notifications”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| New messages | `pref:nMsg` |
| Calls | `pref:nCalls` |
| Someone I follow goes live | `pref:nLive` |
| Everyone I follow | `prefv:all` |
| Close friends only | `prefv:close` |
| News & offers | `pref:nOffers` |
| Comments & corrections | `pref:nComments` |
| Gifts I receive | `pref:nGifts` |
| Lesson reminders | `pref:nClasses` |
| Likes on my Flicks | `pref:nLikes` |
| Sound | `pref:nSound` |
| Vibration | `pref:nVibe` |
| Off | `prefv:off` |
| 22:00–08:00 | `prefv:22-8` |
| 00:00–08:00 | `prefv:0-8` |
| Send me a test notification | `notif-test` |

### Settings · chat — “Chat settings”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Tap to translate | `prefv:tap` |
| Automatic | `prefv:auto` |
| Let partners correct me | `set:corr` |
| Read receipts | `pref:receipts` |
| Show romanisation | `pref:roman` |
| Small | `prefv:S` |
| Medium | `prefv:M` |
| Large | `prefv:L` |
| Glow | `prefv:Glow` |
| Plain | `prefv:Plain` |
| Night | `prefv:Night` |

### Settings · learning — “Learning settings”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Native: English Learning: French B1 ·  | `go:mylangs` |
| 10 min | `prefv:10` |
| 20 min | `prefv:20` |
| 30 min | `prefv:30` |
| 1 hour | `prefv:60` |
| Live subtitles | `set:captions` |
| Mine only | `prefv:mine` |
| Both languages | `prefv:both` |

### Settings · live — “Chats”
| Button (as shown) | Action name in the prototype |
|---|---|
| Search | `go:search` |
| Activity | `go:notif` |
| New chat or group | `sheet:newchat` |
| All | `chatf:all` |
| Unread 5 | `chatf:unread` |
| Groups | `chatf:groups` |
| Requests 3 | `chatf:requests` |
| Online | `chatf:online` |
| + Open room | `go:create` |
| Aiko is live | `go:live` |
| Lucía is in a talk room | `go:room` |
| Room alerts Official now 🎙 Aiko is li | `go:official` |
| A FROM YOUR TEACHER · NOW Aiko: Remind | `go:chat` |
| Mute | `chat-mute:aiko` |
| Delete | `sheet:chatdel` |
| C M French practice crew 4 now Marc: P | `go:group` |
| Mute | `chat-mute:camille` |
| Mute | `chat-mute:kenji` |
| Mute | `chat-mute:lucia` |
| Chats | `tab:chats` |
| Connect | `tab:discover` |
| Flicks | `tab:moments` |
| Rooms | `tab:live` |
| Me | `tab:profile` |

### Settings · appearance — “Appearance”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Light | `theme:light` |
| Dark | `theme:dark` |
| Match phone Default | `theme:system` |

### Settings · language — “App language”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| 📱 English Phone default | `prefv:Phone default` |
| English | `prefv:English` |
| Français | `prefv:Français` |
| Español | `prefv:Español` |
| 日本語 | `prefv:日本語` |
| Português | `prefv:Português` |
| Deutsch | `prefv:Deutsch` |
| Italiano | `prefv:Italiano` |
| العربية | `prefv:العربية` |

### Settings · backup — “Chat backup”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Get Plus | `go:vip` |

### Settings · storage — “Storage”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Data saver | `pref:dataSaver` |
| Images & videos 77 MB | `toast:Kept` |
| Clear cache · 128 MB | `clearcache` |

### Settings · status — “Account status”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Appeal | `sheet:appeal` |

### Settings · help — “Help & safety centre”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| How do gifts and Diamonds work? | `sheet:howgifts` |
| How do I go live? | `go:create` |
| How do corrections work? | `toast:Opens in the real app` |
| Manage my plan | `go:vip` |
| Replay the welcome tour | `tour-replay` |
| Show first-time tips again | `tips-reset` |
| Report a problem | `go:bugrep` |

### Settings · about — “About”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `back` |
| Terms of Use | `sheet:legal` |
| Gift & cash-out rules | `sheet:howgifts` |
| Open-source licences | `toast:Opens in the real app` |

### Talk room (I am the host)
Typing boxes: Comment…
| Button (as shown) | Action name in the prototype |
|---|---|
| FR ⇄ EN 1 listening › | `sheet:audience` |
| Lv.2 | `go:roomlv` |
| Top gifters | `sheet:gifters` |
| More | `rpop` |
| S You | `toast:You’re the host. Tap someone to manage them.` |
| Empty seat 2 | `seat-tap:1` |
| Empty seat 3 | `seat-tap:2` |
| Empty seat 4 | `seat-tap:3` |
| Empty seat 5 | `seat-tap:4` |
| Empty seat 6 | `seat-tap:5` |
| Mode Chat › | `sheet:rmode` |
| Room rules Speak French and English, b | `rules-t` |
| Tunde’s profile | `sheet:rp` |
| Hi all 👋 | `quick-say:Hi all 👋` |
| What are we chatting about? | `quick-say:What are we chatting about?` |
| Just joined, hello! | `quick-say:Just joined, hello!` |
| Hide suggestions | `quick-x` |
| Mute | `mic-toggle` |
| Subtitles | `captions` |
| Send gift | `gift-open:camille` |

### Live room (I am the host)
Typing boxes: Reply to your viewers…
| Button (as shown) | Action name in the prototype |
|---|---|
| S Sam FR · Test room | `toast:That’s you! Viewers see your camera.` |
| See who’s watching | `sheet:viewers` |
| More | `rpop` |
| Tunde’s profile | `sheet:rp` |
| Turn camera off | `lv-cam` |
| Subtitles | `captions` |
| Hide comments | `lv-hidecm` |

### Voice call
| Button (as shown) | Action name in the prototype |
|---|---|
| Minimise call | `call-min` |
| Mute | `call-t:mute` |
| Speaker | `call-t:spk` |
| Subtitles | `captions` |
| End call | `endcall` |

### Video call
| Button (as shown) | Action name in the prototype |
|---|---|
| Minimise call | `call-min` |
| Mute | `call-t:mute` |
| Speaker | `call-t:spk` |
| Subtitles | `captions` |
| End call | `endcall` |

### Sign-up step 0 — “Hi! Who are you?”
Typing boxes: Your first name, yourname
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| @amigo_amigo | `ob-usug` |
| Choose your birthday | `bd-open` |
| Continue | `ob-next` |

### Sign-up step 1 — “Where are you from?”
Typing boxes: Search all countries, e.g. London, ob-showcity
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| 🇬🇧 United Kingdom | `ob-cc` |
| Continue | `ob-next` |

### Sign-up step 2 — “Which languages do you speak fluently?”
Typing boxes: Search all languages
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| Turkish | `ob-lang` |
| Continue | `ob-next` |

### Sign-up step 3 — “Which languages are you learning?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| Remove Spanish | `ob-lang` |
| C2 | `lvl` |
| + Add another language | `ob-addl` |
| Continue | `ob-next` |

### Sign-up step 4 — “Interests & hobbies”
Typing boxes: Search interests and hobbies
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| Cars | `ob-int` |
| Continue | `ob-next` |

### Sign-up step 5 — “Add a profile photo”
Typing boxes: ob-promise
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| Demo photo 6 | `ob-photo` |
| Skip photo | `ob-next` |

### Sign-up step 6 (teacher) — “Say hi on video”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| ● Record my intro (demo) | `rec-start` |
| Continue | `ob-next` |

### Sign-up step 7 (teacher) — “What do you teach?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| English | `t-lang` |
| C2 | `t-lvl` |
| Beginners from zero | `t-type` |
| Continue | `ob-next` |

### Sign-up step 8 (teacher) — “Your teaching experience”
Typing boxes: How do your lessons feel? Who are they for? Example: Relaxed conversation lessons for B1 learners who freeze when they speak.
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| 5+ years | `t-years` |
| None yet | `t-qual` |
| Add a photo of a certificate O | `t-cert` |
| Continue | `ob-next` |

### Sign-up step 9 (teacher) — “Confirm it’s you”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| stripe Verify my ID | `sheet` |
| Continue | `ob-next` |

### Sign-up step 10 (teacher) — “Get paid”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| stripe Set up payouts | `sheet` |
| Continue | `ob-next` |

### Sign-up step 11 (teacher) — “The teacher promise”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `ob-back` |
| I agree to the Teacher Terms a | `t-prom` |
| Teacher Terms | `sheet` |
| Send my application | `ob-next` |

## 5. Every pop-up sheet reached in the audit

### gift — “Send a gift”
| Button (as shown) | Action name in the prototype |
|---|---|
| 600 Top up | `go:wallet` |
| C Camille | `giftto:camille` |
| M Marc | `giftto:marc` |
| J Jade | `giftto:jade` |
| K Kenji | `giftto:kenji` |
| T Tunde | `giftto:tunde` |
| All | `gcat:All` |
| Popular | `gcat:Popular` |
| Love | `gcat:Love` |
| Luxury | `gcat:Luxury` |
| Seasonal | `gcat:Seasonal` |
| 👋 Wave 4 | `giftsel:wave` |
| 🌹 Rose 20 | `giftsel:rose` |
| ☕ Café 40 | `giftsel:coffee` |
| Seasonal 👻 Ghost 100 | `giftsel:ghost` |
| 💖 Big heart 200 | `giftsel:heart` |
| 🎤 Mic drop 500 | `giftsel:mic` |
| 🚀 Rocket 1,000 | `giftsel:rocket` |
| 👑 Crown 3,000 | `giftsel:crown` |
| How gifts work › | `sheet:howgifts` |
| Send 🌹 Rose · 20 coins | `giftsend` |

### gifters — “Top gifters”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| 1 T Tunde 120 | `sheet:rp` |
| Send a gift | `gift-open:camille` |

### audience — “48 in this room”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| C Camille Host | `sheet:rp` |
| Following ✓ | `follow:camille` |
| Follow | `follow:marc` |
| Follow | `follow:jade` |
| Follow | `follow:kenji` |
| Follow | `follow:tunde` |
| Follow | `follow:lucia` |
| Follow | `follow:elodie` |
| Follow | `follow:pablo` |
| Follow | `follow:lea` |
| Follow | `follow:diego` |
| Follow | `follow:carmen` |
| Follow | `follow:aiko` |
| Follow | `follow:rafael` |
| Follow | `follow:reem` |
| Follow | `follow:noah` |
| Follow | `follow:ines` |
| Follow | `follow:mateo` |
| Follow | `follow:emma` |
| Follow | `follow:sofia` |
| Follow | `follow:hugo` |
| Follow | `follow:olivia` |
| Follow | `follow:pierre` |
| Follow | `follow:valentina` |
| Follow | `follow:james` |
| Follow | `follow:chloe` |
| Follow | `follow:diegoR` |

### rp
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| View profile | `go:user` |
| Following ✓ | `follow:camille` |
| Message | `rp-dm:camille` |
| Send a gift | `rp-gift:camille` |
| Block | `rp-block:camille` |
| Report | `sheet:report` |

### rset — “Room settings”
Typing boxes: rs-title, Topic, Tell people what this room is for.
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Save | `rs-save` |
| Pin | `rs:0` |
| Chat | `rs:chat` |
| Music | `rs:music` |
| Whiteboard | `rs:board` |
| Guess the word | `rs:game` |
| + Add | `sheet:rsco` |
| Everyone | `rs:public` |
| Followers | `rs:followers` |
| Friends | `rs:mutuals` |
| 4 | `rs:4` |
| 6 | `rs:6` |
| 8 | `rs:8` |
| 10 | `rs:10` |
| Plum | `rs:plum` |
| Night | `rs:mono` |
| Ember | `rs:ember` |
| Dusk | `toast:Unlocks at room level 3` |
| Café | `toast:Unlocks at room level 4` |
| Sunset | `toast:Unlocks at room level 5` |

### rmusic — “Room music”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Café Lo-fi | `rm-set:s1` |
| Paris Morning | `rm-set:s2` |
| Tokyo Night Drive | `rm-set:s3` |
| Samba Sol | `rm-set:s4` |
| Study Rain | `rm-set:s5` |
| Lagos Sunshine | `rm-set:s6` |

### poll — “New poll”
Typing boxes: Which day for our call?, Answer 1, Answer 2
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| + Add answer | `poll-add` |
| Post poll | `poll-post:undefined` |

### board — “Whiteboard”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |

### seatask
| Button (as shown) | Action name in the prototype |
|---|---|
| Ask to speak | `seat-ask` |
| Cancel | `close` |

### stage — “You’re on stage 🎤”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Mute my mic Stay on stage without bein | `stage-mute` |
| Leave the stage You stay in the room a | `stage-leave` |
| Leave the room | `leave-x` |

### rsco — “Add a co-host”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `sheet:rset` |
| Close | `close` |

### swpick — “Who runs your room?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `swr-back:undefined` |
| Close | `close` |

### rpop
| Button (as shown) | Action name in the prototype |
|---|---|
| Share | `pop-do:share~room|r1` |
| Minimise | `pop-min` |
| Open a room | `pop-open` |
| Report this room | `pop-do:rep~room|r1|camille` |
| Block Camille | `pop-block:camille` |
| Leave room | `pop-do:leave~` |

### rmode — “Room mode”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Chat Talk freely | `rmode-set:chat` |
| Music Our sounds play softly | `rmode-set:music` |
| Whiteboard Draw and write together | `rmode-set:board` |
| Guess the word Describe it, others gue | `rmode-set:game` |

### comments
Typing boxes: Add a comment…
| Button (as shown) | Action name in the prototype |
|---|---|
| Comments · 1 | `ctab:comments` |
| Corrections · 1 | `ctab:fixes` |
| Close | `close` |
| 19 | `clike:m1-0` |
| Reply | `creply:camille` |
| Gift | `gift-open:camille` |
| More options for this comment | `cmenu:comment|m1-0|camille` |
| Comment | `cmode:comment` |
| Correction | `cmode:fix` |

### share — “Send to”
Typing boxes: Search people you follow
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| C Camille | `sh-tog:camille` |
| K Kenji | `sh-tog:kenji` |
| L Lucía | `sh-tog:lucia` |
| A Aiko | `sh-tog:aiko` |
| C M French practice crew | `sh-tog:g1` |
| Copy link | `sh-out:copy` |
| Messages | `sh-out:sms` |
| WhatsApp | `sh-out:wa` |
| More apps | `sh-out:more` |

### post — “Text Flick”
Typing boxes: Aujourd’hui j’ai…
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `post-open` |
| Close | `close` |
| Music | `ed-tool:vol` |
| French | `ed-set:lang|French` |
| Spanish | `ed-set:lang|Spanish` |
| English | `ed-set:lang|English` |
| Beginner | `ed-set:lvl|Beginner` |
| Intermediate | `ed-set:lvl|Intermediate` |
| Advanced | `ed-set:lvl|Advanced` |
| Add sound | `snd-open` |
| Save as draft | `draft-save` |
| Post Flick | `post` |

### postpick — “Create a Flick”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Photo Share a single photo | `postkind:photo` |
| Slideshow Share 2 to 20 photos | `postkind:slideshow` |
| Video Record or upload a video (up to  | `postkind:video` |
| Text only Write in the language you’re | `postkind:text` |

### boostpick — “Boost”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Profile boost First in Connect for 30  | `boost:profile` |
| Flick boost Your latest Flick to more  | `boost:flick` |

### buy — “NaN coins”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Add demo coins | `buy-ok:undefined` |

### secure — “Confirm it’s you”
| Button (as shown) | Action name in the prototype |
|---|---|
| Cancel | `sec-cancel` |
| Use Face ID | `sec-face` |
| Use a PIN instead | `sec-pinmode` |

### newchat — “New”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| New message Find a partner in Connect | `tab:discover` |
| New group Practise with a few friends  | `go:newgroup` |
| Message requests See who wants to prac | `chatf:requests` |

### cplus — “Add to chat”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Photo | `sendimg:undefined` |
| Share a room | `sheet:shroom` |
| Prompt | `prompt:undefined` |
| Check my French | `checkmine:undefined` |
| Voice call | `gcall:undefined` |

### msgdel — “Delete message?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Delete for me Only removed from this p | `msgdel:kenji` |

### aiask
| Button (as shown) | Action name in the prototype |
|---|---|
| Allow AI helpers | `ai-allow` |
| Not now | `close` |
| Privacy Policy | `sheet:legal` |

### applang — “App language”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| 📱 English Phone default | `prefv:Phone default` |
| English | `prefv:English` |
| Français | `prefv:Français` |
| Español | `prefv:Español` |
| Português | `prefv:Português` |
| Deutsch | `prefv:Deutsch` |
| Italiano | `prefv:Italiano` |
| 日本語 | `prefv:日本語` |
| العربية | `prefv:العربية` |

### mydata — “Download my data”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Prepare my file | `datago` |

### delacct — “Delete your account?”
Typing boxes: DELETE
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Download my data first | `sheet:mydata` |
| Delete my account | `delgo` |

### logout — “Log out of TalkAmigo?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Keep my chats with Plus backup | `go:vip` |
| Log out and delete messages | `logoutgo` |

### applesubs — “Subscriptions”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Cancel Subscription | `subcancel` |

### lostphone — “No access to your other phone?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Contact support | `toast:Support request sent. We reply within 24h (demo).` |

### trouble — “Trouble logging in?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Try the way you signed up Look for the | `toast:Try the way you signed up (demo)` |
| New phone number? Log in with Google o | `toast:New phone number? (demo)` |
| Contact support We reply within 24 hou | `toast:Contact support (demo)` |

### crlang — “Room language”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| French | `cr:French` |
| English | `cr:English` |
| Spanish | `cr:Spanish` |
| Japanese | `cr:Japanese` |
| Portuguese | `cr:Portuguese` |

### crtopic — “Topic”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| #Small talk | `cr:Small talk` |
| #Language practice | `cr:Language practice` |
| #Travel | `cr:Travel` |
| #Food & cooking | `cr:Food & cooking` |
| #Films & series | `cr:Films & series` |
| #Music | `cr:Music` |
| #Work & careers | `cr:Work & careers` |
| #Exam prep | `cr:Exam prep` |
| #Culture | `cr:Culture` |
| #Grammar help | `cr:Grammar help` |

### crmodes — “Room modes”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |

### crbg — “Room background”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Plum | `cr:plum` |
| Night | `cr:mono` |
| Ember | `cr:ember` |
| Dusk Lv.3 | `toast:Unlocks at room level 3` |
| Café Lv.4 | `toast:Unlocks at room level 4` |
| Sunset Lv.5 | `toast:Unlocks at room level 5` |
| Level up your room › | `go:roomlv` |

### intro — “Your intro video”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| ● Record my intro (demo) | `rec-start` |

### howgifts — “How gifts work”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |

### safety — “Safety tips”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |

### tsched — “Plan a lesson”
Typing boxes: Order like a local: café French
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Sun 22 | `ts:Sun` |
| Mon 23 | `ts:Mon` |
| Tue 24 | `ts:Tue` |
| Wed 25 | `ts:Wed` |
| Thu 26 | `ts:Thu` |
| Fri 27 | `ts:Fri` |
| Sat 28 | `ts:Sat` |
| 09:00 | `ts:09` |
| 12:00 | `ts:12` |
| 17:00 | `ts:17` |
| 18:00 | `ts:18` |
| 19:00 | `ts:19` |
| 20:00 | `ts:20` |
| 21:00 | `ts:21` |
| 30 min | `ts:30` |
| 45 min | `ts:45` |
| 60 min | `ts:60` |
| 6 | `ts:6` |
| 10 | `ts:10` |
| A1–A2 | `ts:A1–A2` |
| B1–B2 | `ts:B1–B2` |
| C1–C2 | `ts:C1–C2` |
| Talk room | `ts:talk` |
| Live room | `ts:live` |
| Plan lesson | `tsched-add` |

### lhow — “How lessons work”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |

### photopick — “Change photo”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| 🙂 | `setphoto:0` |
| 😎 | `setphoto:1` |
| 🌸 | `setphoto:2` |
| 🎧 | `setphoto:3` |
| ⚽ | `setphoto:4` |
| 📚 | `setphoto:5` |

### rep — “Report this content”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Harassment or bullying | `rep-go:Harassment or bullying` |
| Sexual or inappropriate content | `rep-go:Sexual or inappropriate content` |
| Hate speech | `rep-go:Hate speech` |
| Violence or threats | `rep-go:Violence or threats` |
| Spam or scam | `rep-go:Spam or scam` |
| Asking for money or personal details | `rep-go:Asking for money or personal details` |
| Seems to be under 18 | `rep-go:Seems to be under 18` |
| Someone may be in danger | `rep-go:Someone may be in danger` |
| Something else | `rep-go:Something else` |

### usermenu — “Kenji”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| View profile | `go:user` |
| Share profile | `share:profile|kenji` |
| Remove from close friends | `closefr:kenji` |
| Mute Kenji | `mute-u:kenji` |
| Block Kenji | `block:kenji` |
| Report | `rep:user|kenji|kenji` |

### plusgate
| Button (as shown) | Action name in the prototype |
|---|---|
| See Plus | `go:vip` |
| Not now | `close` |

### draftq — “Save this Flick as a draft?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Save draft | `draft-save` |
| Keep editing | `draft-keep` |
| Discard | `draft-drop` |

### dial — “Country code”
Typing boxes: Search country or code
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| 🇦🇱 Albania +355 | `dialpick:AL` |
| 🇩🇿 Algeria +213 | `dialpick:DZ` |
| 🇦🇴 Angola +244 | `dialpick:AO` |
| 🇦🇷 Argentina +54 | `dialpick:AR` |
| 🇦🇲 Armenia +374 | `dialpick:AM` |
| 🇦🇺 Australia +61 | `dialpick:AU` |
| 🇦🇹 Austria +43 | `dialpick:AT` |
| 🇦🇿 Azerbaijan +994 | `dialpick:AZ` |
| 🇧🇭 Bahrain +973 | `dialpick:BH` |
| 🇧🇩 Bangladesh +880 | `dialpick:BD` |
| 🇧🇪 Belgium +32 | `dialpick:BE` |
| 🇧🇦 Bosnia and Herzegovina +387 | `dialpick:BA` |
| 🇧🇷 Brazil +55 | `dialpick:BR` |
| 🇧🇬 Bulgaria +359 | `dialpick:BG` |
| 🇨🇲 Cameroon +237 | `dialpick:CM` |
| 🇨🇦 Canada +1 | `dialpick:CA` |
| 🇨🇱 Chile +56 | `dialpick:CL` |
| 🇨🇳 China +86 | `dialpick:CN` |
| 🇨🇴 Colombia +57 | `dialpick:CO` |
| 🇨🇩 Congo (DRC) +243 | `dialpick:CD` |
| 🇨🇮 Côte d’Ivoire +225 | `dialpick:CI` |
| 🇭🇷 Croatia +385 | `dialpick:HR` |
| 🇨🇾 Cyprus +357 | `dialpick:CY` |
| 🇨🇿 Czechia +420 | `dialpick:CZ` |
| 🇩🇰 Denmark +45 | `dialpick:DK` |
| 🇪🇨 Ecuador +593 | `dialpick:EC` |
| 🇪🇬 Egypt +20 | `dialpick:EG` |
| 🇪🇪 Estonia +372 | `dialpick:EE` |
| 🇪🇹 Ethiopia +251 | `dialpick:ET` |
| 🇫🇮 Finland +358 | `dialpick:FI` |
| 🇫🇷 France +33 | `dialpick:FR` |
| 🇬🇪 Georgia +995 | `dialpick:GE` |
| 🇩🇪 Germany +49 | `dialpick:DE` |
| 🇬🇭 Ghana +233 | `dialpick:GH` |
| 🇬🇷 Greece +30 | `dialpick:GR` |
| 🇭🇰 Hong Kong +852 | `dialpick:HK` |
| 🇭🇺 Hungary +36 | `dialpick:HU` |
| 🇮🇸 Iceland +354 | `dialpick:IS` |
| 🇮🇳 India +91 | `dialpick:IN` |

### stripeid — “Verify your identity”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Passport | `sid-doc:passport` |
| ID card | `sid-doc:idcard` |
| Driving licence | `sid-doc:licence` |
| Photo of your ID card Make sure all fo | `sid-shot:front` |
| Selfie Look at the camera, good light, | `sid-shot:selfie` |
| Submit | `sid-done` |

### stripepay — “Payout details”
Typing boxes: sp-name, text, 12 rue de la Paix, sp-city, sp-pc, text, FR76 3000 6000 0112 3456 7890 189
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Save payout details | `spay-save` |

### lgme — “You’re a guest”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Mute my mic | `lg-mic` |
| Back to the audience | `lg-leave` |

### lgask — “Join Camille’s live?”
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Ask to join | `lg-ask` |

### tjoin
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Join · £0.99 | `tpay:t1` |

### word
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| Hear it Pronunciation | `speak:kenji|undefined` |
| Save to my notebook | `nb-add:kenji|undefined` |

### newcoll — “New collection”
Typing boxes: e.g. French vocabulary
| Button (as shown) | Action name in the prototype |
|---|---|
| Close | `close` |
| French vocabulary | `colln-s:French vocabulary` |
| Spanish pronunciation | `colln-s:Spanish pronunciation` |
| Grammar lessons | `colln-s:Grammar lessons` |
| Phrases to try | `colln-s:Phrases to try` |
| Create | `coll-new` |

### sndpick — “Add sound”
| Button (as shown) | Action name in the prototype |
|---|---|
| Back | `snd-back:menu` |
| Close | `snd-back` |
| My saved sounds Find the sounds you sa | `sndm:saved` |
| Create a sound Record your own audio | `sndm:create` |
| Music library Browse and search music | `sndm:lib` |

### twel — “You’re a TalkAmigo teacher”
| Button (as shown) | Action name in the prototype |
|---|---|
| Plan my first lesson | `tw-go:tsched` |
| Paid lesson now | `tw-go:tlive` |
| OK | `tw-close` |

Pop-ups that only appear mid-flow and are not listed above: hold-to-react in rooms (`rhold`), group invite confirm (`gconfirm`), group pick and members (`gpick`, `gmembers`), translate-before-sending (`ctrs`), feature guides (`guide`), live results (`lres`), permission prompts (`perm`, `permoff`), share profile (`sharep`), switch room (`swr`), host leaving (`hostleave`), seat menu (`seat`). Open them in the prototype by doing the action.

## 6. Data the prototype stores (starting point for the real data model)

Shapes of the main records:
- **person**: name, cc, city, age, native, learning, lvl, interests, color, online, bio, video, gender, seen, isNew, tags
- **me**: name, cc, city, native, natives, learning, langs, level, mins, levels, handle, interests, places, cover
- **room**: id, l, ls, lang, topic, teacher, price, level, goal, mins, seats, booked, title, host, speakers, count
- **paidRoom**: id, l, ls, lang, topic, teacher, price, level, goal, mins, seats, booked, title, host, speakers, count
- **live**: id, host, l, lang, title, viewers, bg, price, level, goal, mins, seats, booked, ls, onFlicks
- **chat**: unread, msgs
- **message**: f, t, tr
- **group**: name, members, unread, msgs
- **teacher**: status, at, approvedAt, langs, levels, types, years, quals, bio, cert, id, pay, need, why

Everything in the saved state:

| Field | Kind | Example |
|---|---|---|
| `aiOK` | boolean | true |
| `blocked` | list(0) |  |
| `booked` | record{} |  |
| `boosts` | record{} |  |
| `bres` | record{} |  |
| `captions` | boolean | true |
| `chats` | record{camille, kenji, lucia, aiko} |  |
| `close` | list(2) |  |
| `coins` | number | 600 |
| `corr` | boolean | true |
| `coupon` | boolean | true |
| `cset` | record{} |  |
| `decisions` | list(1) |  |
| `diamonds` | number | 1240 |
| `duo` | record{camille} |  |
| `extraComments` | record{} |  |
| `extraLives2` | boolean | true |
| `extraRooms2` | boolean | true |
| `flkSeed` | boolean | true |
| `flkSeedL` | boolean | true |
| `flt` | record{age, lvl, newOnly, region, city, nearbyFirst, …} |  |
| `followersN` | number | 1284 |
| `follows` | record{camille} |  |
| `followsMe` | list(5) |  |
| `frame` | string |  |
| `frames` | list(0) |  |
| `freeBoosts` | number | 0 |
| `giftDemoDay` | string | Sun Nov 22 2026 |
| `groups` | record{g1} |  |
| `hidden` | record{} |  |
| `hist` | list(4) |  |
| `lastSeen` | number | 1795382620464 |
| `liked` | record{} |  |
| `links` | record{apple} |  |
| `lives` | list(17) |  |
| `lpTip` | boolean | true |
| `me` | record{name, cc, city, native, natives, learning, …} |  |
| `muted` | record{} |  |
| `myMoments` | list(4) |  |
| `newF` | number | 1 |
| `newV` | number | 12 |
| `nudge` | record{} |  |
| `offUnread` | record{lounge, team} |  |
| `onboarded` | boolean | true |
| `order` | list(4) |  |
| `paid` | record{} |  |
| `past` | list(2) |  |
| `pending` | number | 320 |
| `perm` | record{mic, cam, notif} |  |
| `pinned` | list(0) |  |
| `plan` | string | standard |
| `prefs` | record{nMsg, nCalls, nLive, nComments, nGifts, nClasses, …} |  |
| `remind` | boolean | false |
| `reports` | list(0) |  |
| `reqDone` | record{} |  |
| `reserved` | record{} |  |
| `roomFree` | number | 0 |
| `roomMode` | string | talk |
| `rooms` | list(48) |  |
| `savedSnd` | record{} |  |
| `stack` | list(0) |  |
| `streak` | number | 27 |
| `tab` | string | chats |
| `tbanDemo` | number | 1 |
| `theme` | string | system |
| `today` | number | 12 |
| `toured` | boolean | true |
| `views` | number | 1284 |
| `vip` | boolean | false |
| `wbGiven` | boolean | false |
| `week` | record{mins, fixes, days} |  |

## 7. Acceptance checks

These are the checks the prototype passes today. Each should become a test of the real app.

| Check | What it verifies |
|---|---|
| t67 | Several people use the same phone: sign up, use the app, log out, log in, switch. |
| t71 | Type in every sign-up field, then do things that redraw the screen; nothing typed may disappear. |
| t75 | keyboard opening (viewport shrinking, Safari-style) must keep each conversation at its latest message, with the header on screen |
| t76 | Every place you can type: with the keyboard open (both iPhone behaviours, SE and big phone), |
| t79 | open every sheet reachable from a button, then close it with each close-type button and with a drag down |
| t89 | typing in a talk room or live room: like HelloTalk, the header, seats and listeners stay visible, the latest messages sit just above the box |
| t90old | the Claude app slides the beta up when the keyboard opens, without telling it: the room must still show the header, seats and listeners in the part you can see |
| t90 | the Claude app slides the beta up when the keyboard opens, without telling it: the room must still show the header, seats and listeners in the part you can see |
| t91 | real iPhone inside the Claude app: the beta gets NO keyboard signal at all, and the phone shows only the strip just above the keyboard. |
| t92 | Typing in a talk room on a real iPhone (no keyboard signal, only the strip above the keyboard is visible): |
| t93 | Every screen with a text box: with the keyboard open, sliding the list/chat keeps the keyboard open, nothing changes size |
| t94 | A short chat (1-2 messages): with the keyboard closed the messages start right under the header (no big empty space); |
| t95 | Daily room time: Standard 3 h a day shared by Talk + Live rooms, carries over through the day, back at midnight; Plus/Infinity no limit. |
| t96 | Teacher sign-up from the Join page: full application (what you teach, experience, Stripe ID check, Stripe payouts, teacher promise), |
| t97 | "Plan for later" is a tick box next to "Also show on Flicks": ticking it shows When (day + time), the main button becomes |
| t98 | Language sweep: every screen + sheet (crawled from all tabs, 2 levels of links) in a language vs English, |
| t99 | Static check: every fixed text the code sends to toast(...) or notify(...) must be translated in every language |
| t100 | Tap-every-button robot: on every page (tabs, sub-tabs, 1 level of links) and every sheet, taps each visible button one by one |
| t101 | Money test: hundreds of random money actions; after each one, balances never go negative and every change matches what was |
| t102 | Layout sweep at small width in long languages: every page + sheet (crawled) -> overlapping text, app text cut off ("…" or clipped), |
| t103 | Re-check every button the robot flagged as "does nothing": fresh page load for each, real tap, compare saved data + screen state + page. |
| t104 | Round-2 language fixes: VoiceOver labels translated on main screens in every language, "Share X's profile" not mangled, |
| t105 | Chats list red divider lines + talk room cards (red edge, glow, Join) in light/dark, 320/390, en/fr/ar. |
| t106 | Pages open at the right place: a tab or page opened fresh starts at the top; going back returns to where you were; |
| t107d | Keyboard: every form field gets a "Done" pill to put the keyboard down (on screen, next to the field, follows it), tapping it blurs; |
| t107 | (v88: forms now get the iPhone-style bar on top of the keyboard instead of the pill) |
| t108 | The box you're typing in is never rebuilt by a redraw (same element, no blur/focus flicker, text and caret kept), |
| t109 | Silent keyboard (Claude app on iPhone): on a touch phone where nothing reports the keyboard, the app moves into the part above the |
| t110 | Tap people in room / live comments -> their card; Live guest (voice only): viewer asks, host invites, accept first, one guest, mute, back to audience. |
| t111.v83 | Live "Comments" button: hides only the comment list (gifts/hearts still show), you can still comment, comes back on the next live; |
| t111 | Live "Comments" button: hides only the comment list (gifts/hearts still show), you can still comment, comes back on the next live; |
| t112.v83 | Live Like rail (founder picked option C): red heart with count + Share on the right (left in Arabic), not in the bottom bar; |
| t112 | Live side button (founder, 14 Nov): likes removed completely; Like and Share replaced by the Plus "who viewed your profile" eye |
| t113 | Flicks: the caption block (name, tags, caption, Translate, sound label) must never overlap the "Add a comment" bar, |
| t114 | Rooms round (v84): talk top bar + gifters, ••• menu, room settings, 2 co-hosts, live layout/bar/modes/no likes, |
| t115 | Me > Language card: the A1..C2 labels sit in one row under the 6 bars, each under its own bar (founder screenshot 14 Nov: they were stacked). |
| t116 | One room at a time (founder, 15 Nov): tapping another room asks first; a host can't join another room while theirs is open: |
| t117 | Sign-up clarity (founder 15 Nov): display name + birthday required (no silent 'Sam', no pre-filled 1999), reason line above Continue, |
| t118 | (v88) Keyboard bar for forms + sign-up data for the admin site. |
| t119 | (v90) 1) Paid lives are circles (grid after 2 tiles, no gap; search, Flicks and the mini window marked; join goes to the lesson). |
| t120 | (v92) Form keyboard bar in the Claude app on iPhone: the page is NOT slid (measured on the founder's phone), so the bar sits on |
| t121 | (v94) Search lists in sign-up (languages you speak / learn, countries, interests) are in A–Z order: |
| t122 | (v95) Teachers: decisions come from our team (beta: Settings → Beta tools), with notices; Open room header; payout page; certificate |
| t123 | (v96) Send closes the keyboard (rooms, lives, Flick comments; not chats) · mini live X like talk · host steps away (talk + live) |
| t124o | v97: Flick comments — first tap on the box: the box must sit above the keyboard, the panel's top on screen; keyboard closes → panel back down |
| t124 | v97: Flick comments — first tap on the box: the box must sit above the keyboard, the panel's top on screen; keyboard closes → panel back down |
| t125 | v98: Me card — stats tiles (F) above the language levels, numbers lined up, taps work, fits 320 + Arabic |
| t126 | v101: teacher messages first in Chats — Room alerts row stays first, then a red banner while a teacher message is unread, then teacher chats (pinned), then the rest |
| t127 | v102: Room alerts feed (F2) — newest at bottom & opens there, ended = grey/no Join, live = Join works, More rooms → Rooms tab in that language, Mute 8 h, Who alerts me, 7-day expiry |
| t128 | v103: talk room audience row — holds the whole audience, swipe sideways, keeps position across redraws, dots, "All" fixed |
| t129 | v104: top gifters badges all visible; gift animation waits while a menu/sheet is open; ••• and tour dots not squashed by audience dots |
| t129o | v104: top gifters badges all visible; gift animation waits while a menu/sheet is open; ••• and tour dots not squashed by audience dots |
| t130 | v105 audit fixes: edit-profile cover button tappable; gift sheet "send to" row visible on short phones; small text buttons have a bigger tap area; new translations; labels |
| t131 | v106 audit round 2: declined teacher keeps Plus; Chats badge counts groups; Room alerts empty state; French "tu"; no duplicate translation keys |

Also run on every version: every screen at 320, 375, 390 and 430 wide; light and dark; all 8 languages with Arabic right-to-left; keyboard open and closed; random-tap robot users; "tap every button" crawl with no errors and no dead buttons.

## 8. Not done yet in the prototype

- Native feel: launch screen, loading placeholders, pull to refresh, designed empty / error / offline states on every list, consistent spacing and sizes. The founder must pick designs from pictures first.
- One single keyboard rule in code (the behaviour is right, the prototype's code for it is patched in many places; do not copy that code, copy the behaviour).
- "Back soon" screen for live viewers when the host steps away.
- Everything in section 2.

## 9. Suggested build order

1. Project set-up, sign-up, profile, the 5 tabs with demo data, 8 languages, light and dark. No server.
2. Accounts and database; real profiles, follow, block, report.
3. Chats (1-to-1, groups, corrections, translation), notifications.
4. Connect and Flicks.
5. Talk rooms, then live video, then calls.
6. Coins, gifts, Plus, boosts (in-app purchases).
7. Teachers: application, approval through the admin site, paid lessons, payouts.
8. Admin site, moderation, legal pages, store preparation.
