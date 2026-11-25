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
.withtabs{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))!important}
.mcard{bottom:calc(96px + env(safe-area-inset-bottom,0px))}
.mini{bottom:calc(90px + env(safe-area-inset-bottom,0px))}
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
.troom.rtype .tdock,.troom:has(>.emopan) .tdock,.troom.rtype .trules,.troom:has(>.emopan) .trules,.troom.rtype .tnotice:not(.tpin),.troom:has(>.emopan) .tnotice:not(.tpin),.troom.rtype .ttools,.troom:has(>.emopan) .ttools,.troom.rtype .tsub,.troom:has(>.emopan) .tsub,.troom.rtype .tseat.empty,.troom:has(>.emopan) .tseat.empty,.troom.rtype .tadots,.troom:has(>.emopan) .tadots{display:none!important}
.troom.rtype form.tbar,.troom:has(>.emopan) form.tbar{padding-bottom:8px!important}
.troom.rtype .rgame,.troom:has(>.emopan) .rgame{margin-top:6px;padding:6px 12px;gap:2px}
.troom.rtype .rgame:not(.col) .rgh,.troom:has(>.emopan) .rgame:not(.col) .rgh,.troom.rtype .rgame .rgsub,.troom:has(>.emopan) .rgame .rgsub{display:none!important}
.troom.rtype .rgame .rgnext,.troom:has(>.emopan) .rgame .rgnext{height:30px}
.troom.rtype #roomscroll,.troom:has(>.emopan) #roomscroll{min-height:0;flex:1 1 auto!important;height:auto!important}
.troom.rtype .tgrid,.troom:has(>.emopan) .tgrid{zoom:1!important}
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
.troom.rtype2 .tgrid{gap:4px 4px!important;padding-top:2px!important}
.troom.rtype2 .tseat{gap:2px}
.troom.rtype2 .tseat .tav{zoom:.7}
.troom.rtype2 .tnm{font-size:11.5px;line-height:14px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.troom.rtype2 .tnm .eq{display:none}
.troom.rtype3 .tl>span:last-child{display:none}
.troom.rtype3 .tlis{padding:2px 0 0!important}
.troom.rtype4 .tlis{display:none!important}
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
  "phone.classList.remove('kbopen','kbb'); phone.classList.add('kbstill'); UI.kbBlind=false;\n    /* [app] (founder, 23 Nov) typing in a talk room: the top of the room never moves, the room simply ends where the keyboard starts.\n       Extras hide (quick replies, rules, mode row, empty seats, subtitles; the game card shows only the word/blanks and hint), so the\n       latest messages stay visible right above the bar. Before, only the bar was lifted: it covered the game card and hid the chat. */\n    if(c.kind==='room'){ const b=c.box, sTop=st?st.getBoundingClientRect().top:0, top=b.getBoundingClientRect().top-sTop; b.classList.add('rtype');\n      const h=Math.max(220,Math.round(ln.V-top)); if(b.style.height!==h+'px'){ b.style.height=h+'px'; b.style.maxHeight=h+'px'; }\n      const sc=document.getElementById('roomscroll'); if(sc&&(anim||sc.scrollHeight-sc.scrollTop-sc.clientHeight<80)) sc.scrollTop=sc.scrollHeight;\n      const al=b.querySelector(':scope > .atlist'), fb=b.querySelector(':scope > form.tbar'); if(al&&fb) al.style.bottom=(b.getBoundingClientRect().bottom-fb.getBoundingClientRect().top)+'px';\n      /* tiny phones (iPhone SE): if the chat still has no room, first the audience row drops its names, then it hides while typing */\n      b.classList.remove('rtype3','rtype4'); const chatH=()=>{ const q=document.getElementById('roomscroll'); return q?q.getBoundingClientRect().height:999; };\n      if(chatH()<70){ b.classList.add('rtype3'); if(chatH()<56) b.classList.add('rtype4'); }\n      UI.kbLift=0; UI.kbStillK='room'; return; }");
change("typing in a talk room: back to normal when the keyboard closes",
  "phone.querySelectorAll('.kbsp').forEach(e=>e.remove());",
  "phone.querySelectorAll('.kbsp').forEach(e=>e.remove());\n    phone.querySelectorAll('.troom.rtype').forEach(b=>{ b.classList.remove('rtype'); b.style.height=''; b.style.maxHeight=''; const al=b.querySelector(':scope > .atlist'); if(al) al.style.bottom=''; });\n    if(UI.fxQ&&UI.fxQ.length) setTimeout(fxNext,400);");
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


// ── Talk room seats (founder, 24–25 Nov): fixed seat numbers; with 5+ on stage, same shape but smaller while typing ──
change("stage seats: everyone keeps their seat number",
  "const stage=[r.host,...r.speakers,...(R.onStage&&!host?['me']:[])].slice(0,max);\n  const seatsN=Math.max(max,stage.length);",
  "/* [app] (founder, 24 Nov) fixed seats: whoever goes up gets the first free seat and keeps it until they leave the stage.\n     Someone joining never pushes anyone along; someone leaving leaves their seat empty (numbered) for the next person. */\n  const onSt=[r.host,...r.speakers,...(R.onStage&&!host?['me']:[])].filter((x,k,a)=>x&&a.indexOf(x)===k), seatOf=R.seatOf||(R.seatOf={});\n  Object.keys(seatOf).forEach(x=>{ if(!onSt.includes(x)||(x!==r.host&&seatOf[x]===0)) delete seatOf[x]; }); seatOf[r.host]=0;\n  onSt.forEach(x=>{ if(seatOf[x]==null){ const used=new Set(Object.values(seatOf)); let k=1; while(used.has(k)) k++; seatOf[x]=k; } });\n  const stage=[]; onSt.forEach(x=>{ if(seatOf[x]<max) stage[seatOf[x]]=x; });\n  const seatsN=Math.max(max,stage.length);");
change("stage seats: audience count uses the people on stage",
  "const lisN=Math.max(0,r.count-stage.length), pool=Object.keys(P).filter(x=>!stage.includes(x)&&x!==r.host&&!isBlocked(x))",
  "const lisN=Math.max(0,r.count-stage.filter(Boolean).length), pool=Object.keys(P).filter(x=>!stage.includes(x)&&x!==r.host&&!isBlocked(x))");
change("typing with 5+ on stage: seats in one row",
  "if(c.kind==='room'){ const b=c.box, sTop=st?st.getBoundingClientRect().top:0, top=b.getBoundingClientRect().top-sTop; b.classList.add('rtype');",
  "if(c.kind==='room'){ const b=c.box, sTop=st?st.getBoundingClientRect().top:0, top=b.getBoundingClientRect().top-sTop; b.classList.add('rtype');\n      /* more than 4 people on stage = two rows of seats: while typing they keep the same shape (4 on top, the rest under), only smaller, so the chat keeps some room */\n      b.classList.toggle('rtype2', b.querySelectorAll('.tgrid .tseat:not(.empty)').length>4);");
change("typing with 5+ on stage: back to two rows after",
  "phone.querySelectorAll('.troom.rtype').forEach(b=>{ b.classList.remove('rtype');",
  "phone.querySelectorAll('.troom.rtype').forEach(b=>{ b.classList.remove('rtype','rtype2','rtype3','rtype4');");


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

change('iPhone screen edges + flag styles (extra CSS)', '</style>', APP_CSS + '</style>');

// Headers fit the phone in every language (founder, 23 Nov: in French the Connect bell went off the screen).
// Measured on the phone itself, with its real font: first the title gets a little smaller (down to 20 px),
// then the "Plus" word next to the crown hides, then the gaps tighten, then the side margins. Never cuts the title with "…" if it can fit.
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
