/**
 * People in the app. The Live world starts empty (NEXT_STEPS §3); from slice 2 people come from the server.
 */
import { livePeople } from './live';

export type Person = {
  name: string;
  cc: string; // country they're from (flag)
  city: string;
  age: number;
  native: string;
  learning: string;
  lvl: string; // level in the language they're learning
  interests: string[];
  color: string; // background of their round picture
  online: boolean;
  bio: string;
  teacher?: boolean;
  rating?: number;
  video?: boolean;
  gender?: string;
  seen?: number; // minutes since last active
  serious?: boolean;
  tags?: string[];
  isNew?: boolean;
};

export const PEOPLE: Record<string, Person> = livePeople;

export const getPerson = (id: string): Person | null => PEOPLE[id] ?? null;
