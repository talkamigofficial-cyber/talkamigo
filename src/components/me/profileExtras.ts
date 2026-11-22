/**
 * Extra profile details that only Edit profile uses (cover photo, places, MBTI, zodiac, hometown,
 * job, school, gender, "show my age"), saved on the phone.
 *
 * They live here, not in the main store, so this part of the app can be built on its own.
 * TODO(slice 2): move these fields into `Me` in src/state/store.ts and onto the server (users table).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProfileExtras = {
  cover: number; // which of the 4 cover colours
  places: string;
  mbti: string;
  zodiac: string;
  home: string;
  job: string;
  school: string;
  gender: string;
  showAge: boolean; // Settings → Privacy → Show my age (on by default)
};

type Store = ProfileExtras & { set: (patch: Partial<ProfileExtras>) => void };

export const useProfileExtras = create<Store>()(
  persist(
    (set) => ({
      cover: 0, places: '', mbti: '', zodiac: '', home: '', job: '', school: '', gender: '', showAge: true,
      set: (patch) => set(patch),
    }),
    { name: 'talkamigo-profile-extras-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** The 4 cover backgrounds of Edit profile ("Change cover photo" cycles through them). */
export const COVERS = [
  'linear-gradient(135deg,#2A0510,#E0101F)',
  'linear-gradient(135deg,#0F3B3A,#4FD1B5)',
  'linear-gradient(135deg,#1A0420,#5B2BB5)',
  'linear-gradient(135deg,#C2410C,#FFC46B)',
];
