/**
 * Everything the app remembers, in one place, saved on the phone.
 *
 * Read a value in a screen:     const coins = useApp((s) => s.coins);
 * Change it (from any screen):  useApp.getState().setTheme('dark');
 *
 * There is no server yet (slice 1). Everything here lives on the phone, like in the prototype,
 * and is lost if the app is deleted. In slice 2 most of it moves to the server (Supabase).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '../i18n';
import { pickLang, phoneLang } from '../i18n';

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type AuthMethod = 'google' | 'apple' | 'phone';
export type Theme = 'system' | 'light' | 'dark';
export type Plan = 'standard' | 'plus' | 'infinity';
/** One message in a chat (shape kept from the prototype; real messages come from the server in slice 3). */
export type Message = { f: string; t?: string; tr?: string; [key: string]: unknown };
export type Chat = { unread: number; msgs: Message[] };
export type Group = { name: string; members: string[]; unread: number; msgs: Message[] };
export type MyFlick = { id: string; kind?: string; photo?: string; bg?: string; text?: string; tr?: string; likes?: number; pinned?: boolean; boosted?: boolean; [key: string]: unknown };
export type Tab = 'chats' | 'connect' | 'flicks' | 'rooms' | 'me';

/** A profile photo: one of the ready-made photos (emoji on a colour) or a real photo from the phone. */
export type Photo = { emoji: string; bg: string } | { uri: string } | null;

export type Me = {
  name: string;
  handle: string; // @username without the @
  cc: string; // country code, sets the flag
  city: string;
  showCity: boolean;
  bday: string | null; // 'YYYY-MM-DD'; only the age is ever shown
  natives: string[]; // languages I speak (1–3), first = main
  langs: string[]; // languages I'm learning (1–3), first = main
  levels: Record<string, Level>;
  mins: Record<string, number>; // minutes practised this week per language
  interests: string[];
  photo: Photo;
  video: boolean; // has an intro video
  bio: string;
  foundVia: string | null; // "How did you find TalkAmigo?"
};

/** The steps of sign-up, in order. 'foundUs' is a sub-step of 'country' (it doesn't change the step numbers). */
export const SIGNUP_STEPS = ['who', 'country', 'foundUs', 'speaks', 'learns', 'interests', 'photo', 'video'] as const;
export type SignupStep = (typeof SIGNUP_STEPS)[number];

const emptyMe = (): Me => ({
  name: '', handle: '', cc: '', city: '', showCity: true, bday: null, natives: [], langs: [], levels: {}, mins: {},
  interests: [], photo: null, video: false, bio: '', foundVia: null,
});

type State = {
  // ---- who is using the app ----
  account: 'new' | null; // null = nobody logged in (Welcome screen). Real accounts on the server in slice 2.
  savedAccount: 'new' | null; // the account kept on this phone after logging out ("Continue as…")
  onboarded: boolean; // finished sign-up
  signupStep: SignupStep | null; // where to resume an unfinished sign-up
  lastAuth: AuthMethod | null; // for "Continue as…" and the "Last used" tag
  authPhone: string;

  // ---- looks and language ----
  theme: Theme;
  appLangChoice: string; // 'Phone default' | 'English' | 'Français' …
  welcomeLangChoice: string | null; // picked with 🌐 on Welcome, applied after sign-up
  aiOK: boolean | null; // "Your AI helpers": null = not asked yet
  lookChosen: boolean; // "Choose your look" shown after sign-up
  toured: boolean; // welcome tour finished or skipped

  // ---- profile and money ----
  me: Me;
  plan: Plan;
  coins: number;
  diamonds: number;
  pendingDiamonds: number;
  views: number;
  followersN: number;
  newFollowers: number;
  newViews: number;
  streak: number;
  follows: Record<string, boolean>;
  followsMe: string[];
  waved: Record<string, boolean>;

  // ---- what this account has (empty for a new account; filled by the server from slice 2) ----
  chats: Record<string, Chat>;
  chatOrder: string[];
  groups: Record<string, Group>;
  offUnread: Record<string, number>;
  myFlicks: MyFlick[];

  // ---- navigation memory ----
  tab: Tab;
  roomMode: 'talk' | 'live';

  // ---- derived ----
  appLang: () => Lang;

  // ---- actions ----
  setTheme: (t: Theme) => void;
  setAppLang: (choice: string) => void;
  setWelcomeLang: (choice: string) => void;
  startSignup: (method: AuthMethod) => void;
  updateMe: (patch: Partial<Me>) => void;
  setSignupStep: (step: SignupStep | null) => void;
  finishSignup: () => void;
  setLookChosen: () => void;
  setAiOK: (ok: boolean) => void;
  finishTour: (reward: boolean) => void;
  logBackIn: () => void;
  logOut: () => void;
  setTab: (tab: Tab) => void;
  setRoomMode: (m: 'talk' | 'live') => void;
  toggleFollow: (id: string) => void;
  wave: (id: string) => void;
};

/** Values for a brand-new account: nothing followed, 0 coins, 0 Diamonds, no chats (NEXT_STEPS §3). */
const freshAccount = () => ({
  me: emptyMe(), plan: 'standard' as Plan, coins: 0, diamonds: 0, pendingDiamonds: 0, views: 0, followersN: 0,
  newFollowers: 0, newViews: 0, streak: 0, follows: {}, followsMe: [] as string[], waved: {},
  chats: {} as Record<string, Chat>, chatOrder: [] as string[], groups: {} as Record<string, Group>, offUnread: { lounge: 0, team: 0 },
  myFlicks: [] as MyFlick[], aiOK: null, lookChosen: false, toured: false,
});

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      account: null, savedAccount: null, onboarded: false, signupStep: null, lastAuth: null, authPhone: '',
      theme: 'system', appLangChoice: 'Phone default', welcomeLangChoice: null,
      ...freshAccount(),
      tab: 'flicks', roomMode: 'talk',

      // Welcome, log-in and sign-up always follow the phone; the app uses the language chosen in Settings.
      appLang: () => (get().onboarded ? pickLang(get().appLangChoice) : phoneLang()),

      setTheme: (theme) => set({ theme }),
      setAppLang: (appLangChoice) => set({ appLangChoice }),
      setWelcomeLang: (welcomeLangChoice) => set({ welcomeLangChoice }),

      startSignup: (method) => set({ ...freshAccount(), account: 'new', onboarded: false, lastAuth: method, signupStep: 'who' }),
      updateMe: (patch) => set({ me: { ...get().me, ...patch } }),
      setSignupStep: (signupStep) => set({ signupStep }),
      finishSignup: () => {
        const choice = get().welcomeLangChoice;
        set({ onboarded: true, signupStep: null, tab: 'flicks', ...(choice ? { appLangChoice: choice } : {}) });
      },
      setLookChosen: () => set({ lookChosen: true }),
      setAiOK: (aiOK) => set({ aiOK }),
      finishTour: (reward) => set({ toured: true, coins: get().coins + (reward ? 50 : 0) }),

      // "Continue as…" or a log-in that matches the account saved on this phone (no server yet).
      logBackIn: () => {
        const choice = get().welcomeLangChoice;
        set({ account: get().account ?? get().savedAccount ?? 'new', onboarded: true, toured: true, tab: 'flicks', ...(choice ? { appLangChoice: choice } : {}) });
      },
      logOut: () => set({ savedAccount: get().account, account: null, onboarded: false, signupStep: null }),

      setTab: (tab) => set({ tab }),
      setRoomMode: (roomMode) => set({ roomMode }),
      toggleFollow: (id) => {
        const follows = { ...get().follows };
        if (follows[id]) delete follows[id];
        else follows[id] = true;
        set({ follows });
      },
      wave: (id) => set({ waved: { ...get().waved, [id]: true } }),
    }),
    {
      name: 'talkamigo-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // functions are not saved, only values
      partialize: (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')) as Partial<State>,
    },
  ),
);
