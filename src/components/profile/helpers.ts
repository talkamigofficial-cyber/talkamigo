/**
 * Small helpers shared by the Chats, Connect and profile screens.
 *
 * - formatCount(1284, 'fr')  → "1,3 k" (short numbers like the prototype's fmt())
 * - greeting('Sam', 'fr')    → "Bonsoir, Sam" (time of day, own words per language)
 * - spokenLabel('wave', 'Camille', 'fr') → VoiceOver label in the app language (v104)
 * - followToast(...)         → the v57 follow messages
 */
import type { Lang } from '../../i18n';
import { translate } from '../../i18n';
import { toast } from '../Toast';

/** Numbers under 1,000 as they are, bigger ones short: 2.3k (English) or the language's own short form. */
export function formatCount(n: number, lang: Lang): string {
  if (n < 1000) return String(n);
  if (lang === 'en') return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  try {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-u-nu-latn' : lang, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch {
    return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  }
}

// "Good morning / afternoon / evening" in each language (prototype GREET table)
const GREET: Record<Exclude<Lang, 'en'>, [string, string, string]> = {
  fr: ['Bonjour', 'Bon après-midi', 'Bonsoir'], es: ['Buenos días', 'Buenas tardes', 'Buenas noches'],
  pt: ['Bom dia', 'Boa tarde', 'Boa noite'], de: ['Guten Morgen', 'Guten Tag', 'Guten Abend'],
  it: ['Buongiorno', 'Buon pomeriggio', 'Buonasera'], ja: ['おはよう', 'こんにちは', 'こんばんは'],
  ar: ['صباح الخير', 'مساء الخير', 'مساء الخير'],
};

/** Greeting shown above "Chats": morning before 12:00, afternoon before 18:00, then evening. */
export function greeting(name: string, lang: Lang, hour = new Date().getHours()): string {
  const i = hour < 12 ? 0 : hour < 18 ? 1 : 2;
  const word = lang === 'en' ? ['Good morning', 'Good afternoon', 'Good evening'][i] : GREET[lang][i];
  return name ? `${word}, ${name}` : word;
}

// VoiceOver labels with a name in them (prototype ARIA table)
const ARIA: Record<string, Record<Exclude<Lang, 'en'>, string> & { en: string }> = {
  wave: { en: 'Wave at $', fr: 'Faire coucou à $', es: 'Saludar a $', pt: 'Acenar para $', de: '$ zuwinken', it: 'Saluta $', ja: '$に手を振る', ar: 'لوّح لـ$' },
  follow: { en: 'Follow $', fr: 'Suivre $', es: 'Seguir a $', pt: 'Seguir $', de: '$ folgen', it: 'Segui $', ja: '$をフォロー', ar: 'تابِع $' },
  prof: { en: '$’s profile', fr: 'Profil de $', es: 'Perfil de $', pt: 'Perfil de $', de: 'Profil von $', it: 'Profilo di $', ja: '$のプロフィール', ar: 'ملف $' },
  live: { en: '$ is live', fr: '$ est en live', es: '$ está en directo', pt: '$ está ao vivo', de: '$ ist live', it: '$ è in live', ja: '$がライブ中', ar: '$ يبث مباشرة' },
  talk: { en: '$ is in a talk room', fr: '$ est dans un salon de parole', es: '$ está en una sala de charla', pt: '$ está numa sala de conversa', de: '$ ist in einem Talk-Raum', it: '$ è in una stanza', ja: '$がトークルームにいます', ar: '$ في غرفة حديث' },
};
export const spokenLabel = (kind: keyof typeof ARIA, name: string, lang: Lang) => ARIA[kind][lang].replace('$', name);

/** v57: following someone says which Flicks tab they will show in. */
export function followToast(nowFollowing: boolean, theyFollowMe: boolean, lang: Lang) {
  if (!nowFollowing) return;
  const full = theyFollowMe
    ? 'You follow each other · Their Flicks now show in Following'
    : 'You’re now following · Their Flicks show in Following once they follow you back';
  // translated as one sentence, then shown as a bold first line + a second line
  const [first, ...rest] = translate(full, lang).split(' · ');
  toast(first, { sub: rest.join(' · '), icon: 'check' });
}


// moved to src/theme/background.ts (one shared copy)
export { cssBackground } from '../../theme/background';
