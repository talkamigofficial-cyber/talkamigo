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

change('top layers start below the clock (stackTop)',
  "let y=phone.classList.contains('hascall')?70:8;",
  "let y=(phone.classList.contains('hascall')?70:8)+appSafeTop();");
change('helper: height of the clock / Dynamic Island area',
  "function stackTop(){",
  "/* [app] height of the iPhone's top safe area (clock / Dynamic Island), measured once per layout */\nlet APP_SAFE_TOP=null; window.addEventListener('resize',()=>{ APP_SAFE_TOP=null; });\nfunction appSafeTop(){ if(APP_SAFE_TOP===null){ const d=document.createElement('div'); d.style.cssText='position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none'; document.body.appendChild(d); APP_SAFE_TOP=d.offsetHeight||0; d.remove(); } return APP_SAFE_TOP; }\nfunction stackTop(){");
change('iPhone screen edges + flag styles (extra CSS)', '</style>', APP_CSS + '</style>');

// ─────────────────────────────────────────────────────────────────────────────
fs.mkdirSync('src/web', { recursive: true });
fs.writeFileSync('src/web/page.ts',
  '// GENERATED by scripts/build-web.mjs from docs/handoff/talkamigo-beta.html — do not edit; change the script and re-run.\n'
  + '// eslint-disable-next-line\n'
  + 'export const PAGE_HTML: string = ' + JSON.stringify(html) + ';\n');
console.log('build-web: ' + applied.length + ' changes applied\n  - ' + applied.join('\n  - '));
console.log('page size: ' + (html.length / 1e6).toFixed(2) + ' MB, flags: ' + Object.keys(FLAG_SVGS).length);
