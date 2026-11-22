/**
 * Demo people (26, same as the prototype). In slice 2 these come from the server.
 */
import demo from './generated/demo.json';

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

export const PEOPLE = demo.people as unknown as Record<string, Person>;

export const getPerson = (id: string): Person | null => PEOPLE[id] ?? null;
