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

change('top layers start below the clock (stackTop)',
  "let y=phone.classList.contains('hascall')?70:8;",
  "let y=(phone.classList.contains('hascall')?70:8)+appSafeTop();");
change('helper: height of the clock / Dynamic Island area',
  "function stackTop(){",
  "/* [app] height of the iPhone's top safe area (clock / Dynamic Island), measured once per layout */\nlet APP_SAFE_TOP=null; window.addEventListener('resize',()=>{ APP_SAFE_TOP=null; });\nfunction appSafeTop(){ if(APP_SAFE_TOP===null){ const d=document.createElement('div'); d.style.cssText='position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none'; document.body.appendChild(d); APP_SAFE_TOP=d.offsetHeight||0; d.remove(); } return APP_SAFE_TOP; }\nfunction stackTop(){");
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
