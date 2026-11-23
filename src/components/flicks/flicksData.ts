/**
 * What the Flicks feed shows, and the small things it remembers (likes, translations, sound).
 *
 * Feed rules (prototype vMoments):
 *   For you   → people you don't follow first ("New for you"), then your own and followed people's Flicks.
 *   Following → only mutuals: people you follow who follow you back (v57 "Who follows you is real").
 *   Learn     → Flicks in the language you're learning (chips switch language).
 *
 * Round 2 (NEXT_STEPS §3–4): Flicks come from src/data/live.ts, empty until real people post (slice 5).
 * The prototype's "LIVE NOW" room cards (slice 6) and the "Sponsored · TalkAmigo" offer card are not shown:
 * no invented content, no buttons that do nothing.
 *
 * The like / translation / sound state here moves to the main store and the server in slice 5.
 */
import { create } from 'zustand';
import { liveFlicks } from '../../data/live';

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

/** TalkAmigo's own sounds (names shown on Flicks). */
export const SOUNDS: Record<string, string> = {
  s1: 'Café Lo-fi', s2: 'Paris Morning', s3: 'Tokyo Night Drive', s4: 'Samba Sol', s5: 'Study Rain', s6: 'Lagos Sunshine',
};

/** Other people's Flicks (empty until slice 5). */
export const OTHERS_FLICKS = (liveFlicks as unknown as Flick[]).filter((f) => f.by !== 'me');

export type FeedTab = 'following' | 'foryou' | 'learn';
export type FeedItem = { type: 'flick'; flick: Flick; isNew: boolean };

export function buildFeed(o: {
  tab: FeedTab; myFlicks: Flick[]; follows: Record<string, boolean>; followsMe: string[]; chats: Record<string, unknown>; learnLang: string;
}): FeedItem[] {
  const all = [...o.myFlicks.filter((m) => !m.old), ...OTHERS_FLICKS];
  const mutual = (id: string) => !!o.follows[id] && o.followsMe.includes(id);
  let shown: Flick[];
  if (o.tab === 'following') shown = all.filter((m) => m.by !== 'me' && mutual(m.by));
  else if (o.tab === 'learn') shown = all.filter((m) => m.lang === o.learnLang);
  else shown = [...all.filter((m) => m.by !== 'me' && !o.follows[m.by]), ...all.filter((m) => m.by === 'me' || o.follows[m.by])];
  return shown.map((f) => ({ type: 'flick', flick: f, isNew: o.tab === 'foryou' && f.by !== 'me' && !o.follows[f.by] && !o.chats[f.by] }));
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
