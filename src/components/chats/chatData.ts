/**
 * Builds what the Chats list shows from this account's chats (same rules as the prototype's vChats).
 * Pure functions: no screen code here, so they are easy to test and to swap for server data later.
 * A new account has no chats (NEXT_STEPS §3); real chats arrive with slice 3.
 */
import { getPerson } from '../../data/people';
import { liveLives, liveRooms } from '../../data/live';

export type Msg = { f?: string; t?: string; voice?: boolean; room?: string; img?: boolean; poll?: { q: string }; share?: { k: string }; right?: string; by?: string; gift?: { n?: string } };
export type Chat = { unread: number; msgs: Msg[] };
export type Group = { name: string; members: string[]; unread: number; msgs: Msg[] };

const SHARE: Record<string, string> = { flick: '▶ Sent a Flick', sound: '♪ Sent a sound', profile: '👤 Sent a profile', lesson: '📅 Sent a lesson' };

/**
 * The grey preview line under a chat's name. Returns English pieces the screen translates.
 * `you` is true when the line should start with "You: ".
 */
export function lastLine(chat: Chat | undefined): { text: string; you: boolean; raw: boolean } {
  const x = chat?.msgs[chat.msgs.length - 1];
  if (!x) return { text: 'Say hi 👋', you: false, raw: false };
  const you = x.f === 'me';
  if (x.voice) return { text: '🎤 Voice message', you, raw: false };
  if (x.room) return { text: '🎙 Shared a room', you, raw: false };
  if (x.share) return { text: SHARE[x.share.k] ?? 'Sent something', you, raw: false };
  if (x.img) return { text: '📷 Photo', you, raw: false };
  if (x.poll) return { text: '📊 ' + x.poll.q, you: false, raw: true };
  if (x.f === 'gift') return { text: 'Gift: ' + (x.t ?? ''), you: false, raw: false };
  if (x.f === 'fix') return { text: 'Correction ✓ ' + (x.right ?? ''), you: false, raw: true };
  // what people write is never translated automatically
  return { text: x.t ?? '', you, raw: true };
}

/** Preview line of a group: "Marc: Parfait…" */
export function groupLastLine(g: Group): { who: string; text: string; raw: boolean } | null {
  const x = g.msgs[g.msgs.length - 1];
  if (!x) return null;
  const who = x.by === 'me' ? 'You' : getPerson(x.by ?? '')?.name ?? '';
  if (x.voice) return { who, text: '🎤 Voice message', raw: false };
  if (x.img) return { who, text: '📷 Photo', raw: false };
  if (x.room) return { who, text: '🎙 Shared a room', raw: false };
  if (x.share) return { who, text: SHARE[x.share.k] ?? '', raw: false };
  if (x.poll) return { who, text: '📊 ' + x.poll.q, raw: true };
  if (x.gift) return { who, text: '🎁 ' + (x.gift.n ?? 'Gift'), raw: false };
  return { who, text: x.t ?? '', raw: true };
}

/**
 * "In a room now": people I follow or chat with who are hosting a live, or are in a talk room
 * (host or on stage). One bubble per person, lives first.
 */
export function liveFriends(follows: Record<string, boolean>, chatIds: string[]): { id: string; kind: 'live' | 'room' }[] {
  const circle = new Set([...Object.keys(follows).filter((k) => follows[k]), ...chatIds]);
  const out: { id: string; kind: 'live' | 'room' }[] = [];
  for (const L of liveLives) if (L.host !== 'me' && circle.has(L.host) && !out.find((o) => o.id === L.host)) out.push({ id: L.host, kind: 'live' });
  for (const r of liveRooms) {
    for (const x of [r.host, ...r.speakers]) {
      if (x !== 'me' && circle.has(x) && !out.find((o) => o.id === x)) out.push({ id: x, kind: 'room' });
    }
  }
  return out;
}
