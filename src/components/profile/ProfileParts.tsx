/**
 * Pieces of someone's profile page: the numbers row, the Flicks grid and the ••• menu.
 * "Top supporters" (gifts), Share, Block and Report come back when their feature is built
 * (gifts slice 9; block and report slice 2) — NEXT_STEPS §4: hide what isn't built.
 */
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Pressy } from '../Pressy';
import { Sheet } from '../Sheet';
import { T } from '../T';
import { toast } from '../Toast';
import { useLang } from '../../i18n';
import { useColors } from '../../theme/colors';
import { getPerson } from '../../data/people';
import { useChatState } from '../chats/chatState';
import { cssBackground, formatCount } from './helpers';

/** "5 Flicks · 2.3k Followers · 201 Following" */
export function Stat({ value, label }: { value: string; label: string }) {
  const c = useColors();
  return (
    <View style={s.stat}>
      <Text style={[s.statValue, { color: c.ink }]}>{value}</Text>
      <T style={[s.statLabel, { color: c.muted }]} numberOfLines={1}>{label}</T>
    </View>
  );
}

export type GridItem = { id: string; bg: string; photo?: string; text?: string; likes: number };

/** 3-column grid of Flick tiles (likes bottom-left). Tiles open full screen once the Flick viewer exists (slice 5). */
export function FlickGrid({ items }: { items: GridItem[] }) {
  const lang = useLang();
  return (
    <View style={s.grid}>
      {items.map((m) => (
        <View key={m.id} style={s.cell}>
        <View style={[s.tile, cssBackground(m.bg)]}>
          {m.photo ? <Text style={{ fontSize: 44 }}>{m.photo}</Text> : <Text style={s.tileText} numberOfLines={4}>{m.text}</Text>}
          <View style={s.likes}>
            <Icon name="heart" size={13} color="#fff" fill="#fff" />
            <Text style={s.likesText}>{formatCount(m.likes, lang)}</Text>
          </View>
        </View>
        </View>
      ))}
    </View>
  );
}

/** The ••• menu on someone's profile: close friends and mute (both kept on this phone until slice 2). */
export function UserMenu({ id, visible, onClose }: { id: string; visible: boolean; onClose: () => void }) {
  const c = useColors();
  const name = getPerson(id)?.name ?? '';
  const { closeFriends, mutedPeople, toggleClose, togglePersonMute } = useChatState();
  const rows: { label: string; danger?: boolean; run: () => void }[] = [
    { label: closeFriends[id] ? 'Remove from close friends' : 'Add to close friends', run: () => { toast(closeFriends[id] ? `${name} removed from close friends` : `${name} added to close friends ⭐`); toggleClose(id); } },
    { label: mutedPeople[id] ? `Unmute ${name}` : `Mute ${name}`, run: () => { toast(mutedPeople[id] ? `${name} is unmuted` : `${name} is muted`, { icon: 'mute' }); togglePersonMute(id); } },
  ];
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={s.menuHead}>
        <Avatar id={id} size={44} />
        <Text style={[s.menuTitle, { color: c.ink }]}>{name}</Text>
      </View>
      <View>
        {rows.map((r) => (
          <Pressy key={r.label} scale={1} highlight="rgba(120,120,128,0.16)" style={[s.menuRow, { borderTopColor: c.line }]} onPress={() => { onClose(); r.run(); }}>
            <T style={[s.menuText, { color: r.danger ? c.tintText : c.ink }]}>{r.label}</T>
          </Pressy>
        ))}
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  stat: { flex: 1, minWidth: 0, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12, letterSpacing: -0.1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  cell: { width: '32.9%' },
  tile: { aspectRatio: 3 / 4, alignItems: 'center', justifyContent: 'center', padding: 8, overflow: 'hidden' },
  tileText: { color: '#fff', fontSize: 11.5, fontWeight: '700', lineHeight: 14, alignSelf: 'stretch' },
  likes: { position: 'absolute', start: 7, bottom: 5, flexDirection: 'row', alignItems: 'center', gap: 3 },
  likesText: { color: '#fff', fontSize: 10.5, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 3 },
  menuHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -6 },
  menuTitle: { fontSize: 21, fontWeight: '700' },
  menuRow: { minHeight: 58, justifyContent: 'center', paddingHorizontal: 16, borderTopWidth: 1 },
  menuText: { fontSize: 16, fontWeight: '600' },
});
