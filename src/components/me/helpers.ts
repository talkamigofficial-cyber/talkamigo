/**
 * Small helpers for the Me tab, Edit profile and Settings: age, short numbers, language codes,
 * weekday letters and the few sentences the prototype translated with its own code
 * ("2h 10m this week", "Profile 45% complete") instead of the translation table.
 */
import type { Lang } from '../../i18n';
import demo from '../../data/generated/demo.json';
import type { Me } from '../../state/store';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

/** Age from the birthday (only the age is ever shown, never the date). */
export function ageOf(bday: string | null): number | null {
  if (!bday) return null;
  const b = new Date(bday + 'T12:00:00');
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

const LOCALE: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', it: 'it-IT', ja: 'ja-JP', ar: 'ar-u-nu-latn' };
export const localeOf = (lang: Lang) => LOCALE[lang];

/** 1284 → "1.3k" (English) or the language's own short form ("1,3 k"). Below 1000 as is. */
export function shortNumber(n: number, lang: Lang): string {
  if (n < 1000) return String(n);
  const en = (n / 1000).toFixed(1).replace('.0', '') + 'k';
  if (lang === 'en') return en;
  try {
    return new Intl.NumberFormat(LOCALE[lang], { notation: 'compact', maximumFractionDigits: 1 } as Intl.NumberFormatOptions).format(n);
  } catch {
    return en;
  }
}

/** 1240 → "1,240" / "1 240" in the app language. */
export function fullNumber(n: number, lang: Lang): string {
  try { return Number(n).toLocaleString(LOCALE[lang]); } catch { return String(n); }
}

/** Two-letter code shown on the Language card ("French" → "FR"). Same table as the prototype's LC(). */
export function langCode(l: string): string {
  const map: Record<string, string> = {
    'Chinese (Mandarin)': 'ZH', Cantonese: 'YUE', Russian: 'RU', Turkish: 'TR', Hindi: 'HI', Dutch: 'NL', Polish: 'PL', Swedish: 'SV',
    'Filipino (Tagalog)': 'TL', English: 'EN', French: 'FR', Spanish: 'ES', German: 'DE', Japanese: 'JA', Portuguese: 'PT', Italian: 'IT',
    Korean: 'KO', Arabic: 'AR', Yoruba: 'YO',
  };
  return map[l] ?? l.slice(0, 2).toUpperCase();
}

/** Monday to Sunday as one letter in the app language (v53: day letters follow the app language). */
export function weekLetters(lang: Lang): string[] {
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    try {
      const x = new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'narrow' }).format(new Date(2026, 0, 5 + i));
      return x && x.length < 4 ? x : 'MTWTFSS'[i];
    } catch {
      return 'MTWTFSS'[i];
    }
  });
}

/** "2h 10m this week" / "No practice yet this week", translated like the prototype's own code did. */
export function practiceThisWeek(mins: number, lang: Lang): string {
  if (!mins) {
    return ({ en: 'No practice yet this week', fr: 'Pas encore pratiqué cette semaine', es: 'Sin práctica esta semana', pt: 'Sem prática nesta semana', de: 'Diese Woche noch nicht geübt', it: 'Nessuna pratica questa settimana', ja: '今週はまだ練習なし', ar: 'لا تدريب هذا الأسبوع بعد' } as Record<Lang, string>)[lang];
  }
  const h = Math.floor(mins / 60), m = String(mins % 60).padStart(2, '0');
  const time = lang === 'ja' ? `${h}時間${m}分` : lang === 'ar' ? `${h} س ${m} د` : `${h}h ${m}m`;
  return ({ en: '$ this week', fr: '$ cette semaine', es: '$ esta semana', pt: '$ esta semana', de: '$ diese Woche', it: '$ questa settimana', ja: '今週 $', ar: '$ هذا الأسبوع' } as Record<Lang, string>)[lang].replace('$', time);
}

/** "3h 12m" spoken this week (units in Japanese / Arabic). */
export function hoursMinutes(mins: number, lang: Lang): string {
  const h = Math.floor(mins / 60), m = mins % 60;
  return lang === 'ja' ? `${h}時間${m}分` : lang === 'ar' ? `${h} س ${m} د` : `${h}h ${m}m`;
}

/**
 * How complete the profile is, as on the Me tab (prototype strength()):
 * 45% to start, +25 photo, +15 intro video, +15 with 5 Flicks.
 */
export function profileStrength(me: Me, flicks: number): number {
  return 45 + (me.photo ? 25 : 0) + (me.video ? 15 : 0) + (flicks >= 5 ? 15 : 0);
}

/** "Profile 45% complete · add a profile photo ›" — other languages only show the percentage (as the prototype). */
export function profileCompleteLine(pc: number, me: Me, lang: Lang): string {
  if (lang === 'en') return `Profile ${pc}% complete · ${!me.photo ? 'add a profile photo' : !me.video ? 'add a 30s intro video' : 'post 5 Flicks'} ›`;
  return ({ fr: 'Profil complété à $ % ›', es: 'Perfil completo al $ % ›', pt: 'Perfil $% completo ›', de: 'Profil zu $ % vollständig ›', it: 'Profilo completo al $% ›', ja: 'プロフィール完成度 $% ›', ar: 'اكتمال الملف $% ›' } as Record<Exclude<Lang, 'en'>, string>)[lang].replace('$', String(pc));
}

/** This week's practice (streak days, minutes spoken, corrections) — demo numbers for the demo, zero for a new account. */
export function weekOf(account: 'demo' | 'new' | null) {
  if (account === 'demo') return { ...demo.stats.week, today: demo.stats.today, goal: Number(demo.prefs.goal) || 20 };
  return { mins: 0, fixes: 0, days: [0, 0, 0, 0, 0, 0, 0], today: 0, goal: 20 };
}

/** People I follow: the demo starts with 86 (the prototype's followBase), a new account with nobody. */
export function followingCount(account: 'demo' | 'new' | null, follows: Record<string, boolean>): number {
  return (account === 'demo' ? 86 : 0) + Object.values(follows).filter(Boolean).length;
}


// moved to src/theme/background.ts (one shared copy)
export { cssBackground } from '../../theme/background';
