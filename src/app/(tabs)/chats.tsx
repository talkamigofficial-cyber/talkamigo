/**
 * Chats tab (prototype vChats).
 *
 * Top: "Good evening, Sam" + Chats. Filter chips: All · Unread (count) · Groups · Requests (count) · Online.
 * "In a room now" row (only when someone I follow or chat with is in a room), then the list in this order (v101):
 *   Room alerts → red "From your teacher" banner while a teacher message is unread → teacher chats (pinned)
 *   → TalkAmigo Team → everyone else.
 * A new account has no chats (NEXT_STEPS §3): Room alerts and TalkAmigo Team stay as places ("Nothing yet")
 * and the "No chats yet" card (design B) points to Connect.
 * Swipe a chat left: Mute / Delete. Until conversations exist (slice 3) tapping a chat opens the person's profile.
 * Hidden until their feature is built (NEXT_STEPS §4): Search, Activity bell, New chat, groups, message requests.
 */
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { useLang, useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { PEOPLE, getPerson } from '../../data/people';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Pressy } from '../../components/Pressy';
import { Sheet } from '../../components/Sheet';
import { T } from '../../components/T';
import { toast } from '../../components/Toast';
import { EmptyState } from '../../components/EmptyState';
import { useChatState } from '../../components/chats/chatState';
import { lastLine, liveFriends, type Chat } from '../../components/chats/chatData';
import { Badge, ChatRow, OfficialRow, TeacherBanner } from '../../components/chats/ChatRows';
import { InRoomRow } from '../../components/chats/InRoomRow';
import { greeting } from '../../components/profile/helpers';

type Filter = 'all' | 'unread' | 'groups' | 'requests' | 'online';
type Item =
  | { k: 'official'; id: 'lounge' | 'team' }
  | { k: 'banner' }
  | { k: 'chat'; id: string }
  | { k: 'label'; text: string }
  | { k: 'partner'; id: string };

export default function ChatsScreen() {
  const c = useColors();
  const t = useT();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const { me, chats, chatOrder, offUnread, follows } = useApp();
  const { muted, deleted, toggleMute, deleteChat } = useChatState();

  const chatOf = (id: string) => (chats as Record<string, Chat>)[id];
  const order = chatOrder.filter((id) => !deleted[id] && getPerson(id) && chatOf(id));
  const offU = offUnread as Record<string, number>;

  const teacherIds = order.filter((id) => getPerson(id)?.teacher);
  const teacherUnread = teacherIds.filter((id) => chatOf(id).unread > 0 && !muted[id]);
  const unreadCount = order.filter((id) => chatOf(id).unread > 0).length + (['lounge', 'team'] as const).filter((k) => offU[k]).length;
  const openProfile = (id: string) => router.push(`/user/${id}`);

  const items = useMemo<Item[]>(() => {
    const chat = (id: string): Item => ({ k: 'chat', id });
    const others = order.filter((id) => !teacherIds.includes(id));
    switch (filter) {
      case 'all':
        return [
          { k: 'official', id: 'lounge' },
          ...(teacherUnread.length ? [{ k: 'banner' } as Item] : []),
          ...teacherIds.map(chat),
          { k: 'official', id: 'team' },
          ...others.map(chat),
        ];
      case 'unread':
        return [
          ...(['lounge', 'team'] as const).filter((k) => offU[k]).map((id): Item => ({ k: 'official', id })),
          ...teacherIds.filter((id) => chatOf(id).unread > 0).map(chat),
          ...others.filter((id) => chatOf(id).unread > 0).map(chat),
        ];
      // groups and message requests arrive with chats (slice 3); until then these filters are empty
      case 'groups':
      case 'requests':
        return [];
      case 'online': {
        const partners = Object.keys(PEOPLE).filter((id) => PEOPLE[id].online && !chatOf(id));
        const online = order.filter((id) => getPerson(id)?.online).map(chat);
        return partners.length ? [...online, { k: 'label', text: 'Online partners' }, ...partners.map((id): Item => ({ k: 'partner', id }))] : online;
      }
    }
  }, [filter, order, teacherIds, teacherUnread.length, chats, offU]);

  const render = ({ item }: { item: Item }) => {
    switch (item.k) {
      case 'official':
        return (
          <OfficialRow
            kind={item.id}
            unread={offU[item.id] ?? 0}
            muted={!!muted['official:' + item.id]}
            onOpen={() => router.push(item.id === 'lounge' ? '/room-alerts' : '/team')}
          />
        );
      case 'banner': {
        const id = teacherUnread[0];
        const last = lastLine(chatOf(id));
        return <TeacherBanner id={id} preview={last.raw ? last.text : t(last.text)} more={teacherUnread.length - 1} onOpen={() => openProfile(id)} />;
      }
      case 'chat':
        return (
          <ChatRow
            id={item.id}
            chat={chatOf(item.id)}
            muted={!!muted[item.id]}
            onOpen={() => openProfile(item.id)}
            onMute={() => {
              const name = getPerson(item.id)?.name ?? '';
              toast(`${name} ${muted[item.id] ? 'unmuted' : 'muted'}`, { icon: 'mute' });
              toggleMute(item.id);
            }}
            onDelete={() => setDeleting(item.id)}
          />
        );
      case 'label':
        return <T style={[s.label, { color: c.muted }]}>{item.text}</T>;
      case 'partner': {
        const p = getPerson(item.id)!;
        return (
          <Pressy scale={1} highlight="rgba(120,120,128,0.16)" style={s.simpleRow} onPress={() => openProfile(item.id)}>
            <Avatar id={item.id} size={52} ring />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[s.rowName, { color: c.ink }]}>{p.name}</Text>
              <T style={{ color: c.muted, fontSize: 14 }}>{`${p.native} → ${p.learning}`}</T>{/* i18n-ignore: language names are translated at run time */}
            </View>
            <T style={[s.pill, { backgroundColor: c.tint, color: c.tintText }]}>Say hi</T>
          </Pressy>
        );
      }
    }
  };

  /** The "nothing here yet" card for each filter (design B, NEXT_STEPS §3). */
  const empty = () => {
    switch (filter) {
      case 'all':
        return (
          <EmptyState
            icon="chat"
            title="No chats yet"
            text="Find someone who speaks the language you’re learning and say hi."
            button="Find a partner"
            onPress={() => router.navigate('/connect')}
          />
        );
      case 'unread':
        return <EmptyState icon="check" title="You’re all caught up." />;
      case 'groups':
        return <EmptyState icon="people" title="No groups yet" />;
      case 'requests':
        return <EmptyState icon="user" title="No requests right now." text="People you don’t follow land in Requests first. You decide who gets in." />;
      case 'online':
        return <EmptyState icon="people" title="No partners online right now" />;
    }
  };
  // On "All" the two official rows are always there, so the card goes under them when there are no chats.
  const noChats = filter === 'all' && order.length === 0;

  const chips: [Filter, string, number][] = [['all', 'All', 0], ['unread', 'Unread', unreadCount], ['groups', 'Groups', 0], ['requests', 'Requests', 0], ['online', 'Online', 0]];
  const header = (
    <View>
      <View style={[s.top, { paddingTop: insets.top + 16 }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[s.greet, { color: c.muted }]} numberOfLines={1}>{greeting(me.name, lang)}</Text>
          {/* the title must never be cut ("Discussi…" in French, v53): it shrinks to fit on small phones */}
          <T style={[s.h1, { color: c.ink, fontSize: width >= 360 ? 32 : t('Chats').length > 8 ? 20 : 26 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Chats</T>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {chips.map(([k, label, n]) => {
          const on = filter === k;
          return (
            <Pressy key={k} scale={0.92} onPress={() => setFilter(k)} style={[s.chip, on ? { backgroundColor: c.ink } : null]} accessibilityState={{ selected: on }}>
              {k === 'online' ? <View style={s.onlineDot} /> : null}
              <T style={[s.chipText, { color: on ? c.bg : c.ink }]}>{label}</T>
              {n ? <Badge n={n} /> : null}
            </Pressy>
          );
        })}
      </ScrollView>
      {filter === 'all' || filter === 'online' ? <InRoomRow friends={liveFriends(follows, order)} /> : null}
      <View style={{ height: 6 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={items}
        keyExtractor={(it, i) => it.k + ('id' in it ? it.id : i)}
        renderItem={render}
        ListHeaderComponent={header}
        ListEmptyComponent={empty()}
        ListFooterComponent={noChats ? empty() : undefined}
        contentContainerStyle={{ paddingBottom: 24 }}
        initialNumToRender={12}
      />
      <DeleteChatSheet id={deleting} onClose={() => setDeleting(null)} onDelete={(id) => { deleteChat(id); setDeleting(null); toast('Chat deleted', { icon: 'trash' }); }} />
    </View>
  );
}

/** "Delete this chat?" — deleted from this phone only, the other person keeps their copy (CLAUDE.md, 31 Oct). */
function DeleteChatSheet({ id, onClose, onDelete }: { id: string | null; onClose: () => void; onDelete: (id: string) => void }) {
  const c = useColors();
  const name = id ? getPerson(id)?.name ?? '' : '';
  return (
    <Sheet visible={!!id} onClose={onClose}>
      {id ? (
        <View style={{ alignItems: 'center', gap: 10, paddingVertical: 6 }}>
          <Avatar id={id} size={64} />
          <T style={{ fontSize: 20, fontWeight: '700', color: c.ink }}>Delete this chat?</T>
          <T style={{ fontSize: 14.5, lineHeight: 21, color: c.muted, textAlign: 'center' }}>{`All messages with ${name} are deleted from this phone. ${name} keeps their copy.`}</T>
          {/* dark red, not the brand gradient: this one deletes */}
          <View style={{ alignSelf: 'stretch', gap: 10 }}>
            <Pressy onPress={() => onDelete(id)} scale={0.955} style={s.danger}>
              <T style={s.dangerText}>Delete chat</T>
            </Pressy>
            <Button title="Cancel" kind="ghost" onPress={onClose} />
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingBottom: 12, paddingHorizontal: 20 },
  greet: { fontSize: 14, fontWeight: '600' },
  h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  chips: { gap: 8, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 2 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipText: { fontSize: 14, fontWeight: '700' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  simpleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 20 },
  rowName: { fontSize: 16, fontWeight: '800' },
  pill: { fontSize: 11.5, fontWeight: '800', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden' },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', paddingTop: 18, paddingBottom: 4, paddingHorizontal: 20 },
  danger: { height: 54, borderRadius: 18, backgroundColor: '#B00C18', alignItems: 'center', justifyContent: 'center' },
  dangerText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
