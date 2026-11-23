/**
 * What the app shows: the "Live" world (NEXT_STEPS §3 and §5).
 *
 * Live is EMPTY until real people sign up: no invented people, rooms, lives, lessons or Flicks.
 * From slice 2 these lists come from the server (Supabase). Every screen reads its lists from here,
 * so switching from "empty" to "server" happens in one place.
 *
 * The prototype's demo content (src/data/generated/demo.json) is NOT used by the app any more.
 * It is kept as the starting point for the hidden Test world (slice 2, team accounts only).
 */
import type { Person } from './people';

/** A talk room (shape from the prototype). */
export type Room = { id: string; l: string; ls?: string[]; lang: string; topic?: string; title: string; host: string; speakers: string[]; count: number; [key: string]: unknown };
/** A live room. */
export type Live = { id: string; host: string; l: string; lang: string; title: string; viewers: number; bg?: string; [key: string]: unknown };
/** A Flick in the feed. */
export type Flick = { id: string; by: string; kind?: string; text?: string; tr?: string; bg?: string; likes?: number; [key: string]: unknown };
/** A planned lesson. */
export type Lesson = { id: string; host: string; title: string; [key: string]: unknown };

export const livePeople: Record<string, Person> = {};
export const liveRooms: Room[] = [];
export const liveLives: Live[] = [];
export const liveLessons: Lesson[] = [];
export const liveFlicks: Flick[] = [];
