// Builds the app's copy of the beta (step 1 of BUILD_EXACT_COPY.md).
//
//   Run:  node scripts/build-web.mjs
//
// Reads   docs/handoff/talkamigo-beta.html   (the founder's beta — never edited)
// Writes  src/web/page.ts                    (the same page + the small changes below, as a string the app loads)
//
// Every change is listed in CHANGES. Each one must find its text EXACTLY ONCE in the beta,
// otherwise the build stops — so a new beta version can never be patched silently in the wrong place.
// Why each change exists is written next to it (and in docs/DECISIONS.md, 23 Nov 2026, step 1).

import fs from 'node:fs';
import * as squareFlags from '../node_modules/country-flag-icons/string/1x1/index.js';

const SRC = 'docs/handoff/talkamigo-beta.html';
let html = fs.readFileSync(SRC, 'utf8');

/** Replace `find` with `replace`; `find` must occur exactly once. */
function change(name, find, replace) {
  const n = html.split(find).length - 1;
  if (n !== 1) throw new Error(`build-web: change "${name}" expected its text once in the beta, found ${n} times`);
  html = html.replace(find, () => replace);
  applied.push(name);
}
const applied = [];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Real flags (founder, 23 Nov 2026: "use real flags… it's the real app").
//    The beta draws 12 flags with colour stripes and uses emoji for every other country.
//    Now every flag is a real flag picture (country-flag-icons, MIT licence), cropped to a circle
//    with a thin dark ring, at the beta's own sizes and positions.
// ─────────────────────────────────────────────────────────────────────────────
const FLAG_SVGS = Object.fromEntries(
  Object.entries(squareFlags).filter(([k, v]) => /^[A-Z]{2}$/.test(k) && typeof v === 'string'),
);
change('flags: picture helper (replaces emoji flags)',
  "const emojiFlag=(cc)=>cc.toUpperCase().replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt(0)));",
  `/* [app] real flag pictures instead of emoji (scripts/build-web.mjs, change 1) */
const FLAG_SVG=${JSON.stringify(FLAG_SVGS)};
const FLAG_URI={};
const flagUri=(cc)=>{ cc=String(cc||'').toUpperCase(); if(!FLAG_SVG[cc]) return ''; return FLAG_URI[cc]||(FLAG_URI[cc]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(FLAG_SVG[cc])); };
const flagImg=(cc)=>{ const u=flagUri(cc); return u?'<img class="flg" src="'+u+'" alt="" draggable="false">':''; };
/* emojiFlag() keeps its name (used by the country and phone-code lists) but now returns a round flag picture, 1em wide */
const emojiFlag=(cc)=>'<span class="flgem" aria-hidden="true">'+flagImg(cc)+'</span>';`);

change('flags: flagDot (small flag before names and cities)',
  "const flagDot=(cc,s=18)=>!FLAG[cc]&&CN[cc]?`<span role=\"img\" aria-label=\"${CN[cc]}\" style=\"display:inline-block;font-size:${Math.round(s*.95)}px;line-height:1;vertical-align:-2px\">${emojiFlag(cc)}</span>`:FLAG[cc]?`<span role=\"img\" aria-label=\"${FLAG[cc][0]}\" style=\"display:inline-block;width:${s}px;height:${s}px;border-radius:50%;background:${FLAG[cc][1]};vertical-align:-3px;box-shadow:0 0 0 1px var(--line)\"></span>`:'';",
  "const flagDot=(cc,s=18)=>flagUri(cc)?`<span class=\"flgdot\" role=\"img\" aria-label=\"${cName(cc)}\" style=\"width:${s}px;height:${s}px\">${flagImg(cc)}</span>`:'';");

change('flags: badge on profile photos (av)',
  "${f&&!o.noflag?`<span class=\"fl\" role=\"img\" aria-label=\"${f[0]}\" style=\"width:${fs}px;height:${fs}px;background:${f[1]};${f[2]?'display:flex;align-items:center;justify-content:center;font-size:'+Math.round(fs*.75)+'px;line-height:1':''}\">${f[2]?'<i>'+f[2]+'</i>':''}</span>`:''}",
  "${f&&!o.noflag&&flagUri(p.cc)?`<span class=\"fl\" role=\"img\" aria-label=\"${f[0]}\" style=\"width:${fs}px;height:${fs}px\">${flagImg(p.cc)}</span>`:''}");

// ─────────────────────────────────────────────────────────────────────────────
// 2. Wording mistakes in the beta (founder's rules: French always "tu"; one word per idea).
//    Same fixes as the native translations (scripts/translation-fixes.json).
// ─────────────────────────────────────────────────────────────────────────────
change('fr "tu": 10 min left (room)', "fr:'Plus que 10 min · votre salon se termine à $2'", "fr:'Plus que 10 min · ton salon se termine à $2'");
change('fr "tu": 2 min left (room)', "fr:'Plus que 2 min dans votre salon'", "fr:'Plus que 2 min dans ton salon'");
change('fr "tu": room task done', "fr:'Mission réussie · récupérez +$1 XP'", "fr:'Mission réussie · récupère +$1 XP'");
change('fr "tu": room level up', "fr:'Votre salon passe au niveau $1 🎉'", "fr:'Ton salon passe au niveau $1 🎉'");
change('Connect tab name in the profile-boost line (fr)', "fr:'En tête de Connecter pendant 30 min · $1 pièces$2'", "fr:'En tête de Rencontrer pendant 30 min · $1 pièces$2'");
change('Connect tab name in the profile-boost line (ja)', "ja:'コネクトで30分トップ表示 · $1コイン$2'", "ja:'つながるで30分トップ表示 · $1コイン$2'");
change('Italian Flicks tab like the 18 other Italian texts', "\nFlicks|Flicks|Flicks|Flicks|Flicks|Flick|Flicks|Flicks\n", "\nFlicks|Flicks|Flicks|Flicks|Flicks|Flicks|Flicks|Flicks\n");
// lives were called "rooms" in every language, and the delete-account warning lost "Cash out first…"
change('separate wording for lives (10 / 2 min left) + cash-out warning: rules',
  "[/^10 min left in this (room|live)$/,'w10a']",
  "[/^10 min left in this live$/,'w10aLive'],[/^10 min left · your live ends at (\\d\\d:\\d\\d)$/,'w10bLive'],[/^2 min left in your live$/,'w2bLive'],[/^You’ll lose ([\\d.,\\s\\u202f\\u00a0]+) coins and ([\\d.,\\s\\u202f\\u00a0]+) Diamonds\\. Cash out first if you want the money\\.$/,'loseCash'],[/^10 min left in this (room|live)$/,'w10a']");
change('separate wording for lives + cash-out warning: texts',
  "w10a:{fr:'Plus que 10 min dans ce salon'",
  "w10aLive:{fr:'Plus que 10 min dans ce live',es:'Quedan 10 min en este directo',pt:'Faltam 10 min nesta live',de:'Noch 10 Min. in diesem Live',it:'Mancano 10 min in questa live',ja:'このライブは残り10分',ar:'بقيت 10 دقائق في هذا البث'},"
  + "w10bLive:{fr:'Plus que 10 min · ton live se termine à $1',es:'Quedan 10 min · tu directo termina a las $1',pt:'Faltam 10 min · sua live termina às $1',de:'Noch 10 Min. · dein Live endet um $1',it:'Mancano 10 min · la tua live finisce alle $1',ja:'残り10分・$1にライブが終了します',ar:'بقيت 10 دقائق · ينتهي بثك الساعة $1'},"
  + "w2bLive:{fr:'Plus que 2 min dans ton live',es:'Quedan 2 min en tu directo',pt:'Faltam 2 min na sua live',de:'Noch 2 Min. in deinem Live',it:'Mancano 2 min nella tua live',ja:'ライブは残り2分です',ar:'بقيت دقيقتان في بثك'},"
  + "loseCash:{fr:'Tu perdras $1 pièces et $2 Diamants. Retire-les d’abord si tu veux l’argent.',es:'Perderás $1 monedas y $2 Diamantes. Retíralos antes si quieres el dinero.',pt:'Você perderá $1 moedas e $2 Diamantes. Saque antes se quiser o dinheiro.',de:'Du verlierst $1 Münzen und $2 Diamanten. Zahl sie vorher aus, wenn du das Geld willst.',it:'Perderai $1 monete e $2 Diamanti. Prelevali prima se vuoi i soldi.',ja:'$1コインと$2ダイヤを失います。お金が必要なら先に出金してください。',ar:'ستخسر $1 عملة و$2 ماسة. اسحبها أولًا إذا كنت تريد المال.'},"
  + "w10a:{fr:'Plus que 10 min dans ce salon'");
// "Continue as Sam · @sam · phone": the word "phone" was never translated
html = html.split("{google:'Google',apple:'Apple',phone:'phone'}[S.lastAuth]").join("{google:'Google',apple:'Apple',phone:TX('Phone number')}[S.lastAuth]");
applied.push('"Continue as … · phone" translated (2 places)');
// Join said "Step 1 of 8" while the next step says "Step 2 of 9" (the v88 "How did you find us" step was never counted)
change('Join step counter (1)', 'Step 1 of ${A.teacher?13:8}', 'Step 1 of ${A.teacher?14:9}');
change('Join step counter (2)', 'step/(A.teacher?13:8)', 'step/(A.teacher?14:9)');
change('Join step counter (3)', 'NS=TCH?13:8', 'NS=TCH?14:9');

// ─────────────────────────────────────────────────────────────────────────────
// 3. iPhone screen edges (problems that only appear full-screen on a real iPhone, never inside the Claude app):
//    - the beta's height stopped at 900 px (iPhone Pro Max is 932): fill the whole screen on phones;
//    - nothing tappable under the clock / Dynamic Island: every page starts below it;
//    - nothing under the bottom bar: lists end above it; things placed just above the bar move up with the home bar.
//    Extra CSS only, added at the end of the page's styles. Each rule names what it fixes.
// ─────────────────────────────────────────────────────────────────────────────
const APP_CSS = `
/* ===== [app] added by scripts/build-web.mjs (change 3) ===== */
/* flags: real pictures, round, thin dark ring (change 1) */
.flg{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;pointer-events:none;-webkit-user-select:none;user-select:none}
.flgdot{display:inline-block;vertical-align:-3px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.28);flex-shrink:0}
.flgem{display:inline-block;width:1em;height:1em;vertical-align:-.12em;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.28)}
.av .fl{background:#fff!important}
.av .fl .flg{box-shadow:inset 0 0 0 1px rgba(0,0,0,.28)}
/* the app fills the whole iPhone screen (the beta stopped at 900 px tall) */
@media (max-width:599px){ .phone{max-height:none} }
/* nothing under the clock / Dynamic Island: pages start below it… */
.screen{padding-top:env(safe-area-inset-top,0px)}
/* …and things pinned to the top of full-screen pages move down by the same amount
   (Flicks feed and posts, live rooms, calls, Edit profile header, banners and pop-up messages) */
.mtop{padding-top:calc(16px + env(safe-area-inset-top,0px))}
.ephead{top:env(safe-area-inset-top,0px)!important}
.nb{top:calc(8px + env(safe-area-inset-top,0px))}
/* full-screen layers with their own top and bottom controls: the Plus offer screen and the Flick creation screen */
.adwrap{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
.fwrap{padding-top:calc(16px + env(safe-area-inset-top,0px));padding-bottom:calc(22px + env(safe-area-inset-bottom,0px))}
/* the green minimised-call bar covers the clock area too, and the page starts under it */
.callbar{height:calc(62px + env(safe-area-inset-top,0px));padding-top:env(safe-area-inset-top,0px)}
#phone.hascall>.screen{top:calc(62px + env(safe-area-inset-top,0px));padding-top:0}
.toast{top:calc(14px + env(safe-area-inset-top,0px))}
.gcpill{top:calc(8px + env(safe-area-inset-top,0px))}
.cmin{top:calc(14px + env(safe-area-inset-top,0px))}
.fself{top:calc(72px + env(safe-area-inset-top,0px))}
.stream .head{top:calc(14px + env(safe-area-inset-top,0px))}
.lhead{top:calc(14px + env(safe-area-inset-top,0px))}
.lrow2{top:calc(60px + env(safe-area-inset-top,0px))}
.lrow3{top:calc(100px + env(safe-area-inset-top,0px))}
.lsub{top:calc(146px + env(safe-area-inset-top,0px))!important}
.lmode{top:calc(96px + env(safe-area-inset-top,0px))}
.gst{top:calc(98px + env(safe-area-inset-top,0px))}
.lnrow{top:calc(66px + env(safe-area-inset-top,0px))}
.lxin{top:calc(112px + env(safe-area-inset-top,0px))}
.sdots2{top:calc(64px + env(safe-area-inset-top,0px))}
.scount{top:calc(60px + env(safe-area-inset-top,0px))}
.dspill{top:calc(118px + env(safe-area-inset-top,0px))}
.post .txt{top:calc(118px + env(safe-area-inset-top,0px))}
/* bottom bars of pages without the tab bar: keep their buttons above the iPhone home bar */
.wbot{padding-bottom:calc(18px + env(safe-area-inset-bottom,0px))}
.crft{padding-bottom:calc(22px + env(safe-area-inset-bottom,0px))}
.cwrap{padding-bottom:calc(22px + env(safe-area-inset-bottom,0px))}
.epreview,.sndbar{padding-bottom:calc(26px + env(safe-area-inset-bottom,0px))}
/* nothing under the bottom bar: the bar is 68 px + the home bar */
.withtabs{padding-bottom:calc(64px + env(safe-area-inset-bottom,0px))!important}
.mcard{bottom:calc(62px + env(safe-area-inset-bottom,0px))}
.mini{bottom:calc(58px + env(safe-area-inset-bottom,0px))}
.mini.hi{bottom:calc(150px + env(safe-area-inset-bottom,0px))}
.vprog{bottom:calc(82px + env(safe-area-inset-bottom,0px))}
.vlen2{bottom:calc(92px + env(safe-area-inset-bottom,0px))}
/* live: a guest with their camera on (video look + camera badge), and a camera button that isn't allowed in this live */
.lsplit .lt.vid{background:radial-gradient(80% 60% at 30% 25%,rgba(255,190,140,.55),transparent 60%),radial-gradient(90% 70% at 80% 90%,rgba(120,60,200,.6),transparent 60%),#1d1a2b!important}
.lsplit .lt.vid .av{transform:scale(1.25)}
.lsplit .ltvid{position:absolute;top:8px;inset-inline-start:8px;height:24px;padding:0 8px;border-radius:999px;background:#E0101F;display:flex;align-items:center}
.lsplit .ltvid svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.lb3.lgnocam{opacity:.5}
/* [app] typing in a talk room (class rtype, set while the keyboard is up): the room ends at the keyboard; extras hide so messages show */
.troom.rtype .tdock,.troom:has(>.emopan) .tdock,.troom.rtype .trules,.troom:has(>.emopan) .trules,.troom.rtype .tnotice:not(.tpin),.troom:has(>.emopan) .tnotice:not(.tpin),.troom.rtype .ttools,.troom:has(>.emopan) .ttools,.troom.rtype .tsub,.troom:has(>.emopan) .tsub,.troom.rtype .tadots,.troom:has(>.emopan) .tadots{display:none!important}
.troom.rtype form.tbar,.troom:has(>.emopan) form.tbar{padding-bottom:8px!important}
.troom.rtype .rgame,.troom:has(>.emopan) .rgame{margin-top:6px;padding:6px 12px;gap:2px}
.troom.rtype .rgame:not(.col) .rgh,.troom:has(>.emopan) .rgame:not(.col) .rgh,.troom.rtype .rgame .rgsub,.troom:has(>.emopan) .rgame .rgsub{display:none!important}
.troom.rtype .rgame .rgnext,.troom:has(>.emopan) .rgame .rgnext{height:30px}
.troom.rtype #roomscroll,.troom:has(>.emopan) #roomscroll{min-height:0;flex:1 1 auto!important;height:auto!important}
/* (the stage keeps whatever size it had before typing) */
.troom.rtype #roomscroll,.troom:has(>.emopan) #roomscroll{display:flex!important;flex-direction:column}
.troom.rtype #roomscroll::before,.troom:has(>.emopan) #roomscroll::before{content:'';flex:1 1 auto}
.troom>.atlist{position:absolute;left:0;right:0;z-index:12;max-height:46vh;overflow-y:auto}
/* emoji panel open: same layout as while typing; the bar sits right on the panel (no home-bar gap) */
.troom:has(>.emopan) form.tbar{padding-bottom:8px!important}
.troom:has(>.emopan) .tdock{display:none!important}
/* Guess the word: blanks never wrap; the hint is readable in light mode */
.rgword.rgb{white-space:nowrap;overflow:hidden;letter-spacing:.1em!important}
/* live, emoji panel open: the bar sits right on the panel (it was hidden under it) and the comments stay above the bar */
.stream.remo>form.lbar{bottom:256px!important}
.stream.remo>.lcfeed{display:flex!important;bottom:312px!important;max-height:calc(100% - 312px - 190px)!important}
/* the keyboard-down button steps aside while the @ list is open (it covered the names) */
body:has(.atlist) .kbdone.ico{visibility:hidden}
/* live, Framed look with guests: the split screen fills the video box under the LIVE row (it used to keep the full-screen spacing and was squashed into a strip) */
.stream.framed .lsplit{top:57px!important;bottom:8px!important;left:8px;right:8px;border-radius:16px;overflow:hidden}
/* tab bar: the standard iPhone size like HelloTalk (founder, 26 Nov) — 50 pt + the home-bar area, icons and labels just above the home bar */
.tabs{height:calc(50px + max(var(--sa-bottom,0px),4px))!important;padding:3px 2px max(var(--sa-bottom,0px),4px)!important;align-items:start!important}
.tab{height:47px!important;gap:2px!important;justify-content:center}
.tab svg{width:26px!important;height:26px!important}
.tab .tlab{font-size:10.5px}
/* someone's local time on their profile */
.ltime{display:inline-flex;align-items:center;gap:4px;font-size:13px;color:var(--muted);font-weight:600}
.ltime svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2}
.ltime small{font-size:11.5px;opacity:.8}
/* text people type follows its own direction (French in an Arabic app keeps its punctuation on the right side) */
#corr-t,#corr-n,#cmt,#rc-input,#lc-input{unicode-bidi:plaintext}
/* typing in a talk room on small phones: the stage keeps its size; if it doesn't all fit above the keyboard, the stage area scrolls instead of pushing the comment box under the keyboard */
.troom.rtype>.ttop,.troom:has(>.emopan)>.ttop{flex-shrink:0}
.troom.rtype>.tstage,.troom:has(>.emopan)>.tstage{flex:0 0 auto!important}
.troom.rtype #roomscroll,.troom:has(>.emopan) #roomscroll{flex:1 1 0!important;min-height:0}
/* last resort, only when even without the audience row the chat would be under 40 pt (very small phones): the stage area scrolls */
.troom.rtype6>.tstage{flex:0 1 auto!important;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none}
.troom.rtype6 #roomscroll{flex:0 0 72px!important}
.troom.rtype>form.tbar,.troom:has(>.emopan)>form.tbar{flex-shrink:0}
/* the minimised room card steps aside on the Open room screen (it covered the Open button) */
#phone:has(.crs) > .mcard{display:none!important}
/* pop-up messages, Dynamic Island style (founder's pick A, 25 Nov): black, grows out of the island, message under the camera */
.toast{background:#000!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:0 12px 32px rgba(0,0,0,.32)!important;border-radius:26px!important;padding:9px 18px 9px 9px!important;max-width:min(360px,calc(100% - 24px))!important;gap:11px!important}
.toast .tki{width:34px!important;height:34px!important;background:rgba(255,255,255,.16)}
.toast .tki svg{width:18px!important;height:18px!important}
.toast.tk-mute .tki,.toast.tk-red .tki{background:#E0101F!important}
.toast .tkt b{font-size:15px!important}
.toast .tkt small{font-size:13px!important;color:rgba(255,255,255,.62)!important}
.toast.isl{padding-top:46px!important;border-radius:32px!important;min-width:min(250px,calc(100% - 24px));transform-origin:50% 18px;animation:islin .46s cubic-bezier(.2,1.15,.35,1) both!important}
.toast.isl>*{animation:islc .26s .14s both}
@keyframes islin{from{transform:translateX(-50%) scale(.42,.33)}to{transform:translateX(-50%) scale(1)}}
@keyframes islc{from{opacity:0}to{opacity:1}}
.toast.tout{animation:islout .22s cubic-bezier(.4,0,1,1) forwards!important}
.toast.tout>*{animation:none;opacity:0;transition:opacity .1s}
@keyframes islout{to{transform:translateX(-50%) scale(.42,.33);opacity:.6}}
.toast:not(.isl).tout{animation-name:toastoutx!important}
@keyframes toastoutx{to{transform:translateX(-50%) translateY(-10px);opacity:0}}
@media (prefers-reduced-motion:reduce){.toast.isl,.toast.isl>*{animation:none!important}}
/* every pop-up-style notice uses the same Dynamic Island look (founder, 25 Nov): offline / reconnecting, weak connection in calls */
.offbar{left:50%!important;right:auto!important;transform:translateX(-50%);width:max-content;max-width:min(360px,calc(100% - 24px));background:#000!important;border-radius:26px!important;padding:10px 18px 10px 10px!important;gap:11px!important;font-size:14.5px!important;box-shadow:0 12px 32px rgba(0,0,0,.32)!important;animation:toastin .34s cubic-bezier(.2,1.1,.35,1)!important}
.offbar svg{width:34px!important;height:34px!important;padding:8px;border-radius:50%;background:#F29A0C;stroke:#fff!important;box-sizing:border-box}
.offbar.isl{padding-top:46px!important;border-radius:32px!important;min-width:min(250px,calc(100% - 24px));transform-origin:50% 18px;animation:islin .46s cubic-bezier(.2,1.15,.35,1) both!important}
.offbar.isl>*{animation:islc .26s .14s both}
.cqual{position:absolute;left:50%;top:calc(var(--sa-top,0px) + 8px);transform:translateX(-50%);z-index:30;margin:0!important;width:max-content;max-width:min(360px,calc(100% - 24px));background:#000!important;border-radius:26px!important;padding:10px 18px 10px 10px!important;gap:11px!important;font-size:14.5px!important;box-shadow:0 12px 32px rgba(0,0,0,.35);animation:toastin .34s cubic-bezier(.2,1.1,.35,1)!important}
#phone.hasisl .cqual{top:11px;padding-top:46px!important;border-radius:32px!important;min-width:min(250px,calc(100% - 24px));transform-origin:50% 18px;animation:islin .46s cubic-bezier(.2,1.15,.35,1) both!important}
.cqual svg{width:34px!important;height:34px!important;padding:8px;border-radius:50%;background:#F29A0C;stroke:#fff!important;box-sizing:border-box}
@media (prefers-reduced-motion:reduce){.offbar,.offbar.isl,.offbar.isl>*,.cqual{animation:none!important}}
/* behind the keyboard: the keyboard's own colour (never a white or black gap while it slides) — follows the iPhone's light/dark setting like the keyboard does */
#phone:has(.troom.rtype){background:#CED1D8!important}
@media (prefers-color-scheme:dark){#phone:has(.troom.rtype){background:#2A2A2D!important}}
/* (25 Nov, founder) the stage never changes while typing: same seat size, same shape, empty seats stay. Only what is under it makes room: */
.troom.rtype3 .tl>span:last-child{display:none}
.troom.rtype3 .tlis{padding:2px 0 0!important}
.troom.rtype4 .rgame .rgh2{display:none!important}
.troom.rtype5 .tlis{display:none!important}
/* reply card (talk rooms and lives): sits right above the box, red edge, name in red, the message on one line, × to cancel */
.rrbar{animation:rrin .18s cubic-bezier(.2,.8,.2,1)}
@keyframes rrin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.rrbar .rrbi{width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(224,16,31,.14)}
.rrbar .rrbi svg{width:15px;height:15px;fill:none;stroke:#E0101F;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.rrbar b{color:#E0101F}
.stream .rrbar b{color:#FF8A93}
.stream>.rrbar{bottom:84px;margin:0 12px;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);background:rgba(0,0,0,.55)}
.stream:has(>.rrbar)>.lcfeed{bottom:146px!important}
.rrbar>.rrbi{flex:0 0 28px!important}
body:has(.rrbar) .kbdone.ico{visibility:hidden}
/* minimised live: the × sits inside the card's corner (it was cut off: the card hides anything outside it, and it ran past the screen edge) */
.mcard.mlive .mc-x{top:6px!important;right:auto!important;inset-inline-end:6px!important;width:26px;height:26px;background:rgba(0,0,0,.55);box-shadow:none!important;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.troom>.rrbar{margin:4px 10px 6px}
@media (prefers-reduced-motion:reduce){.rrbar{animation:none}}
/* swipe to reply on room and live comments (same as chats): the row follows the finger, the arrow appears beside it */
#roomscroll [data-sw],#livechat [data-sw]{position:relative;touch-action:pan-y}
[data-theme=light] .troom .rgh2{color:#4A4A55}
`;
// the Plans footer and the "Create group" footer (New group) use the same inline spacing: both move above the home bar
{ const find = '<div class="pad" style="padding-bottom:20px;padding-top:8px">';
  const n = html.split(find).length - 1; if (n !== 2) throw new Error('build-web: bottom footers expected 2, found ' + n);
  html = html.split(find).join('<div class="pad" style="padding-bottom:calc(20px + env(safe-area-inset-bottom,0px));padding-top:8px">');
  applied.push('Plans and New group footers above the home bar'); }
// banners, the offline bar and pop-up messages are stacked from the top by stackTop(): start the stack below the clock
// Founder, 23 Nov: in a live, people in the audience get a raise-hand button to ask to go on stage.
// The mic button only appears once they are on stage (on / off as they like); the host can still mute them.
change('live: audience asks with a raised hand, not a mic',
  'data-a="lg-join" aria-label="${R.gAsk?\'Asked to join\':\'Ask to join\'}">${ic(\'mic\')}</button>',
  'data-a="lg-join" aria-label="${R.gAsk?\'Asked to join\':\'Ask to join\'}">${ic(\'hand\')}</button>');


// (also: the host's "X joined · tap their square…" pop-up was English in every language — translated below)
// ── Live rooms: guest cameras (founder, 23 Nov 2026: 1st guest free, 2nd if the host has Plus, 3rd voice only) ──
change("live guest camera: rules and helpers",
  "const gMut=(R,id)=>!!((R&&R.gMut)||{})[id];",
  "const gMut=(R,id)=>!!((R&&R.gMut)||{})[id];\n/* [app] guest cameras in lives (founder, 23 Nov 2026): the 1st guest can turn their camera on in any live, the 2nd only if the HOST has Plus/Infinity (or is a teacher), the 3rd stays voice only.\n   The camera always starts off, only the guest turns it on, the host can turn it off. In the real app these two numbers are server settings (app_config). */\nconst LG_CAM_FREE=1, LG_CAM_PLUS=2;\nconst lgHostPlus=L=>L.host==='me'?plusOK():!!(L.vip||(P[L.host]&&P[L.host].teacher));\nconst gCamMax=L=>lgHostPlus(L)?LG_CAM_PLUS:LG_CAM_FREE;\nconst gCamOK=(R,L,id)=>{ const k=lgs(R).indexOf(id); return k>-1&&k<gCamMax(L); };\nconst gCam=(R,id)=>!!((R&&R.gCam)||{})[id];\nfunction gCamFix(R,L){ if(!R||!R.gCam||!L) return; Object.keys(R.gCam).forEach(id=>{ if(!gCamOK(R,L,id)) delete R.gCam[id]; }); }\nfunction gCamSet(id,on,byHost){ const R=UI.room, L=R&&S.lives.find(x=>x.id===R.id); if(!L||!isG(R,id)) return; R.gCam=Object.assign({},R.gCam); if(on) R.gCam[id]=true; else delete R.gCam[id];\n  R.chat.push(['_',byHost?(id==='me'?'The host turned your camera off':P[id].name+'’s camera is off'):id==='me'?(on?'You turned your camera on 📹':'You turned your camera off'):P[id].name+(on?' turned their camera on 📹':' turned their camera off')]); render(); }");
change("live guest camera: other guests may turn theirs on",
  "R.gMut=Object.assign({},R.gMut,{[id]:id==='me'});",
  "R.gMut=Object.assign({},R.gMut,{[id]:id==='me'}); if(id!=='me') setTimeout(()=>{ const R2=UI.room; if(R2===R&&isG(R2,id)&&!gCam(R2,id)&&gCamOK(R2,L,id)) gCamSet(id,true); },4000);");
change("live guest camera: off when leaving the stage",
  "if(R.gMut) delete R.gMut[id];",
  "if(R.gMut) delete R.gMut[id]; if(R.gCam) delete R.gCam[id]; gCamFix(R,S.lives.find(x=>x.id===R.id));");
change("live guest camera: square shows the camera",
  "class=\"lt ${k===0?'hst':''} ${k>0&&gMut(R,g)?'mut':''}\"",
  "class=\"lt ${k===0?'hst':''} ${k>0&&gMut(R,g)?'mut':''} ${k>0&&gCam(R,g)?'vid':''}\"");
change("live guest camera: camera badge on the square",
  "${k>0&&gMut(R,g)?`<span class=\"ltmut\">${ic('micoff')}</span>`:''}",
  "${k>0&&gMut(R,g)?`<span class=\"ltmut\">${ic('micoff')}</span>`:''}${k>0&&gCam(R,g)?`<span class=\"ltvid\">${ic('video')}</span>`:''}");
change("live guest camera: button next to the mic",
  "${isG(R,'me')?`<button type=\"button\" class=\"lb3 ${gMut(R,'me')?'':'grn'}\" data-a=\"lg-mic\"",
  "${isG(R,'me')?`<button type=\"button\" class=\"lb3 ${gCam(R,'me')?'grn':''} ${gCamOK(R,L,'me')?'':'lgnocam'}\" data-a=\"lg-vcam\" aria-pressed=\"${gCam(R,'me')?'true':'false'}\" aria-label=\"${gCam(R,'me')?'Turn camera off':'Turn camera on'}\">${ic(gCam(R,'me')?'video':'vidoff')}</button><button type=\"button\" class=\"lb3 ${gMut(R,'me')?'':'grn'}\" data-a=\"lg-mic\"");
change("live guest camera: actions",
  "case 'lg-mic': {",
  "case 'lg-vcam': { const R=UI.room, L=R&&S.lives.find(x=>x.id===R.id); if(!L||!isG(R,'me')) break; if(UI.sheet&&UI.sheet.t==='lgme') UI.sheet=null;\n      if(gCam(R,'me')){ gCamSet('me',false); toast('Your camera is off'); break; }\n      if(!gCamOK(R,L,'me')){ render(); toast(lgs(R).indexOf('me')<LG_CAM_PLUS&&!lgHostPlus(L)?'Only 1 guest camera in this live · Plus hosts can have 2':'Only 2 guests can use their camera · you’re on with your voice'); break; }\n      gCamSet('me',true); toast('Your camera is on · everyone in the live can see you'); break; }\n    case 'lg-camoff': { const R=UI.room; if(!R||!gCam(R,v)) break; UI.sheet=null; gCamSet(v,false,true); toast('Camera turned off'); break; }\n    case 'lg-mic': {");
change("live guest camera: ask for the camera first",
  "function permFor(a,v){ ",
  "function permFor(a,v){ if(a==='lg-vcam'){ const R=UI.room, L=R&&S.lives.find(x=>x.id===R.id); return L&&isG(R,'me')&&!gCam(R,'me')&&gCamOK(R,L,'me')?['cam']:null; } ");
change("live guest camera: host can turn it off",
  "grid=onSt?act('lg-mute',id,muted?'mic':'micoff',muted?'Unmute mic':'Mute mic')+",
  "grid=onSt?act('lg-mute',id,muted?'mic':'micoff',muted?'Unmute mic':'Mute mic')+(gCam(R,id)?act('lg-camoff',id,'vidoff','Turn camera off'):'')+");
change("live guest camera: in the \"You\u2019re a guest\" sheet",
  "<button class=\"btn glass\" data-a=\"lg-leave\">${ic('down')} <span>Back to the audience</span></button>`; }",
  "${(()=>{ const L=S.lives.find(x=>x.id===R.id); return !L?'':gCamOK(R,L,'me')?`<button class=\"btn ${gCam(R,'me')?'glass':''}\" data-a=\"lg-vcam\">${ic(gCam(R,'me')?'vidoff':'video')} <span>${gCam(R,'me')?'Turn my camera off':'Turn my camera on'}</span></button>`:'<p class=\"muted\" style=\"margin:0;font-size:13px\">Your camera stays off in this live</p>'; })()}<button class=\"btn glass\" data-a=\"lg-leave\">${ic('down')} <span>Back to the audience</span></button>`; }");
change("live guest camera: texts in 8 languages",
  "\nTurn camera off|Couper la caméra|Apagar la cámara|Desligar a câmera|Kamera ausschalten|Spegni la fotocamera|カメラをオフにする|إيقاف الكاميرا\n",
  "\nTurn camera off|Couper la caméra|Apagar la cámara|Desligar a câmera|Kamera ausschalten|Spegni la fotocamera|カメラをオフにする|إيقاف الكاميرا\nYour camera is on · everyone in the live can see you|Ta caméra est allumée · tout le live te voit|Tu cámara está encendida · todo el directo te ve|Sua câmera está ligada · todos na live veem você|Deine Kamera ist an · alle im Live sehen dich|La fotocamera è accesa · tutti nella live ti vedono|カメラがオンです · ライブの全員に映っています|الكاميرا تعمل · يراك الجميع في البث\nYour camera is off|Ta caméra est coupée|Tu cámara está apagada|Sua câmera está desligada|Deine Kamera ist aus|La fotocamera è spenta|カメラがオフです|الكاميرا متوقفة\nOnly 1 guest camera in this live · Plus hosts can have 2|Une seule caméra d’invité dans ce live · les hôtes Plus peuvent en avoir 2|Solo 1 cámara de invitado en este directo · los anfitriones Plus pueden tener 2|Só 1 câmera de convidado nesta live · anfitriões Plus podem ter 2|Nur 1 Gastkamera in diesem Live · Plus-Hosts können 2 haben|Solo 1 fotocamera ospite in questa live · gli host Plus possono averne 2|このライブのゲストカメラは1台まで · Plusのホストは2台まで使えます|كاميرا ضيف واحدة فقط في هذا البث · يمكن لمضيفي Plus استخدام كاميرتين\nOnly 2 guests can use their camera · you’re on with your voice|Seuls 2 invités peuvent allumer leur caméra · toi, tu es là avec ta voix|Solo 2 invitados pueden usar su cámara · tú participas con tu voz|Só 2 convidados podem usar a câmera · você participa com a voz|Nur 2 Gäste können ihre Kamera nutzen · du bist mit deiner Stimme dabei|Solo 2 ospiti possono usare la fotocamera · tu partecipi con la voce|カメラを使えるゲストは2人まで · あなたは音声で参加中です|يمكن لضيفين فقط استخدام الكاميرا · أنت مشارك بصوتك\nYou turned your camera on 📹|Tu as allumé ta caméra 📹|Encendiste tu cámara 📹|Você ligou sua câmera 📹|Du hast deine Kamera eingeschaltet 📹|Hai acceso la fotocamera 📹|カメラをオンにしました 📹|شغّلت الكاميرا 📹\nYou turned your camera off|Tu as coupé ta caméra|Apagaste tu cámara|Você desligou sua câmera|Du hast deine Kamera ausgeschaltet|Hai spento la fotocamera|カメラをオフにしました|أوقفت الكاميرا\nThe host turned your camera off|L’hôte a coupé ta caméra|El anfitrión apagó tu cámara|O anfitrião desligou sua câmera|Der Host hat deine Kamera ausgeschaltet|L’host ha spento la tua fotocamera|ホストがあなたのカメラをオフにしました|أوقف المضيف الكاميرا الخاصة بك\nCamera turned off|Caméra coupée|Cámara apagada|Câmera desligada|Kamera ausgeschaltet|Fotocamera spenta|カメラをオフにしました|تم إيقاف الكاميرا\nTurn my camera on|Allumer ma caméra|Encender mi cámara|Ligar minha câmera|Meine Kamera einschalten|Accendi la mia fotocamera|カメラをオンにする|تشغيل الكاميرا\nTurn my camera off|Couper ma caméra|Apagar mi cámara|Desligar minha câmera|Meine Kamera ausschalten|Spegni la mia fotocamera|カメラをオフにする|إيقاف الكاميرا\nYour camera stays off in this live|Ta caméra reste coupée dans ce live|Tu cámara se queda apagada en este directo|Sua câmera fica desligada nesta live|Deine Kamera bleibt in diesem Live aus|La tua fotocamera resta spenta in questa live|このライブではカメラはオフのままです|تبقى الكاميرا متوقفة في هذا البث\n");
change("live guest camera: texts with names (rules)",
  "[/^10 min left in this (room|live)$/,'w10a']",
  "[/^(.+) turned their camera on 📹$/,'gcamOn'],[/^(.+) joined · tap their square to mute or move them$/,'lgjoinT'],[/^(.+) turned their camera off$/,'gcamOff'],[/^(.+)’s camera is off$/,'gcamHostOff'],[/^10 min left in this (room|live)$/,'w10a']");
change("live guest camera: texts with names (8 languages)",
  "w10a:{fr:'Plus que 10 min dans ce salon'",
  "lgjoinT:{fr:'$1 a rejoint le live · touche sa case pour couper son micro ou l’envoyer dans le public',es:'$1 se unió · toca su recuadro para silenciar o mover',pt:'$1 entrou · toque no quadro para silenciar ou mover',de:'$1 ist dabei · tippe auf das Feld, um stummzuschalten oder zu verschieben',it:'$1 è sul palco · tocca il riquadro per silenziare o spostare',ja:'$1さんが参加しました · 枠をタップしてミュートや移動ができます',ar:'انضمام $1 · اضغط على المربّع لكتم الصوت أو النقل'},gcamOn:{fr:'$1 a allumé sa caméra 📹',es:'$1 encendió su cámara 📹',pt:'$1 ligou a câmera 📹',de:'$1 hat die Kamera eingeschaltet 📹',it:'$1 ha acceso la fotocamera 📹',ja:'$1さんがカメラをオンにしました 📹',ar:'الكاميرا مفعّلة لدى $1 📹'},gcamOff:{fr:'$1 a coupé sa caméra',es:'$1 apagó su cámara',pt:'$1 desligou a câmera',de:'$1 hat die Kamera ausgeschaltet',it:'$1 ha spento la fotocamera',ja:'$1さんがカメラをオフにしました',ar:'الكاميرا متوقفة لدى $1'},gcamHostOff:{fr:'Caméra de $1 coupée',es:'Cámara de $1 apagada',pt:'Câmera de $1 desligada',de:'Kamera von $1 ist aus',it:'Fotocamera di $1 spenta',ja:'$1さんのカメラをオフにしました',ar:'تم إيقاف كاميرا $1'},w10a:{fr:'Plus que 10 min dans ce salon'");


// ── Talk room typing (founder's screenshots, 23 Nov): room fits above the keyboard, @ list above the bar, no gap above emojis ──
change("typing in a talk room: nothing is lifted (the room fits above the keyboard instead)",
  "const stillEls=(c)=>c.kind==='sheet'?[c.box]:c.kind==='room'?[...c.box.querySelectorAll(':scope > .tdock, :scope > form.tbar')]:c.kind==='live'?[...c.box.querySelectorAll(':scope > .lcfeed, :scope > .lrail, :scope > form.lbar')]:[c.f];",
  "const stillEls=(c)=>c.kind==='sheet'?[c.box]:c.kind==='room'?[]:c.kind==='live'?[...c.box.querySelectorAll(':scope > .lcfeed, :scope > .lrail, :scope > form.lbar, :scope > .atlist, :scope > .trcard, :scope > .rrbar')]:[c.f];");
change("typing in a talk room: the room ends at the keyboard",
  "phone.classList.remove('kbopen','kbb'); phone.classList.add('kbstill'); UI.kbBlind=false;",
  "phone.classList.remove('kbopen','kbb'); phone.classList.add('kbstill'); UI.kbBlind=false;\n    /* [app] (founder, 23 Nov) typing in a talk room: the top of the room never moves, the room simply ends where the keyboard starts.\n       Extras hide (quick replies, rules, mode row, empty seats, subtitles; the game card shows only the word/blanks and hint), so the\n       latest messages stay visible right above the bar. Before, only the bar was lifted: it covered the game card and hid the chat. */\n    if(c.kind==='room'){ const b=c.box, sTop=st?st.getBoundingClientRect().top:0, top=b.getBoundingClientRect().top-sTop; b.classList.add('rtype');\n      const h=Math.max(220,Math.round(ln.V-top)); if(b.style.height!==h+'px'){ b.style.height=h+'px'; b.style.maxHeight=h+'px'; }\n      const sc=document.getElementById('roomscroll'); if(sc&&(anim||sc.scrollHeight-sc.scrollTop-sc.clientHeight<80)) sc.scrollTop=sc.scrollHeight;\n      const al=b.querySelector(':scope > .atlist'), fb=b.querySelector(':scope > form.tbar'); if(al&&fb) al.style.bottom=(b.getBoundingClientRect().bottom-fb.getBoundingClientRect().top)+'px';\n      /* if the chat has less than ~80 pt: the audience row drops its names → the game card drops its hint line → the audience row hides (only as far as needed) */\n      b.classList.remove('rtype3','rtype4','rtype5','rtype6'); const chatH=()=>{ const q=document.getElementById('roomscroll'); return q?q.getBoundingClientRect().height:999; };\n      for(const k of ['rtype3','rtype4','rtype5']){ if(chatH()>=80) break; b.classList.add(k); } if(chatH()<40) b.classList.add('rtype6');\n      if(b._flip){\n      /* slide the bar and the messages from where the bar was to its new place, with the keyboard's curve */\n      const fb1=b.querySelector(':scope > form.tbar'), d=b._flip.y0-(fb1?fb1.getBoundingClientRect().top:0); b._flip=null; const sc1=document.getElementById('roomscroll'); if(sc1) sc1.scrollTop=sc1.scrollHeight;\n      if(fb1&&d>4&&!matchMedia('(prefers-reduced-motion: reduce)').matches) [fb1,sc1,b.querySelector(':scope > .rrbar')].filter(Boolean).forEach(e=>e.animate([{transform:'translateY('+d+'px)'},{transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.85,.25,1)'})); }\n      UI.kbLift=0; UI.kbStillK='room'; return; }");
change("typing in a talk room: back to normal when the keyboard closes",
  "phone.querySelectorAll('.kbsp').forEach(e=>e.remove());",
  "phone.querySelectorAll('.kbsp').forEach(e=>e.remove());\n    phone.querySelectorAll('.troom.rtype').forEach(b=>{ b.classList.remove('rtype'); b.style.height=''; b.style.maxHeight=''; const al=b.querySelector(':scope > .atlist'); if(al) al.style.bottom=''; });\n    if(UI.fxQ&&UI.fxQ.length){ if(UI.fxQ.length>1) UI.fxQ=UI.fxQ.slice(-1); setTimeout(fxNext,400); }");
change("@ list sits above the typing bar",
  "if(!box){ box=document.createElement('div'); box.className='atlist'; f.parentElement.insertBefore(box,f); }",
  "if(!box){ box=document.createElement('div'); box.className='atlist'; f.parentElement.insertBefore(box,f); }\n  if(f.parentElement.classList.contains('troom')){ const pr=f.parentElement.getBoundingClientRect(), ft=f.getBoundingClientRect().top; box.style.bottom=(pr.bottom-ft)+'px'; const hd=f.parentElement.querySelector('.ttop'); box.style.maxHeight=Math.max(120,Math.round(ft-(hd?hd.getBoundingClientRect().bottom:pr.top+90)-8))+'px'; }\n  if(window.stillAgain) setTimeout(window.stillAgain,0);");
change("gift animations wait while you type",
  "if(phone.querySelector('.veil')){ (UI.fxQ=UI.fxQ||[]).push(",
  "if(phone.querySelector('.veil')||phone.classList.contains('kbstill')){ (UI.fxQ=UI.fxQ||[]).push(");
change("gift animations wait while you type (queue)",
  "if(!UI.fxQ||!UI.fxQ.length||phone.querySelector('.veil')||phone.querySelector('.giftfx')) return;",
  "if(!UI.fxQ||!UI.fxQ.length||phone.querySelector('.veil')||phone.querySelector('.giftfx')||phone.classList.contains('kbstill')) return;");
change("Guess the word: blanks on one line",
  "`<b class=\"rgword rgb\">${[...g.w].map(c=>c===' '?'&nbsp;':'_').join(' ')}</b>`",
  "`<b class=\"rgword rgb\" style=\"font-size:${g.w.length<=7?20:g.w.length<=10?17:14}px\">${[...g.w].map(c=>c===' '?'&nbsp;':'_').join(' ')}</b>`");


// ── Reply to a comment in talk rooms and lives: WhatsApp-style card + swipe right to reply (founder, 23 Nov) ──
change("swipe to reply: talk room comments",
  "`<div class=\"tmsg${w!=='me'&&mentionsMe(t)?' tmme':''}\">",
  "`<div class=\"tmsg${w!=='me'&&mentionsMe(t)?' tmme':''}\" data-sw=\"rcm|${w}\">");
change("swipe to reply: live comments",
  "`<div class=\"lc lc2${w!=='me'&&mentionsMe(t)?' tmme':''}\">",
  "`<div class=\"lc lc2${w!=='me'&&mentionsMe(t)?' tmme':''}\" data-sw=\"rcm|${w}\">");
change("swipe to reply: same pull and arrow as chats",
  "const isMsg=swS.el.dataset.sw.startsWith('msg|');",
  "const isMsg=swS.el.dataset.sw.startsWith('msg|')||swS.el.dataset.sw.startsWith('rcm|');");
change("swipe to reply: let go past the line → reply card + keyboard",
  "if(k==='msg'&&s.dx>=56){",
  "/* [app] (founder, 23 Nov) room and live comments: pull right past the line → the reply card appears above the box and the keyboard opens, like WhatsApp */\n  if(k==='rcm'){ if(s.dx>=56&&UI.room){ const t=(s.el.querySelector('.rht')||{}).textContent||''; UI.rre={who:id,t}; UI.remo=null; UI.sheet=null; render();\n      const i2=document.getElementById(UI.room.kind==='live'?'lc-input':'rc-input'); if(i2){ if(window.stillPre) window.stillPre(i2); try{ i2.focus({preventScroll:true}); }catch(x){ i2.focus(); } if(window.stillAgain) setTimeout(window.stillAgain,30); } } return; }\n  if(k==='msg'&&s.dx>=56){");
change("reply card: who and what you are replying to",
  "function rreBar(){ const q=UI.rre; return `<div class=\"rrbar\"><span><b><span>Reply to</span> ${q.who==='me'?'<span>yourself</span>':P[q.who]?P[q.who].name:''}</b>",
  "function rreBar(){ const q=UI.rre; return `<div class=\"rrbar\" role=\"status\"><span class=\"rrbi\">${ic('reply')}</span><span><b><span>Reply to</span> ${q.who==='me'?'<span>yourself</span>':P[q.who]?P[q.who].name:''}</b>");


// ── Talk room seats (founder, 24–25 Nov): fixed seat numbers; the stage never changes while typing ──
change("stage seats: everyone keeps their seat number",
  "const stage=[r.host,...r.speakers,...(R.onStage&&!host?['me']:[])].slice(0,max);\n  const seatsN=Math.max(max,stage.length);",
  "/* [app] (founder, 24 Nov) fixed seats: whoever goes up gets the first free seat and keeps it until they leave the stage.\n     Someone joining never pushes anyone along; someone leaving leaves their seat empty (numbered) for the next person. */\n  const onSt=[r.host,...r.speakers,...(R.onStage&&!host?['me']:[])].filter((x,k,a)=>x&&a.indexOf(x)===k), seatOf=R.seatOf||(R.seatOf={});\n  Object.keys(seatOf).forEach(x=>{ if(!onSt.includes(x)||(x!==r.host&&seatOf[x]===0)) delete seatOf[x]; }); seatOf[r.host]=0;\n  onSt.forEach(x=>{ if(seatOf[x]==null){ const used=new Set(Object.values(seatOf)); let k=1; while(used.has(k)) k++; seatOf[x]=k; } });\n  const stage=[]; onSt.forEach(x=>{ if(seatOf[x]<max) stage[seatOf[x]]=x; });\n  const seatsN=Math.max(max,stage.length);");
change("stage seats: audience count uses the people on stage",
  "const lisN=Math.max(0,r.count-stage.length), pool=Object.keys(P).filter(x=>!stage.includes(x)&&x!==r.host&&!isBlocked(x))",
  "const lisN=Math.max(0,r.count-stage.filter(Boolean).length), pool=Object.keys(P).filter(x=>!stage.includes(x)&&x!==r.host&&!isBlocked(x))");
change("typing with 5+ on stage: seats in one row",
  "if(c.kind==='room'){ const b=c.box, sTop=st?st.getBoundingClientRect().top:0, top=b.getBoundingClientRect().top-sTop; b.classList.add('rtype');",
  "if(c.kind==='room'){ const b=c.box, sTop=st?st.getBoundingClientRect().top:0, top=b.getBoundingClientRect().top-sTop; { const fbA=b.querySelector(':scope > form.tbar'); if(fbA&&!b.classList.contains('rtype')) b._yA=fbA.getBoundingClientRect().top; } b.classList.add('rtype');\n      /* the stage itself never changes while typing (founder, 25 Nov); what is under it makes room, see the steps below */");
change("typing with 5+ on stage: back to two rows after",
  "phone.querySelectorAll('.troom.rtype').forEach(b=>{ b.classList.remove('rtype');",
  "phone.querySelectorAll('.troom.rtype').forEach(b=>{ b.classList.remove('rtype','rtype2','rtype3','rtype4','rtype5','rtype6');");


// ── Full stage (founder, 25 Nov): asking to go up when all seats are taken says so ──
change("full stage: helper",
  "function vRoom(id){",
  "/* [app] (founder, 25 Nov) how many people are on stage right now, and whether every seat is taken */\nfunction stageFull(r,R){ if(!r) return false; const n=1+(r.speakers||[]).length+(R&&R.onStage&&r.host!=='me'?1:0); return n>=seatMax(r); }\nfunction vRoom(id){");
change("full stage: asking to go up",
  "case 'hand': { const R=UI.room; if(!R) return; if(R.onStage){ UI.sheet={t:'stage'}; render(); return; } R.hand=!R.hand; render();",
  "case 'hand': { const R=UI.room; if(!R) return; if(R.onStage){ UI.sheet={t:'stage'}; render(); return; }\n      if(!R.hand&&stageFull(S.rooms.find(x=>x.id===R.id),R)){ toast('The stage is full · Try again when someone leaves the stage'); break; }\n      R.hand=!R.hand; render();");
change("full stage: the host answers a raised hand only if a seat is free",
  "if(UI.room&&UI.room.hand&&!UI.room.onStage){ const r=S.rooms.find(x=>x.id===UI.room.id); UI.room.inv=r?r.host:null; render(); }",
  "if(UI.room&&UI.room.hand&&!UI.room.onStage){ const r=S.rooms.find(x=>x.id===UI.room.id); if(stageFull(r,UI.room)){ UI.room.hand=false; render(); toast('The stage is full · Try again when someone leaves the stage'); return; } UI.room.inv=r?r.host:null; render(); }");
change("full stage: accepting an invitation",
  "case 'inv-yes': if(UI.room) UI.room.onStageAt=UI.room.t; { const R=UI.room; if(!R) break;",
  "case 'inv-yes': if(UI.room&&!UI.room.onStage&&stageFull(S.rooms.find(x=>x.id===UI.room.id),UI.room)){ UI.room.inv=null; UI.room.hand=false; render(); toast('The stage is full · Try again when someone leaves the stage'); break; } if(UI.room) UI.room.onStageAt=UI.room.t; { const R=UI.room; if(!R) break;");
change("full stage: the host lets someone up",
  "case 'req-ok': { const R=UI.room, r=S.rooms.find(x=>x.id===R.id); r.speakers.push(R.req);",
  "case 'req-ok': { const R=UI.room, r=S.rooms.find(x=>x.id===R.id); if(stageFull(r,R)){ toast('The stage is full'); break; } r.speakers.push(R.req);");
change("full stage: texts in 8 languages",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nThe stage is full · Try again when someone leaves the stage|La scène est pleine · Réessaie quand quelqu’un en descend|El escenario está lleno · Inténtalo cuando alguien baje|O palco está cheio · Tente de novo quando alguém sair|Die Bühne ist voll · Versuch es, wenn jemand runtergeht|Il palco è pieno · Riprova quando qualcuno scende|ステージは満席です · 誰かが降りたらもう一度どうぞ|المنصة ممتلئة · حاول مجددًا عندما يغادرها أحد\n");

change('top layers start below the clock (stackTop)',
  "let y=phone.classList.contains('hascall')?70:8;",
  "let y=(phone.classList.contains('hascall')?70:8)+appSafeTop();");
change('helper: height of the clock / Dynamic Island area',
  "function stackTop(){",
  "/* [app] height of the iPhone's top safe area (clock / Dynamic Island), measured once per layout */\nlet APP_SAFE_TOP=null; window.addEventListener('resize',()=>{ APP_SAFE_TOP=null; });\nfunction appSafeTop(){ if(APP_SAFE_TOP===null){ const d=document.createElement('div'); d.style.cssText='position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none'; document.body.appendChild(d); APP_SAFE_TOP=d.offsetHeight||0; d.remove(); } return APP_SAFE_TOP; }\nfunction stackTop(){");

// ── Pop-up messages: Dynamic Island style (founder picked A, 25 Nov) + gift stops when typing starts ──
change("pop-ups: Dynamic Island position",
  "if(t){ const pr=phone.getBoundingClientRect(); const scr=[...phone.children].filter(e=>e.classList&&e.classList.contains('screen')).pop(); const sheet=",
  "/* [app] (founder's pick A, 25 Nov) pop-up messages always come out of the Dynamic Island at the top (or sit under the clock on iPhones\n     without one); banners, the offline bar and the call bar keep their place above them. The old placement below is no longer used. */\n  if(t){ const isl=appSafeTop()>=54, free=!off&&!nbs.length&&!phone.classList.contains('hascall'); t.classList.remove('tbot'); t.style.bottom=''; t.classList.toggle('isl',isl&&free); t.style.top=(isl&&free?11:y)+'px'; }\n  if(false){ const pr=phone.getBoundingClientRect(); const scr=[...phone.children].filter(e=>e.classList&&e.classList.contains('screen')).pop(); const sheet=");
change("pop-ups: shrink back into the island when they go",
  "function toast(t,ms){ UI.toast=t; render(); clearTimeout(toast.h); toast.h=setTimeout(()=>{UI.toast='';render();},ms||2000); }",
  "function toast(t,ms){ UI.toast=t; render(); clearTimeout(toast.h); toast.h=setTimeout(()=>{ const el=phone.querySelector(':scope > .toast'); if(el&&!matchMedia('(prefers-reduced-motion: reduce)').matches){ el.classList.add('tout'); toast.h=setTimeout(()=>{ UI.toast=''; render(); },230); } else { UI.toast=''; render(); } },ms||2000); }");
change("gift animation stops when you start typing",
  "phone.classList.remove('kbopen','kbb'); phone.classList.add('kbstill'); UI.kbBlind=false;",
  "if(!phone.classList.contains('kbstill')) phone.querySelectorAll(':scope > .giftfx').forEach(x=>x.remove());\n    phone.classList.remove('kbopen','kbb'); phone.classList.add('kbstill'); UI.kbBlind=false;");


// ── Offline and weak-connection notices in the same Dynamic Island style (founder, 25 Nov) ──
change("offline notice: Dynamic Island too",
  "if(off){ off.style.top=y+'px'; y+=off.offsetHeight+8; }",
  "phone.classList.toggle('hasisl',appSafeTop()>=54);\n  if(off){ const oi=appSafeTop()>=54&&!phone.classList.contains('hascall'); off.classList.toggle('isl',oi); off.style.top=(oi?11:y)+'px'; y=(oi?11:y)+off.offsetHeight+8; }");


// ── Talk room typing: the bar and messages slide with the keyboard (smooth); keyboard colour behind it (founder, 25 Nov) ──
change("typing in a talk room: the room takes its size at once, the bar slides (opening)",
  "const h=Math.max(220,Math.round(ln.V-top)); if(b.style.height!==h+'px'){ b.style.height=h+'px'; b.style.maxHeight=h+'px'; }",
  "const h=Math.max(220,Math.round(ln.V-top)); if(b.style.height!==h+'px'){\n        /* [app] (founder, 25 Nov: smoother) the room takes its new size at once and only the bar and the messages slide, on the phone's graphics chip\n           (animating the room's height redrew the whole room on every frame, which felt laggy) */\n        const fb0=b.querySelector(':scope > form.tbar'); b._flip={y0:b._yA!=null?b._yA:(fb0?fb0.getBoundingClientRect().top:0)}; b._yA=null; b.style.transition=''; b.style.height=h+'px'; b.style.maxHeight=h+'px'; }");
change("typing in a talk room: the bar slides back (closing)",
  "phone.querySelectorAll('.troom.rtype').forEach(b=>{ b.classList.remove('rtype','rtype2','rtype3','rtype4','rtype5','rtype6'); b.style.height=''; b.style.maxHeight='';",
  "phone.querySelectorAll('.troom.rtype').forEach(b=>{ const fb0=b.querySelector(':scope > form.tbar'), y0=fb0?fb0.getBoundingClientRect().top:0;\n      b.classList.remove('rtype','rtype2','rtype3','rtype4','rtype5','rtype6'); b.style.transition=''; b.style.height=''; b.style.maxHeight=''; b._flip=null;\n      /* the bar and the messages slide back down with the keyboard (graphics chip only, no redraw of the room per frame) */\n      if(fb0&&!matchMedia('(prefers-reduced-motion: reduce)').matches){ const d=y0-fb0.getBoundingClientRect().top; if(Math.abs(d)>4) [fb0,b.querySelector('#roomscroll'),b.querySelector(':scope > .tdock')].filter(Boolean).forEach(e=>e.animate([{transform:'translateY('+d+'px)'},{transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.85,.25,1)'})); }");


// ── Real activity numbers on Me (founder, 25 Nov: "corrections given" never went up) ──
change("Me: real activity numbers (log + this week + streak)",
  "function vProfile(){",
  "/* [app] (founder, 25 Nov) REAL activity numbers on Me. Every correction you send and every minute you spend in a call, a talk room or a live\n   is logged per day (and per language for minutes) in S.act; Me → This week, Today, the streak, the day dots and the time under each\n   language on the Language card are worked out from it (they used to be fixed numbers). In the real app the server keeps this log. */\nconst actKey=d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();\nfunction actDay(d){ const A=S.act||(S.act={v:1,days:{}}), k=actKey(d||new Date()); return A.days[k]||(A.days[k]={m:0,f:0,l:{}}); }\nfunction practiceAdd(min,lang,fix){ const D=actDay(); if(min){ D.m+=min; if(lang) D.l[lang]=(D.l[lang]||0)+min; } if(fix) D.f+=fix; save&&save(); }\nfunction actSeed(){ /* the demo account: 27 days of practice so it looks lived in; new accounts start empty */\n  const A={v:1,days:{}}, now=new Date(); for(let i=26;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); const r=(d.getDate()*37+d.getMonth()*11)%23, m=i===0?12:14+r, fr=Math.round(m*.64);\n    A.days[actKey(d)]={m,f:i===0?0:i<7?(r%3)+1:(r%2),l:{French:fr,Spanish:m-fr}}; } return A; }\nfunction actSync(){ if(!S.act) S.act=S.noActSeed?{v:1,days:{}}:actSeed(); const A=S.act.days, now=new Date(), t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());\n  const mon=new Date(t0); mon.setDate(t0.getDate()-((t0.getDay()+6)%7)); let mins=0, fixes=0; const days=[], lm={};\n  for(let i=0;i<7;i++){ const d=new Date(mon); d.setDate(mon.getDate()+i); const D=A[actKey(d)]; const past=d<=t0; days.push(past&&D&&(D.m>=1||D.f>0)?1:0); if(D&&past){ mins+=D.m; fixes+=D.f; Object.entries(D.l||{}).forEach(([l,v])=>lm[l]=(lm[l]||0)+v); } }\n  S.week={mins:Math.floor(mins),fixes,days}; const T=A[actKey(t0)]; S.today=Math.floor(T?T.m:0);\n  let st=0; const d=new Date(t0); const act=x=>{ const D=A[actKey(x)]; return D&&(D.m>=1||D.f>0); }; if(!act(d)) d.setDate(d.getDate()-1); while(act(d)&&st<4000){ st++; d.setDate(d.getDate()-1); } S.streak=st;\n  S.me.mins={}; Object.entries(lm).forEach(([l,v])=>S.me.mins[l]=Math.floor(v));\n  Object.keys(A).forEach(k=>{ const [y,mo,da]=k.split('-').map(Number); if((t0-new Date(y,mo-1,da))/864e5>60) delete A[k]; }); }\n/* time in a call, a talk room or a live counts every 15 s while the app is open (the language is the room's; calls count for the language you learn) */\nsetInterval(()=>{ try{ if(document.hidden||!S.onboarded||UI.ob||UI.auth) return; let lang=null; if(onCall()) lang=S.me.learning; else if(UI.room&&!UI.room.paused) lang=roomLangOf(RXo())||S.me.learning; if(lang) practiceAdd(.25,lang,0); }catch(e){} },15000);\nfunction vProfile(){ actSync();");
change("corrections count (chat)",
  "c.msgs.push({f:'fix',wrong:m.t,right,note:document.getElementById('corr-n').value.trim()||'Corrected by '+S.me.name,by:'me'});",
  "c.msgs.push({f:'fix',wrong:m.t,right,note:document.getElementById('corr-n').value.trim()||'Corrected by '+S.me.name,by:'me'}); practiceAdd(0,null,1);");
change("corrections count (Flick comments)",
  "(S.extraComments[v]=S.extraComments[v]||[]).unshift(['me',m.text,t]); UI.ctab='fixes';",
  "(S.extraComments[v]=S.extraComments[v]||[]).unshift(['me',m.text,t]); practiceAdd(0,null,1); UI.ctab='fixes';");
change("new accounts start with an empty activity log",
  "S.me.mins={}; S.me.photo=''; S.me.city=''; S.me.name='';",
  "S.me.mins={}; S.act={v:1,days:{}}; S.me.photo=''; S.me.city=''; S.me.name='';");


// ── Chats audit fixes (25 Nov): correction sheet keyboard, block, mute, hide Flicks, polls, calls, pin, long press ──
change("correction sheet rides above the keyboard (no black screen)",
  "const f=el.closest('form.tbar,form.lbar,.cwrap,.sheet form[data-f=comment]'); if(!f) return null;",
  "const f=el.closest('form.tbar,form.lbar,.cwrap,.sheet form[data-f=comment],.sheet form[data-f=correct]'); if(!f) return null;");
change("correction sheet rides above the keyboard (kind)",
  "f.matches('form[data-f=comment]')?'sheet'",
  "f.matches('form[data-f=comment],form[data-f=correct]')?'sheet'");
change("correction sheet: small phones scroll to the box you type in",
  "if(s0.offsetHeight>room){ s0.style.maxHeight=room+'px'; s0.scrollTop=s0.scrollHeight; }",
  "if(s0.offsetHeight>room){ s0.style.maxHeight=room+'px'; if(c.f.matches('[data-f=correct]')){ const er=c.el.getBoundingClientRect(), sr2=s0.getBoundingClientRect(); s0.scrollTop+=er.top-sr2.top-76; } else s0.scrollTop=s0.scrollHeight; }");
change("correction: time + no English default note + confirmation",
  "c.msgs.push({f:'fix',wrong:m.t,right,note:document.getElementById('corr-n').value.trim()||'Corrected by '+S.me.name,by:'me'}); practiceAdd(0,null,1); UI.sheet=null; UI.scrollChat=true; render();",
  "c.msgs.push({f:'fix',wrong:m.t,right,note:document.getElementById('corr-n').value.trim(),by:'me',at:Date.now()}); practiceAdd(0,null,1); UI.sheet=null; UI.scrollChat=true; render(); toast('Correction sent');");
change("block: leave every screen of that person",
  "UI.sheet=null; const c0=cur(); if(c0&&(c0.id===v)) S.stack.pop(); render(); toast(P[v].name+' is blocked. They can’t see you or message you.'); break; }",
  "UI.sheet=null; while(cur()&&cur().id===v) S.stack.pop(); if(UI.call&&UI.call.id===v) act0('endcall'); render(); toast(P[v].name+' is blocked. They can’t see you or message you.'); break; }");
change("unblock: the chat comes back to the list",
  "case 'unblock': S.blocked=S.blocked.filter(x=>x!==v); render();",
  "case 'unblock': S.blocked=S.blocked.filter(x=>x!==v); if(S.chats[v]&&S.chats[v].msgs.length&&!S.order.includes(v)) S.order.unshift(v); render();");
change("blocked: no messages",
  "if(f.dataset.f==='send'){ const inp=document.getElementById('msg-'+v), t=inp.value.trim(); if(!t) return;",
  "if(f.dataset.f==='send'){ const inp=document.getElementById('msg-'+v), t=inp.value.trim(); if(!t) return; if(isBlocked(v)){ toast('You blocked this person · Unblock them to send messages'); return; }");
change("blocked: no replies",
  "function reply(id){\n",
  "function reply(id){ if(isBlocked(id)) return;\n");
change("blocked: no calls",
  "case 'call': { const [id,type]=v.split(':'); if(!P[id]) break;",
  "case 'call': { const [id,type]=v.split(':'); if(!P[id]) break; if(isBlocked(id)){ toast('You blocked this person · Unblock them to call'); break; } if(S.cset&&S.cset[id]&&S.cset[id].calls===false){ toast('Calls are off for this chat · Turn them on in Chat settings'); break; }");
change("blocked: no gifts",
  "case 'gift-open': if(String(v).startsWith('@')){",
  "case 'gift-open': if(P[v]&&isBlocked(v)){ toast('You blocked this person · Unblock them to send gifts'); break; } if(String(v).startsWith('@')){");
change("mute (swipe) = mute (chat settings)",
  "case 'chat-mute': S.cmute=S.cmute||{}; S.cmute[v]=!S.cmute[v];",
  "case 'chat-mute': S.cmute=S.cmute||{}; S.cmute[v]=!S.cmute[v]; S.muted[v]=S.cmute[v];");
change("mute (chat settings) = mute (swipe)",
  "if(k==='notif'){ S.muted[id]=!S.muted[id]; }",
  "if(k==='notif'){ S.muted[id]=!S.muted[id]; S.cmute=S.cmute||{}; S.cmute[id]=S.muted[id]; }");
change("muted chats: no message banners",
  "if(who&&isMutedU(who)) return false;",
  "if(who&&isMutedU(who)) return false; if(kind==='msg'&&who&&((S.cmute||{})[who]||(S.muted||{})[who])){ try{ actLog(kind,html,go,who,o); }catch(e){} return false; }");
change("chat settings: Hide their Flicks works",
  "const all=[...S.myMoments.filter(m=>!m.old),...MOMENTS0].filter(m=>!hid('flick',m.id)&&!isBlocked(m.by)&&!isMutedU(m.by));",
  "const all=[...S.myMoments.filter(m=>!m.old),...MOMENTS0].filter(m=>!hid('flick',m.id)&&!isBlocked(m.by)&&!isMutedU(m.by)&&!((S.cset||{})[m.by]||{}).hideTheirs);");
change("poll answers are full height",
  "class=\"pin inputbar\" maxlength=\"60\" placeholder=\"${TX('Answer '+(k+1))}\" style=\"height:46px;",
  "class=\"pin inputbar\" maxlength=\"60\" placeholder=\"${TX('Answer '+(k+1))}\" style=\"flex:none;height:46px;");
change("call end: a line in the chat; Duo day goes up once a day",
  "const who=UI.call.id; UI.call=null; if(S.duo[who]) S.duo[who]++;",
  "const who=UI.call.id, sec0=UI.call.sec||0, ty0=UI.call.type; UI.call=null; { const dk=new Date().toDateString(); S.duoDay=S.duoDay||{}; if(S.duo[who]&&S.duoDay[who]!==dk&&sec0>=60){ S.duo[who]++; S.duoDay[who]=dk; } }\n      if(v!=='drop'&&sec0>0){ const c=S.chats[who]||(S.chats[who]={msgs:[],unread:0}); c.msgs.push({f:'tip',t:(ty0==='video'?'📹 Video call · ':'📞 Voice call · ')+Math.floor(sec0/60)+':'+String(sec0%60).padStart(2,'0'),at:Date.now()}); }");
change("pinned chats come first",
  "+gids.map(groupRow).join('')+[...S.pinned.filter(x=>S.order.includes(x)),...S.order.filter(x=>!S.pinned.includes(x))].filter(x=>!tIds.includes(x)).map(chatRow).join('');",
  "+S.pinned.filter(x=>S.order.includes(x)&&!tIds.includes(x)).map(chatRow).join('')+gids.map(groupRow).join('')+S.order.filter(x=>!S.pinned.includes(x)&&!tIds.includes(x)).map(chatRow).join('');");
change("pinned chats show the pin",
  "<span class=\"n\">${p.teacher?`<span class=\"tpin\" aria-label=\"Pinned\">${ic('pin')}</span>`:''}",
  "<span class=\"n\">${p.teacher||(S.pinned||[]).includes(id)?`<span class=\"tpin\" aria-label=\"Pinned\">${ic('pin')}</span>`:''}");
change("press-and-hold menu stays open when the finger lifts",
  "if(a==='close-veil'){ if(e.target===el){ UI.sheet=null; render(); } return; }",
  "if(a==='close-veil'){ if(UI.lpFired&&e.isTrusted){ UI.lpFired=false; return; } if(e.target===el){ UI.sheet=null; render(); } return; }");
change("correction card: no empty note line",
  "<span class=\"muted\" style=\"font-size:12.5px\">${esc(m.note)}</span></div>`;",
  "${m.note?`<span class=\"muted\" style=\"font-size:12.5px\">${esc(m.note)}</span>`:\"\"}</div>`;");
change("chat fixes: texts in 8 languages",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nCorrection sent|Correction envoyée|Corrección enviada|Correção enviada|Korrektur gesendet|Correzione inviata|添削を送りました|تم إرسال التصحيح\nYou blocked this person · Unblock them to send messages|Tu as bloqué cette personne · Débloque-la pour envoyer des messages|Bloqueaste a esta persona · Desbloquéala para enviar mensajes|Você bloqueou esta pessoa · Desbloqueie para enviar mensagens|Du hast diese Person blockiert · Hebe die Blockierung auf, um Nachrichten zu senden|Hai bloccato questa persona · Sbloccala per inviare messaggi|この人をブロック中です · メッセージを送るにはブロックを解除してください|لقد حظرت هذا الشخص · ألغِ الحظر لإرسال الرسائل\nYou blocked this person · Unblock them to call|Tu as bloqué cette personne · Débloque-la pour l’appeler|Bloqueaste a esta persona · Desbloquéala para llamar|Você bloqueou esta pessoa · Desbloqueie para ligar|Du hast diese Person blockiert · Hebe die Blockierung auf, um anzurufen|Hai bloccato questa persona · Sbloccala per chiamare|この人をブロック中です · 通話するにはブロックを解除してください|لقد حظرت هذا الشخص · ألغِ الحظر للاتصال\nYou blocked this person · Unblock them to send gifts|Tu as bloqué cette personne · Débloque-la pour envoyer des cadeaux|Bloqueaste a esta persona · Desbloquéala para enviar regalos|Você bloqueou esta pessoa · Desbloqueie para enviar presentes|Du hast diese Person blockiert · Hebe die Blockierung auf, um Geschenke zu senden|Hai bloccato questa persona · Sbloccala per inviare regali|この人をブロック中です · ギフトを送るにはブロックを解除してください|لقد حظرت هذا الشخص · ألغِ الحظر لإرسال الهدايا\nCalls are off for this chat · Turn them on in Chat settings|Les appels sont désactivés pour cette discussion · Active-les dans les réglages de la discussion|Las llamadas están desactivadas en este chat · Actívalas en los ajustes del chat|As chamadas estão desligadas nesta conversa · Ative nas configurações da conversa|Anrufe sind für diesen Chat aus · Schalte sie in den Chat-Einstellungen ein|Le chiamate sono disattivate per questa chat · Attivale nelle impostazioni della chat|このチャットでは通話がオフです · チャット設定でオンにしてください|المكالمات متوقفة في هذه المحادثة · فعّلها من إعدادات المحادثة\n");
change("call lines in the chat: translated (rules)",
  "[/^10 min left in this (room|live)$/,'w10a']",
  "[/^📞 Voice call · (\\d+:\\d\\d)$/,'callLineA'],[/^📹 Video call · (\\d+:\\d\\d)$/,'callLineV'],[/^10 min left in this (room|live)$/,'w10a']");
change("call lines in the chat: translated (texts)",
  "w10a:{fr:'Plus que 10 min dans ce salon'",
  "callLineA:{fr:'📞 Appel vocal · $1',es:'📞 Llamada de voz · $1',pt:'📞 Chamada de voz · $1',de:'📞 Sprachanruf · $1',it:'📞 Chiamata vocale · $1',ja:'📞 音声通話 · $1',ar:'📞 مكالمة صوتية · $1'},callLineV:{fr:'📹 Appel vidéo · $1',es:'📹 Videollamada · $1',pt:'📹 Chamada de vídeo · $1',de:'📹 Videoanruf · $1',it:'📹 Videochiamata · $1',ja:'📹 ビデオ通話 · $1',ar:'📹 مكالمة فيديو · $1'},w10a:{fr:'Plus que 10 min dans ce salon'");


// ── Sign-up / Connect / profile audit fixes (25 Nov) ──
change("only finished sign-ups count as accounts",
  "return Object.values(o).filter(a=>a&&a.me&&a.me.handle&&a.lastAuth); }",
  "return Object.values(o).filter(a=>a&&a.me&&a.me.handle&&a.lastAuth&&(a.acct==='demo'||!a.signupRec||a.signupRec.status==='finished')); }");
change("log in with no account on this phone → create one",
  "case 'auth-approve': if(!UI.auth) break; UI.auth.approved=true; authDone();",
  "case 'auth-approve': if(!UI.auth) break; if(UI.auth.mode==='signin'&&!UI.auth.picked){ UI.auth.mode='create'; UI.auth.step=null; authDone(); setTimeout(()=>toast('No account with this log-in yet · Let’s create yours'),300); break; } UI.auth.approved=true; authDone();");
change("new account: nothing left over from the previous one",
  "UI.auth=null; UI.ob=true; UI.obStep=0;",
  "UI.auth=null; UI.ob=true; UI.obStep=0; UI.promise=false; UI.natTouched=false; UI.obAddL=false; UI.bdOpen=false; UI.gq=''; UI.gsTab=null;");
change("log out: clear the search",
  "case 'logout': S.onboarded=false; S.stack=[]; UI.ob=false;",
  "case 'logout': S.onboarded=false; S.stack=[]; UI.ob=false; UI.gq=''; UI.gsTab=null;");
change("new accounts: no demo message requests (chats)",
  "const reqList=REQS.filter(([id])=>!S.reqDone[id]);",
  "const reqList=S.noActSeed?[]:REQS.filter(([id])=>!S.reqDone[id]);");
change("usernames: reserved names, 20 max, not taken by another account on this phone",
  "if(TAKEN.includes(u)) return {ok:false,taken:true,msg:'@'+u+' is taken. Try one of these:'}; return {ok:true,msg:'✓ @'+u+' is available'}; }",
  "if(u.length>20) return {ok:false,msg:'20 characters max'}; if(TAKEN.includes(u)||/^(admin|administrator|moderator|mod|staff|team|help|support|root|system|security|official|talk_?amigo.*|.*talk_?amigo|teacher)$/.test(u)||(()=>{ try{ return Object.values(acctsLoad()).some(a=>a&&a.me&&a.me.handle===u&&a.acct!==S.acct); }catch(e){ return false; } })()) return {ok:false,taken:true,msg:'@'+u+' is taken. Try one of these:'}; return {ok:true,msg:'✓ @'+u+' is available'}; }");
change("username can be changed once every 30 days",
  "if(u!==S.me.handle){ if(!userCheck(u).ok){ toast('That username isn’t available'); return; } S.me.handle=u; }",
  "if(u!==S.me.handle){ if(!userCheck(u).ok){ toast('That username isn’t available'); return; } if(S.unameAt&&Date.now()-S.unameAt<30*864e5){ toast('You can change your username once every 30 days'); return; } S.me.handle=u; S.unameAt=Date.now(); }");
change("search: blocked people’s Flicks are hidden",
  "const flicks=allFlicks().filter(m=>!hid('flick',m.id)&&(",
  "const flicks=allFlicks().filter(m=>!hid('flick',m.id)&&!isBlocked(m.by)&&(");
change("search: blocked people’s rooms are hidden",
  "...planAll().map(r=>['lesson',r])].filter(([k,r])=>has(r.title)",
  "...planAll().map(r=>['lesson',r])].filter(([k,r])=>!isBlocked(r.host)&&(has(r.title)");
change("search: rooms filter bracket",
  "||(P[r.host]&&has(P[r.host].name)));\n  const langs=",
  "||(P[r.host]&&has(P[r.host].name))));\n  const langs=");
change("block: unfollow both ways and leave close friends",
  "case 'block': { S.blocked=[...new Set([...(S.blocked||[]),v])]; S.order=S.order.filter(x=>x!==v);",
  "case 'block': { S.blocked=[...new Set([...(S.blocked||[]),v])]; S.order=S.order.filter(x=>x!==v); if(S.follows&&S.follows[v]){ delete S.follows[v]; } S.close=(S.close||[]).filter(x=>x!==v); if(Array.isArray(S.followsMe)) S.followsMe=S.followsMe.filter(x=>x!==v); else if(S.followsMe&&typeof S.followsMe==='object') delete S.followsMe[v];");
change("follow lists: real followers only, never blocked people",
  "list=(k==='followers'?(S.noActSeed?Object.keys(P).filter(followsMe):Object.keys(P)):Object.keys(P).filter(id=>S.follows[id])).filter(id=>P[id].name.toLowerCase().includes(q));",
  "list=(k==='followers'?Object.keys(P).filter(followsMe):Object.keys(P).filter(id=>S.follows[id])).filter(id=>!isBlocked(id)&&P[id].name.toLowerCase().includes(q));");
change("following list: no \"+ more\" under an empty list",
  "${k==='following'&&!q&&(S.followBase==null?86:S.followBase)>0?",
  "${k==='following'&&!q&&list.length&&(S.followBase==null?86:S.followBase)>0?");
change("Duo: an invite, accepted after a moment (not started at once)",
  "case 'duo': if(!S.duo[v]){ S.duo[v]=1; render(); toast('Duo invite sent to '+P[v].name); } break;",
  "case 'duo': if(!S.duo[v]&&!(S.duoInv||{})[v]){ S.duoInv=S.duoInv||{}; S.duoInv[v]=Date.now(); render(); toast('Duo invite sent to '+P[v].name); setTimeout(()=>{ if(!S.duoInv||!S.duoInv[v]||isBlocked(v)) return; delete S.duoInv[v]; S.duo[v]=1; const c=S.chats[v]||(S.chats[v]={msgs:[],unread:0}); c.msgs.push({f:'tip',t:'🤝 '+P[v].name+' accepted your Duo invite · Day 1',at:Date.now()}); if(!S.order.includes(v)) S.order.unshift(v); render(); notify('msg','<b>'+P[v].name+'</b> accepted your Duo invite 🤝','chat:'+v,v); },6000); } else if((S.duoInv||{})[v]) toast('Invite already sent · '+P[v].name+' will answer soon'); break;");
change("wave: real time, chat goes to the top",
  "c.msgs.push({f:'me',t:'👋'}); if(!S.order.includes(v)) S.order.unshift(v);",
  "c.msgs.push({f:'me',t:'👋',at:Date.now(),st:1}); S.order=[v,...S.order.filter(x=>x!==v)];");
change("In a room now: 1 friend / N friends",
  "${L.length?`<span style=\"color:var(--tint-text)\">${L.length} friends</span>`:''}",
  "${L.length?`<span style=\"color:var(--tint-text)\">${L.length===1?TX('1 friend'):L.length+' friends'}</span>`:''}");
change("tour: Coins card finds the coins in every language",
  "{sel:'[aria-label=Coins]',t:'Coins'",
  "{sel:'.coinbal:not([data-a=go-dia])',t:'Coins'");
change("French: no guessed gender (welcome)",
  "Just looking? Try the demo|Juste curieux ? Essaie la démo|",
  "Just looking? Try the demo|Envie de jeter un œil ? Essaie la démo|");
change("French: no guessed gender (promise)",
  "|sois gentil et patient, reste respectueux, sois toi-même.|",
  "|fais preuve de gentillesse et de patience, garde le respect, sois toi-même.|");
change("sign-up/profile fixes: texts in 8 languages",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nNo account with this log-in yet · Let’s create yours|Pas encore de compte avec cette connexion · Créons le tien|Aún no hay cuenta con este inicio de sesión · Vamos a crear la tuya|Ainda não há conta com este login · Vamos criar a sua|Noch kein Konto mit dieser Anmeldung · Lass uns deins erstellen|Nessun account con questo accesso · Creiamo il tuo|このログイン方法のアカウントはまだありません · 作成しましょう|لا يوجد حساب بهذا الدخول بعد · لننشئ حسابك\n20 characters max|20 caractères max|20 caracteres como máximo|No máximo 20 caracteres|Höchstens 20 Zeichen|Massimo 20 caratteri|20文字まで|20 حرفًا كحد أقصى\nYou can change your username once every 30 days|Tu peux changer ton nom d’utilisateur une fois tous les 30 jours|Puedes cambiar tu nombre de usuario una vez cada 30 días|Você pode mudar seu nome de usuário uma vez a cada 30 dias|Du kannst deinen Benutzernamen alle 30 Tage einmal ändern|Puoi cambiare il nome utente una volta ogni 30 giorni|ユーザー名の変更は30日に1回までです|يمكنك تغيير اسم المستخدم مرة كل 30 يومًا\n1 friend|1 ami·e|1 amigo|1 amigo|1 Freund|1 amico|友だち1人|صديق واحد\nAt least 3 characters|Au moins 3 caractères|Al menos 3 caracteres|Pelo menos 3 caracteres|Mindestens 3 Zeichen|Almeno 3 caratteri|3文字以上|3 أحرف على الأقل\nOnly lowercase letters, numbers, _ and .|Seulement des minuscules, des chiffres, _ et .|Solo minúsculas, números, _ y .|Só letras minúsculas, números, _ e .|Nur Kleinbuchstaben, Zahlen, _ und .|Solo lettere minuscole, numeri, _ e .|小文字・数字・_ と . のみ|أحرف إنجليزية صغيرة وأرقام و _ و . فقط\nCan’t start or end with _ or .|Ne peut pas commencer ni finir par _ ou .|No puede empezar ni terminar con _ o .|Não pode começar nem terminar com _ ou .|Darf nicht mit _ oder . beginnen oder enden|Non può iniziare o finire con _ o .|_ や . で始めたり終えたりできません|لا يبدأ ولا ينتهي بـ _ أو .\n");
change("Duo accepted line + invite already sent: translated (rules)",
  "[/^10 min left in this (room|live)$/,'w10a']",
  "[/^🤝 (.+) accepted your Duo invite · Day 1$/,'duoAcc'],[/^Invite already sent · (.+) will answer soon$/,'duoWait'],[/^(.+) level set to (A1|A2|B1|B2|C1|C2)$/,'lvlSet'],[/^10 min left in this (room|live)$/,'w10a']");
change("Duo accepted line + invite already sent: translated (texts)",
  "w10a:{fr:'Plus que 10 min dans ce salon'",
  "duoAcc:{fr:'🤝 $1 a accepté ton invitation Duo · Jour 1',es:'🤝 $1 aceptó tu invitación Duo · Día 1',pt:'🤝 $1 aceitou seu convite Duo · Dia 1',de:'🤝 $1 hat deine Duo-Einladung angenommen · Tag 1',it:'🤝 $1 ha accettato il tuo invito Duo · Giorno 1',ja:'🤝 $1さんがDuoの招待を承認しました · 1日目',ar:'🤝 قَبِل $1 دعوة الثنائي · اليوم 1'},duoWait:{fr:'Invitation déjà envoyée · $1 va bientôt répondre',es:'Invitación ya enviada · $1 responderá pronto',pt:'Convite já enviado · $1 vai responder em breve',de:'Einladung schon gesendet · $1 antwortet bald',it:'Invito già inviato · $1 risponderà presto',ja:'招待は送信済みです · $1さんからまもなく返事があります',ar:'تم إرسال الدعوة بالفعل · سيرد $1 قريبًا'},lvlSet:{fr:'Niveau en $1 : $2',es:'Nivel de $1: $2',pt:'Nível de $1: $2',de:'$1-Niveau: $2',it:'Livello di $1: $2',ja:'$1のレベル：$2',ar:'مستوى $1: $2'},w10a:{fr:'Plus que 10 min dans ce salon'");


// ── Privacy settings applied + muted people (25 Nov audit) ──
change("Who can send me gifts: People I follow is applied",
  "function giftIn(from,gid,where,away){ const g=GIFTS.find(x=>x.id===gid); if(!g||!P[from]||isBlocked(from)) return;",
  "function giftIn(from,gid,where,away){ const g=GIFTS.find(x=>x.id===gid); if(!g||!P[from]||isBlocked(from)) return; if(S.prefs.whoGift==='follow'&&!(S.follows||{})[from]) return;");
change("Who can message me: message requests respect it",
  "const reqList=S.noActSeed?[]:REQS.filter(([id])=>!S.reqDone[id]);",
  "const reqList=S.noActSeed||S.prefs.whoMsg==='none'?[]:REQS.filter(([id])=>!S.reqDone[id]&&!isBlocked(id)&&(S.prefs.whoMsg!=='follow'||(S.follows||{})[id]));");
change("In a room now: muted people are left out",
  "let circle=new Set([...Object.keys(S.follows).filter(k=>S.follows[k]),...Object.keys(S.chats)].filter(k=>!isBlocked(k)));",
  "let circle=new Set([...Object.keys(S.follows).filter(k=>S.follows[k]),...Object.keys(S.chats)].filter(k=>!isBlocked(k)&&!isMutedU(k)));");


// ── Money fixes (25 Nov audit): renewal date, cash-out rules, Infinity while on Plus, frame confirm ──
change("plans: real renewal date (helper)",
  "function vProfile(){ actSync();",
  "/* [app] the next renewal date of Plus, from the day it was bought (it was always \"30 Nov 2026\") */\nfunction renewOn(){ const per=S.planPer||'month', d=new Date(S.planAt||Date.now()), now=Date.now(); let g=0; const step=x=>{ if(per==='year') x.setFullYear(x.getFullYear()+1); else if(per==='week') x.setDate(x.getDate()+7); else x.setMonth(x.getMonth()+1); }; step(d); while(d.getTime()<=now&&g++<600) step(d); return dayFmt(d,{day:'numeric',month:'short',year:'numeric'}); }\nfunction vProfile(){ actSync();");
change("plans: remember when it was bought; Infinity while on Plus → reminder to cancel Plus",
  "S.owned=v; S.planPer=UI.plan; S.subCancelled=false; S.plan=v; S.vip=true;",
  "const wasPlus=S.plan==='plus'&&!S.subCancelled&&v==='infinity'; S.owned=v; if(v==='plus'){ S.planPer=UI.plan; S.planAt=Date.now(); } S.subCancelled=false; S.plan=v; S.vip=true; if(wasPlus) setTimeout(()=>toast('Infinity is yours · Cancel your Plus subscription in your Apple ID settings so you’re not charged again',7000),2300);");
change("manage subscription: real dates",
  "${S.subCancelled?'Expires 30 Nov 2026':'Renews 30 Nov 2026 · '+(S.planPer==='year'",
  "${S.subCancelled?TX('Expires')+' '+renewOn():TX('Renews')+' '+renewOn()+' · '+(S.planPer==='year'");
change("cancel / renew messages: real dates",
  "case 'subcancel': S.subCancelled=true; UI.sheet=null; render(); toast('Cancelled. You keep Plus until 30 Nov 2026.'); break;\n    case 'resub': S.subCancelled=false; UI.sheet=null; render(); toast('Plus will renew on 30 Nov 2026'); break;",
  "case 'subcancel': S.subCancelled=true; UI.sheet=null; render(); toast('Cancelled. You keep Plus until '+renewOn()+'.'); break;\n    case 'resub': S.subCancelled=false; UI.sheet=null; render(); toast('Plus will renew on '+renewOn()); break;");
change("cash-out: only Diamonds past the hold, 2 a month",
  "case 'cash-ok': { const tr=TIERS.find(x=>x[0]===+v); if(S.diamonds<tr[0]) return;",
  "case 'cash-ok': { const tr=TIERS.find(x=>x[0]===+v); pendSync(); const avail=Math.max(0,(S.diamonds||0)-(S.pending||0)); if(avail<tr[0]){ toast('Only Diamonds past the 14-day hold can be cashed out · '+n0(avail)+' available',5000); return; } const mk=new Date().getFullYear()+'-'+new Date().getMonth(); S.cashouts=(S.cashouts||[]).filter(x=>x.startsWith(mk)); if(S.cashouts.length>=2){ toast('2 cash-outs a month max · Next one from the 1st of next month',5000); return; } if(S.diamonds<tr[0]) return;");
change("cash-out: count it for the month",
  "S.diamonds-=tr[0]; hist('d','Cash-out '+tierCash(TIERS.indexOf(tr))+' (demo)',-tr[0]);",
  "S.diamonds-=tr[0]; { const mk=new Date().getFullYear()+'-'+new Date().getMonth(); (S.cashouts=S.cashouts||[]).push(mk+'-'+Date.now()); } hist('d','Cash-out '+tierCash(TIERS.indexOf(tr))+' (demo)',-tr[0]);");
change("Diamonds → coins: only Diamonds past the hold",
  "case 'convert': if(S.diamonds<100){ toast('You need 100 Diamonds'); return; }",
  "case 'convert': pendSync(); if(Math.max(0,(S.diamonds||0)-(S.pending||0))<100){ toast('You need 100 Diamonds past the 14-day hold'); return; }");
change("frames: confirm before spending coins",
  "if(S.coins<F[2]){ toast('Not enough coins'); return; } S.coins-=F[2];",
  "if(S.coins<F[2]){ toast('Not enough coins'); return; } if(UI.frameOK!==v){ UI.frameOK=v; toast('Tap again to buy the '+F[1]+' frame · '+n0(F[2])+' coins',3500); clearTimeout(UI.frameT); UI.frameT=setTimeout(()=>{ UI.frameOK=null; },3500); break; } UI.frameOK=null; S.coins-=F[2];");
change("money fixes: texts in 8 languages",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nRenews|Renouvellement le|Se renueva el|Renova em|Verlängert sich am|Si rinnova il|更新日|يتجدد في\nExpires|Expire le|Vence el|Expira em|Läuft ab am|Scade il|期限|ينتهي في\nYou need 100 Diamonds past the 14-day hold|Il te faut 100 Diamants passés le délai de 14 jours|Necesitas 100 Diamantes que hayan pasado la espera de 14 días|Você precisa de 100 Diamantes após a espera de 14 dias|Du brauchst 100 Diamanten nach der 14-tägigen Wartezeit|Ti servono 100 Diamanti oltre l’attesa di 14 giorni|14日間の保留期間を過ぎたダイヤが100個必要です|تحتاج إلى 100 ماسة تجاوزت فترة الانتظار البالغة 14 يومًا\n2 cash-outs a month max · Next one from the 1st of next month|2 retraits par mois max · Le prochain à partir du 1er du mois prochain|Máximo 2 retiros al mes · El siguiente desde el día 1 del próximo mes|No máximo 2 saques por mês · O próximo a partir do dia 1 do mês que vem|Höchstens 2 Auszahlungen im Monat · Die nächste ab dem 1. des nächsten Monats|Massimo 2 prelievi al mese · Il prossimo dal 1° del mese prossimo|出金は月2回までです · 次回は来月1日から|سحبان كحد أقصى في الشهر · السحب التالي من أول الشهر القادم\nInfinity is yours · Cancel your Plus subscription in your Apple ID settings so you’re not charged again|Infinity est à toi · Annule ton abonnement Plus dans les réglages de ton identifiant Apple pour ne plus être débité|Infinity es tuyo · Cancela tu suscripción Plus en los ajustes de tu ID de Apple para que no te cobren otra vez|O Infinity é seu · Cancele a assinatura Plus nos ajustes do seu ID Apple para não ser cobrado de novo|Infinity gehört dir · Kündige dein Plus-Abo in deinen Apple-ID-Einstellungen, damit du nicht erneut zahlst|Infinity è tuo · Annulla l’abbonamento Plus nelle impostazioni dell’ID Apple per non pagare di nuovo|Infinityを購入しました · 再度請求されないよう、Apple IDの設定でPlusを解約してください|أصبح Infinity لك · ألغِ اشتراك Plus من إعدادات Apple ID حتى لا تُحاسَب مجددًا\n");
change("money fixes: texts with numbers/dates (rules)",
  "[/^10 min left in this (room|live)$/,'w10a']",
  "[/^Cancelled\\. You keep Plus until (.+)\\.$/,'subC'],[/^Plus will renew on (.+)$/,'subR'],[/^Only Diamonds past the 14-day hold can be cashed out · (.+) available$/,'cashHold'],[/^Tap again to buy the (.+) frame · (.+) coins$/,'frameAgain'],[/^10 min left in this (room|live)$/,'w10a']");
change("money fixes: texts with numbers/dates (8 languages)",
  "w10a:{fr:'Plus que 10 min dans ce salon'",
  "subC:{fr:'Annulé. Tu gardes Plus jusqu’au $1.',es:'Cancelado. Mantienes Plus hasta el $1.',pt:'Cancelado. Você mantém o Plus até $1.',de:'Gekündigt. Du behältst Plus bis $1.',it:'Annullato. Tieni Plus fino al $1.',ja:'解約しました。$1までPlusを使えます。',ar:'تم الإلغاء. يبقى Plus لك حتى $1.'},subR:{fr:'Plus sera renouvelé le $1',es:'Plus se renovará el $1',pt:'O Plus será renovado em $1',de:'Plus verlängert sich am $1',it:'Plus si rinnoverà il $1',ja:'Plusは$1に更新されます',ar:'سيتجدد Plus في $1'},cashHold:{fr:'Seuls les Diamants passés le délai de 14 jours peuvent être retirés · $1 disponibles',es:'Solo se pueden retirar los Diamantes que pasaron la espera de 14 días · $1 disponibles',pt:'Só os Diamantes após a espera de 14 dias podem ser sacados · $1 disponíveis',de:'Nur Diamanten nach der 14-tägigen Wartezeit können ausgezahlt werden · $1 verfügbar',it:'Solo i Diamanti oltre l’attesa di 14 giorni si possono prelevare · $1 disponibili',ja:'14日間の保留を過ぎたダイヤのみ出金できます · 利用可能 $1',ar:'لا يمكن سحب إلا الماس الذي تجاوز فترة الانتظار البالغة 14 يومًا · المتاح $1'},frameAgain:{fr:'Touche encore pour acheter le cadre $1 · $2 pièces',es:'Toca otra vez para comprar el marco $1 · $2 monedas',pt:'Toque de novo para comprar a moldura $1 · $2 moedas',de:'Nochmal tippen, um den Rahmen $1 zu kaufen · $2 Münzen',it:'Tocca di nuovo per comprare la cornice $1 · $2 monete',ja:'もう一度タップでフレーム「$1」を購入 · $2コイン',ar:'اضغط مرة أخرى لشراء إطار $1 · $2 عملة'},w10a:{fr:'Plus que 10 min dans ce salon'");


// ── Flicks / Me fixes (25 Nov audit) ──
change("new Flick: language and level you picked (not always your main language)",
  "lang:ED.lang||S.me.learning,lvl:ED.lvl||'Beginner',",
  "lang:ED.lang||S.me.learning,lvl:ED.lvl||({A1:'Beginner',A2:'Beginner',B1:'Intermediate',B2:'Intermediate',C1:'Advanced',C2:'Advanced'})[(S.me.levels||{})[ED.lang||S.me.learning]||S.me.level]||'Beginner',");
change("new Flick caption: the language you wrote in",
  "cap:'Learning '+S.me.learning+' '+S.me.level+' · corrections welcome'",
  "cap:'Learning '+(ED.lang||S.me.learning)+' '+((S.me.levels||{})[ED.lang||S.me.learning]||S.me.level)+' · corrections welcome'");
change("reactions after posting are real (likes and the comment show on the Flick; tapping opens it)",
  "toast('Flick posted'); setTimeout(()=>notify('like','<b>Kenji</b> and 4 others liked your Flick','tab:moments','kenji',{more:['lucia','reem']}),6000); setTimeout(()=>notify('comment','<b>Camille</b> commented: “Trop bien ! 👏”','tab:moments','camille'),10000);",
  "toast('Flick posted'); const nid=(S.myMoments[0]||{}).id; setTimeout(()=>{ const mm=S.myMoments.find(x=>x.id===nid); if(!mm) return; mm.likes=(mm.likes||0)+5; save(); notify('like','<b>Kenji</b> and 4 others liked your Flick','flick:'+nid,'kenji',{more:['lucia','reem']}); },6000); setTimeout(()=>{ const mm=S.myMoments.find(x=>x.id===nid); if(!mm||isBlocked('camille')) return; (S.extraComments[nid]=S.extraComments[nid]||[]).push(['camille','Trop bien ! 👏','']); save(); notify('comment','<b>Camille</b> commented: “Trop bien ! 👏”','flick:'+nid,'camille'); },10000);");
change("Automatic translation asks for AI consent first",
  "(a==='pref'&&v==='autoTr'&&!S.prefs.autoTr))){",
  "(a==='pref'&&v==='autoTr'&&!S.prefs.autoTr)||(a==='prefv'&&el&&el.dataset&&el.dataset.k==='trMode'&&v==='auto'))){");
change("profile completion: \"add a profile photo\" opens the photo picker",
  "<button data-a=\"sheet\" data-v=\"intro\" style=\"border:0;background:none;padding:0;font-size:13px;font-weight:700;color:var(--tint-text)\">Profile ${st}% complete",
  "<button data-a=\"${!me.photo?'go':'sheet'}\" data-v=\"${!me.photo?'editp':'intro'}\" style=\"border:0;background:none;padding:0;font-size:13px;font-weight:700;color:var(--tint-text)\">Profile ${st}% complete");


// ── Wallet / Shop / purchase texts left in English (25 Nov audit) ──
change("wallet, shop and purchase texts in 8 languages",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nYour Diamonds|Tes Diamants|Tus Diamantes|Seus Diamantes|Deine Diamanten|I tuoi Diamanti|あなたのダイヤ|ماساتك\nNext tier|Palier suivant|Siguiente nivel|Próximo nível|Nächste Stufe|Livello successivo|次の段階|المستوى التالي\nFirst cash-out|Premier retrait|Primer retiro|Primeiro saque|Erste Auszahlung|Primo prelievo|初回出金|أول سحب\nYearly · renews automatically|Annuel · renouvellement automatique|Anual · se renueva automáticamente|Anual · renova automaticamente|Jährlich · verlängert sich automatisch|Annuale · si rinnova automaticamente|年額・自動更新|سنوي · يتجدد تلقائيًا\nMonthly · renews automatically|Mensuel · renouvellement automatique|Mensual · se renueva automáticamente|Mensal · renova automaticamente|Monatlich · verlängert sich automatisch|Mensile · si rinnova automaticamente|月額・自動更新|شهري · يتجدد تلقائيًا\nOne-time purchase|Achat unique|Compra única|Compra única|Einmalkauf|Acquisto unico|買い切り|شراء لمرة واحدة\nChoose a photo (demo)|Choisis une photo (démo)|Elige una foto (demo)|Escolha uma foto (demo)|Wähle ein Foto (Demo)|Scegli una foto (demo)|写真を選ぶ（デモ）|اختر صورة (تجريبي)\nFrames show around your photo everywhere: chats, rooms, Lives and Connect.|Les cadres entourent ta photo partout : discussions, salons, lives et Rencontrer.|Los marcos rodean tu foto en todas partes: chats, salas, directos y Conectar.|As molduras aparecem em volta da sua foto em todo lugar: conversas, salas, lives e Conectar.|Rahmen erscheinen überall um dein Foto: Chats, Räume, Lives und Verbinden.|Le cornici appaiono intorno alla tua foto ovunque: chat, stanze, live e Connetti.|フレームはチャット、ルーム、ライブ、つながるなど、どこでもあなたの写真を囲みます。|تظهر الإطارات حول صورتك في كل مكان: المحادثات والغرف والبث وتواصل.\nTurned into coins|Convertis en pièces|Convertidos en monedas|Convertidos em moedas|In Münzen umgewandelt|Convertiti in monete|コインに交換|تم تحويلها إلى عملات\nFrom 100 Diamonds|Depuis 100 Diamants|De 100 Diamantes|De 100 Diamantes|Aus 100 Diamanten|Da 100 Diamanti|ダイヤ100個から|من 100 ماسة\n");


// ── Rooms / lessons / teacher audit fixes (25 Nov) ──
change("lessons become real rooms at their time (helpers + reminders)",
  "const planAll=()=>S.myLessons&&S.myLessons.length?PLAN.concat(S.myLessons):PLAN;",
  "const planAll=()=>S.myLessons&&S.myLessons.length?PLAN.concat(S.myLessons):PLAN;\n/* [app] (25 Nov audit) a planned lesson becomes a real room at its time: students who reserved can join it, the teacher can start it.\n   Open from 5 minutes before the start until the end. Reminders: 10 minutes before (and at the start for the teacher). */\nfunction lessonNow(x){ const t=lessonDate(x).getTime(), n=Date.now(); return n>=t-5*60000&&n<t+(x.mins||45)*60000; }\nfunction lessonRoom(x){ const rid='pl_'+x.id, live=x.mode==='live', L=live?S.lives:S.rooms; let r=L.find(y=>y.id===rid);\n  if(!r){ const me=x.host==='me'; r=live?{id:rid,host:x.host,l:x.l,lang:x.lang,ls:[x.l],title:x.title,viewers:me?1:(x.booked||0)+4,price:.99,level:x.level,goal:x.goal,mins:x.mins,seats:x.seats,booked:x.booked||0,bg:'radial-gradient(90% 60% at 70% 20%,#FF8A5B,transparent 60%),radial-gradient(90% 70% at 10% 90%,#B4004E,transparent 60%),#3A0A1A',mine:me,lesson:x.id}\n      :{id:rid,l:x.l,lang:x.lang,topic:x.goal,teacher:true,price:.99,level:x.level,goal:x.goal,mins:x.mins,seats:x.seats,booked:x.booked||0,title:x.title,host:x.host,speakers:[],count:me?1:(x.booked||0)+4,mine:me,lesson:x.id};\n    L.unshift(r); }\n  if(x.host==='me'||(S.reserved||{})[x.id]) S.paid[rid]=true; return (live?'live:':'room:')+rid; }\nfunction lessonEnded(x){ return Date.now()>lessonDate(x).getTime()+(x.mins||45)*60000; }\nsetInterval(()=>{ try{ if(!S.onboarded) return; const n=Date.now(); S.lrem=S.lrem||{};\n  /* a lesson that is on now is a real room (listed in Happening now); when it ends the room closes, the reservation and reminders are cleared (next week is a new booking) */\n  [...S.rooms,...S.lives].filter(r=>r.lesson).forEach(r=>{ const x=planAll().find(y=>y.id===r.lesson); const end=!x||n>lessonDate(x).getTime()+(x.mins||45)*60000||(n<lessonDate(x).getTime()-5*60000);\n    if(!end) return; const live=S.lives.includes(r); if(UI.room&&UI.room.id===r.id){ try{ stopRoom(); }catch(e){} UI.room=null; UI.mini=null; S.stack=S.stack.filter(z=>z.id!==r.id); toast(r.host==='me'?'Your lesson has ended · Thanks for teaching!':'The lesson has ended'); }\n    if(live) S.lives=S.lives.filter(z=>z!==r); else S.rooms=S.rooms.filter(z=>z!==r); delete S.paid[r.id]; if(x){ delete S.reserved[x.id]; delete S.lrem[x.id+':10']; delete S.lrem[x.id+':0']; } render(); });\n  planAll().forEach(x=>{ if(!isBlocked(x.host)&&lessonNow(x)&&!(UI.room&&UI.room.id==='pl_'+x.id)&&![...S.rooms,...S.lives].some(r=>r.id==='pl_'+x.id)) lessonRoom(x); });\n  planAll().forEach(x=>{ const mine=x.host==='me', res=(S.reserved||{})[x.id]; if((!mine&&!res)||isBlocked(x.host)) return; const t=lessonDate(x).getTime();\n    if(n>=t-10*60000&&n<t-60000&&!S.lrem[x.id+':10']){ S.lrem[x.id+':10']=1; notify('klass',mine?'<b>Your lesson starts in 10 min</b> “'+esc(x.title)+'”':'<b>Starts in 10 min</b> “'+esc(x.title)+'” with '+P[x.host].name+'. Tap to get ready.',null,null,{chip:'10 min',act:['sheet','lres:'+x.id]}); }\n    if(n>=t&&n<t+(x.mins||45)*60000&&!S.lrem[x.id+':0']){ S.lrem[x.id+':0']=1; notify('klass','<b>'+(mine?'Time to start your lesson':'Your lesson is starting')+'</b> “'+esc(x.title)+'”',null,null,{chip:'Now',act:['lgo',x.id]}); } }); save(); }catch(e){} },20000);");
change("lesson sheet: Join / Start at the time",
  "${x.host==='me'?`<div class=\"tdone\" style=\"background:var(--chip);color:var(--ink)\">",
  "${lessonNow(x)&&(x.host==='me'||res)?`<button class=\"btn block\" data-a=\"lgo\" data-v=\"${x.id}\" style=\"gap:8px\">${ic(x.mode==='live'?'video':'mic')}<span>${x.host==='me'?'Start your lesson':'Join the lesson'}</span></button>`:x.host==='me'?`<div class=\"tdone\" style=\"background:var(--chip);color:var(--ink)\">");
change("lesson: the join/start action",
  "case 'lpay': {",
  "case 'lgo': { const x=planAll().find(y=>y.id===v); if(!x) break; if(lessonEnded(x)){ toast('The lesson has ended'); break; } if(!lessonNow(x)){ toast('It starts '+dayFmt(lessonDate(x),{weekday:'short'})+' '+x.time); break; } if(x.host!=='me'&&!(S.reserved||{})[x.id]){ UI.sheet={t:'lres',id:x.id}; render(); break; } UI.sheet=null; open(lessonRoom(x)); break; }\n    case 'lpay': {");
change("lesson reserved: reminder at the real time (not 9 s later)",
  "toast('Reserved! We’ll remind you 10 min before.'); setTimeout(()=>notify('klass','<b>Starts in 10 min</b> “'+esc(x.title)+'” with '+P[x.host].name+'. Tap to get ready.','livetab-go',null,{chip:'10 min'}),9000); }}); break; }",
  "toast('Reserved! We’ll remind you 10 min before.'); }}); break; }");
change("teacher: can’t plan a lesson in the past",
  "time:D.time||'19:00'}; S.myLessons=[...(S.myLessons||[]),x];",
  "time:D.time||'19:00'}; if(lessonDate(x).getTime()<Date.now()+60000){ toast('Pick a time later today, or another day'); return; } S.myLessons=[...(S.myLessons||[]),x];");
change("Schedule: your own lessons always show",
  "const fil=base.filter(x=>langOk(x.l)&&",
  "const fil=base.filter(x=>(x.host==='me'||langOk(x.l))&&");
change("teacher asked to fix something: back to their own plan until approved again",
  "if(k==='needs'){ T.status='needs';",
  "if(k==='needs'){ if(S.me.teacher&&S.plan==='infinity'&&S.planBefore!=null){ S.plan=S.planBefore; S.vip=S.plan!=='standard'; } S.me.teacher=false; T.status='needs';");
change("\"X is live\" alerts: once per room, not on repeat",
  "const L=liveFriends().filter(x=>x.kind==='live'||x.kind==='room'); if(!L.length) return; const x=L[UI.liveTick%L.length];",
  "S.liveSeen=S.liveSeen||{}; const L=liveFriends().filter(x=>(x.kind==='live'||x.kind==='room')&&!S.liveSeen[x.go]); if(!L.length) return; const x=L[0]; S.liveSeen[x.go]=Date.now();");
change("Join a live: the sheet tells the truth about the camera",
  "['mic','Voice only','Your camera stays off. Only the host is on camera.']",
  "['mic','Mic first','Your camera stays off unless you turn it on.']");
change("lessons/teacher fixes: texts in 8 languages",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nStart your lesson|Commencer ton cours|Empezar tu clase|Começar sua aula|Deinen Kurs starten|Inizia la tua lezione|レッスンを始める|ابدأ درسك\nJoin the lesson|Rejoindre le cours|Unirse a la clase|Entrar na aula|Am Kurs teilnehmen|Partecipa alla lezione|レッスンに参加|انضم إلى الدرس\nTime to start your lesson|C’est l’heure de commencer ton cours|Es hora de empezar tu clase|Hora de começar sua aula|Zeit, deinen Kurs zu starten|È ora di iniziare la tua lezione|レッスン開始の時間です|حان وقت بدء درسك\nYour lesson is starting|Ton cours commence|Tu clase empieza|Sua aula está começando|Dein Kurs beginnt|La tua lezione sta iniziando|レッスンが始まります|درسك يبدأ الآن\nMic first|Micro d’abord|Primero el micro|Microfone primeiro|Erst das Mikro|Prima il microfono|まずはマイクで|الميكروفون أولًا\nYour camera stays off unless you turn it on.|Ta caméra reste coupée sauf si tu l’allumes.|Tu cámara se queda apagada salvo que la enciendas.|Sua câmera fica desligada a menos que você a ligue.|Deine Kamera bleibt aus, außer du schaltest sie ein.|La fotocamera resta spenta finché non la accendi.|自分でオンにしない限りカメラはオフのままです。|تبقى الكاميرا مطفأة إلا إذا شغّلتها.\nNow|Maintenant|Ahora|Agora|Jetzt|Ora|今|الآن\n");
change("\"It starts …\" translated (rules)",
  "[/^10 min left in this (room|live)$/,'w10a']",
  "[/^It starts (.+)$/,'lstarts'],[/^10 min left in this (room|live)$/,'w10a']");
change("\"It starts …\" translated (texts)",
  "w10a:{fr:'Plus que 10 min dans ce salon'",
  "lstarts:{fr:'Ça commence $1',es:'Empieza el $1',pt:'Começa $1',de:'Es beginnt $1',it:'Inizia $1',ja:'開始：$1',ar:'يبدأ $1'},w10a:{fr:'Plus que 10 min dans ce salon'");


// ── Rooms audit fixes, part 2 (25 Nov) ──
change("room settings: pinning a notice later completes the room task",
  "x.notice=v2; x.pin=d.pin; ch.push('notice'); } }",
  "x.notice=v2; x.pin=d.pin; ch.push('notice'); if(v2&&d.pin!==false&&!LV) setTimeout(()=>rtask('notice'),600); } }");
change("own room: demo gifts only with an audience, Diamonds on hold",
  "if(r.mine){ S.diamonds+=dia(g); R.earned+=dia(g);",
  "if(r.mine&&(r.count||0)<5){ delete R.top[who]; } else if(r.mine){ S.diamonds+=dia(g); addPending(dia(g)); R.earned+=dia(g);");
change("own live: demo gifts only with an audience, Diamonds on hold",
  "if(L.mine){ S.diamonds+=dia(g); R.earned+=dia(g);",
  "if(L.mine&&(L.viewers||0)<5){ delete R.top[who]; } else if(L.mine){ S.diamonds+=dia(g); addPending(dia(g)); R.earned+=dia(g);");
change("received gifts: Diamonds wait the 14-day hold",
  "S.diamonds=(S.diamonds||0)+dia(g); hist('d',P[from].name+' sent you a '+g.name+' '+g.e,dia(g));",
  "S.diamonds=(S.diamonds||0)+dia(g); addPending(dia(g)); hist('d',P[from].name+' sent you a '+g.name+' '+g.e,dia(g));");

change("teacher application message: no beta promise (row)",
  "Application sent · we check every teacher, usually within 48 hours (beta: a few seconds)|Candidature envoyée · nous vérifions chaque prof, en général sous 48 h (bêta : quelques secondes)|Solicitud enviada · revisamos a cada profesor, normalmente en 48 horas (beta: unos segundos)|Inscrição enviada · verificamos cada professor, em geral em até 48 horas (beta: alguns segundos)|Bewerbung gesendet · wir prüfen jede Lehrkraft, meist innerhalb von 48 Stunden (Beta: ein paar Sekunden)|Candidatura inviata · controlliamo ogni insegnante, di solito entro 48 ore (beta: pochi secondi)|申請を送信しました・通常48時間以内に確認します（ベータ版：数秒）|تم إرسال الطلب · نراجع كل معلّم عادةً خلال 48 ساعة (النسخة التجريبية: بضع ثوانٍ)",
  "Application sent · we check every teacher, usually within 48 hours|Candidature envoyée · nous vérifions chaque prof, en général sous 48 h|Solicitud enviada · revisamos a cada profesor, normalmente en 48 horas|Inscrição enviada · verificamos cada professor, em geral em até 48 horas|Bewerbung gesendet · wir prüfen jede Lehrkraft, meist innerhalb von 48 Stunden|Candidatura inviata · controlliamo ogni insegnante, di solito entro 48 ore|申請を送信しました・通常48時間以内に確認します|تم إرسال الطلب · نراجع كل معلّم عادةً خلال 48 ساعة");
change("teacher application message: no beta promise (code)",
  "'Application sent · we check every teacher, usually within 48 hours (beta: a few seconds)'",
  "'Application sent · we check every teacher, usually within 48 hours'");


// ── Round 2 fixes (25 Nov): lessons close and reset, ended lessons, small-phone typing, login with no account ──
change("lesson sheet: an ended lesson can’t be reserved",
  "if(sh.t==='lres'){ const x=planAll().find(y=>y.id===sh.id), h=P[x.host], res=S.reserved[x.id];",
  "if(sh.t==='lres'){ const x=planAll().find(y=>y.id===sh.id), h=P[x.host], res=S.reserved[x.id], ended=lessonEnded(x);");
change("lesson sheet: ended message instead of Reserve",
  "`:res?`<button class=\"btn block ghost\" data-a=\"close\">${ic('check')} Reserved · we’ll remind you</button>`:`<button class=\"btn block\" data-a=\"lpay\"",
  "`:ended?`<div class=\"tdone\" style=\"background:var(--chip);color:var(--ink)\">${ic('clock')}<span><b>This lesson has ended</b><small style=\"color:var(--muted)\">It’s on again next week</small></span></div>`:res?`<button class=\"btn block ghost\" data-a=\"close\">${ic('check')} Reserved · we’ll remind you</button>`:`<button class=\"btn block\" data-a=\"lpay\"");
change("reserving: refused after the end; honest message close to the start",
  "case 'lpay': { const x=planAll().find(y=>y.id===v); UI.sheet=null;",
  "case 'lpay': { const x=planAll().find(y=>y.id===v); if(!x||lessonEnded(x)){ toast('The lesson has ended'); break; } UI.sheet=null;");
change("reserving: message that matches the time left",
  "toast('Reserved! We’ll remind you 10 min before.'); }}); break; }",
  "toast(lessonNow(x)?'Reserved! You can join now':lessonDate(x).getTime()-Date.now()<10*60000?'Reserved! It starts in a few minutes':'Reserved! We’ll remind you 10 min before.'); }}); break; }");
change("log in with no account here: offer to create one straight away",
  "else { A.step='approve'; render(); return; } }",
  "else { A.mode='create'; A.step=null; setTimeout(()=>toast('No account with this log-in yet · Let’s create yours'),300); } }");
change("username: the 30-day rule shows while typing",
  "if(u.length>20) return {ok:false,msg:'20 characters max'};",
  "if(u.length>20) return {ok:false,msg:'20 characters max'}; if(S.onboarded&&S.me&&u!==S.me.handle&&S.unameAt&&Date.now()-S.unameAt<30*864e5) return {ok:false,msg:'You can change your username once every 30 days'};");
change("round 2 fixes: texts in 8 languages",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nThis lesson has ended|Ce cours est terminé|Esta clase ha terminado|Esta aula terminou|Dieser Kurs ist vorbei|Questa lezione è finita|このレッスンは終了しました|انتهى هذا الدرس\nIt’s on again next week|Il revient la semaine prochaine|Vuelve la próxima semana|Volta na próxima semana|Nächste Woche wieder|Torna la prossima settimana|来週また開催されます|يُعاد الأسبوع القادم\nThe lesson has ended|Le cours est terminé|La clase ha terminado|A aula terminou|Der Kurs ist vorbei|La lezione è finita|レッスンは終了しました|انتهى الدرس\nYour lesson has ended · Thanks for teaching!|Ton cours est terminé · Merci d’avoir enseigné !|Tu clase ha terminado · ¡Gracias por enseñar!|Sua aula terminou · Obrigado por ensinar!|Dein Kurs ist vorbei · Danke fürs Unterrichten!|La tua lezione è finita · Grazie per aver insegnato!|レッスンが終了しました · ありがとうございました！|انتهى درسك · شكرًا على التدريس!\nYour lesson starts in 10 min|Ton cours commence dans 10 min|Tu clase empieza en 10 min|Sua aula começa em 10 min|Dein Kurs beginnt in 10 Min.|La tua lezione inizia tra 10 min|レッスンは10分後に始まります|يبدأ درسك بعد 10 دقائق\nReserved! You can join now|Réservé ! Tu peux rejoindre maintenant|¡Reservado! Ya puedes unirte|Reservado! Você já pode entrar|Reserviert! Du kannst jetzt teilnehmen|Prenotato! Puoi entrare ora|予約しました！今すぐ参加できます|تم الحجز! يمكنك الانضمام الآن\nReserved! It starts in a few minutes|Réservé ! Ça commence dans quelques minutes|¡Reservado! Empieza en unos minutos|Reservado! Começa em alguns minutos|Reserviert! Es geht in ein paar Minuten los|Prenotato! Inizia tra pochi minuti|予約しました！まもなく始まります|تم الحجز! يبدأ بعد دقائق\n");


// ── Round 2 fixes (A, 25 Nov): pending Diamonds release, blocked chat/follow/Duo, Flick auto-translate consent ──
change("pending Diamonds are released after the 14-day hold (helpers)",
  "function vWallet(){\n  const W=UI.wtab||'coins', d=S.diamonds;",
  "/* [app] Diamonds you receive wait 14 days (\"pending\"); each gift has its own release date, so pending goes down again (it used to only grow) */\nfunction pendSync(){ const n=Date.now(); if(!Array.isArray(S.pendL)) S.pendL=S.pending?[{n:S.pending,until:n+6*864e5}]:[]; S.pendL=S.pendL.filter(x=>x.until>n); S.pending=S.pendL.reduce((a,x)=>a+x.n,0); return S.pending; }\nfunction addPending(k){ pendSync(); S.pendL.push({n:k,until:Date.now()+14*864e5}); S.pending+=k; }\nfunction vWallet(){ pendSync();\n  const W=UI.wtab||'coins', d=Math.max(0,S.diamonds-(S.pending||0));");
change("Wallet demo Rocket also waits the hold",
  "case 'receive': S.diamonds+=250;",
  "case 'receive': S.diamonds+=250; addPending(250);");
change("blocked: their chat doesn’t open (profile instead, with Unblock)",
  "function push(s){ if(s&&(s.s==='room'||s.s==='live')&&onCall()){ callBusy('open'); return; }",
  "function push(s){ if(s&&s.s==='chat'&&P[s.id]&&isBlocked(s.id)){ toast('You blocked this person · Unblock them from their profile'); s={s:'user',id:s.id}; } if(s&&(s.s==='room'||s.s==='live')&&onCall()){ callBusy('open'); return; }");
change("blocked: no corrections",
  "if(f.dataset.f==='correct'){ const sh=UI.sheet, c=S.chats[sh.id],",
  "if(f.dataset.f==='correct'&&UI.sheet&&isBlocked(UI.sheet.id)){ UI.sheet=null; render(); toast('You blocked this person · Unblock them to send messages'); return; }\n  if(f.dataset.f==='correct'){ const sh=UI.sheet, c=S.chats[sh.id],");
change("blocked: can’t be followed",
  "case 'follow': S.follows[v]=!S.follows[v];",
  "case 'follow': if(!S.follows[v]&&isBlocked(v)){ toast('You blocked this person · Unblock them first'); break; } S.follows[v]=!S.follows[v];");
change("blocked: the Duo ends",
  "case 'block': { S.blocked=[...new Set([...(S.blocked||[]),v])];",
  "case 'block': { S.blocked=[...new Set([...(S.blocked||[]),v])]; if(S.duo) delete S.duo[v]; if(S.duoInv) delete S.duoInv[v];");
change("Flick captions: automatic translation only with AI consent",
  "open=UI['mt'+m.id]??(S.prefs.trMode==='auto'&&m.by!=='me'",
  "open=UI['mt'+m.id]??(S.prefs.trMode==='auto'&&S.aiOK===true&&m.by!=='me'");
change("chat auto-reply after a correction has a time",
  "c.msgs.push({f:'them',t:'Merci pour la correction ! 🙏',tr:'Thanks for the correction! 🙏'});",
  "c.msgs.push({f:'them',t:'Merci pour la correction ! 🙏',tr:'Thanks for the correction! 🙏',at:Date.now()});");
change("round 2 (A) texts in 8 languages",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nYou blocked this person · Unblock them from their profile|Tu as bloqué cette personne · Débloque-la depuis son profil|Bloqueaste a esta persona · Desbloquéala desde su perfil|Você bloqueou esta pessoa · Desbloqueie pelo perfil|Du hast diese Person blockiert · Hebe die Blockierung in ihrem Profil auf|Hai bloccato questa persona · Sbloccala dal suo profilo|この人をブロック中です · プロフィールからブロックを解除できます|لقد حظرت هذا الشخص · ألغِ الحظر من ملفه الشخصي\nYou blocked this person · Unblock them first|Tu as bloqué cette personne · Débloque-la d’abord|Bloqueaste a esta persona · Desbloquéala primero|Você bloqueou esta pessoa · Desbloqueie primeiro|Du hast diese Person blockiert · Hebe zuerst die Blockierung auf|Hai bloccato questa persona · Prima sbloccala|この人をブロック中です · 先にブロックを解除してください|لقد حظرت هذا الشخص · ألغِ الحظر أولًا\nReady to cash out up to|Prêt à retirer jusqu’à|Listo para retirar hasta|Pronto para sacar até|Bereit zur Auszahlung bis zu|Pronto per prelevare fino a|出金できる上限|جاهز لسحب ما يصل إلى\nOne payment, no subscription|Un seul paiement, sans abonnement|Un solo pago, sin suscripción|Um só pagamento, sem assinatura|Eine Zahlung, kein Abo|Un solo pagamento, nessun abbonamento|1回払い・サブスクなし|دفعة واحدة، بلا اشتراك\nMore options for this comment|Plus d’options pour ce commentaire|Más opciones para este comentario|Mais opções para este comentário|Weitere Optionen für diesen Kommentar|Altre opzioni per questo commento|このコメントのその他の操作|مزيد من الخيارات لهذا التعليق\nto re-gift|pour les offrir à nouveau|para volver a regalar|para presentear de novo|zum Weiterverschenken|per regalarli di nuovo|もう一度贈るために|لإهدائها مجددًا\n");


// ── Sign-up: a language you speak can't be your only 'learning' language (founder, 25 Nov) ──
change("sign-up: a language you speak can’t also be \"learning\" (and the reverse moves it across)",
  "case 'ob-lang': { if(el.dataset.k==='speak') UI.natTouched=true; const k=el.dataset.k, key=k==='speak'?'natives':'langs', L=S.me[key]||[];",
  "case 'ob-lang': { if(el.dataset.k==='speak') UI.natTouched=true; const k=el.dataset.k, key=k==='speak'?'natives':'langs', L=S.me[key]||[];\n      /* [app] (founder, 25 Nov: an account was created with no language to learn — English was both spoken and \"learning\") */\n      if(k==='learn'&&!L.includes(v)&&(S.me.natives||[]).includes(v)){ toast('You already speak '+TX(v)+' · Pick a language you’re learning'); return; }\n      if(k==='speak'&&!L.includes(v)&&(S.me.langs||[]).includes(v)){ S.me.langs=S.me.langs.filter(x=>x!==v); }");
change("sign-up: Continue needs a language you don’t already speak (reason line)",
  "if(st===3&&!(me.langs||[]).length) return 'Pick at least one language to learn';",
  "if(st===3&&!(me.langs||[]).filter(l=>!(me.natives||[]).includes(l)).length) return 'Pick at least one language to learn';");
change("sign-up: Continue needs a language you don’t already speak (check)",
  "if(UI.obStep===3&&!(S.me.langs||[]).length){ toast('Pick at least one language to learn'); return; }",
  "if(UI.obStep===3&&!(S.me.langs||[]).filter(l=>!(S.me.natives||[]).includes(l)).length){ toast('Pick at least one language to learn'); return; }");
change("Language card: no language to learn → a button to add one",
  "${langs.map(l=>{ const L6=['A1','A2','B1','B2','C1',",
  "${langs.length?'':`<button class=\"btn small\" data-a=\"go\" data-v=\"mylangs\" style=\"align-self:flex-start;gap:6px\">${ic('plus')} <span>Add a language you’re learning</span></button>`}${langs.map(l=>{ const L6=['A1','A2','B1','B2','C1',");
change("learning-language fix: texts",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nAdd a language you’re learning|Ajoute une langue que tu apprends|Añade un idioma que estés aprendiendo|Adicione um idioma que você está aprendendo|Füge eine Sprache hinzu, die du lernst|Aggiungi una lingua che stai imparando|学習中の言語を追加|أضف لغة تتعلمها\n");
change("\"You already speak …\" translated (rules)",
  "[/^10 min left in this (room|live)$/,'w10a']",
  "[/^You already speak (.+) · Pick a language you’re learning$/,'alrSpeak'],[/^10 min left in this (room|live)$/,'w10a']");
change("\"You already speak …\" translated (texts)",
  "w10a:{fr:'Plus que 10 min dans ce salon'",
  "alrSpeak:{fr:'Tu parles déjà $1 · Choisis une langue que tu apprends',es:'Ya hablas $1 · Elige un idioma que estés aprendiendo',pt:'Você já fala $1 · Escolha um idioma que está aprendendo',de:'Du sprichst schon $1 · Wähle eine Sprache, die du lernst',it:'Parli già $1 · Scegli una lingua che stai imparando',ja:'$1はすでに話せます · 学習中の言語を選んでください',ar:'أنت تتحدث $1 بالفعل · اختر لغة تتعلمها'},w10a:{fr:'Plus que 10 min dans ce salon'");


// ── An unfinished sign-up can't be logged into via "Continue as" (founder, 25 Nov: account with no language to learn) ──
change("Welcome: \"Continue as\" only for a finished account",
  "function vWelcome(){ const back=S.lastAuth&&S.me.handle;",
  "function vWelcome(){ const back=S.lastAuth&&S.me.handle&&(S.acct==='demo'||!S.signupRec||S.signupRec.status==='finished');");
change("Log in: \"Continue as\" only for a finished account",
  "    const back=S.lastAuth&&S.me.handle;\n    return `<div class=\"screen pushed obx\">",
  "    const back=S.lastAuth&&S.me.handle&&(S.acct==='demo'||!S.signupRec||S.signupRec.status==='finished');\n    return `<div class=\"screen pushed obx\">");
change("quick log-in never skips an unfinished sign-up (it resumes it)",
  "case 'auth-quick': UI.auth={mode:'signin',quick:true}; authDone(); break;",
  "case 'auth-quick': if(S.signupRec&&S.signupRec.status!=='finished'&&S.acct!=='demo'){ UI.auth=null; UI.ob=true; UI.obStep=Math.min(S.obAt||0,6); render(); toast('Let’s finish your sign-up'); break; } UI.auth={mode:'signin',quick:true}; authDone(); break;");
change("resume sign-up: text",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nLet’s finish your sign-up|Terminons ton inscription|Terminemos tu registro|Vamos terminar seu cadastro|Lass uns deine Anmeldung abschließen|Completiamo la tua iscrizione|登録を完了しましょう|لنُكمل تسجيلك\n");


// ── Someone's profile: local time; tap Followers / Following to see the lists (founder, 25 Nov) ──
change("profile: local time + follower lists (helpers)",
  "function vUser(id){",
  "/* [app] (founder, 25 Nov) someone's local time on their profile, and their Followers / Following lists */\nconst TZ_CITY={Chicago:'America/Chicago','Montréal':'America/Toronto',Sydney:'Australia/Sydney',Guadalajara:'America/Mexico_City','Mexico City':'America/Mexico_City'};\nconst TZ_CC={AR:'America/Argentina/Buenos_Aires',AU:'Australia/Sydney',BE:'Europe/Brussels',CA:'America/Toronto',CH:'Europe/Zurich',CL:'America/Santiago',CO:'America/Bogota',ES:'Europe/Madrid',FR:'Europe/Paris',GB:'Europe/London',IE:'Europe/Dublin',JP:'Asia/Tokyo',MA:'Africa/Casablanca',MX:'America/Mexico_City',NG:'Africa/Lagos',PT:'Europe/Lisbon',US:'America/New_York',DE:'Europe/Berlin',IT:'Europe/Rome',BR:'America/Sao_Paulo',KR:'Asia/Seoul',CN:'Asia/Shanghai',IN:'Asia/Kolkata',NL:'Europe/Amsterdam'};\nfunction localTime(p){ const tz=TZ_CITY[p.city]||TZ_CC[p.cc]; if(!tz) return ''; try{ const now=new Date(), t=now.toLocaleTimeString(LOC(),{hour:'2-digit',minute:'2-digit',timeZone:tz});\n  const off=z=>{ const d=new Date(now.toLocaleString('en-US',{timeZone:z})); return d.getTime(); }; const mine=Intl.DateTimeFormat().resolvedOptions().timeZone; const h=Math.round((off(tz)-off(mine))/36e5);\n  return `<span class=\"ltime\" aria-label=\"${TX('Local time')} ${t}\">${ic('clock')} ${t}${h?` <small>${h>0?'+':'−'}${Math.abs(h)} h</small>`:''}</span>`; }catch(e){ return ''; } }\nfunction uFolList(id,k){ const h=s=>{ let n=0; for(const c of s) n=(n*31+c.charCodeAt(0))>>>0; return n; };\n  let L=Object.keys(P).filter(x=>x!==id&&!isBlocked(x)&&h(id+'|'+k+'|'+x)%3!==0); if(k==='followers'&&S.follows[id]) L=['me',...L]; if(k==='following'&&followsMe(id)) L=['me',...L]; return L; }\nfunction vUFollows(v){ const [id,k0]=String(v).split('|'), k=k0==='following'?'following':'followers', p=P[id]; if(!p) return vProfile();\n  const total=k==='followers'?800+p.name.length*211+(S.follows[id]?1:0):120+p.age*3, L=uFolList(id,k);\n  const row=x=>x==='me'?`<button class=\"srow\" data-a=\"tab\" data-v=\"profile\" style=\"border:0;background:none;width:100%;text-align:start;padding:0;display:flex;align-items:center;gap:12px\">${av('me',44)}<span style=\"flex:1;min-width:0\"><b>${esc(S.me.name)}</b> <span class=\"muted\">· <span>You</span></span></span></button>`\n    :`<div style=\"display:flex;align-items:center;gap:12px\"><button data-a=\"go\" data-v=\"user:${x}\" style=\"border:0;background:none;padding:0;display:flex;align-items:center;gap:12px;flex:1;min-width:0;text-align:start;color:inherit\">${av(x,44)}<span style=\"min-width:0\"><b>${P[x].name}</b><span class=\"muted\" style=\"display:block;font-size:12.5px\">${flagDot(P[x].cc,13)} ${P[x].city}</span></span></button><button class=\"btn small ${S.follows[x]?'glass':''}\" style=\"height:34px;padding:0 14px\" data-a=\"follow\" data-v=\"${x}\">${S.follows[x]?'Following ✓':'Follow'}</button></div>`;\n  return `<div class=\"screen pushed\" data-swipe>${topBar(p.name)}\n    <div class=\"pad\"><div class=\"seg\">${[['followers',fmt(800+p.name.length*211+(S.follows[id]?1:0))+' followers'],['following',(120+p.age*3)+' following']].map(([x,l])=>`<button class=\"${k===x?'on':''}\" data-a=\"ufol-tab\" data-v=\"${id}|${x}\">${l}</button>`).join('')}</div></div>\n    <div class=\"scroll\" data-sk=\"ufol-${id}-${k}\"><div class=\"pad\" style=\"display:flex;flex-direction:column;gap:14px;padding-top:16px;padding-bottom:24px\">${L.map(row).join('')}${total>L.length?`<span class=\"muted\" style=\"font-size:13px;text-align:center\">+ ${n0(total-L.length)} more</span>`:''}</div></div></div>`; }\nfunction vUser(id){");
change("profile: Followers / Following can be tapped",
  "<div class=\"stat\"><b>${fmt(800+p.name.length*211)}</b><span>Followers</span></div><div class=\"stat\"><b>${120+p.age*3}</b><span>Following</span></div>",
  "<button class=\"stat\" data-a=\"go\" data-v=\"ufol:${id}|followers\" style=\"border:0;background:none;padding:0;color:inherit;font:inherit\"><b>${fmt(800+p.name.length*211+(f?1:0))}</b><span>Followers</span></button><button class=\"stat\" data-a=\"go\" data-v=\"ufol:${id}|following\" style=\"border:0;background:none;padding:0;color:inherit;font:inherit\"><b>${120+p.age*3}</b><span>Following</span></button>");
change("profile: their local time next to the city",
  "${flagDot(p.cc,15)} ${p.city}${p.online?' · <span style=\"color:var(--good);font-weight:700\">online</span>':''}</span>",
  "${flagDot(p.cc,15)} ${p.city}${p.online?' · <span style=\"color:var(--good);font-weight:700\">online</span>':''}</span>${localTime(p)}");
change("route for the follower lists",
  "follows:()=>vFollows(c.id),",
  "follows:()=>vFollows(c.id),ufol:()=>vUFollows(c.id),");
change("profile: texts",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\n",
  "\nThe stage is full|La scène est pleine|El escenario está lleno|O palco está cheio|Die Bühne ist voll|Il palco è pieno|ステージは満席です|المنصة ممتلئة\nLocal time|Heure locale|Hora local|Hora local|Ortszeit|Ora locale|現地時間|التوقيت المحلي\n");

change("follower lists: switch between Followers and Following",
  "case 'follow':",
  "case 'ufol-tab': { const c=cur(); if(c&&c.s==='ufol'){ c.id=v; render(); } break; }\n    case 'follow':");

change('iPhone screen edges + flag styles (extra CSS)', '</style>', APP_CSS + '</style>');

// Headers fit the phone in every language (founder, 23 Nov: in French the Connect bell went off the screen).
// Measured on the phone itself, with its real font: first the title gets a little smaller (down to 20 px),
// then the "Plus" word next to the crown hides, then the gaps tighten, then the side margins. Never cuts the title with "…" if it can fit.
// ── Connect → Nearby really shows people near you (founder, 26 Nov: Sam in London saw Mexico City "≈ 0 km") ──
// Most cities had no map position, so the distance fell back to your own position (0 km) and they went to the top.
// Now: every city has a position, your own city is used, and Nearby only lists people within NEAR_KM (app_config in the real app).
change("Nearby: map positions for every city",
  "const COORD={Lyon:[45.76,4.84],",
  "const NEAR_KM=500;\nconst COORD={London:[51.51,-0.13],Bristol:[51.45,-2.59],Bordeaux:[44.84,-0.58],Marseille:[43.3,5.37],Seville:[37.39,-5.98],Brussels:[50.85,4.35],Geneva:[46.2,6.14],Dublin:[53.35,-6.26],Chicago:[41.88,-87.63],'Mexico City':[19.43,-99.13],Guadalajara:[20.67,-103.35],'Buenos Aires':[-34.6,-58.38],Santiago:[-33.45,-70.67],'Medellín':[6.24,-75.58],Sydney:[-33.87,151.21],Lyon:[45.76,4.84],");
change("Nearby: capitals for the missing countries",
  "const CAP={GB:[51.51,-0.13],",
  "const CAP={MX:[19.43,-99.13],AR:[-34.6,-58.38],AU:[-35.28,149.13],CO:[4.71,-74.07],CL:[-33.45,-70.67],GB:[51.51,-0.13],");
change("Nearby: from your own city, unknown places never count as 0 km",
  "const a=CAP[S.me.cc]||CAP.GB, b=COORD[P[id].city]||CAP[P[id].cc]||a,",
  "const a=COORD[S.me.city]||CAP[S.me.cc]||CAP.GB, b=COORD[P[id].city]||CAP[P[id].cc]; if(!b) return 99999; const");
change("Nearby: only people within NEAR_KM",
  "if(f==='online'&&!p.online) return false; if(f==='teachers'",
  "if(f==='online'&&!p.online) return false; if(f==='nearby'&&kmTo(id)>NEAR_KM) return false; if(f==='teachers'");
change("Nearby: city and distance on their own line",
  "${f==='nearby'?' · '+esc(p.city)+' · ≈ '+n0(kmTo(id))+' km':''}</span>",
  "</span>${f==='nearby'?'<span class=\"pnear\">'+esc(p.city)+' · ≈ '+n0(kmTo(id))+' km</span>':''}");
change("Nearby: message when no one is close",
  "<button class=\"btn small\" data-a=\"pref\" data-v=\"nearby\">Turn on Nearby</button></div></div>`:''}",
  "<button class=\"btn small\" data-a=\"pref\" data-v=\"nearby\">Turn on Nearby</button></div></div>`:''}\n    ${f==='nearby'&&S.prefs.nearby&&!list.length?`<div class=\"pad\" style=\"padding-top:12px\"><div class=\"glass\" style=\"padding:20px;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center\"><b>No one near you yet</b><span class=\"muted\" style=\"font-size:13.5px;line-height:1.45\">Only people within about 500 km show here.</span><button class=\"btn small\" data-a=\"discf\" data-v=\"all\">See everyone</button></div></div>`:''}");
change("Nearby: style of the city line",
  "</style>",
  ".pnear{display:block;font-size:13px;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n</style>");
change("Nearby: translations",
  "المنصة ممتلئة · حاول مجددًا عندما يغادرها أحد\n",
  "المنصة ممتلئة · حاول مجددًا عندما يغادرها أحد\nNo one near you yet|Personne près de toi pour l’instant|Aún no hay nadie cerca de ti|Ainda não há ninguém perto de você|Noch niemand in deiner Nähe|Ancora nessuno vicino a te|近くにはまだ誰もいません|لا أحد بالقرب منك بعد\nOnly people within about 500 km show here.|Seules les personnes à moins de 500 km environ s’affichent ici.|Aquí solo aparecen personas a unos 500 km como máximo.|Aqui só aparecem pessoas a até uns 500 km.|Hier erscheinen nur Leute im Umkreis von etwa 500 km.|Qui compaiono solo persone entro circa 500 km.|ここには約500km以内の人だけが表示されます。|تظهر هنا فقط الأشخاص على بعد 500 كم تقريبًا.\nSee everyone|Voir tout le monde|Ver a todos|Ver todo mundo|Alle ansehen|Vedi tutti|全員を見る|عرض الجميع\n");

// ── Flick comments and corrections show when they were sent (founder, 26 Nov: "no date and time on comments") ──
// Today: 14:32 · yesterday: Yesterday 14:32 · older: 20 Nov 14:32. Sample comments get a fixed past time the first time they show.
change("comment time: helper",
  "function dayFmt(d,o){",
  "function cmtWhen(ts){ const d=new Date(ts), n=new Date(), p=x=>String(x).padStart(2,'0'), hm=p(d.getHours())+':'+p(d.getMinutes()), day=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime(), dd=Math.round((day(n)-day(d))/864e5);\n  if(dd<=0) return hm; if(dd===1) return '<span>Yesterday</span> '+hm; let ds; try{ const L=appLang()==='en'?'en-GB':appLang()==='ar'?'ar-u-nu-latn':appLang(); ds=new Intl.DateTimeFormat(L,{day:'numeric',month:'short',...(d.getFullYear()!==n.getFullYear()?{year:'numeric'}:{})}).format(d); }catch(e){ ds=d.toDateString(); } return ds+' '+hm; }\nfunction cmtAt(id,by,t0,fix,j){ const k=id+'|'+by+'|'+t0+'|'+(fix||''), A=(S.cmtAt=S.cmtAt||{}); if(!A[k]){ A[k]=Date.now()-(((by.length*53+j*97+(t0||'').length*7)%2800)+25)*60000; save(); } return A[k]; }\nfunction dayFmt(d,o){");
change("comment time: stored when you post a comment",
  "(S.extraComments[v]=S.extraComments[v]||[]).unshift(['me',t,'']);",
  "(S.extraComments[v]=S.extraComments[v]||[]).unshift(['me',t,'']); (S.cmtAt=S.cmtAt||{})[v+'|me|'+t+'|']=Date.now();");
change("comment time: stored when you post a correction",
  "(S.extraComments[v]=S.extraComments[v]||[]).unshift(['me',m.text,t]); practiceAdd(0,null,1);",
  "(S.extraComments[v]=S.extraComments[v]||[]).unshift(['me',m.text,t]); (S.cmtAt=S.cmtAt||{})[v+'|me|'+m.text+'|'+t]=Date.now(); practiceAdd(0,null,1);");
change("comment time: shown first in the comment's action row",
  "<div class=\"cact\"><button data-a=\"clike\" data-v=\"${sh.id}-${j}\">",
  "<div class=\"cact\"><time class=\"cwhen\">${cmtWhen(cmtAt(sh.id,by,t0,fix,j))}</time><button data-a=\"clike\" data-v=\"${sh.id}-${j}\">");
change("comment time: style",
  "</style>",
  ".cwhen{font-size:12px;color:var(--muted);align-self:center;white-space:nowrap;margin-right:2px;font-variant-numeric:tabular-nums}\n</style>");

// "French native" badge on comments: the language name was left in English ("Natif french", Arabic doubled "بالـالفرنسية").
change("native badge: language name in the app language",
  'class="natb">${m.lang} native',
  'class="natb">${natBadge(m.lang)}');
change("native badge: helper",
  "function cmtWhen(ts){",
  "function natBadge(lg){ const L=appLang(); if(L==='en') return lg+' native'; const n=lname(lg,L)||lg, lo=/^(fr|es|pt|it)$/.test(L)?n.toLowerCase():n; return ({fr:'Natif · '+lo,es:'Nativo · '+lo,pt:'Nativo · '+lo,de:'Muttersprache '+n,it:'Madrelingua '+lo,ja:n+'ネイティブ',ar:'ناطق أصلي ب'+n})[L]||lg+' native'; }\nfunction cmtWhen(ts){");

// Room and live chat: no time on each line (keeps the chat clean); pressing and holding a message shows when it was sent (founder, 26 Nov).
change("room chat: remember when each message arrived (talk rooms)",
  "function chatHtml(){ if(UI.room.chat.length>120)",
  "function rcStamp(){ const n=Date.now(); (UI.room&&UI.room.chat||[]).forEach(c=>{ if(c&&!c.ts) c.ts=n; }); }\nfunction chatHtml(){ rcStamp(); if(UI.room.chat.length>120)");
change("room chat: remember when each message arrived (lives)",
  "function liveChatHtml(){ return UI.room.chat",
  "function liveChatHtml(){ rcStamp(); return UI.room.chat");
change("room chat: time in the press-and-hold bubble",
  "<div class=\"hbub\"><b>${mine?esc(S.me.name):P[who]?P[who].name:''}</b>",
  "<div class=\"hbub\"><b>${mine?esc(S.me.name):P[who]?P[who].name:''}${(()=>{ const c=[...R.chat].reverse().find(c=>c[0]===who&&c[1]===sh.txt); return c&&c.ts?`<time class=\"hwhen\">${cmtWhen(c.ts)}</time>`:''; })()}</b>");
change("room chat: style of the time",
  "</style>",
  ".hbub .hwhen{font-weight:500;font-size:11.5px;opacity:.6;margin-inline-start:8px;font-variant-numeric:tabular-nums}\n</style>");

// ── Connect → City (Plus): pick a city, suggestions, city on each row, remembered (founder, 26 Nov) ──
// Before: until you typed, it showed everyone (same as All), rows didn't say where people live, and the spelling had to be exact.
change("City: helpers (accents ignored, local spellings, city chips)",
  "function vDiscover(){",
  `const nrmC=s=>String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().trim();
const CITY_ALIAS={londres:'London',londra:'London',sevilla:'Seville',siviglia:'Seville',bruxelles:'Brussels',brussel:'Brussels',bruselas:'Brussels',lisboa:'Lisbon',lissabon:'Lisbon',geneve:'Geneva',genf:'Geneva',ginevra:'Geneva','ciudad de mexico':'Mexico City','cdmx':'Mexico City','mexico':'Mexico City',tokio:'Tokyo',dublino:'Dublin',parigi:'Paris','osaka':'Osaka',lione:'Lyon','marsella':'Marseille','marsiglia':'Marseille','montreal':'Montréal','medellin':'Medellín','santiago de chile':'Santiago'};
function cityMatch(city,q){ const c=nrmC(city), n=nrmC(q); if(!n) return true; if(c.includes(n)) return true; const al=Object.keys(CITY_ALIAS).filter(k=>k.startsWith(n)||n.startsWith(k)&&n.length>=k.length).map(k=>CITY_ALIAS[k]); return al.some(a=>nrmC(a)===c); }
function ctryName(cc){ try{ const L=appLang()==='en'?'en-GB':appLang(); return (DNC['r'+L]||(DNC['r'+L]=new Intl.DisplayNames([L],{type:'region'}))).of(cc)||cc; }catch(e){ return cc; } }
function cityChips(ll){ const q=UI.cityQ||'', cnt={}; Object.keys(P).forEach(id=>{ const p=P[id]; if(id==='me'||!p.city||p.city==='You'||isBlocked(id)) return; if(ll==='mine'&&!myLangs().includes(p.native)) return; if(ll&&ll!=='mine'&&ll!=='all'&&p.native!==ll) return; cnt[p.city]=cnt[p.city]||{n:0,cc:p.cc}; cnt[p.city].n++; });
  let cs=Object.keys(cnt).filter(c=>cityMatch(c,q)).sort((a,b)=>cnt[b].n-cnt[a].n||a.localeCompare(b)); const exact=cs.find(c=>nrmC(c)===nrmC(q)); if(exact) cs=[exact];
  const chip=c=>\`<button class="\${exact===c?'on':''}" data-a="cityq" data-v="\${esc(exact===c?'':c)}">\${flagDot(cnt[c].cc,18)}<span>\${esc(c)}</span><i>\${cnt[c].n}</i>\${exact===c?ic('close'):''}</button>\`;
  return \`<div class="pad citypk">\${q?'':'<p class="muted citynote">Find partners in a city you’re visiting or moving to.</p>'}\${cs.length?\`<div class="citych">\${cs.slice(0,q?8:20).map(chip).join('')}</div>\`:''}</div>\`; }
function vDiscover(){ if(UI.cityQ==null&&S.cityQ) UI.cityQ=S.cityQ;`);
change("City: accents and local spellings ignored",
  "if(f==='city'&&UI.cityQ&&!p.city.toLowerCase().includes(UI.cityQ.toLowerCase())) return false;",
  "if(f==='city'&&UI.cityQ&&!cityMatch(p.city,UI.cityQ)) return false;");
change("City: nobody listed until a city is picked or typed",
  "const list=(f==='nearby'&&!S.prefs.nearby?[]:ids);",
  "const list=(f==='nearby'&&!S.prefs.nearby)||(f==='city'&&!(UI.cityQ||'').trim())?[]:ids;");
change("City: chips under the search box, and a message when no one lives there",
  `placeholder="Search by city" style="border:0;background:none;outline:none;width:100%;font-size:16px"></label></div>\`:''}`,
  `placeholder="Search by city" style="border:0;background:none;outline:none;width:100%;font-size:16px"></label></div>\${cityChips(ll)}\${(UI.cityQ||'').trim()&&!list.length?\`<div class="pad" style="padding-top:4px"><div class="glass" style="padding:20px;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center;box-shadow:none"><b>No one in this city yet</b><span class="muted" style="font-size:13.5px;line-height:1.45">Try another city, or see everyone in All.</span><button class="btn small" data-a="discf" data-v="all">See everyone</button></div></div>\`:''}\`:''}`);
change("City: the city is remembered",
  "if(e.target.id==='city-q'){ UI.cityQ=e.target.value; render(); }",
  "if(e.target.id==='city-q'){ UI.cityQ=e.target.value; S.cityQ=UI.cityQ; render(); }");
change("City: tapping a city chip",
  "case 'discf': UI.discFilter=v; render(); break;",
  "case 'discf': UI.discFilter=v; render(); break;\n    case 'cityq': UI.cityQ=v; S.cityQ=v; save(); render(); break;");
change("City: city and country on each row",
  "${f==='nearby'?'<span class=\"pnear\">'+esc(p.city)+' · ≈ '+n0(kmTo(id))+' km</span>':''}",
  "${f==='nearby'?'<span class=\"pnear\">'+esc(p.city)+' · ≈ '+n0(kmTo(id))+' km</span>':f==='city'?'<span class=\"pnear\">'+esc(p.city)+', '+esc(ctryName(p.cc))+'</span>':''}");
change("City: chip style",
  "</style>",
  `.citypk{padding-top:10px!important}.citynote{margin:0 0 10px;font-size:13.5px;line-height:1.4}
.citych{display:flex;flex-wrap:wrap;gap:8px}
.citych button{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:18px;border:1px solid var(--line);background:var(--card,#fff);color:var(--ink);font-size:14px;font-weight:600}
.citych button i{font-style:normal;font-size:12px;font-weight:700;color:var(--muted);background:var(--chip);border-radius:9px;padding:1px 7px}
.citych button.on{background:var(--ink);color:var(--bg,#fff);border-color:var(--ink)}.citych button.on i{background:rgba(255,255,255,.2);color:inherit}
.citych button svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.4}
.citych .flagc,.citych img{width:18px;height:18px;border-radius:50%}
</style>`);
change("City: translations",
  "See everyone|Voir tout le monde|Ver a todos|Ver todo mundo|Alle ansehen|Vedi tutti|全員を見る|عرض الجميع\n",
  "See everyone|Voir tout le monde|Ver a todos|Ver todo mundo|Alle ansehen|Vedi tutti|全員を見る|عرض الجميع\nFind partners in a city you’re visiting or moving to.|Trouve des partenaires dans une ville où tu vas voyager ou t’installer.|Encuentra compañeros en una ciudad que vas a visitar o a la que te mudas.|Encontre parceiros numa cidade que você vai visitar ou para onde vai se mudar.|Finde Partner in einer Stadt, die du besuchst oder in die du ziehst.|Trova partner in una città che visiterai o dove ti trasferisci.|旅行や引っ越しで行く街のパートナーを探そう。|اعثر على شركاء في مدينة ستزورها أو ستنتقل إليها.\nNo one in this city yet|Personne dans cette ville pour l’instant|Aún no hay nadie en esta ciudad|Ainda não há ninguém nesta cidade|Noch niemand in dieser Stadt|Ancora nessuno in questa città|この街にはまだ誰もいません|لا أحد في هذه المدينة بعد\nTry another city, or see everyone in All.|Essaie une autre ville, ou vois tout le monde dans Tout.|Prueba otra ciudad o mira a todos en Todos.|Tente outra cidade ou veja todo mundo em Todos.|Versuch eine andere Stadt oder sieh dir alle unter Alle an.|Prova un’altra città o vedi tutti in Tutti.|別の街を試すか、「すべて」で全員を見てね。|جرّب مدينة أخرى، أو اعرض الجميع في الكل.\n");

// While typing in a talk room or live, a tap on the room only closes the keyboard (like iMessage / WhatsApp); the next tap opens what you tap.
// Before, the tap that closed the keyboard also opened what was under the finger (founder's video: Marc's card opened).
change("typing in a room: first tap outside only closes the keyboard",
  "phone.addEventListener('contextmenu',(e)=>{ if(e.target.closest('#roomchat [data-rh],#livechat [data-rh]')) e.preventDefault(); });",
  "phone.addEventListener('contextmenu',(e)=>{ if(e.target.closest('#roomchat [data-rh],#livechat [data-rh]')) e.preventDefault(); });\nlet kbEat=false;\nphone.addEventListener('pointerdown',(e)=>{ const a=document.activeElement; kbEat=!!(a&&(a.id==='rc-input'||a.id==='lc-input')&&!e.target.closest('form.tbar,form.lbar,.atlist,.emopan,.rrbar,.kbtop,.veil,.trcard,.lbar,.tbar')); },true);\nphone.addEventListener('click',(e)=>{ if(!kbEat) return; kbEat=false; e.preventDefault(); e.stopPropagation(); const a=document.activeElement; if(a&&/^(INPUT|TEXTAREA)$/.test(a.tagName)) a.blur(); },true);");

// ── Round 4 audit fixes, batch A (27 Nov): Me / money / sign-up and Connect / Flicks / profiles ──
// keyboard "Done" never in the clock area (phone-number and SMS-code screens had it at the very top)
change("r4: keyboard Done stays below the clock",
  "x=Math.max(pr.left+6,Math.min(pr.right-w-6,x)); y=Math.max(pr.top+6,y);",
  "x=Math.max(pr.left+6,Math.min(pr.right-w-6,x)); y=Math.max(pr.top+Math.max(6,(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sa-top'))||0)+6),y);");
// one profile-completion number everywhere (Me used a different formula than Edit profile)
change("r4: Me uses the same profile completion as Edit profile",
  "mine=S.myMoments, st=strength(), W=S.week",
  "mine=S.myMoments, st=strength2(), W=S.week");
change("r4: profile completion hint",
  "${!me.photo?'add a profile photo':!me.video?'add a 30s intro video':'post 5 Flicks'}",
  "${!me.photo?'add a profile photo':!me.video?'add a 30s intro video':'add more about you'}");
// Wallet: the "Turn 100 Diamonds into coins" button was three broken pieces of text
change("r4: Diamonds to coins button is one sentence",
  "<button class=\"btn small glass\" data-a=\"convert\">Turn 100 ${GEM(15)} into 100 ${COIN(14)} to re-gift</button>",
  "<button class=\"btn small glass\" data-a=\"convert\" style=\"gap:8px\">${GEM(15)}<span>Turn 100 Diamonds into 100 coins</span></button>");
// Plans: savings worked out from the prices you actually see
change("r4: Plans savings from local prices",
  "['year','Yearly','≈ '+money(79.99/12,1)+' a month',money(79.99),'Save 33%']",
  "['year','Yearly','≈ '+fmtCur(Math.round(priceV(79.99)/12*100)/100,ccy())+' a month',money(79.99),'Save '+Math.round((1-priceV(79.99)/(priceV(9.99)*12))*100)+'%']");
change("r4: priceV helper",
  "function money(eur,exact){",
  "function priceV(eur){ const c=ccy(); let v=eur*FX[c]; if(NODEC.includes(c)){ const s=c==='JPY'?10:100; return Math.round(v/s)*s; } return eur%1?Math.max(.99,Math.round(v)-0.01):Math.round(v); }\nfunction money(eur,exact){");
// teacher sign-up: a reason line under every greyed Continue, and a teacher version of the video tip
change("r4: reason line fallback", "<span class=\"obwhy\" id=\"ob-why\" ${ok?'hidden':''}>${obWhy()}</span>",
  "<span class=\"obwhy\" id=\"ob-why\" ${ok?'hidden':''}>${obWhy()||(ok?'':UI._why||'')}</span>");
change("r4: why country", "; ok=!!me.cc;", "; ok=!!me.cc; UI._why='Pick your country';");
change("r4: why interests", "; ok=sel.length>=1;", "; ok=sel.length>=1; UI._why='Pick at least one interest';");
change("r4: why video", "; ok=!!me.video;", "; ok=!!me.video; UI._why='Record your intro to continue';");
change("r4: why teach", "; ok=TA.langs.length>0&&TA.levels.length>0&&TA.types.length>0;", "; ok=TA.langs.length>0&&TA.levels.length>0&&TA.types.length>0; UI._why='Pick what you teach, the levels and the lesson types';");
change("r4: why experience", "; ok=!!TA.years&&TA.quals.length>0;", "; ok=!!TA.years&&TA.quals.length>0; UI._why='Add your years of teaching and a qualification';");
change("r4: why id", "; ok=!!TA.id;", "; ok=!!TA.id; UI._why='Confirm your identity to continue';");
change("r4: why pay", "; ok=!!TA.pay;", "; ok=!!TA.pay; UI._why='Add your payout account to continue';");
change("r4: why promise", "; ok=['real','inapp','kind','tax','terms'].every(k=>TA.promise[k]);", "; ok=['real','inapp','kind','tax','terms'].every(k=>TA.promise[k]); UI._why='Tick every promise to send your application';");
change("r4: teacher video tip", "💡 Say your name, where you’re from and what you’re learning</span>",
  "💡 ${UI.tapp?'Say your name, where you’re from and what you teach':'Say your name, where you’re from and what you’re learning'}</span>");
// My languages: Done with nothing changed just goes back
change("r4: My languages Done with no change", "case 'lg-save': { if(!UI.lgd) break", "case 'lg-save': { if(!UI.lgd){ pop(); break; }");
// "46m this week" instead of "0h 46m this week"
change("r4: minutes only under an hour", "${m?Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m':'No practice yet'} this week",
  "${m?(m>=60?Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m':m+'m'):'No practice yet'} this week");
change("r4: this-week translation for minutes only", "const wk=x0.match(/^(\\d+h \\d+m) this week$/);", "const wk=x0.match(/^((?:\\d+h )?\\d+m) this week$/);");
// German: big numbers keep their thousands separator (compact format gave "1284")
change("r4: number format", "try{ return new Intl.NumberFormat(LOC(),{notation:'compact',maximumFractionDigits:1}).format(n); }",
  "try{ const r=new Intl.NumberFormat(LOC(),{notation:'compact',maximumFractionDigits:1}).format(n); return /\\d{4}/.test(r)?n0(n):r; }");
// Storage rows: a useful message instead of "Kept"
{ const f = "'toast','Kept'"; const n = html.split(f).length - 1; if (n !== 3) throw new Error('r4 Kept: ' + n);
  html = html.split(f).join("'toast','Use “Clear cache” below to free up space'"); applied.push('r4: storage rows explain how to free space'); }
// Delete account: only tell people to cash out when they really can
change("r4: delete account cash-out hint", "${S.diamonds>=1000?' Cash out first if you want the money.':''}", "${(S.diamonds-(S.pending||0))>=1000?' Cash out first if you want the money.':''}");

// ── Flicks comments: likes / hides / saves stay on the comment you acted on (they used the list position) ──
change("r4: comments keep a stable key", "list=[...(S.extraComments[sh.id]||[]),...m.comments].map((c,j)=>[...c,j])",
  "list=[...(S.extraComments[sh.id]||[]),...m.comments].map((c,j,a)=>[...c,'r'+(a.length-1-j)]).filter(c=>!isBlocked(c[0]))");
change("r4: own new comments start at 0 likes", "${((by.length*7+j*5)%30)+((S.cliked||{})[sh.id+'-'+j]?1:0)}",
  "${(by==='me'?0:((by.length*7+(+String(j).slice(1))*5)%30))+((S.cliked||{})[sh.id+'-'+j]?1:0)}");
change("r4: notebook save uses the stable key", "c=[...(S.extraComments[mid]||[]),...m.comments][+j];",
  "c=(Lc=>Lc[String(j)[0]==='r'?Lc.length-1-(+String(j).slice(1)):+j])([...(S.extraComments[mid]||[]),...m.comments]);");
// Correction mode always starts from the original sentence, even with the keyboard open
change("r4: correction mode prefills", "case 'cmode': UI.cmode=v; render(); break;",
  "case 'cmode': { UI.cmode=v; UI.cmtTouched=false; render(); const i2=document.getElementById('cmt'), sh=UI.sheet, m=sh&&[...S.myMoments,...MOMENTS0].find(x=>x.id===sh.id); if(i2&&m) i2.value=v==='fix'?m.text:''; break; }");
// a new Flick starts at your own level for that language (tags and caption agree)
change("r4: Flick editor level from your profile", "UI.ed={lang:S.me.learning,lvl:'Beginner',",
  "UI.ed={lang:S.me.learning,lvl:(l=>/^C/.test(l)?'Advanced':/^B/.test(l)?'Intermediate':'Beginner')((S.me.levels||{})[S.me.learning]||S.me.level||'A1'),");
// a new account doesn't show the demo bio or demo supporters
{ const f = "${esc(me.bio||'Londoner learning French and Spanish. Happy to help with your English!')}"; const n = html.split(f).length - 1; if (n !== 2) throw new Error('r4 bio: ' + n);
  html = html.split(f).join("${me.bio?esc(me.bio):S.acct==='demo'?'Londoner learning French and Spanish. Happy to help with your English!':'<button class=\"lnk\" data-a=\"go\" data-v=\"editp\">Add a short bio</button>'}"); applied.push('r4: no demo bio on new accounts'); }
change("r4: no demo supporters on new accounts", "${suppRow(SUPP.me)}`}</div>", "${S.acct==='demo'?suppRow(SUPP.me):'<p class=\"muted\" style=\"margin:0;font-size:13.5px\">No gifts yet this month</p>'}`}</div>");
// other people's profiles: only their real Flicks (the placeholder tiles opened the wrong feed)
change("r4: no placeholder tiles on profiles", "momGrid([...mom,...fakeGrid(id)],false)", "(mom.length?momGrid(mom,false):'<p class=\"muted\" style=\"text-align:center;margin:20px 0\">No Flicks yet</p>')");
change("r4: real Flick count on profiles", "<b>${mom.length+4}</b><span>Flicks</span>", "<b>${mom.length}</b><span>Flicks</span>");
change("r4: a missing or blocked Flick says so", "function vFlick(id){ const m=allFlicks().find(x=>x.id===id); if(!m) return vMoments();",
  "function vFlick(id){ const m=allFlicks().find(x=>x.id===id); if(!m||isBlocked(m.by)) return `<div class=\"screen pushed\" data-swipe>${topBar('Flick')}<div class=\"scroll\"><p class=\"muted\" style=\"text-align:center;padding:60px 24px\">This Flick isn’t available.</p></div></div>`;");
// Learn: nothing from blocked or muted people
change("r4: Learn hides blocked and muted people", "const items=(LEARN[L]||[]).filter(x=>!hid('post',x.id)&&!(x.by&&isBlocked(x.by)));",
  "const items=(LEARN[L]||[]).filter(x=>!hid('post',x.id)&&!(x.by&&isBlocked(x.by))&&!(x.from&&(f=>f&&(isBlocked(f.by)||(typeof isMutedU==='function'&&isMutedU(f.by))))(allFlicks().find(y=>y.id===x.from))));");
// Learn "N done today": each exercise counts once, and it starts again every day
change("r4: Learn done today counts once per exercise per day", "if(UI.ex[id]==null){ UI.ex[id]=+i; S.exDone=(S.exDone||0)+1; }",
  "if(UI.ex[id]==null){ UI.ex[id]=+i; const d=new Date().toDateString(); if(S.exDay!==d){ S.exDay=d; S.exIds=[]; } S.exIds=S.exIds||[]; if(!S.exIds.includes(id)) S.exIds.push(id); S.exDone=S.exIds.length; }");
change("r4: Learn done today shows today only", "<span>${S.exDone||0} done today</span>", "<span>${S.exDay===new Date().toDateString()?S.exDone||0:0} done today</span>");
// French: no guessed gender
change("r4 fr: get seen first", "|Sois vu en premier|", "|Passe en tête|");
change("r4 fr: only you", "|Toi seul peux voir ceci|", "|Visible uniquement par toi|");
change("r4 fr: collections", "Toi seul vois tes collections.|", "Tes collections ne sont visibles que par toi.|");
change("r4 fr: tour", "Touche Suivant quand tu es prêt.", "Touche Suivant quand tu veux.");
change("r4 fr: stuck", "|Bloqué ? Touche Traduire sous la légende.|", "|Un doute ? Touche Traduire sous la légende.|");
change("r4 fr: paid", "Enseigne ta langue et sois payé pour tes cours", "Enseigne ta langue et reçois un paiement pour tes cours");
change("r4 fr: experience", "|Ton expérience d’enseignant|", "|Ton expérience d’enseignement|");
// CSS
change("r4: CSS", "</style>", `/* r4: City chips readable in dark mode */
.citych button{background:var(--chip)!important;color:var(--ink)!important;border-color:var(--line)!important}
.citych button.on{background:var(--ink)!important;color:var(--bg)!important;border-color:var(--ink)!important}
/* r4: comment action row never breaks words letter by letter */
.cact{flex-wrap:wrap;row-gap:4px}.cact>*{white-space:nowrap;flex-shrink:0;word-break:normal!important;overflow-wrap:normal!important}
.cact svg{flex-shrink:0}.cmt>.ibtn{flex-shrink:0;white-space:nowrap}
/* r4: big text Flicks stop above the name and caption, and shrink on small phones */
.ptext .ptxt{bottom:calc(230px + var(--sa-bottom,0px));overflow:hidden}
.ptext .ptxt .big{font-size:clamp(22px,7.4vw,34px)!important;line-height:1.18}
/* r4: Learn cards use the space down to the tab bar (they have no caption or comment bar) */
.post.lx .lxin{bottom:calc(78px + var(--sa-bottom,0px))!important}
/* r4: Plans on short phones: the whole page scrolls, only the Start button stays pinned at the bottom */
@media (max-height:740px){
.screen:has(> .pad [data-a=restore]){overflow-y:auto;scrollbar-width:none}
.screen:has(> .pad [data-a=restore])>.scroll{flex:none!important;overflow:visible!important}
.screen:has(> .pad [data-a=restore])>.pad{display:contents}
.screen:has(> .pad [data-a=restore])>.pad>.btn{position:sticky;bottom:calc(10px + var(--sa-bottom,0px));z-index:3;margin:0 16px;width:auto}
.screen:has(> .pad [data-a=restore])>.pad>.finep,.screen:has(> .pad [data-a=restore])>.pad>.linkrow{margin-left:16px!important;margin-right:16px!important}
.screen:has(> .pad [data-a=restore])>.pad>.linkrow{padding-bottom:calc(16px + var(--sa-bottom,0px))}
.screen:has(> .pad [data-a=restore])>.top{position:sticky;top:0;z-index:4;background:var(--bg)}
}
@media (max-width:359px){.screen:has(> .pad [data-a=restore]) .golive>span:last-child{display:none}}
</style>`);
// dynamic texts (RX + PAT)
change("r4: RX", "[/^10 min left in this (room|live)$/,'w10a']",
  "[/^([\\d.,\\s\\u202f\\u00a0]+) more to your first cash-out$/,'mfc'],[/^([\\d.,\\s\\u202f\\u00a0]+) pending · gifts unlock after 14 days$/,'pnd'],[/^(\\S+) sent you an? (.+)$/,'sentu'],[/^Cash-out (.+) \\(demo\\)$/,'cashd'],[/^Save (\\d+)%$/,'savep'],[/^(\\S+) is calling$/,'iscall'],[/^10 min left in this (room|live)$/,'w10a']");
change("r4: PAT", "w10a:{fr:'Plus que 10 min dans ce salon'",
  "mfc:{fr:'Encore $1 avant ton premier retrait',es:'Te faltan $1 para tu primer retiro',pt:'Faltam $1 para o primeiro saque',de:'Noch $1 bis zur ersten Auszahlung',it:'Ancora $1 per il primo prelievo',ja:'初回の換金まであと$1',ar:'تبقّى \\u2068$1\\u2069 على أول سحب'},pnd:{fr:'$1 en attente · les cadeaux se débloquent après 14 jours',es:'$1 pendientes · los regalos se liberan a los 14 días',pt:'$1 pendentes · os presentes liberam após 14 dias',de:'$1 ausstehend · Geschenke werden nach 14 Tagen frei',it:'$1 in attesa · i regali si sbloccano dopo 14 giorni',ja:'保留中 $1 · ギフトは14日後に使えます',ar:'\\u2068$1\\u2069 قيد الانتظار · تُتاح الهدايا بعد 14 يومًا'},sentu:{fr:'$1 t’a offert : $2',es:'$1 te regaló: $2',pt:'$1 te deu: $2',de:'$1 hat dir geschenkt: $2',it:'$1 ti ha regalato: $2',ja:'$1から$2が届きました',ar:'هدية من $1: $2'},cashd:{fr:'Retrait $1 (démo)',es:'Retiro $1 (demo)',pt:'Saque $1 (demo)',de:'Auszahlung $1 (Demo)',it:'Prelievo $1 (demo)',ja:'換金 $1（デモ）',ar:'سحب $1 (تجريبي)'},savep:{fr:'Économise $1 %',es:'Ahorra $1 %',pt:'Economize $1%',de:'Spare $1 %',it:'Risparmia $1%',ja:'$1%お得',ar:'وفّر $1%'},iscall:{fr:'$1 t’appelle',es:'$1 te está llamando',pt:'$1 está ligando',de:'$1 ruft an',it:'$1 ti sta chiamando',ja:'$1から着信',ar:'$1 يتصل بك'},w10a:{fr:'Plus que 10 min dans ce salon'");
change("r4: gift name translated in 'sent you a'", "if(k==='sentg') b=trs(b,LIDX[L])||b;",
  "if(k==='sentg') b=trs(b,LIDX[L])||b; if(k==='sentu'){ const mm=b.match(/^(.*?)(\\s*[\\p{Extended_Pictographic}].*)?$/u); b=(trs(mm[1],LIDX[L])||mm[1])+(mm[2]||''); }");
change("r4: translations", "See everyone|Voir tout le monde|Ver a todos|Ver todo mundo|Alle ansehen|Vedi tutti|全員を見る|عرض الجميع\n",
  "See everyone|Voir tout le monde|Ver a todos|Ver todo mundo|Alle ansehen|Vedi tutti|全員を見る|عرض الجميع\n" + [
  "Turn 100 Diamonds into 100 coins|Convertir 100 Diamants en 100 pièces|Convertir 100 Diamantes en 100 monedas|Converter 100 Diamantes em 100 moedas|100 Diamanten in 100 Münzen tauschen|Converti 100 Diamanti in 100 monete|ダイヤ100を100コインに交換|حوّل 100 ماسة إلى 100 عملة",
  "18+ · up to 2 cash-outs a month · EU, UK and Switzerland · paid by our payout partner|18+ · jusqu’à 2 retraits par mois · UE, Royaume-Uni et Suisse · payé par notre partenaire de paiement|18+ · hasta 2 retiros al mes · UE, Reino Unido y Suiza · lo paga nuestro socio de pagos|18+ · até 2 saques por mês · UE, Reino Unido e Suíça · pago pelo nosso parceiro de pagamentos|18+ · bis zu 2 Auszahlungen im Monat · EU, Großbritannien und Schweiz · über unseren Zahlungspartner|18+ · fino a 2 prelievi al mese · UE, Regno Unito e Svizzera · pagato dal nostro partner di pagamento|18歳以上 · 月2回まで換金可 · EU・英国・スイス · 決済パートナーが支払い|18+ · حتى سحبين في الشهر · الاتحاد الأوروبي والمملكة المتحدة وسويسرا · يدفعها شريك الدفع لدينا",
  "Demo: Kenji sends you a Rocket 🚀 (+250)|Démo : Kenji t’offre une Fusée 🚀 (+250)|Demo: Kenji te regala un Cohete 🚀 (+250)|Demo: Kenji te dá um Foguete 🚀 (+250)|Demo: Kenji schenkt dir eine Rakete 🚀 (+250)|Demo: Kenji ti regala un Razzo 🚀 (+250)|デモ：Kenjiからロケット 🚀（+250）|تجريبي: Kenji يهديك صاروخًا 🚀 (+250)",
  "Beta demo · no money is paid out|Démo bêta · aucun argent n’est versé|Demo beta · no se paga dinero|Demo beta · nenhum dinheiro é pago|Beta-Demo · es wird kein Geld ausgezahlt|Demo beta · nessun pagamento reale|ベータ版デモ · 実際の支払いはありません|نسخة تجريبية · لا تُدفع أي أموال",
  "Welcome tour reward|Récompense de la visite guidée|Premio del tour de bienvenida|Recompensa do tour de boas-vindas|Belohnung für die Tour|Premio del tour di benvenuto|ウェルカムツアーの特典|مكافأة الجولة الترحيبية",
  "Boost now|Booster maintenant|Impulsar ahora|Impulsionar agora|Jetzt boosten|Metti in evidenza ora|今すぐブースト|عزّز الآن",
  "Photo added|Photo ajoutée|Foto añadida|Foto adicionada|Foto hinzugefügt|Foto aggiunta|写真を追加しました|تمت إضافة الصورة",
  "we check every photo|nous vérifions chaque photo|revisamos cada foto|verificamos cada foto|wir prüfen jedes Foto|controlliamo ogni foto|すべての写真を確認しています|نراجع كل صورة",
  "We check every photo|Nous vérifions chaque photo|Revisamos cada foto|Verificamos cada foto|Wir prüfen jedes Foto|Controlliamo ogni foto|すべての写真を確認しています|نراجع كل صورة",
  "Apple purchase|Achat Apple|Compra de Apple|Compra Apple|Apple-Kauf|Acquisto Apple|Appleでの購入|شراء عبر Apple",
  "Invite to Duo|Inviter en Duo|Invitar a Duo|Convidar para Duo|Zum Duo einladen|Invita al Duo|Duoに招待|ادعُ إلى Duo",
  "Say your name, where you’re from and what you teach|Dis ton prénom, d’où tu viens et ce que tu enseignes|Di tu nombre, de dónde eres y qué enseñas|Diga seu nome, de onde você é e o que ensina|Sag deinen Namen, woher du kommst und was du unterrichtest|Di’ il tuo nome, da dove vieni e cosa insegni|名前、出身、教えている言語を話してね|قل اسمك ومن أين أنت وماذا تدرّس",
  "Pick your country|Choisis ton pays|Elige tu país|Escolha seu país|Wähle dein Land|Scegli il tuo paese|国を選んでね|اختر بلدك",
  "Record your intro to continue|Enregistre ta présentation pour continuer|Graba tu presentación para continuar|Grave sua apresentação para continuar|Nimm deine Vorstellung auf, um weiterzumachen|Registra la presentazione per continuare|続けるには自己紹介を録画してね|سجّل تعريفك للمتابعة",
  "Pick what you teach, the levels and the lesson types|Choisis ce que tu enseignes, les niveaux et les types de cours|Elige qué enseñas, los niveles y los tipos de clase|Escolha o que ensina, os níveis e os tipos de aula|Wähle, was du unterrichtest, die Niveaus und die Kursarten|Scegli cosa insegni, i livelli e i tipi di lezione|教える言語・レベル・レッスンの種類を選んでね|اختر ما تدرّسه والمستويات وأنواع الدروس",
  "Add your years of teaching and a qualification|Indique tes années d’enseignement et un diplôme|Indica tus años de enseñanza y una titulación|Informe seus anos de ensino e uma qualificação|Gib deine Unterrichtsjahre und eine Qualifikation an|Indica gli anni di insegnamento e una qualifica|指導年数と資格を入力してね|أضف سنوات التدريس ومؤهلًا",
  "Confirm your identity to continue|Confirme ton identité pour continuer|Confirma tu identidad para continuar|Confirme sua identidade para continuar|Bestätige deine Identität, um weiterzumachen|Conferma la tua identità per continuare|続けるには本人確認をしてね|أكّد هويتك للمتابعة",
  "Add your payout account to continue|Ajoute ton compte de versement pour continuer|Añade tu cuenta de cobro para continuar|Adicione sua conta de recebimento para continuar|Füge dein Auszahlungskonto hinzu, um weiterzumachen|Aggiungi il conto per i pagamenti per continuare|続けるには受取口座を追加してね|أضف حساب الاستلام للمتابعة",
  "Tick every promise to send your application|Coche chaque engagement pour envoyer ta candidature|Marca cada compromiso para enviar tu solicitud|Marque cada compromisso para enviar sua candidatura|Hake jedes Versprechen ab, um deine Bewerbung zu senden|Spunta ogni impegno per inviare la candidatura|申請するにはすべての約束にチェックしてね|حدّد كل التعهدات لإرسال طلبك",
  "Add a short bio|Ajoute une courte bio|Añade una breve biografía|Adicione uma bio curta|Füge eine kurze Bio hinzu|Aggiungi una breve bio|短い自己紹介を追加|أضف نبذة قصيرة",
  "No gifts yet this month|Pas encore de cadeaux ce mois-ci|Aún no hay regalos este mes|Ainda sem presentes este mês|Diesen Monat noch keine Geschenke|Ancora nessun regalo questo mese|今月のギフトはまだありません|لا هدايا بعد هذا الشهر",
  "This Flick isn’t available.|Ce Flick n’est pas disponible.|Este Flick no está disponible.|Este Flick não está disponível.|Dieser Flick ist nicht verfügbar.|Questo Flick non è disponibile.|このFlickは表示できません。|هذا الـFlick غير متاح.",
  "Use “Clear cache” below to free up space|Utilise « Vider le cache » plus bas pour libérer de l’espace|Usa «Borrar caché» abajo para liberar espacio|Use “Limpar cache” abaixo para liberar espaço|Nutze unten „Cache leeren“, um Platz zu schaffen|Usa “Svuota cache” qui sotto per liberare spazio|下の「キャッシュを消去」で空き容量を増やせます|استخدم «مسح ذاكرة التخزين» أدناه لتحرير المساحة",
  ].join("\n") + "\n");

// ── Round 4 audit fixes, batch B (27 Nov): Chats ──
// chat list shows the real time of the last message (it always said "now" or "today")
change("r4c: chat list time helper", "function vDiscover(){",
  "function lastWhen(msgs,unread){ const x=[...(msgs||[])].reverse().find(m=>m&&m.at); if(!x) return unread?'now':'today'; const d=new Date(x.at), n=new Date(), p=v=>String(v).padStart(2,'0'); if(n-d<60000) return 'now'; const day=v=>new Date(v.getFullYear(),v.getMonth(),v.getDate()).getTime(), dd=Math.round((day(n)-day(d))/864e5); if(dd<=0) return p(d.getHours())+':'+p(d.getMinutes()); if(dd===1) return 'Yesterday'; if(dd<7) return dayFmt(d,{weekday:'short'}); return dayFmt(d,{day:'numeric',month:'short'}); }\nfunction vDiscover(){");
change("r4c: 1-to-1 row time", "<small>${c.unread?'now':'today'}</small>", "<small>${lastWhen(c.msgs,c.unread)}</small>");
change("r4c: group row time", "<small>${g.unread?'now':'today'}</small>", "<small>${lastWhen(g.msgs,g.unread)}</small>");
// calls ring first: "Calling…" until the other person answers; no answer after 15 s if they're offline
change("r4c: outgoing call rings first", "UI.call={id,type,sec:0,spk:type==='video',muted:false}; clearInterval(UI.callT); UI.callT=setInterval(()=>{ if(!UI.call) return; UI.call.sec++;",
  "UI.call={id,type,sec:0,spk:type==='video',muted:false,ring:true,rt:0}; clearInterval(UI.callT); UI.callT=setInterval(()=>{ if(!UI.call) return; if(UI.call.ring){ const C=UI.call; C.rt++; const t0=document.getElementById('calltm'); if(C.rt>=(P[C.id].online?3:15)){ if(P[C.id].online){ C.ring=false; C.sec=0; render(); } else act0('endcall','noans'); } else if(t0) t0.textContent=TX('Calling…'); return; } UI.call.sec++;");
change("r4c: call screen says Calling…", "<span id=\"calltm\">${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}",
  "<span id=\"calltm\">${UI.call.ring?'Calling…':Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}");
change("r4c: no answer / cancelled call", "case 'endcall': { clearInterval(UI.callT); if(!UI.call) break;",
  "case 'endcall': { clearInterval(UI.callT); if(!UI.call) break; if(v==='noans'||UI.call.ring){ const who=UI.call.id, na=v==='noans'; UI.call=null; const c=S.chats[who]||(S.chats[who]={msgs:[],unread:0}); c.msgs.push({f:'tip',t:na?'📞 No answer':'📞 Call cancelled',at:Date.now()}); if(!callResumeRoom()) render(); toast(na?'No answer · Try again later':'Call cancelled'); break; }");
// delete for everyone also clears its quote in replies and the correction made on it
change("r4c: delete for everyone clears quotes and corrections", "if(how==='all'){ m.del=true; m.t=''; }",
  "if(how==='all'){ const old=m.t; m.del=true; m.t=''; S.chats[cid].msgs.forEach(x=>{ if(x&&x.re&&+x.re.i===+ii){ x.re.sn=['This message is no longer here','']; x.re.t=''; } }); S.chats[cid].msgs=S.chats[cid].msgs.filter(x=>!(x&&x.f==='fix'&&old&&x.wrong===old)); }");
// demo replies only "correct" something that is really wrong (it added " !" with an unrelated tip)
change("r4c: demo correction only when it fixes something", "if(n%2===1&&mine&&mine.t&&mine.t.length>8&&S.corr) c.msgs.push({f:'fix',wrong:mine.t,right:mine.t.replace(/^./,x=>x.toUpperCase()).replace(/[.!?]*$/,'')+' !',note:TIPS[n%TIPS.length],by:id});",
  "if(n%2===1&&mine&&mine.t&&mine.t.length>8&&S.corr&&/^[a-zà-ÿ]/.test(mine.t)) c.msgs.push({f:'fix',wrong:mine.t,right:mine.t.replace(/^./,x=>x.toUpperCase()),note:'Start a sentence with a capital letter.',by:id});");
// French: "Sourdine" reads better than "Muet" on the swipe button
change("r4c fr: mute", "\nMute|Muet|", "\nMute|Sourdine|");
// Arabic: Latin names, previews and titles keep their own direction (cut at the right end, punctuation in place)
change("r4c: CSS", "</style>", `.n .nn,.b .m>span,.m .nt,.srch b,.srres b,.nb .t,.rquote .nt,#corr-t,#corr-n,.reqq{unicode-bidi:plaintext}
</style>`);
change("r4c: translations", "Add a short bio|", [
  "Online partners|Partenaires en ligne|Compañeros en línea|Parceiros online|Partner online|Partner online|オンラインのパートナー|شركاء متصلون",
  "Create a group|Créer un groupe|Crear un grupo|Criar um grupo|Gruppe erstellen|Crea un gruppo|グループを作成|أنشئ مجموعة",
  "Say hi 👋|Dis bonjour 👋|Saluda 👋|Diga oi 👋|Sag hallo 👋|Saluta 👋|あいさつしよう 👋|قل مرحبًا 👋",
  "Leave call|Quitter l’appel|Salir de la llamada|Sair da chamada|Anruf verlassen|Esci dalla chiamata|通話を退出|مغادرة المكالمة",
  "Flip camera|Retourner la caméra|Girar cámara|Virar câmera|Kamera wechseln|Gira fotocamera|カメラを切り替え|قلب الكاميرا",
  "e.g. Spanish Sunday club|ex. Club espagnol du dimanche|p. ej. Club de español del domingo|ex.: Clube de espanhol de domingo|z. B. Spanisch-Sonntagsclub|es. Club di spagnolo della domenica|例：日曜スペイン語クラブ|مثال: نادي الإسبانية يوم الأحد",
  "Calling…|Appel en cours…|Llamando…|Chamando…|Anruf läuft…|Chiamata in corso…|発信中…|جارٍ الاتصال…",
  "📞 No answer|📞 Pas de réponse|📞 Sin respuesta|📞 Sem resposta|📞 Keine Antwort|📞 Nessuna risposta|📞 応答なし|📞 لا رد",
  "📞 Call cancelled|📞 Appel annulé|📞 Llamada cancelada|📞 Chamada cancelada|📞 Anruf abgebrochen|📞 Chiamata annullata|📞 通話をキャンセル|📞 أُلغيت المكالمة",
  "No answer|Pas de réponse|Sin respuesta|Sem resposta|Keine Antwort|Nessuna risposta|応答なし|لا رد",
  "Try again later|Réessaie plus tard|Inténtalo más tarde|Tente mais tarde|Versuch es später noch mal|Riprova più tardi|あとでもう一度かけてね|حاول لاحقًا",
  "Call cancelled|Appel annulé|Llamada cancelada|Chamada cancelada|Anruf abgebrochen|Chiamata annullata|通話をキャンセルしました|أُلغيت المكالمة",
  "Start a sentence with a capital letter.|Commence une phrase par une majuscule.|Empieza la frase con mayúscula.|Comece a frase com letra maiúscula.|Beginne einen Satz mit einem Großbuchstaben.|Inizia la frase con la maiuscola.|文の最初は大文字にしよう。|ابدأ الجملة بحرف كبير.",
  "This message is no longer here|Ce message n’est plus là|Este mensaje ya no está|Esta mensagem não está mais aqui|Diese Nachricht ist nicht mehr da|Questo messaggio non c’è più|このメッセージは削除されました|لم تعد هذه الرسالة موجودة",
  "Yesterday|Hier|Ayer|Ontem|Gestern|Ieri|昨日|أمس",
  ].join("\n") + "\nAdd a short bio|");

const FIT_JS = `<script>
/* [app] make header rows fit the screen (.top = page headers, .sheethead = pop-up titles) */
(function(){
  function over(row){ return row.scrollWidth > row.clientWidth; }
  function cut(h){ return !!h && h.scrollWidth > h.clientWidth; }
  function fitRow(row){
    var h = row.querySelector('h1, h2, h3');
    if (h && h.dataset.fit) { h.style.removeProperty('font-size'); h.style.removeProperty('letter-spacing'); }
    row.style.removeProperty('gap'); row.style.removeProperty('padding-left'); row.style.removeProperty('padding-right'); row.querySelectorAll('.pct').forEach(function(x){ x.style.removeProperty('display'); });
    if (!over(row) && !cut(h)) return;
    if (h) {
      h.dataset.fit = '1';
      var size = parseFloat(getComputedStyle(h).fontSize);
      while ((over(row) || cut(h)) && size > 20) { size -= 1; h.style.setProperty('font-size', size + 'px', 'important'); h.style.setProperty('letter-spacing', '-.03em', 'important'); }
    }
    if (over(row) || cut(h)) row.querySelectorAll('.pct').forEach(function(x){ x.style.setProperty('display', 'none', 'important'); });
    if (over(row) || cut(h)) row.style.setProperty('gap', '4px', 'important');
    if (over(row) || cut(h)) { row.style.setProperty('padding-left', '10px', 'important'); row.style.setProperty('padding-right', '10px', 'important'); }
  }
  var queued = false;
  function fitAll(){ queued = false; document.querySelectorAll('.top, .sheethead').forEach(function(r){ if (r.offsetParent) fitRow(r); }); }
  function soon(){ if (!queued) { queued = true; requestAnimationFrame(fitAll); } }
  new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', soon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  soon();
})();
</script>`;
html += FIT_JS; applied.push('headers fit the screen in every language'); // the beta has no </body>: added at the very end

// iPhone top and bottom space: the app hands the page the real sizes (--sa-top, --sa-bottom…, set in src/web/BetaApp.tsx).
// The web view's own env(safe-area-inset-…) was wrong on the founder's iPhone (page pushed ~59 pt down, tab labels cut).
{ const before = html.length;
  let n = 0;
  html = html.replace(/env\(safe-area-inset-(top|bottom|left|right)(\s*,\s*0px)?\)/g, (m, side) => { n++; return 'var(--sa-' + side + ',0px)'; });
  if (n < 30) throw new Error('build-web: expected 30+ safe-area values, found ' + n);
  applied.push('iPhone top/bottom space from the app (' + n + ' places)'); void before; }

// ─────────────────────────────────────────────────────────────────────────────
fs.mkdirSync('src/web', { recursive: true });
fs.writeFileSync('src/web/page.ts',
  '// GENERATED by scripts/build-web.mjs from docs/handoff/talkamigo-beta.html — do not edit; change the script and re-run.\n'
  + '// eslint-disable-next-line\n'
  + 'export const PAGE_HTML: string = ' + JSON.stringify(html) + ';\n');
console.log('build-web: ' + applied.length + ' changes applied\n  - ' + applied.join('\n  - '));
console.log('page size: ' + (html.length / 1e6).toFixed(2) + ' MB, flags: ' + Object.keys(FLAG_SVGS).length);
