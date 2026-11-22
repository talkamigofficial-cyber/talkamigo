/**
 * Pieces of someone's profile page: the numbers row, "Top supporters", the Flicks grid,
 * and the ••• menu (View profile · Share profile · close friends · Mute · Block · Report).
 */
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Pressy } from '../Pressy';
import { Sheet } from '../Sheet';
import { T } from '../T';
import { comingSoon, toast } from '../Toast';
import { useLang } from '../../i18n';
import { useColors } from '../../theme/colors';
import { getPerson } from '../../data/people';
import { useChatState } from '../chats/chatState';
import { cssBackground, formatCount } from './helpers';
import { router } from 'expo-router';

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

/** Small gold coin. */
export function Coin({ size = 11 }: { size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundImage: 'radial-gradient(circle at 35% 30%, #FFF2B0, #FFC531 45%, #E08A00)' }} />;
}

// Demo supporters shown on other people's profiles (prototype SUPP.other)
const SUPPORTERS: [string, number][] = [['tunde', 800], ['lucia', 400], ['reem', 150], ['marc', 90]];
const MEDAL = ['#FFC531', '#D9DDE3', '#E7A06B'];

export function TopSupporters({ exclude }: { exclude: string }) {
  const c = useColors();
  const lang = useLang();
  const list = SUPPORTERS.filter(([id]) => id !== exclude).slice(0, 3);
  return (
    <View style={s.supp}>
      {list.map(([id, coins], i) => (
        <Pressy key={id} scale={0.92} onPress={() => router.push(`/user/${id}`)} style={s.suppOne} accessibilityLabel={getPerson(id)?.name}>
          <View>
            <Avatar id={id} size={46} noFlag />
            <View style={[s.rank, { backgroundColor: MEDAL[i], borderColor: c.bg }]}><Text style={s.rankText}>{i + 1}</Text></View>
          </View>
          <View style={s.coins}>
            <Coin />
            <Text style={[s.coinText, { color: c.ink }]}>{formatCount(coins, lang)}</Text>
          </View>
        </Pressy>
      ))}
    </View>
  );
}

export type GridItem = { id: string; bg: string; photo?: string; text?: string; likes: number };

/** 3-column grid of Flick tiles (likes bottom-left). Opening one full screen comes with the Flicks viewer. */
export function FlickGrid({ items }: { items: GridItem[] }) {
  const lang = useLang();
  return (
    <View style={s.grid}>
      {items.map((m) => (
        <View key={m.id} style={s.cell}>
        <Pressy scale={0.97} onPress={comingSoon} style={[s.tile, cssBackground(m.bg)]}>
          {m.photo ? <Text style={{ fontSize: 44 }}>{m.photo}</Text> : <Text style={s.tileText} numberOfLines={4}>{m.text}</Text>}
          <View style={s.likes}>
            <Icon name="heart" size={13} color="#fff" fill="#fff" />
            <Text style={s.likesText}>{formatCount(m.likes, lang)}</Text>
          </View>
        </Pressy>
        </View>
      ))}
    </View>
  );
}

/** The ••• menu on someone's profile. Share, Block and Report arrive with the server (next slices). */
export function UserMenu({ id, visible, onClose }: { id: string; visible: boolean; onClose: () => void }) {
  const c = useColors();
  const name = getPerson(id)?.name ?? '';
  const { closeFriends, mutedPeople, toggleClose, togglePersonMute } = useChatState();
  const rows: { label: string; danger?: boolean; run: () => void }[] = [
    { label: 'View profile', run: () => undefined },
    { label: 'Share profile', run: comingSoon },
    { label: closeFriends[id] ? 'Remove from close friends' : 'Add to close friends', run: () => { toast(closeFriends[id] ? `${name} removed from close friends` : `${name} added to close friends ⭐`); toggleClose(id); } },
    { label: mutedPeople[id] ? `Unmute ${name}` : `Mute ${name}`, run: () => { toast(mutedPeople[id] ? `${name} is unmuted` : `${name} is muted`, { icon: 'mute' }); togglePersonMute(id); } },
    { label: `Block ${name}`, danger: true, run: comingSoon },
    { label: 'Report', danger: true, run: comingSoon },
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
  supp: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  suppOne: { alignItems: 'center', gap: 4 },
  rank: { position: 'absolute', end: -3, bottom: -3, width: 19, height: 19, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 10, fontWeight: '800', color: '#1A1418' },
  coins: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  coinText: { fontSize: 11.5, fontWeight: '700' },
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
