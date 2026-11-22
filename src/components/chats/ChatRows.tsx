/**
 * The rows of the Chats list: a person's chat, a group, the two official rows (Room alerts, TalkAmigo Team),
 * the message-requests summary, one request, and the red "From your teacher" banner.
 *
 * A person's chat can be swiped left to show Mute (grey) and Delete (red) (CLAUDE.md "Swipe to delete", look fixed in v47:
 * the row stays solid while it slides, small white line icons).
 */
import { memo, useRef } from 'react';
import { Animated, I18nManager, Image, PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { LOGO } from '../Logo';
import { useLang, useT } from '../../i18n';
import { BRAND_GRADIENT, useColors, useScheme } from '../../theme/colors';
import { getPerson } from '../../data/people';
import { groupLastLine, lastLine, type Chat, type Group } from './chatData';

const ACTIONS_WIDTH = 164; // two 82 px buttons

/** Thin red-tinted line under each row, starting after the photo (v72). */
function RowLine() {
  const dark = useScheme() === 'dark';
  return <View style={[s.line, { backgroundColor: dark ? 'rgba(255,70,81,0.20)' : 'rgba(224,16,31,0.13)' }]} />;
}

/** Red round unread count (grey when the chat is muted). */
export function Badge({ n, grey }: { n: number; grey?: boolean }) {
  const c = useColors();
  return (
    <View style={[s.badge, grey ? { backgroundColor: c.muted } : { backgroundImage: BRAND_GRADIENT }]}>
      <Text style={s.badgeText}>{n}</Text>
    </View>
  );
}

/** Name line: name, optional tags, and the time on the far end. */
function NameLine({ name, children, time, prefix }: { name: string; children?: React.ReactNode; time: string; prefix?: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={s.nameLine}>
      {prefix}
      <Text style={[s.name, { color: c.ink }]} numberOfLines={1}>{name}</Text>
      {children}
      <View style={{ flex: 1 }} />
      <T style={[s.time, { color: c.muted }]}>{time}</T>
    </View>
  );
}

/** Preview line: grey text (bold and dark when unread) + badge. */
function PreviewLine({ text, unread, badge, mutedIcon, muted }: { text: string; unread: boolean; badge?: number; mutedIcon?: boolean; muted?: boolean }) {
  const c = useColors();
  return (
    <View style={s.msgLine}>
      <Text style={[s.msg, { color: unread ? c.ink : c.muted }, unread && { fontWeight: '700' }]} numberOfLines={1}>{text}</Text>
      {badge ? <Badge n={badge} grey={muted} /> : mutedIcon ? <Icon name="mute" size={15} color={c.muted} /> : null}
    </View>
  );
}

// ---------------------------------------------------------------- a person's chat
type ChatRowProps = { id: string; chat: Chat; muted: boolean; onOpen: () => void; onMute: () => void; onDelete: () => void };

export const ChatRow = memo(function ChatRow({ id, chat, muted, onOpen, onMute, onDelete }: ChatRowProps) {
  const c = useColors();
  const t = useT();
  const lang = useLang();
  const dark = useScheme() === 'dark';
  const p = getPerson(id);
  const x = useRef(new Animated.Value(0)).current;
  const open = useRef(false);
  const native = Platform.OS !== 'web';
  // In Arabic the row slides the other way and the buttons sit on the left.
  const dir = lang === 'ar' || I18nManager.isRTL ? 1 : -1;

  const slide = (to: number) => {
    open.current = to !== 0;
    Animated.spring(x, { toValue: to, useNativeDriver: native, speed: 20, bounciness: 2 }).start();
  };
  const pan = useRef(
    PanResponder.create({
      // only a clear sideways drag swipes; up/down keeps scrolling the list
      // (capture: the tappable row underneath would otherwise keep the touch)
      onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_e, g) => {
        const base = open.current ? dir * ACTIONS_WIDTH : 0;
        const v = base + g.dx;
        x.setValue(dir < 0 ? Math.max(-ACTIONS_WIDTH - 20, Math.min(0, v)) : Math.min(ACTIONS_WIDTH + 20, Math.max(0, v)));
      },
      onPanResponderRelease: (_e, g) => slide(dir * g.dx > 40 || (open.current && dir * g.dx > -40) ? dir * ACTIONS_WIDTH : 0),
      onPanResponderTerminate: () => slide(open.current ? dir * ACTIONS_WIDTH : 0),
    }),
  ).current;

  if (!p) return null;
  const last = lastLine(chat);
  const text = last.you ? t(`You: ${last.text}`) : last.raw ? last.text : t(last.text);
  const unread = chat.unread > 0;

  return (
    <View style={[s.swRow, { backgroundColor: c.bg }]}>
      <View style={[s.actions, dir < 0 ? { right: 0 } : { left: 0 }]}>
        <Pressy scale={1} style={[s.act, { backgroundColor: dark ? '#4A4A50' : '#6B6B73' }]} onPress={() => { slide(0); onMute(); }} accessibilityLabel={t(muted ? 'Unmute' : 'Mute')}>
          <Icon name={muted ? 'bell' : 'mute'} size={22} color="#fff" />
          <T style={s.actText}>{muted ? 'Unmute' : 'Mute'}</T>
        </Pressy>
        <Pressy scale={1} style={[s.act, { backgroundColor: '#E0101F' }]} onPress={() => { slide(0); onDelete(); }} accessibilityLabel={t('Delete')}>
          <Icon name="trash" size={22} color="#fff" />
          <T style={s.actText}>Delete</T>
        </Pressy>
      </View>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }], backgroundColor: c.bg }}>
        <Pressy scale={1} highlight="rgba(120,120,128,0.16)" style={[s.row, { backgroundColor: c.bg }]} onPress={() => (open.current ? slide(0) : onOpen())}>
          <Avatar id={id} size={52} ring />
          <View style={s.body}>
            <NameLine name={p.name} time={unread ? 'now' : 'today'} prefix={p.teacher ? <PinMark /> : null}>
              {p.teacher ? <T style={[s.pill, { backgroundColor: c.tint, color: c.tintText }]}>Teacher</T> : null}
              {muted ? <Icon name="mute" size={15} color={c.muted} /> : null}
            </NameLine>
            <PreviewLine text={text} unread={unread && !muted} badge={chat.unread} muted={muted} />
          </View>
        </Pressy>
        <RowLine />
      </Animated.View>
    </View>
  );
});

/** Teachers' chats are pinned: a small red pin before the name (v101). Rendered as a prefix by the screen. */
export function PinMark() {
  return <Icon name="pin" size={14} color="#E0101F" strokeWidth={2.2} />;
}

// ---------------------------------------------------------------- group
export const GroupRow = memo(function GroupRow({ group, onOpen }: { group: Group; onOpen: () => void }) {
  const c = useColors();
  const t = useT();
  const last = groupLastLine(group);
  const text = last ? `${t(last.who)}: ${last.raw ? last.text : t(last.text)}` : t('Say hi 👋');
  const [a, b] = [group.members[0], group.members[1] ?? 'me'];
  return (
    <View>
      <Pressy scale={1} highlight="rgba(120,120,128,0.16)" style={s.row} onPress={onOpen}>
        {/* two overlapping photos */}
        <View style={{ width: 52, height: 52 }}>
          <View style={{ position: 'absolute', top: 0, start: 0 }}><Avatar id={a} size={36} noFlag /></View>
          <View style={{ position: 'absolute', bottom: 0, end: 0, borderWidth: 2, borderColor: c.bg, borderRadius: 20 }}><Avatar id={b} size={34} noFlag /></View>
        </View>
        <View style={s.body}>
          <NameLine name={group.name} time={group.unread ? 'now' : 'today'}>
            <Text style={[s.pill, { backgroundColor: c.chip, color: c.muted }]}>{group.members.length + 1}</Text>
          </NameLine>
          <PreviewLine text={text} unread={group.unread > 0} badge={group.unread} />
        </View>
      </Pressy>
      <RowLine />
    </View>
  );
});

// ---------------------------------------------------------------- official rows
export const OfficialRow = memo(function OfficialRow({ kind, preview, unread, muted, onOpen }: { kind: 'lounge' | 'team'; preview: string; unread: number; muted: boolean; onOpen: () => void }) {
  const c = useColors();
  const t = useT();
  const u = muted ? 0 : unread;
  return (
    <View>
      <Pressy scale={1} highlight="rgba(120,120,128,0.16)" style={s.row} onPress={onOpen}>
        {kind === 'lounge' ? (
          <View style={[s.offAv, { backgroundImage: BRAND_GRADIENT }]}><Icon name="mic" size={24} color="#fff" strokeWidth={2.2} /></View>
        ) : (
          <Image source={LOGO} style={s.offAv} />
        )}
        <View style={s.body}>
          <NameLine name={t(kind === 'lounge' ? 'Room alerts' : 'TalkAmigo Team')} time={kind === 'lounge' ? 'now' : 'today'}>
            <View style={[s.offb, { backgroundColor: c.tint }]}>
              <Icon name="check" size={10} color={c.tintText} strokeWidth={4} />
              <T style={[s.offbText, { color: c.tintText }]}>Official</T>
            </View>
          </NameLine>
          <PreviewLine text={t(preview)} unread={u > 0} badge={u} mutedIcon={muted} />
        </View>
      </Pressy>
      <RowLine />
    </View>
  );
});

// ---------------------------------------------------------------- requests
export function RequestsSummaryRow({ count, onOpen }: { count: number; onOpen: () => void }) {
  const c = useColors();
  return (
    <View>
      <Pressy scale={1} highlight="rgba(120,120,128,0.16)" style={s.row} onPress={onOpen}>
        <View style={[s.offAv, { backgroundColor: c.chip }]}><Icon name="user" size={22} color={c.tintText} /></View>
        <View style={s.body}>
          <T style={[s.name, { color: c.ink }]}>Message requests</T>
          <View style={s.msgLine}>
            <T style={[s.msg, { color: c.muted }]} numberOfLines={1}>{count === 1 ? '1 person wants to practise with you' : `${count} people want to practise with you`}</T>
            <Badge n={count} />
          </View>
        </View>
      </Pressy>
      <RowLine />
    </View>
  );
}

export function RequestRow({ id, text, onAccept, onDecline }: { id: string; text: string; onAccept: () => void; onDecline: () => void }) {
  const c = useColors();
  const t = useT();
  const p = getPerson(id);
  if (!p) return null;
  return (
    <View>
      <View style={s.row}>
        <Avatar id={id} size={52} />
        <View style={s.body}>
          <Text style={[s.name, { color: c.ink }]}>{p.name}</Text>
          <Text style={[s.msg, { color: c.muted }]} numberOfLines={1}>“{text}”</Text>
        </View>
        <Pressy onPress={onAccept} style={[s.accept, { backgroundImage: BRAND_GRADIENT }]}>
          <T style={s.acceptText}>Accept</T>
        </Pressy>
        <Pressy onPress={onDecline} scale={0.9} style={[s.decline, { backgroundColor: c.card, borderColor: c.line }]} accessibilityLabel={t('Decline')}>
          <Icon name="close" size={18} color={c.ink} />
        </Pressy>
      </View>
      <RowLine />
    </View>
  );
}

// ---------------------------------------------------------------- teacher banner (v101)
export function TeacherBanner({ id, preview, more, onOpen }: { id: string; preview: string; more: number; onOpen: () => void }) {
  const c = useColors();
  const p = getPerson(id);
  const moreText = `+${more} more from your teachers`; // i18n-ignore: pattern "tbmore"
  if (!p) return null;
  return (
    <Pressy scale={0.98} onPress={onOpen} style={s.tban}>
      <Avatar id={id} size={42} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <T style={s.tbk}>From your teacher · now</T>
        <Text style={[s.tbt, { color: c.ink }]} numberOfLines={2}>
          <Text style={{ fontWeight: '800' }}>{p.name}</Text>: {preview}
        </Text>
        {more > 0 ? <T style={[s.tbk, { textTransform: 'none', fontWeight: '700' }]}>{moreText}</T> : null}
      </View>
      <View style={s.tbo}><T style={s.tboText}>Open</T></View>
    </Pressy>
  );
}

const s = StyleSheet.create({
  swRow: { overflow: 'hidden' },
  actions: { position: 'absolute', top: 0, bottom: 0, flexDirection: 'row' },
  act: { width: 82, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 20 },
  body: { flex: 1, minWidth: 0, gap: 3 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  name: { fontWeight: '800', fontSize: 16, flexShrink: 1 },
  time: { fontSize: 12, fontWeight: '600' },
  msgLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  msg: { flex: 1, fontSize: 14 },
  pill: { fontSize: 11.5, fontWeight: '800', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden' },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 7, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  line: { position: 'absolute', bottom: 0, start: 86, end: 0, height: 1 },
  offAv: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  offb: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 999 },
  offbText: { fontSize: 10.5, fontWeight: '800' },
  accept: { height: 36, paddingHorizontal: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  acceptText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  decline: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tban: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 6, marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(224,16,31,0.45)', backgroundImage: 'linear-gradient(135deg, rgba(224,16,31,0.26), rgba(224,16,31,0.08))',
  },
  tbk: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.2, color: '#FF3B47', textTransform: 'uppercase' },
  tbt: { fontSize: 14.5, fontWeight: '600', lineHeight: 19 },
  tbo: { backgroundColor: '#E0101F', borderRadius: 99, paddingVertical: 7, paddingHorizontal: 13 },
  tboText: { color: '#fff', fontWeight: '800', fontSize: 13.5 },
});
