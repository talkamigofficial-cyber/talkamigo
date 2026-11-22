/**
 * The prototype writes backgrounds as CSS, often ending with a plain colour layer:
 *   "radial-gradient(…), #C2410C"
 * React Native draws gradients with `backgroundImage` but the plain colour must be `backgroundColor`.
 * This splits one into the other.   style={cssBackground(flick.bg)}
 * Use this for every background that comes from the prototype's data (people, Flicks, rooms, lives).
 */
export function cssBackground(bg: string | undefined, fallback?: string): { backgroundImage?: string; backgroundColor?: string } {
  if (!bg) return { backgroundColor: fallback };
  if (!/gradient\(/.test(bg)) return { backgroundColor: bg };
  // split on commas that are not inside brackets
  const layers: string[] = [];
  let depth = 0, cur = '';
  for (const ch of bg) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { layers.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) layers.push(cur.trim());
  const last = layers[layers.length - 1];
  const color = /gradient\(/.test(last) ? fallback : layers.pop()!;
  return color ? { backgroundImage: layers.join(', '), backgroundColor: color } : { backgroundImage: layers.join(', ') };
}
