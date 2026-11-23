/**
 * Pop-up sheets used by Welcome and the log-in / sign-up entry screens (prototype renderSheet):
 *   - AppLanguageSheet  ('applang')   the 🌐 button on Welcome
 *   - DialSheet         ('dial')      country code picker for the phone number
 *   - TroubleSheet      ('trouble')   "Trouble logging in?"
 *   - LegalSheet        ('legal')     Terms of Use / Privacy Policy summaries
 */
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Sheet } from '../Sheet';
import { Pressy } from '../Pressy';
import { Icon, type IconName } from '../Icon';
import { Button } from '../Button';
import { emojiFlag } from '../Avatar';
import { LANG_NAME, countryName, phoneLang, useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import lists from '../../data/generated/lists.json';

const DIAL = lists.dialCodes as Record<string, string>;

// ---------------------------------------------------------------- App language

/** Choices in the order of the prototype. 'Phone default' shows the phone's own language with 📱. */
const CHOICES = ['Phone default', 'English', 'Français', 'Español', 'Português', 'Deutsch', 'Italiano', '日本語', 'العربية'];

type LangProps = { visible: boolean; onClose: () => void; current: string; onPick: (choice: string) => void; showNote: boolean };

export function AppLanguageSheet({ visible, onClose, current, onPick, showNote }: LangProps) {
  const c = useColors();
  const t = useT();
  return (
    <Sheet visible={visible} onClose={onClose} title="App language">
      {/* v57: sign-up always follows the phone; this choice applies after sign-up */}
      {showNote ? <Text style={[styles.note, { color: c.muted }]}>{t('Sign-up stays in your phone’s language so you understand every step. After that, TalkAmigo uses the language you pick here. You can change it any time in Settings.')}</Text> : null}
      <View style={[styles.group, { backgroundColor: c.card, borderColor: c.line }]}>
        {CHOICES.map((v, i) => (
          <Pressy key={v} onPress={() => onPick(v)} scale={1} highlight={c.chip} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]} accessibilityState={{ selected: current === v }}>
            <View style={{ flex: 1 }}>
              {/* language names are written in their own language and never translated */}
              <Text style={[styles.rowText, { color: c.ink }]}>{v === 'Phone default' ? '📱 ' + LANG_NAME[phoneLang()] : v}</Text>
              {v === 'Phone default' ? <Text style={[styles.small, { color: c.muted }]}>{t('Phone default')}</Text> : null}
            </View>
            {current === v ? <Icon name="check" size={20} color={c.brand} strokeWidth={3} /> : null}
          </Pressy>
        ))}
      </View>
    </Sheet>
  );
}

// ---------------------------------------------------------------- Country code

export function DialSheet({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (cc: string) => void }) {
  const c = useColors();
  const t = useT();
  const [q, setQ] = useState('');
  // every country we have a code for, A–Z in the app language; search by name or by "+33"
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return Object.keys(DIAL)
      .map((cc) => ({ cc, name: countryName(cc, t.lang) }))
      .sort((a, b) => a.name.localeCompare(b.name, t.lang))
      .filter(({ cc, name }) => !query || name.toLowerCase().includes(query) || DIAL[cc].startsWith(query.replace('+', '')));
  }, [q, t.lang]);

  return (
    <Sheet visible={visible} onClose={() => { setQ(''); onClose(); }} title="Country code" scroll={false}>
      <View style={[styles.search, { backgroundColor: c.chip }]}>
        <Icon name="search" size={19} color={c.muted} />
        <TextInput value={q} onChangeText={setQ} placeholder={t('Search country or code')} placeholderTextColor={c.muted} style={[styles.searchInput, { color: c.ink }]} autoCorrect={false} />
      </View>
      <ScrollView style={[styles.group, { backgroundColor: c.card, borderColor: c.line, maxHeight: 420 }]} keyboardShouldPersistTaps="handled">
        {list.length ? list.map(({ cc, name }, i) => (
          <Pressy key={cc} onPress={() => { setQ(''); onPick(cc); }} scale={1} highlight={c.chip} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.line }]}>
            <Text style={{ fontSize: 22 }}>{emojiFlag(cc)}</Text>
            <Text style={[styles.rowText, { flex: 1, color: c.ink }]}>{name}</Text>
            <Text style={[styles.value, { color: c.muted }]}>+{DIAL[cc]}</Text>
          </Pressy>
        )) : <View style={styles.row}><Text style={{ color: c.muted }}>{t('No match')}</Text></View>}
      </ScrollView>
    </Sheet>
  );
}

// ---------------------------------------------------------------- Trouble logging in?

/** A row with a grey icon tile, a bold title and a small grey line (prototype ".pick"). */
function PickRow({ icon, title, sub, onPress }: { icon: IconName; title: string; sub: string; onPress?: () => void }) {
  const c = useColors();
  const t = useT();
  const inner = (
    <>
      <View style={[styles.pickIcon, { backgroundColor: c.chip }]}><Icon name={icon} size={22} color={c.ink} strokeWidth={1.9} /></View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.pickTitle, { color: c.ink }]}>{t(title)}</Text>
        <Text style={[styles.pickSub, { color: c.muted }]}>{t(sub)}</Text>
      </View>
    </>
  );
  // a row without an action is plain text, not a button (no dead buttons)
  if (!onPress) return <View style={styles.pick}>{inner}</View>;
  return <Pressy onPress={onPress} scale={1} highlight={c.chip} style={styles.pick}>{inner}</Pressy>;
}

export function TroubleSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  // help text only: the support desk comes with the server, so there is no "Contact support" row yet
  const rows: [IconName, string, string][] = [
    ['user', 'Try the way you signed up', 'Look for the “Last used” tag. Google, Apple and phone are separate logins.'],
    ['phone', 'New phone number?', 'Log in with Google or Apple if you added it, or contact support to move your account.'],
  ];
  return (
    <Sheet visible={visible} onClose={onClose} title="Trouble logging in?">
      <View style={[styles.group, { backgroundColor: c.card, borderColor: c.line }]}>
        {rows.map(([icon, a, b], i) => (
          <View key={a} style={i > 0 ? { borderTopWidth: 1, borderTopColor: c.line } : null}>
            <PickRow icon={icon} title={a} sub={b} />
          </View>
        ))}
      </View>
    </Sheet>
  );
}

// ---------------------------------------------------------------- Terms / Privacy

const LEGAL: Record<'terms' | 'privacy', [string, [string, string][]]> = {
  terms: ['Terms of Use', [
    ['Who can use TalkAmigo', 'Adults 18 and over. One account per person and per phone number.'],
    ['Zero tolerance', 'No objectionable content and no abusive users: no nudity, sexual content, hate, harassment, threats, scams or content involving minors. We remove it and ban accounts that break this rule.'],
    ['Your content', 'You own what you post. You let us show it inside TalkAmigo so others can see it. You can delete it any time.'],
    ['Coins, Diamonds and gifts', 'Coins have no cash value and never expire. Gifts become Diamonds for the receiver. Cash-out rules are in Gift & cash-out rules.'],
    ['Subscriptions', 'Plus renews automatically through your Apple ID until you cancel. Infinity is a one-time purchase.'],
    ['Reporting and appeals', 'Report anything from the ••• menu. If we act on your content, we tell you why and you can appeal.'],
  ]],
  privacy: ['Privacy Policy', [
    ['What we collect', 'Your profile, your languages, what you post and send, and your purchases. Your phone number is never shown.'],
    ['Location', 'Only the city you type. We never use GPS.'],
    ['AI partners', 'When you allow AI helpers, the text or audio you choose is sent to our translation and speech-to-text partners. It’s never used to train AI or sold.'],
    ['Analytics', 'Crash reports and app usage, without advertising tracking.'],
    ['Your rights', 'Download your data, correct it or delete your account any time in Settings → Account. EU/UK data rules apply.'],
    ['Contact', 'privacy@talkamigo.app'],
  ]],
};

export function LegalSheet({ which, onClose }: { which: 'terms' | 'privacy' | null; onClose: () => void }) {
  const c = useColors();
  const t = useT();
  const doc = which ? LEGAL[which] : null;
  return (
    <Sheet visible={!!doc} onClose={onClose} title={doc?.[0]}>
      {doc ? <Paragraphs rows={doc[1]} /> : null}
      <Text style={[styles.fine, { color: c.muted }]}>{t('Summary for the beta. The full text is published on talkamigo.app.')}</Text>
    </Sheet>
  );
}

/** Bold heading + grey text pairs (prototype ".legal"). */
function Paragraphs({ rows }: { rows: [string, string][] }) {
  const c = useColors();
  const t = useT();
  return (
    <View style={{ gap: 10 }}>
      {rows.map(([a, b]) => (
        <View key={a}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.ink }}>{t(a)}</Text>
          <Text style={{ fontSize: 14, lineHeight: 21, color: c.muted }}>{t(b)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13.5, lineHeight: 20 },
  group: { borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8, paddingHorizontal: 16 },
  rowText: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: 12 },
  value: { fontSize: 14, fontWeight: '600' },
  search: { height: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontSize: 16, height: 50 },
  pick: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  pickIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pickTitle: { fontSize: 15, fontWeight: '700' },
  pickSub: { fontSize: 12.5, lineHeight: 17 },
  fine: { fontSize: 11.5, lineHeight: 17, textAlign: 'center' },
});
