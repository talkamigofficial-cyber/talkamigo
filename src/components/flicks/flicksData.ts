/**
 * What the Flicks feed shows, and the small things it remembers (likes, translations, sound).
 *
 * Feed rules (prototype vMoments):
 *   For you   → people you don't follow first ("New for you"), then your own and followed people's Flicks.
 *               Rooms and lives marked "Also show on Flicks" appear as LIVE NOW cards after the 1st and 4th post,
 *               and Standard users see one "Sponsored · TalkAmigo" card after the 3rd post.
 *   Following → only mutuals: people you follow who follow you back (v57 "Who follows you is real").
 *   Learn     → Flicks in the language you're learning (chips switch language).
 *
 * The like / translation / sound state here moves to the main store and the server in slice 2.
 */
import { create } from 'zustand';
import demo from '../../data/generated/demo.json';

export type Flick = {
  id: string;
  by: string; // person id, or 'me'
  kind: string;
  text: string;
  tr?: string; // translation
  cap?: string; // caption under the main text
  likes: number;
  comments: unknown[];
  bg: string;
  photo?: string; // big emoji standing in for the photo/video
  photos?: string[]; // slideshow
  video?: string; // length, e.g. "0:42"
  snd?: string;
  lang?: string;
  lvl?: string;
  old?: boolean;
};

export type LiveCard = { kind: 'live' | 'room'; id: string; title: string; host: string; count: number; lang: string; price?: number; bg?: string };

/** TalkAmigo's own sounds (names shown on Flicks). */
export const SOUNDS: Record<string, string> = {
  s1: 'Café Lo-fi', s2: 'Paris Morning', s3: 'Tokyo Night Drive', s4: 'Samba Sol', s5: 'Study Rain', s6: 'Lagos Sunshine',
};

/** Other people's Flicks (the prototype's MOMENTS0). Your old demo Flicks only show on your profile. */
export const OTHERS_FLICKS = (demo.flicks as unknown as Flick[]).filter((f) => f.by !== 'me');

/** Rooms and lives that are open and shown on Flicks. */
export const LIVE_CARDS: LiveCard[] = [
  ...(demo.lives as any[]).filter((x) => x.onFlicks).map((x) => ({ kind: 'live' as const, id: x.id, title: x.title, host: x.host, count: x.viewers, lang: x.lang || x.l || '', price: x.price, bg: x.bg })),
  ...(demo.rooms as any[]).filter((x) => x.onFlicks).map((x) => ({ kind: 'room' as const, id: x.id, title: x.title, host: x.host, count: x.count, lang: x.lang || x.l || '', price: x.price })),
];

export type FeedTab = 'following' | 'foryou' | 'learn';
export type FeedItem = { type: 'flick'; flick: Flick; isNew: boolean } | { type: 'live'; card: LiveCard } | { type: 'promo' } | { type: 'empty'; text: string };

export function buildFeed(o: {
  tab: FeedTab; myFlicks: Flick[]; follows: Record<string, boolean>; followsMe: string[]; chats: Record<string, unknown>;
  learnLang: string; plan: string;
}): FeedItem[] {
  const all = [...o.myFlicks.filter((m) => !m.old), ...OTHERS_FLICKS];
  const mutual = (id: string) => !!o.follows[id] && o.followsMe.includes(id);
  let shown: Flick[];
  if (o.tab === 'following') shown = all.filter((m) => m.by !== 'me' && mutual(m.by));
  else if (o.tab === 'learn') shown = all.filter((m) => m.lang === o.learnLang);
  else shown = [...all.filter((m) => m.by !== 'me' && !o.follows[m.by]), ...all.filter((m) => m.by === 'me' || o.follows[m.by])];

  const items: FeedItem[] = shown.map((f) => ({
    type: 'flick', flick: f,
    isNew: o.tab === 'foryou' && f.by !== 'me' && !o.follows[f.by] && !o.chats[f.by],
  }));
  if (!items.length) {
    return [{ type: 'empty', text: o.tab === 'following' ? 'When you and someone follow each other, their Flicks show here.' : 'No Flicks in your learning languages yet.' }];
  }
  if (o.tab === 'learn') return items;

  // LIVE NOW cards after the 1st and 4th post (Following: only mutuals' rooms)
  const lives = LIVE_CARDS.filter((x) => o.tab !== 'following' || mutual(x.host));
  const out: FeedItem[] = [];
  let li = 0;
  items.forEach((it, i) => {
    out.push(it);
    if ((i === 0 || i === 3) && lives[li]) out.push({ type: 'live', card: lives[li++] });
  });
  // one offer card for Standard users, after the 3rd item (Plus and Infinity never see offers)
  if (o.plan === 'standard' && o.tab === 'foryou' && out.length > 3) out.splice(3, 0, { type: 'promo' });
  return out;
}

type FlickUI = {
  liked: Record<string, boolean>;
  translated: Record<string, boolean>;
  slide: Record<string, number>;
  soundOn: boolean;
  soundHinted: boolean; // "Tap for sound" shows until the first tap
  toggleLike: (id: string) => void;
  like: (id: string) => void; // double-tap only likes, never unlikes
  toggleTranslate: (id: string) => void;
  nextSlide: (id: string, count: number) => void;
  toggleSound: () => void;
};

export const useFlickUI = create<FlickUI>((set, get) => ({
  liked: {}, translated: {}, slide: {}, soundOn: false, soundHinted: false,
  toggleLike: (id) => set({ liked: { ...get().liked, [id]: !get().liked[id] } }),
  like: (id) => set({ liked: { ...get().liked, [id]: true } }),
  toggleTranslate: (id) => set({ translated: { ...get().translated, [id]: !get().translated[id] } }),
  nextSlide: (id, count) => set({ slide: { ...get().slide, [id]: ((get().slide[id] ?? 0) + 1) % count } }),
  toggleSound: () => set({ soundOn: !get().soundOn, soundHinted: true }),
}));
