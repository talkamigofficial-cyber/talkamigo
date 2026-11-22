/**
 * Which partners Connect shows, and in what order (prototype vDiscover).
 *
 * - Boosted people first (in the demo: Reem), then the most recently active.
 * - Tabs: All · Online · Nearby (sorted by distance) · Serious learners · Teachers. City and Age are Plus.
 * - Language chips: "My languages" = people whose native language I speak or learn; one language = people native in it.
 * The advanced filters (level, age, region…) come with the Filters page in a later slice.
 */
import { PEOPLE, type Person } from '../../data/people';

export type ConnectTab = 'all' | 'online' | 'nearby' | 'serious' | 'teachers';
export const BOOSTED = new Set(['reem']); // demo: Reem has a profile boost running

// Rough capital positions (prototype CAP) and a few demo cities (COORD), for "≈ 340 km".
const CAP: Record<string, [number, number]> = {
  GB: [51.51, -0.13], FR: [48.86, 2.35], ES: [40.42, -3.7], DE: [52.52, 13.4], IT: [41.9, 12.5], PT: [38.72, -9.14], SE: [59.33, 18.07],
  NL: [52.37, 4.9], BE: [50.85, 4.35], IE: [53.35, -6.26], CH: [46.95, 7.45], US: [40.71, -74], CA: [45.5, -73.57], JP: [35.68, 139.69],
  KR: [37.57, 126.98], BR: [-23.55, -46.63], NG: [6.52, 3.38], MA: [34.02, -6.84], IN: [28.61, 77.21], PL: [52.23, 21.01],
};
const CITY: Record<string, [number, number]> = {
  Lyon: [45.76, 4.84], Osaka: [34.69, 135.5], Madrid: [40.42, -3.7], Paris: [48.86, 2.35], Tokyo: [35.68, 139.69],
  Lisbon: [38.72, -9.14], 'Montréal': [45.5, -73.57], Lagos: [6.52, 3.38], Rabat: [34.02, -6.84],
};

/** Distance in km (rounded to 10) between my country's capital and the person's city. Never an exact location. */
export function kmTo(myCountry: string, p: Person): number {
  const a = CAP[myCountry] ?? CAP.GB;
  const b = CITY[p.city] ?? CAP[p.cc] ?? a;
  const r = Math.PI / 180;
  const d = Math.acos(Math.min(1, Math.sin(a[0] * r) * Math.sin(b[0] * r) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.cos((b[1] - a[1]) * r))) * 6371;
  return Math.round(d / 10) * 10;
}

export function partnerIds(tab: ConnectTab, langChip: string, myLangs: string[], myCountry: string): string[] {
  const ids = Object.keys(PEOPLE);
  const sorted =
    tab === 'nearby'
      ? ids.sort((a, b) => kmTo(myCountry, PEOPLE[a]) - kmTo(myCountry, PEOPLE[b]))
      : ids.sort((a, b) => Number(BOOSTED.has(b)) - Number(BOOSTED.has(a)) || (PEOPLE[a].seen ?? 0) - (PEOPLE[b].seen ?? 0));
  return sorted.filter((id) => {
    const p = PEOPLE[id];
    if (tab === 'online' && !p.online) return false;
    if (tab === 'teachers' && !p.teacher) return false;
    if (tab === 'serious' && !p.serious) return false;
    if (langChip === 'mine' && !myLangs.includes(p.native)) return false;
    if (langChip !== 'mine' && langChip !== 'all' && p.native !== langChip) return false;
    return true;
  });
}

/** Two-letter code shown in the language pair ("FR ●●●●●● ⇄ EN ●●●○○○"). */
const CODE: Record<string, string> = { English: 'EN', Spanish: 'ES', French: 'FR', German: 'DE', Italian: 'IT', Portuguese: 'PT', Japanese: 'JA', Korean: 'KO', Arabic: 'AR', Yoruba: 'YO', Chinese: 'ZH' };
export const langCode = (name: string) => CODE[name] ?? name.slice(0, 2).toUpperCase();
