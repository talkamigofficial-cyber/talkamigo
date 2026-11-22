/**
 * The rules checked on the "Hi! Who are you?" step, copied from the prototype
 * (nameBad, userCheck, userSuggest, bdAge in docs/handoff/talkamigo-beta.html).
 *
 * In slice 2 the server checks the username (unique, reserved names) and the age (18+) again:
 * the app's checks are only there to explain things early (CLAUDE.md §0 rule 7).
 */

/** Usernames treated as taken in slice 1 (no server yet). Same list as the prototype. */
const TAKEN = ['sam', 'samuel', 'camille', 'kenji', 'lucia', 'marc', 'admin', 'talkamigo', 'support', 'official', 'sam_ldn', 'sam.uk'];

/** Why a display name is refused, or '' if it's fine (no emails, links or phone numbers, v87). */
export function nameBad(name: string): string {
  if (/@|https?:|www\.|\.(com|net|org|fr|io|co|me|app)\b/i.test(name)) return 'No emails or links in your name';
  if ((name.match(/\d/g) || []).length >= 5) return 'No phone numbers in your name';
  return '';
}

export type UsernameCheck = { ok: boolean; taken?: boolean; msg: string };

/** 3–20 characters: lowercase letters, numbers, _ and .; can't start or end with _ or . (CLAUDE.md §5). */
export function userCheck(u: string): UsernameCheck {
  if (!u) return { ok: false, msg: '' };
  if (u.length < 3) return { ok: false, msg: 'At least 3 characters' };
  if (!/^[a-z0-9_.]+$/.test(u)) return { ok: false, msg: 'Only lowercase letters, numbers, _ and .' };
  if (/^[._]|[._]$/.test(u)) return { ok: false, msg: 'Can’t start or end with _ or .' };
  if (TAKEN.includes(u)) return { ok: false, taken: true, msg: `@${u} is taken. Try one of these:` };
  return { ok: true, msg: `✓ @${u} is available` };
}

/** Up to 4 free usernames built from the display name and country, shown only when the name is taken. */
export function userSuggest(name: string, cc: string): string[] {
  const base = (name || 'amigo').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '').slice(0, 12) || 'amigo';
  const yy = String(new Date().getFullYear()).slice(2);
  return [`${base}_talks`, `${base}.${(cc || 'eu').toLowerCase()}`, `${base}${yy}_`, `${base}_amigo`].filter((x) => userCheck(x).ok).slice(0, 4);
}

/** Age in years from 'YYYY-MM-DD'. */
export function ageFrom(bday: string | null): number {
  if (!bday) return 0;
  return (Date.now() - new Date(bday + 'T12:00:00').getTime()) / 31557600000;
}
