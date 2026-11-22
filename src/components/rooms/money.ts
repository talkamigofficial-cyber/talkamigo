/**
 * Prices in the person's own currency, like the prototype's money().
 *
 *   money(0.99, 'GB')  → "£0.99"     money(0.99, 'JP') → "¥160"
 *
 * Prices are written in euros in the code and converted with the rough rates below, then rounded
 * the way stores do (…99). In the real app the App Store gives the exact local price, so this file
 * goes away (CLAUDE.md §7 "the app always displays the store's localised price").
 */
import type { Lang } from '../../i18n';

const CUR: Record<string, string> = { AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR', GR: 'EUR', HR: 'EUR', IE: 'EUR', LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR', SK: 'EUR', SI: 'EUR', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', US: 'USD', GB: 'GBP', FR: 'EUR', ES: 'EUR', DE: 'EUR', IT: 'EUR', PT: 'EUR', JP: 'JPY', BR: 'BRL', NG: 'NGN', MA: 'MAD', CA: 'CAD', KR: 'KRW', CH: 'CHF' };
const FX: Record<string, number> = { SEK: 11.5, NOK: 11.7, DKK: 7.46, PLN: 4.3, CZK: 25, HUF: 395, RON: 5, USD: 1.08, EUR: 1, GBP: 0.87, CHF: 0.94, JPY: 165, BRL: 6, NGN: 1700, MAD: 10.8, CAD: 1.5, KRW: 1500 };
const NO_DECIMALS = ['JPY', 'KRW', 'NGN', 'HUF'];
const LOCALE: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', it: 'it-IT', ja: 'ja-JP', ar: 'ar-u-nu-latn' };

export const currencyOf = (cc: string) => CUR[cc] ?? 'EUR';

export function money(eur: number, cc: string, lang: Lang = 'en'): string {
  const c = currencyOf(cc);
  let v = eur * FX[c];
  if (NO_DECIMALS.includes(c)) { const step = c === 'JPY' ? 10 : 100; v = Math.round(v / step) * step; }
  else if (eur % 1) v = Math.max(0.99, Math.round(v) - 0.01);
  else v = Math.round(v);
  const whole = NO_DECIMALS.includes(c) || v % 1 === 0;
  try {
    return new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: c, currencyDisplay: 'narrowSymbol', minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: NO_DECIMALS.includes(c) ? 0 : 2 })
      .format(v).replace(/UK£|£GB|GB£/, '£').replace(/US\$|\$US/, '$').replace(/€EU|EU€/, '€');
  } catch {
    return `${v} ${c}`;
  }
}

/** 48 → "48", 4800 → "4,800" in the app language (prototype n0). */
export const n0 = (n: number, lang: Lang) => Number(n).toLocaleString(LOCALE[lang]);

/** 1284 → "1.3k" (prototype fmt: short counts on Flicks). */
export function fmtCount(n: number, lang: Lang): string {
  if (n < 1000) return String(n);
  if (lang === 'en') return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  try { return new Intl.NumberFormat(LOCALE[lang], { notation: 'compact', maximumFractionDigits: 1 }).format(n); } catch { return (n / 1000).toFixed(1).replace('.0', '') + 'k'; }
}

export const localeOf = (lang: Lang) => LOCALE[lang];
