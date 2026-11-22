/**
 * Small extra memory for the Chats list (muted chats, deleted chats, answered requests,
 * muted official rows), saved on the phone.
 *
 * It lives here for slice 1 so the Chats screen could be built without touching the main store.
 * TODO(slice 2): move these fields into src/state/store.ts (and then to the server).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChatState = {
  muted: Record<string, boolean>; // chats muted with the swipe "Mute" button
  deleted: Record<string, boolean>; // chats deleted from this phone (the other person keeps theirs)
  reqDone: Record<string, boolean>; // message requests accepted or declined
  closeFriends: Record<string, boolean>; // ⭐ from a profile's ••• menu
  mutedPeople: Record<string, boolean>; // "Mute Kenji" from a profile's ••• menu
  toggleMute: (id: string) => void;
  deleteChat: (id: string) => void;
  answerRequest: (id: string) => void;
  toggleClose: (id: string) => void;
  togglePersonMute: (id: string) => void;
};

const flip = (rec: Record<string, boolean>, id: string) => {
  const next = { ...rec };
  if (next[id]) delete next[id];
  else next[id] = true;
  return next;
};

export const useChatState = create<ChatState>()(
  persist(
    (set, get) => ({
      muted: {}, deleted: {}, reqDone: {}, closeFriends: {}, mutedPeople: {},
      toggleMute: (id) => set({ muted: flip(get().muted, id) }),
      deleteChat: (id) => set({ deleted: { ...get().deleted, [id]: true } }),
      answerRequest: (id) => set({ reqDone: { ...get().reqDone, [id]: true } }),
      toggleClose: (id) => set({ closeFriends: flip(get().closeFriends, id) }),
      togglePersonMute: (id) => set({ mutedPeople: flip(get().mutedPeople, id) }),
    }),
    {
      name: 'talkamigo-chats-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ muted: s.muted, deleted: s.deleted, reqDone: s.reqDone, closeFriends: s.closeFriends, mutedPeople: s.mutedPeople }),
    },
  ),
);
