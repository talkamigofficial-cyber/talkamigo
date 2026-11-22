/**
 * Search lists in A–Z order (v94, prototype qRank):
 * names that START with what you typed come first, then names with a WORD starting with it,
 * then names that contain it — each group sorted A–Z in the app language, accents ignored (é = e).
 * The English name only counts after every match on the name the person sees
 * (so in French "u" gives "Ukrainien" first, not "Ourdou").
 */

const norm = (t: string) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * @param items    the list to search
 * @param query    what the person typed
 * @param shown    the name as shown in the app language
 * @param english  the English name
 */
export function rankSearch<T>(items: T[], query: string, shown: (x: T) => string, english: (x: T) => string, lang: string): T[] {
  const q = norm(query).trim();
  if (!q) return items;
  const group = (n: string) => (n.startsWith(q) ? 0 : n.split(/[\s\-–/(]+/).some((w) => w.startsWith(q)) ? 1 : n.includes(q) ? 2 : 9);
  const scored: [number, string, T][] = [];
  for (const it of items) {
    const sh = shown(it);
    const a = norm(sh);
    const b = norm(english(it));
    let g = group(a);
    if (g === 9 && b !== a && group(b) < 9) g = 3;
    if (g < 9) scored.push([g, sh, it]);
  }
  return scored.sort((x, y) => x[0] - y[0] || x[1].localeCompare(y[1], lang, { sensitivity: 'base' })).map((x) => x[2]);
}
