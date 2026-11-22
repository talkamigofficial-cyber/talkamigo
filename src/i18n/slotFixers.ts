/**
 * Special rules for texts with changing parts.
 *
 * Some English texts put an English word into a gap, e.g. "48 watching · French"
 * where "watching" changes. The pattern table can't translate that word, so the rule for
 * that pattern (by its key in translations_patterns.csv) does it here.
 *
 * A rule gets the 4 captured parts (slots[0] = $1 … slots[3] = $4) and may:
 *   - change slots in place and return null  → the normal template is then filled in, or
 *   - return a full sentence                  → used as is.
 * Copied from the prototype's i18nExtra() (docs/handoff/talkamigo-beta.html), rule for rule.
 */
import type { Lang } from './index';

type Helpers = {
  fixed: (en: string, lang: Lang) => string | null;
  langName: (en: string, lang: Lang) => string;
  langNameInSentence: (en: string, lang: Lang) => string;
};
type Rule = (slots: string[], lang: Lang, h: Helpers) => string | null;
type PerLang<T> = Record<Exclude<Lang, 'en'>, T>;

const lowerUnlessGermanOrJapanese = (s: string, lang: Lang) => (lang === 'de' || lang === 'ja' ? s : s.toLocaleLowerCase(lang));
const translateSlot = (i: number): Rule => (s, l, h) => { s[i] = h.fixed(s[i], l) ?? s[i]; return null; };
const languageSlot = (i: number, lower: 'romance' | 'notDeJa' | 'none'): Rule => (s, l, h) => {
  let n = h.langName(s[i], l);
  if (lower === 'romance' && /^(fr|es|pt|it)$/.test(l)) n = n.toLocaleLowerCase(l);
  if (lower === 'notDeJa') n = lowerUnlessGermanOrJapanese(n, l);
  s[i] = n;
  return null;
};
const pick = <T extends string>(table: PerLang<Record<T, string>>): Rule => (s, l) => {
  s[0] = table[l as Exclude<Lang, 'en'>]?.[s[0] as T] ?? s[0];
  return null;
};

/** The end date of the coin offer, in the app language ("Sun 29 Nov"). Always a Sunday at least 3 days away. */
export function offerEnd(lang: Lang): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  let add = (7 - d.getDay()) % 7;
  if (add < 3) add += 7;
  d.setDate(d.getDate() + add);
  const loc = lang === 'en' ? 'en-GB' : lang === 'ar' ? 'ar-u-nu-latn' : lang;
  try { return new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short' }).format(d); } catch { return d.toDateString().slice(0, 10); }
}

const PERIOD: PerLang<Record<string, string>> = {
  fr: { 'a year': 'par an', 'a month': 'par mois', 'a week': 'par semaine' }, es: { 'a year': 'al año', 'a month': 'al mes', 'a week': 'a la semana' },
  pt: { 'a year': 'por ano', 'a month': 'por mês', 'a week': 'por semana' }, de: { 'a year': 'pro Jahr', 'a month': 'pro Monat', 'a week': 'pro Woche' },
  it: { 'a year': 'all’anno', 'a month': 'al mese', 'a week': 'a settimana' }, ja: { 'a year': '年額', 'a month': '月額', 'a week': '週額' },
  ar: { 'a year': 'سنويًا', 'a month': 'شهريًا', 'a week': 'أسبوعيًا' },
};
const UNIT: PerLang<Record<string, string>> = {
  fr: { month: 'mois', year: 'an', week: 'semaine' }, es: { month: 'mes', year: 'año', week: 'semana' }, pt: { month: 'mês', year: 'ano', week: 'semana' },
  de: { month: 'Monat', year: 'Jahr', week: 'Woche' }, it: { month: 'mese', year: 'anno', week: 'settimana' }, ja: { month: '月', year: '年', week: '週' },
  ar: { month: 'شهر', year: 'سنة', week: 'أسبوع' },
};

export const slotFixers: Record<string, Rule> = {
  cmt: translateSlot(0), onplan: translateSlot(0), cosw: translateSlot(0), hosw: translateSlot(0),
  youp: translateSlot(0), sentk: translateSlot(0), livenow: translateSlot(0), plusf: translateSlot(0), msp: translateSlot(0),
  ngf: translateSlot(0), mood: translateSlot(0), sgq: translateSlot(0), frameon: translateSlot(0), framei: translateSlot(0),
  linked: translateSlot(0), reason1: translateSlot(0), dt: translateSlot(0),
  sentg: translateSlot(1), sgc: translateSlot(1), sentyou: translateSlot(1), psm: translateSlot(1), plns: translateSlot(1), reason: translateSlot(1),

  off1: (s, l) => { s[0] = offerEnd(l).replace(/\.$/, ''); return null; },
  off2: (s, l) => { s[0] = offerEnd(l).replace(/\.$/, ''); return null; },
  off3: (s, l) => { s[0] = offerEnd(l).replace(/\.$/, ''); return null; },

  lrnlv: languageSlot(0, 'romance'), tnat: languageSlot(0, 'romance'), spk1: languageSlot(0, 'romance'), ntv: languageSlot(0, 'romance'),
  trauto: languageSlot(0, 'romance'), cpn: languageSlot(0, 'notDeJa'), inl: languageSlot(0, 'notDeJa'), wit: languageSlot(0, 'notDeJa'),
  tonly: languageSlot(0, 'notDeJa'), tnote: languageSlot(0, 'notDeJa'), tnote2: languageSlot(0, 'notDeJa'),
  mylvl: (s, l, h) => { s[0] = l === 'de' ? h.langName(s[0], l) : h.langName(s[0], l).toLocaleLowerCase(l); return null; },
  chk: (s, l, h) => { s[0] = h.langName(s[0], l).toLocaleLowerCase(l === 'de' ? 'en' : l); return null; },
  lgmv: (s, l, h) => { s[0] = h.langName(s[0], l); s[1] = h.fixed(s[1], l) ?? s[1]; return null; },

  bprof: (s, l) => {
    if (s[1]) s[1] = ({ fr: ' (coupon)', es: ' (cupón)', pt: ' (cupom)', de: ' (Gutschein)', it: ' (coupon)', ja: '（クーポン）', ar: ' (قسيمة)' } as PerLang<string>)[l as Exclude<Lang, 'en'>];
    return null;
  },
  bempty: (s, l, h) => {
    const word: PerLang<Record<string, string>> = { fr: { room: 'salon', Live: 'live' }, es: { room: 'sala', Live: 'directo' }, pt: { room: 'sala', Live: 'live' }, de: { room: 'Raum', Live: 'Live' }, it: { room: 'stanza', Live: 'live' }, ja: { room: 'ルーム', Live: 'ライブ' }, ar: { room: 'غرفتك', Live: 'بثك' } };
    s[0] = word[l as Exclude<Lang, 'en'>][s[0]] ?? s[0];
    s[1] = l === 'de' ? h.langName(s[1], l) : h.langName(s[1], l).toLocaleLowerCase(l);
    return null;
  },
  nmc: pick({ fr: { voice: 'vocal', video: 'vidéo' }, es: { voice: 'voz', video: 'vídeo' }, pt: { voice: 'voz', video: 'vídeo' }, de: { voice: 'Sprach', video: 'Video' }, it: { voice: 'vocale', video: 'video' }, ja: { voice: '音声', video: 'ビデオ' }, ar: { voice: 'صوتية', video: 'فيديو' } }),
  ndc: pick({ fr: { voice: 'vocal', video: 'vidéo' }, es: { voice: 'voz', video: 'vídeo' }, pt: { voice: 'voz', video: 'vídeo' }, de: { voice: 'Sprach', video: 'Video' }, it: { voice: 'vocale', video: 'video' }, ja: { voice: '音声', video: 'ビデオ' }, ar: { voice: 'صوتية', video: 'فيديو' } }),
  youm: pick({ fr: { muted: 'coupé le micro de', unmuted: 'réactivé le micro de' }, es: { muted: 'silenciado', unmuted: 'activado' }, pt: { muted: 'silenciou', unmuted: 'ativou' }, de: { muted: 'stummgeschaltet', unmuted: 'eingeschaltet' }, it: { muted: 'silenziato', unmuted: 'riattivato' }, ja: { muted: 'ミュートしました', unmuted: 'ミュート解除しました' }, ar: { muted: 'كتمت', unmuted: 'ألغيت كتم' } }),
  mut: (s, l) => {
    const w: PerLang<Record<string, string>> = { fr: { muted: 'en sourdine', unmuted: 'réactivé' }, es: { muted: 'silenciado', unmuted: 'con sonido' }, pt: { muted: 'silenciado', unmuted: 'com som' }, de: { muted: 'stumm', unmuted: 'wieder an' }, it: { muted: 'silenziato', unmuted: 'riattivato' }, ja: { muted: 'をミュート', unmuted: 'のミュート解除' }, ar: { muted: 'مكتوم', unmuted: 'غير مكتوم' } };
    s[1] = w[l as Exclude<Lang, 'en'>][s[1]] ?? s[1];
    return null;
  },
  watch: (s, l) => {
    const w: PerLang<Record<string, string>> = { fr: { watching: 'spectateurs', listening: 'à l’écoute' }, es: { watching: 'viendo', listening: 'escuchando' }, pt: { watching: 'assistindo', listening: 'ouvindo' }, de: { watching: 'schauen zu', listening: 'hören zu' }, it: { watching: 'guardano', listening: 'in ascolto' }, ja: { watching: 'が視聴中', listening: 'が聴取中' }, ar: { watching: 'يشاهدون', listening: 'يستمعون' } };
    s[1] = w[l as Exclude<Lang, 'en'>][s[1]] ?? s[1];
    return null;
  },
  rules: (s, l, h) => {
    const lo = (x: string) => (l === 'de' ? h.langName(x, l) : h.langName(x, l).toLocaleLowerCase(l));
    const and = ({ fr: ' et ', es: ' y ', pt: ' e ', de: ' und ', it: ' e ', ja: 'と', ar: ' و' } as PerLang<string>)[l as Exclude<Lang, 'en'>];
    s[0] = lo(s[0]);
    s[1] = s[1] ? and + lo(s[1]) : '';
    return null;
  },
  bres: (s, l) => {
    const w: PerLang<Record<string, string>> = {
      fr: { 'profile views': 'vues du profil', 'likes on your Flick': 'j’aime sur ton Flick', 'listeners joined': 'personnes ont rejoint', 'viewers joined': 'spectateurs en plus' },
      es: { 'profile views': 'visitas al perfil', 'likes on your Flick': 'me gusta en tu Flick', 'listeners joined': 'oyentes se unieron', 'viewers joined': 'espectadores más' },
      pt: { 'profile views': 'visitas ao perfil', 'likes on your Flick': 'curtidas no seu Flick', 'listeners joined': 'ouvintes entraram', 'viewers joined': 'espectadores a mais' },
      de: { 'profile views': 'Profilaufrufe', 'likes on your Flick': 'Likes für deinen Flick', 'listeners joined': 'Zuhörende dazugekommen', 'viewers joined': 'Zuschauende mehr' },
      it: { 'profile views': 'visite al profilo', 'likes on your Flick': 'mi piace sul tuo Flick', 'listeners joined': 'ascoltatori in più', 'viewers joined': 'spettatori in più' },
      ja: { 'profile views': 'プロフィール閲覧', 'likes on your Flick': 'Flickへのいいね', 'listeners joined': '人のリスナーが参加', 'viewers joined': '人の視聴者が増加' },
      ar: { 'profile views': 'مشاهدة للملف', 'likes on your Flick': 'إعجاب على Flick', 'listeners joined': 'مستمعين انضموا', 'viewers joined': 'مشاهدين إضافيين' },
    };
    const again: PerLang<string> = { fr: ' · Touche pour booster à nouveau', es: ' · Toca para impulsar otra vez', pt: ' · Toque para impulsionar de novo', de: ' · Tippen, um erneut zu boosten', it: ' · Tocca per potenziare di nuovo', ja: '・タップしてもう一度ブースト', ar: ' · اضغط للتعزيز مرة أخرى' };
    s[1] = w[l as Exclude<Lang, 'en'>][s[1]] ?? s[1];
    s[2] = s[2] ? again[l as Exclude<Lang, 'en'>] : '';
    return null;
  },
  bbtn: (s, l) => {
    if (s[0] === 'free') s[0] = ({ fr: 'gratuit', es: 'gratis', pt: 'grátis', de: 'gratis', it: 'gratis', ja: '無料', ar: 'مجانًا' } as PerLang<string>)[l as Exclude<Lang, 'en'>];
    return null;
  },
  repd: (s, l) => {
    const t: PerLang<string> = { fr: ' et bloqué $', es: ' y bloqueamos a $', pt: ' e bloqueamos $', de: ' und $ blockiert', it: ' e bloccato $', ja: '（$をブロック）', ar: ' وحظرنا $' };
    s[0] = s[0] ? t[l as Exclude<Lang, 'en'>].replace('$', s[0]) : '';
    return null;
  },
  renew: (s, l) => { s[1] = PERIOD[l as Exclude<Lang, 'en'>][s[1]] ?? s[1]; return null; },
  renews: (s, l) => {
    s[0] = s[0].replace(/\/(month|year|week)$/, (_x, u: string) => '/' + (UNIT[l as Exclude<Lang, 'en'>][u] ?? u));
    return null;
  },
};
