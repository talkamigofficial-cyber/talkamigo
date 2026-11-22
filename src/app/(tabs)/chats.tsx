/**
 * Chats tab (prototype vChats).
 *
 * Top: "Good evening, Sam" + Chats, Search, Activity (bell with count) and the red ✎ New chat button.
 * Filter chips: All · Unread (count) · Groups · Requests (count) · Online.
 * "In a room now" row (All and Online), then the list in this order (v101):
 *   Room alerts → red "From your teacher" banner while a teacher message is unread → teacher chats (pinned)
 *   → TalkAmigo Team → Message requests → groups → everyone else.
 * Swipe a chat left: Mute / Delete. Opening a conversation comes in the next slice.
 */
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import demo from '../../data/generated/demo.json';
import { useApp } from '../../state/store';
import { useLang, useT } from '../../i18n';
import { BRAND_GRADIENT, useColors } from '../../theme/colors';
import { getPerson } from '../../data/people';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Pressy } from '../../components/Pressy';
import { Sheet } from '../../components/Sheet';
import { T } from '../../components/T';
import { comingSoon, toast } from '../../components/Toast';
import { useChatState } from '../../components/chats/chatState';
import { activityUnread, lastLine, liveFriends, roomAlertPreview, teamPreview, type Chat, type Group } from '../../components/chats/chatData';
import { Badge, ChatRow, GroupRow, OfficialRow, RequestRow, RequestsSummaryRow, TeacherBanner } from '../../components/chats/ChatRows';
import { InRoomRow } from '../../components/chats/InRoomRow';
import { greeting } from '../../components/profile/helpers';
import { router } from 'expo-router';

type Filter = 'all' | 'unread' | 'groups' | 'requests' | 'online';
type Item =
  | { k: 'official'; id: 'lounge' | 'team' }
  | { k: 'banner' }
  | { k: 'chat'; id: string }
  | { k: 'group'; id: string }
  | { k: 'reqSummary' }
  | { k: 'request'; id: string; text: string }
  | { k: 'newGroup' }
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

  const { me, chats, chatOrder, groups, offUnread, follows, plan, account } = useApp();
  const { muted, deleted, reqDone, toggleMute, deleteChat, answerRequest } = useChatState();
  const isDemo = account === 'demo';

  // demo-only content: message requests and activity (a brand-new account has none, v53)
  const requests = (isDemo ? (demo.requests as [string, string][]) : []).filter(([id]) => !reqDone[id]);
  const actUnread = isDemo ? activityUnread() : 0;
  const order = chatOrder.filter((id) => !deleted[id] && getPerson(id) && (chats as Record<string, Chat>)[id]);
  const chatOf = (id: string) => (chats as Record<string, Chat>)[id];
  const gids = Object.keys(groups);
  const groupOf = (id: string) => (groups as Record<string, Group>)[id];
  const offU = offUnread as Record<string, number>;

  const teacherIds = order.filter((id) => getPerson(id)?.teacher);
  const teacherUnread = teacherIds.filter((id) => chatOf(id).unread > 0 && !muted[id]);
  const unreadCount = order.filter((id) => chatOf(id).unread > 0).length + gids.filter((g) => groupOf(g).unread).length + (['lounge', 'team'] as const).filter((k) => offU[k]).length;

  const items = useMemo<Item[]>(() => {
    const chat = (id: string): Item => ({ k: 'chat', id });
    const group = (id: string): Item => ({ k: 'group', id });
    const others = order.filter((id) => !teacherIds.includes(id));
    switch (filter) {
      case 'all':
        return [
          { k: 'official', id: 'lounge' },
          ...(teacherUnread.length ? [{ k: 'banner' } as Item] : []),
          ...teacherIds.map(chat),
          { k: 'official', id: 'team' },
          ...(requests.length ? [{ k: 'reqSummary' } as Item] : []),
          ...gids.map(group),
          ...others.map(chat),
        ];
      case 'unread':
        return [
          ...(['lounge', 'team'] as const).filter((k) => offU[k]).map((id): Item => ({ k: 'official', id })),
          ...teacherIds.filter((id) => chatOf(id).unread > 0).map(chat),
          ...gids.filter((g) => groupOf(g).unread).map(group),
          ...others.filter((id) => chatOf(id).unread > 0).map(chat),
        ];
      case 'groups':
        return [{ k: 'newGroup' }, ...gids.map(group)];
      case 'requests':
        return requests.map(([id, text]): Item => ({ k: 'request', id, text }));
      case 'online': {
        const partners = Object.keys(demo.people).filter((id) => getPerson(id)?.online && !chatOf(id));
        return [...order.filter((id) => getPerson(id)?.online).map(chat), { k: 'label', text: 'Online partners' }, ...partners.map((id): Item => ({ k: 'partner', id }))];
      }
    }
  }, [filter, order, teacherIds, teacherUnread.length, requests, gids, chats, groups, offU]);

  const render = ({ item }: { item: Item }) => {
    switch (item.k) {
      case 'official':
        return (
          <OfficialRow
            kind={item.id}
            preview={item.id === 'lounge' ? roomAlertPreview() : teamPreview(plan, isDemo)}
            unread={offU[item.id] ?? 0}
            muted={!!muted['official:' + item.id]}
            onOpen={comingSoon}
          />
        );
      case 'banner': {
        const id = teacherUnread[0];
        const last = lastLine(chatOf(id));
        return <TeacherBanner id={id} preview={last.raw ? last.text : t(last.text)} more={teacherUnread.length - 1} onOpen={comingSoon} />;
      }
      case 'chat':
        return (
          <ChatRow
            id={item.id}
            chat={chatOf(item.id)}
            muted={!!muted[item.id]}
            onOpen={comingSoon}
            onMute={() => {
              const name = getPerson(item.id)?.name ?? '';
              toast(`${name} ${muted[item.id] ? 'unmuted' : 'muted'}`, { icon: 'mute' });
              toggleMute(item.id);
            }}
            onDelete={() => setDeleting(item.id)}
          />
        );
      case 'group':
        return <GroupRow group={groupOf(item.id)} onOpen={comingSoon} />;
      case 'reqSummary':
        return <RequestsSummaryRow count={requests.length} onOpen={() => setFilter('requests')} />;
      case 'request':
        return (
          <RequestRow
            id={item.id}
            text={item.text}
            onAccept={() => { answerRequest(item.id); comingSoon(); }}
            onDecline={() => { answerRequest(item.id); toast('Request declined'); }}
          />
        );
      case 'newGroup':
        return (
          <Pressy scale={1} highlight="rgba(120,120,128,0.16)" style={s.simpleRow} onPress={comingSoon}>
            <View style={[s.roundIcon, { backgroundColor: c.tint }]}><Text style={{ color: c.tintText, fontSize: 26 }}>+</Text></View>
            <View style={{ flex: 1, gap: 3 }}>
              <T style={[s.rowName, { color: c.ink }]}>Create a group</T>
              <T style={{ color: c.muted, fontSize: 14 }}>Practise with a few friends at once</T>
            </View>
          </Pressy>
        );
      case 'label':
        return <T style={[s.label, { color: c.muted }]}>{item.text}</T>;
      case 'partner': {
        const p = getPerson(item.id)!;
        return (
          <Pressy scale={1} highlight="rgba(120,120,128,0.16)" style={s.simpleRow} onPress={() => router.push(`/user/${item.id}`)}>
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

  const chips: [Filter, string, number][] = [['all', 'All', 0], ['unread', 'Unread', unreadCount], ['groups', 'Groups', 0], ['requests', 'Requests', requests.length], ['online', 'Online', 0]];
  const bell = requests.length + actUnread;
  const header = (
    <View>
      <View style={[s.top, { paddingTop: insets.top + 16 }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[s.greet, { color: c.muted }]} numberOfLines={1}>{greeting(me.name, lang)}</Text>
          {/* the title must never be cut ("Discussi…" in French, v53): it shrinks to fit on small phones */}
          <T style={[s.h1, { color: c.ink, fontSize: width >= 360 ? 32 : t('Chats').length > 8 ? 20 : 26 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Chats</T>
        </View>
        <Pressy scale={0.9} style={[s.ibtn, { backgroundColor: c.card, borderColor: c.line }]} onPress={comingSoon} accessibilityLabel={t('Search')}>
          <Icon name="search" size={21} color={c.ink} />
        </Pressy>
        <Pressy scale={0.9} style={[s.ibtn, { backgroundColor: c.card, borderColor: c.line }]} onPress={comingSoon} accessibilityLabel={t('Activity')}>
          <Icon name="bell" size={21} color={c.ink} />
          {bell ? <View style={[s.dot, { borderColor: c.bg }]}><Text style={s.dotText}>{bell}</Text></View> : null}
        </Pressy>
        <Pressy scale={0.9} style={[s.ibtn, s.solid]} onPress={comingSoon} accessibilityLabel={t('New chat or group')}>
          <Icon name="pen" size={21} color="#fff" />
        </Pressy>
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
        ListEmptyComponent={<T style={[s.empty, { color: c.muted }]}>{filter === 'requests' ? 'No requests right now.' : 'You’re all caught up.'}</T>}
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
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 12, paddingHorizontal: 20 },
  greet: { fontSize: 14, fontWeight: '600' },
  h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  ibtn: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  solid: { borderWidth: 0, backgroundImage: BRAND_GRADIENT, boxShadow: '0 8px 20px rgba(224,16,31,0.35)' },
  dot: { position: 'absolute', top: -4, end: -4, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: '#E0101F', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  chips: { gap: 8, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 2 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipText: { fontSize: 14, fontWeight: '700' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  simpleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 20 },
  roundIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontSize: 16, fontWeight: '800' },
  pill: { fontSize: 11.5, fontWeight: '800', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden' },
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', paddingTop: 18, paddingBottom: 4, paddingHorizontal: 20 },
  danger: { height: 54, borderRadius: 18, backgroundColor: '#B00C18', alignItems: 'center', justifyContent: 'center' },
  dangerText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  empty: { paddingTop: 30, textAlign: 'center' },
});
