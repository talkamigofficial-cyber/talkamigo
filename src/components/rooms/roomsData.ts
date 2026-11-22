/**
 * What the Rooms tab shows (prototype vLive / langMatch / BANNERS / lessons).
 *
 * Language chips (decided 2 Nov 2026, "Language chips are exact"):
 *   All my languages → rooms whose languages are ALL ones I speak or learn
 *   English          → English-only rooms
 *   French ⇄ English → only French–English exchange rooms
 *   + More languages → everything
 * Boosted rooms come first. One "Popular lesson" (a paid teacher room) is mixed in as the 3rd item.
 *
 * Demo content; in slice 2 it comes from the server.
 */
import demo from '../../data/generated/demo.json';
import type { Me } from '../../state/store';

export type Room = {
  id: string; l: string; ls?: string[]; lang: string; topic?: string; title: string; host: string; speakers: string[]; count: number;
  official?: boolean; teacher?: boolean; vip?: boolean; boosted?: boolean; price?: number; level?: string; goal?: string; mins?: number; seats?: number; booked?: number;
};
export type Live = {
  id: string; host: string; l: string; ls?: string[]; lang: string; title: string; viewers: number; bg: string;
  boosted?: boolean; price?: number; level?: string; goal?: string; mins?: number; seats?: number; booked?: number;
};
export type Lesson = { id: string; mode: 'talk' | 'live'; host: string; l: string; lang: string; title: string; level: string; goal: string; mins: number; seats: number; booked: number; day: string; time: string };

export const ROOMS = demo.rooms as unknown as Room[];
export const LIVES = demo.lives as unknown as Live[];
export const LESSONS = demo.lessonsPlan as unknown as Lesson[];

/** Languages I speak and learn (no duplicates). */
export const myLangs = (me: Me) => [...new Set([...me.natives, ...me.langs])];

/** Chip values: 'All' · 'L:French' · 'P:French|English' · 'More'. */
export type LangChip = string;

export function langChips(me: Me): { value: LangChip; label: string }[] {
  const L = myLangs(me);
  const pairs: [string, string][] = [];
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) pairs.push([L[i], L[j]]);
  return [
    { value: 'All', label: 'All my languages' },
    ...L.map((l) => ({ value: 'L:' + l, label: l })),
    ...pairs.map(([a, b]) => ({ value: `P:${a}|${b}`, label: `${a} ⇄ ${b}` })),
    { value: 'More', label: '+ More languages' },
  ];
}

export function langMatch(langs: string[], chip: LangChip, me: Me): boolean {
  if (chip === 'More') return true;
  const ls = [...new Set(langs)];
  if (chip.startsWith('L:')) return ls.length === 1 && ls[0] === chip.slice(2);
  if (chip.startsWith('P:')) { const [a, b] = chip.slice(2).split('|'); return ls.length === 2 && ls.includes(a) && ls.includes(b); }
  const mine = myLangs(me);
  return ls.every((x) => mine.includes(x));
}

const boostedFirst = <T extends { boosted?: boolean }>(a: T, b: T) => (b.boosted ? 1 : 0) - (a.boosted ? 1 : 0);
/** The same "random" pick all day: changes with the date (prototype pick()). */
const pickOfToday = <T,>(arr: T[]) => (arr.length ? arr[new Date().getDate() % arr.length] : null);

export function talkRoomsFor(chip: LangChip, me: Me) {
  const vis = ROOMS.filter((r) => langMatch(r.ls || [r.l], chip, me)).sort(boostedFirst);
  return { free: vis.filter((r) => !r.price), popular: pickOfToday(vis.filter((r) => r.price)) };
}

export function livesFor(chip: LangChip, me: Me) {
  const vis = LIVES.filter((x) => langMatch(x.ls || [x.l], chip, me)).sort(boostedFirst);
  return { free: vis.filter((x) => !x.price), popular: pickOfToday(vis.filter((x) => x.price)) };
}

/** The 5 people shown on a room card: on stage first, then listeners (prototype cardFaces). */
export function cardFaces(r: Room, allIds: string[]): string[] {
  const out = (r.speakers || []).filter((id) => id !== r.host && allIds.includes(id));
  const n = Math.min(5, Math.max(out.length, r.count | 0));
  if (out.length >= n) return out.slice(0, n);
  const hash = (x: string) => { let v = 7; for (const ch of r.id + x) v = (v * 31 + ch.charCodeAt(0)) | 0; return v; };
  const pool = allIds.filter((id) => id !== r.host && !out.includes(id)).sort((a, b) => hash(a) - hash(b));
  return out.concat(pool).slice(0, n);
}

// ---------- lessons ----------
const WKD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Today and the next 6 days, at midnight. */
export function weekDays(): Date[] {
  const d0 = new Date();
  d0.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(d0); d.setDate(d0.getDate() + i); return d; });
}

/** When a planned lesson happens ("Tue" + "19:00" → the next Tuesday this week). */
export function lessonDate(x: Lesson): Date {
  const days = weekDays();
  const d = days.find((dd) => WKD[dd.getDay()] === x.day) || days[0];
  const [h, m] = x.time.split(':').map(Number);
  const r = new Date(d);
  r.setHours(h, m, 0, 0);
  return r;
}

export const timeOfDay = (x: Lesson) => { const h = +x.time.split(':')[0]; return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; };

/** Lessons happening now: paid teacher rooms and lives, the current mode's kind first. */
export function lessonsNow(langOk: (l: string) => boolean, mode: 'talk' | 'live') {
  const all: { kind: 'room' | 'live'; x: Room | Live }[] = [
    ...ROOMS.filter((x) => x.price).map((x) => ({ kind: 'room' as const, x })),
    ...LIVES.filter((x) => x.price).map((x) => ({ kind: 'live' as const, x })),
  ].filter(({ x }) => langOk(x.l));
  const first = mode === 'live' ? 'live' : 'room';
  return all.sort((a, b) => (a.kind === first ? 0 : 1) - (b.kind === first ? 0 : 1));
}

// ---------- banners at the top ----------
export type Banner = { tag: string; title: string; sub: string; emoji: string; bg: string };

/** Offers for Standard users, then "Teacher live now" and "New lesson" in the chosen language (v2 Nov). */
export function banners(o: { plan: string; chip: LangChip; me: Me; offerEnd: string; langName: (en: string) => string; day: (d: Date) => string }): Banner[] {
  const offers: Banner[] = o.plan === 'standard' ? [
    { tag: 'Offer', title: '2× coins until Sunday', sub: `Top up 630, get 630 extra · ends ${o.offerEnd}`, emoji: '🪙', bg: 'linear-gradient(135deg, #FFB000, #E05A00)' },
    { tag: 'Offer', title: 'Get seen first', sub: 'Boost your profile for 30 min', emoji: '🚀', bg: 'linear-gradient(135deg, #EE1626, #8A0016)' },
    { tag: 'Plus', title: 'See who viewed you', sub: 'Private rooms · free first boost · no offers', emoji: '👑', bg: 'linear-gradient(135deg, #1B1B21, #5A0A1A)' },
  ] : [];
  const mine = myLangs(o.me);
  const ok = (l: string, ls?: string[]) => ls ? langMatch(ls, o.chip, o.me)
    : o.chip.startsWith('L:') ? l === o.chip.slice(2) : o.chip.startsWith('P:') ? false : o.chip === 'More' ? true : mine.includes(l);
  const live = [...ROOMS, ...LIVES].filter((r) => r.price && ok(r.l, r.ls)).slice(0, 1).map((r) => ({
    tag: 'Teacher live now', title: r.title, sub: `${hostName(r.host)} · ${o.langName(r.l)} · ${r.level}`, emoji: '🎓', bg: 'linear-gradient(135deg, #B4001E, #3A0610)',
  }));
  const now = Date.now();
  const up = LESSONS.filter((x) => ok(x.l) && lessonDate(x).getTime() > now).sort((a, b) => lessonDate(a).getTime() - lessonDate(b).getTime()).slice(0, 2).map((x) => ({
    tag: 'New lesson', title: x.title, sub: `${o.day(lessonDate(x))} ${x.time} · ${o.langName(x.l)} · ${hostName(x.host)} · ${x.mins} min`, emoji: '📅', bg: 'linear-gradient(135deg, #2A2A33, #0E0E12)',
  }));
  return [...offers, ...live, ...up];
}

const hostName = (id: string) => ((demo.people as Record<string, { name: string }>)[id]?.name ?? '');
