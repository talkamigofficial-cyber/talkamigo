/**
 * Translations: turns the English text written in the code into the app language.
 *
 * How to use in a screen:
 *     const t = useT();
 *     <Text>{t('Create account')}</Text>
 *     <Text>{t(`Continue as ${name}`)}</Text>   // texts with changing parts work too
 *
 * Where the words come from:
 *   - generated/strings.json   fixed texts      (from docs/handoff/translations.csv)
 *   - generated/patterns.json  texts with $1/$2 (from docs/handoff/translations_patterns.csv)
 *   - generated/names.json     country + language names
 * Never edit the generated files: change the CSV or scripts/translation-fixes.json,
 * then run `node scripts/build-translations.mjs`.
 *
 * If a text is missing it simply shows in English (and is listed by `npm run check:i18n`).
 */
import { getLocales } from 'expo-localization';
import strings from './generated/strings.json';
import patterns from './generated/patterns.json';
import names from './generated/names.json';
import { useApp } from '../state/store';
import { slotFixers } from './slotFixers';

export type Lang = 'en' | 'fr' | 'es' | 'pt' | 'de' | 'it' | 'ja' | 'ar';
export const LANGS: Lang[] = ['en', 'fr', 'es', 'pt', 'de', 'it', 'ja', 'ar'];

/** Column of each language in strings.json (English is the key, so it has no column). */
const COLUMN: Record<Exclude<Lang, 'en'>, number> = { fr: 0, es: 1, pt: 2, de: 3, it: 4, ja: 5, ar: 6 };

/** Each language's own name, as shown in the language pickers. */
export const LANG_NAME: Record<Lang, string> = {
  en: 'English', fr: 'Français', es: 'Español', pt: 'Português', de: 'Deutsch', it: 'Italiano', ja: '日本語', ar: 'العربية',
};

/** The choice saved in Settings → App language ('Phone default' or one of LANG_NAME's values). */
export function pickLang(choice: string | undefined | null): Lang {
  if (!choice || choice === 'Phone default') return phoneLang();
  const found = (Object.keys(LANG_NAME) as Lang[]).find((l) => LANG_NAME[l] === choice);
  return found ?? 'en';
}

/** First language in the phone's list that TalkAmigo supports, else English. */
export function phoneLang(): Lang {
  try {
    for (const loc of getLocales()) {
      const code = (loc.languageCode ?? '').toLowerCase() as Lang;
      if (LANGS.includes(code)) return code;
    }
  } catch {}
  return 'en';
}

/** Two-letter country of the phone (used for the phone-number country code). */
export function phoneRegion(): string | null {
  try {
    for (const loc of getLocales()) if (loc.regionCode) return loc.regionCode.toUpperCase();
  } catch {}
  return null;
}

export const isRTL = (lang: Lang) => lang === 'ar';

// ---------- lookups ----------
const STR = strings as Record<string, string[]>;
type Pattern = { key: string; re: string } & Partial<Record<Exclude<Lang, 'en'>, string>>;
const PAT = (patterns as Pattern[]).filter((p) => p.re).map((p) => ({ ...p, rx: new RegExp(p.re, 'u') }));
const PAT_BY_KEY = Object.fromEntries((patterns as Pattern[]).map((p) => [p.key, p]));
const COUNTRIES = names.countries as Record<string, Record<Lang, string>>;
const LANGUAGES = names.languages as Record<string, Record<Lang, string>>;
const COUNTRY_BY_EN = Object.fromEntries(Object.entries(COUNTRIES).map(([cc, n]) => [n.en, cc]));

/** A fixed text, or null if there is no translation. */
function fixed(en: string, lang: Lang): string | null {
  if (lang === 'en') return en;
  const row = STR[en];
  return row?.[COLUMN[lang]] || null;
}

/** Name of a language ('French') in the app language ('Français'). */
export function langName(en: string, lang: Lang): string {
  return LANGUAGES[en]?.[lang] ?? fixed(en, lang) ?? en;
}

/** Same, but lower-case where the grammar wants it inside a sentence (fr/es/pt/it). */
export function langNameInSentence(en: string, lang: Lang): string {
  const n = langName(en, lang);
  return /^(fr|es|pt|it)$/.test(lang) ? n.toLocaleLowerCase(lang) : n;
}

/** Country name from a 2-letter code ('FR' → 'France' / 'Francia' …). */
export function countryName(cc: string, lang: Lang): string {
  return COUNTRIES[cc]?.[lang] ?? COUNTRIES[cc]?.en ?? cc;
}

/** French typography: no line break before ? ! : ; » and after « */
function frenchSpaces(s: string) {
  return s.replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
}

/** Fill a pattern by key, for code that builds the sentence itself. */
export function fillPattern(key: string, lang: Lang, parts: string[]): string | null {
  const p = PAT_BY_KEY[key];
  if (!p || lang === 'en') return null;
  let out = p[lang as Exclude<Lang, 'en'>] ?? null;
  if (!out) return null;
  parts.forEach((v, i) => (out = out!.split('$' + (i + 1)).join(v)));
  return out;
}

/**
 * Translate one piece of English text. Same order of attempts as the prototype:
 * fixed text → emoji/symbol prefix → texts with changing parts → country/language names → combinations.
 */
export function translate(en: string, lang: Lang): string {
  if (lang === 'en' || !en) return en;
  const x0 = en.trim();
  let out = fixed(x0, lang);

  // "🎉 Something" / "+ Something": translate the words after the emoji or symbols
  if (!out) {
    const m = x0.match(/^([\p{Extended_Pictographic}️‍\s●]+)(.+)$/u) || x0.match(/^([^\p{L}+]+)(.+)$/u);
    if (m) {
      const rest = fixed(m[2].trim(), lang) ?? withPattern(m[2].trim(), lang);
      if (rest) out = m[1] + rest;
    }
  }
  if (!out) out = withPattern(x0, lang);
  if (!out) out = combination(x0, lang);
  if (!out) return en;
  return lang === 'fr' ? frenchSpaces(out) : out;
}

/** Texts with changing parts, e.g. "Continue as Sam". */
function withPattern(x0: string, lang: Lang): string | null {
  for (const p of PAT) {
    const m = x0.match(p.rx);
    if (!m) continue;
    const template = p[lang as Exclude<Lang, 'en'>];
    if (!template) return null;
    const slots = [m[1] ?? '', m[2] ?? '', m[3] ?? '', m[4] ?? ''];
    // some patterns put an English word into the gap ("watching", "muted"…): fix it up
    const fixer = slotFixers[p.key];
    const done = fixer ? fixer(slots, lang, { fixed, langName, langNameInSentence }) : null;
    if (typeof done === 'string') return done; // the fixer built the whole sentence
    let s = template;
    slots.forEach((v, i) => (s = s.split('$' + (i + 1)).join(v)));
    return s;
  }
  return null;
}

/** Names and simple combinations: "France", "French → English", "French ⇄ English", "London, United Kingdom". */
function combination(x0: string, lang: Lang): string | null {
  if (COUNTRY_BY_EN[x0]) return countryName(COUNTRY_BY_EN[x0], lang);
  if (LANGUAGES[x0]) return langName(x0, lang);
  let m = x0.match(/^City in (.+) \(optional\)$/);
  if (m) return (PAT_BY_KEY.city?.[lang as Exclude<Lang, 'en'>] ?? '').replace('$1', countryName(COUNTRY_BY_EN[m[1]] ?? m[1], lang));
  m = x0.match(/^(.+) ✕$/);
  if (m) { const y = LANGUAGES[m[1]] ? langName(m[1], lang) : fixed(m[1], lang); if (y) return y + ' ✕'; }
  m = x0.match(/^(.+) → (.+?)( [ABC][12])?$/);
  if (m && LANGUAGES[m[1]] && LANGUAGES[m[2]]) return `${langName(m[1], lang)} → ${langName(m[2], lang)}${m[3] ?? ''}`;
  m = x0.match(/^(.+) ⇄ (.+)$/);
  if (m && LANGUAGES[m[1]] && LANGUAGES[m[2]]) return `${langName(m[1], lang)} ⇄ ${langName(m[2], lang)}`;
  m = x0.match(/^(.+) · (.+)$/);
  if (m && !/[@#]/.test(x0)) { const a = fixed(m[1], lang), b = fixed(m[2], lang); if (a && b) return `${a} · ${b}`; }
  m = x0.match(/^(.+), ([^,]+)$/);
  if (m && COUNTRY_BY_EN[m[2]]) return `${m[1]}, ${countryName(COUNTRY_BY_EN[m[2]], lang)}`;
  return null;
}

// ---------- React ----------
/** The app language right now (follows Settings → App language, or the phone during sign-up). */
export function useLang(): Lang {
  return useApp((s) => s.appLang());
}

/** Hook: returns t(), already set to the current app language. */
export function useT() {
  const lang = useLang();
  const t = (en: string) => translate(en, lang);
  t.lang = lang;
  return t;
}
