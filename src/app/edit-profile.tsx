/**
 * Edit profile (prototype vEditP, decided 2 Nov 2026): cover photo you can change, big photo with a
 * camera button, a completion ring, then About me · Languages · Interests · Personal info · Other,
 * and a Preview button pinned at the bottom.
 * The top bar is see-through over the cover and turns solid once you scroll past it (so the title
 * never overlaps the content). Rows with nothing filled in show a small red dot.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../state/store';
import { countryName, langName, useT } from '../i18n';
import { useColors } from '../theme/colors';
import { Avatar, Flag } from '../components/Avatar';
import { Icon, type IconName } from '../components/Icon';
import { Pressy } from '../components/Pressy';
import { Button } from '../components/Button';
import { T } from '../components/T';
import { comingSoon } from '../components/Toast';
import { COVERS, useProfileExtras } from '../components/me/profileExtras';
import { EditFieldSheet, type EditField } from '../components/me/EditFieldSheet';
import { PhotoSheet } from '../components/me/PhotoSheet';
import { LEVELS, ageOf } from '../components/me/helpers';

const COVER_H = 210;

export default function EditProfile() {
  const c = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const me = useApp((s) => s.me);
  const extras = useProfileExtras();
  const [editing, setEditing] = useState<EditField | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  // completion: photo, introduction, hobbies, places, MBTI, hometown, job, school, gender, intro video (prototype strength2())
  const filled = [me.photo, me.bio, me.interests.length, extras.places, extras.mbti, extras.home, extras.job, extras.school, extras.gender, me.video];
  const pc = Math.round((filled.filter(Boolean).length / filled.length) * 100);
  const age = ageOf(me.bday);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        onScroll={(e) => setSolid(e.nativeEvent.contentOffset.y > COVER_H - 70)}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
        {/* cover */}
        <View style={[styles.cover, { height: COVER_H + insets.top, backgroundImage: COVERS[extras.cover % COVERS.length] }]}>
          <View style={styles.dots}>
            {COVERS.map((_, k) => <View key={k} style={[styles.dot, { backgroundColor: k === extras.cover % COVERS.length ? '#fff' : 'rgba(255,255,255,0.4)' }]} />)}
          </View>
          <Pressy onPress={() => extras.set({ cover: (extras.cover + 1) % COVERS.length })} scale={0.9} style={styles.coverBtn} accessibilityLabel="Change cover photo">
            <Icon name="cover" size={20} color="#fff" />
          </Pressy>
        </View>

        {/* photo */}
        <View style={styles.avatarRow}>
          <View style={[styles.avatarRing, { borderColor: c.bg }]}><Avatar id="me" size={112} /></View>
          <Pressy onPress={() => setPhotoOpen(true)} scale={0.9} style={[styles.camera, { borderColor: c.bg }]} accessibilityLabel="Change photo">
            <Icon name="camera" size={17} color="#fff" strokeWidth={2.2} />
          </Pressy>
        </View>

        <View style={styles.body}>
          <View style={[styles.complete, { backgroundColor: c.tint }]}>
            <Ring percent={pc} track={c.tint} />
            <View style={{ flex: 1 }}>
              <T style={{ fontSize: 16, fontWeight: '800', color: c.tintText }}>Complete your profile</T>
              <T style={{ fontSize: 13, color: c.muted }}>Reach 100% to be seen by more partners</T>
            </View>
          </View>

          <T style={styles.h3}>About me</T>
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <T style={[styles.small, { color: c.muted }]}>Name</T>
                <T raw style={styles.value}>{me.name}</T>
              </View>
              <Pressy onPress={() => setEditing('name')} scale={0.94}><T style={{ color: c.tintText, fontWeight: '800', fontSize: 15 }}>Edit</T></Pressy>
            </View>
            <FieldRow label="Introduction" value={me.bio} empty="Tell people about yourself" onPress={() => setEditing('bio')} />
          </Card>

          <T style={styles.h3}>Languages</T>
          <Card>
            {me.natives.map((n, k) => (
              <Pressy key={n} onPress={() => router.push('/my-languages')} scale={1} highlight="rgba(120,120,128,0.16)" style={styles.row}>
                <View style={{ flex: 1 }}>
                  <T style={[styles.small, { color: c.muted }]}>{me.natives.length > 1 ? `Native ${k + 1}` : 'Native'}</T>
                  <Text style={[styles.value, { color: c.ink }]}>{langName(n, t.lang)}</Text>
                  <View style={styles.greenBar} />
                </View>
                <Icon name="chev" size={17} color={c.muted} strokeWidth={2.4} />
              </Pressy>
            ))}
            {me.langs.map((l, k) => {
              const n = LEVELS.indexOf((me.levels[l] ?? 'A1') as (typeof LEVELS)[number]) + 1;
              return (
                <Pressy key={l} onPress={() => router.push('/my-languages')} scale={1} highlight="rgba(120,120,128,0.16)" style={styles.row}>
                  <Text style={{ color: c.muted, fontSize: 20, width: 18 }}>≡</Text>
                  <View style={{ flex: 1 }}>
                    <T style={[styles.small, { color: c.muted }]}>{`Learning ${k + 1}`}</T>
                    <Text style={[styles.value, { color: c.ink }]}>{langName(l, t.lang)}</Text>
                    <View style={{ flexDirection: 'row', gap: 3, marginTop: 5 }}>
                      {LEVELS.map((_, j) => <View key={j} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: j < n ? c.brand : c.line }} />)}
                    </View>
                  </View>
                  <Icon name="chev" size={17} color={c.muted} strokeWidth={2.4} />
                </Pressy>
              );
            })}
            <Pressy onPress={() => router.push('/my-languages')} scale={1} highlight="rgba(120,120,128,0.16)" style={[styles.row, { justifyContent: 'center' }]}>
              <T style={{ fontWeight: '800', fontSize: 16 }}>+ Add a language</T>
            </Pressy>
          </Card>

          <T style={styles.h3}>Interests</T>
          <Card>
            <IconRow icon="music" label="Hobbies" value={me.interests.map((x) => t(x)).join(', ')} onPress={() => setEditing('interests')} />
            <IconRow icon="globe" label="Places I want to go" value={extras.places} onPress={() => setEditing('places')} />
          </Card>

          <T style={styles.h3}>Personal info</T>
          <Card>
            <IconRow icon="smile" label="My MBTI" value={extras.mbti} onPress={() => setEditing('mbti')} />
            <IconRow icon="spark" label="My zodiac sign" value={extras.zodiac && t(extras.zodiac)} onPress={() => setEditing('zodiac')} />
            <IconRow icon="home" label="Hometown" value={extras.home} onPress={() => setEditing('home')} />
            <IconRow icon="bag" label="Job" value={extras.job} onPress={() => setEditing('job')} />
            <IconRow icon="book" label="School" value={extras.school} onPress={() => setEditing('school')} />
          </Card>

          <T style={styles.h3}>Other</T>
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <T style={[styles.small, { color: c.muted }]}>TalkAmigo ID</T>
                <Text style={[styles.value, { color: c.ink }]}>@{me.handle}</Text>
              </View>
              <Pressy onPress={comingSoon} scale={0.94}><T style={{ color: c.tintText, fontWeight: '800', fontSize: 15 }}>Edit</T></Pressy>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <T style={[styles.small, { color: c.muted }]}>Country</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Flag cc={me.cc} size={16} />
                  <Text style={[styles.value, { color: c.ink }]}>{countryName(me.cc, t.lang)}</Text>
                </View>
              </View>
            </View>
            <FieldRow label="Gender" value={extras.gender && t(extras.gender)} empty="Add (used for search filters)" onPress={() => setEditing('gender')} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <T style={[styles.small, { color: c.muted }]}>Age</T>
                <Text style={[styles.value, { color: c.ink }]}>{age ?? '—'}</Text>
              </View>
              <T style={{ fontSize: 12, color: c.muted }}>From your birthday</T>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* top bar: see-through over the cover, solid after scrolling */}
      <View style={[styles.head, { paddingTop: insets.top + 6 }, solid && { backgroundColor: c.bg, borderBottomWidth: 1, borderBottomColor: c.line }]}>
        <Pressy onPress={() => router.back()} scale={0.9} style={styles.back} accessibilityLabel="Back">
          <Icon name="back" size={24} color={solid ? c.ink : '#fff'} strokeWidth={2.4} />
        </Pressy>
        <T style={{ fontSize: 17, fontWeight: '800', color: solid ? c.ink : '#fff' }}>Edit profile</T>
        <View style={{ width: 40 }} />
      </View>

      {/* Preview pinned at the bottom */}
      <View style={[styles.preview, { paddingBottom: Math.max(insets.bottom, 16) + 10, backgroundImage: `linear-gradient(transparent, ${c.bg} 30%)` }]}>
        <Button title="Preview" icon="eye2" onPress={comingSoon} />
      </View>

      <EditFieldSheet field={editing} onClose={() => setEditing(null)} />
      <PhotoSheet visible={photoOpen} onClose={() => setPhotoOpen(false)} />
    </View>
  );
}

/** A grey rounded box holding rows, with thin lines between them. */
function Card({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const rows = (Array.isArray(children) ? children.flat() : [children]).filter(Boolean);
  return (
    <View style={[styles.card, { backgroundColor: c.chip }]}>
      {rows.map((r, i) => (
        <View key={i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: c.line } : null}>{r}</View>
      ))}
    </View>
  );
}

/** Label on top, value under it (or a grey hint + red dot when empty), chevron. */
function FieldRow({ label, value, empty, onPress }: { label: string; value?: string; empty: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressy onPress={onPress} scale={1} highlight="rgba(120,120,128,0.16)" style={styles.row}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T style={[styles.small, { color: c.muted }]}>{label}</T>
        {value ? <T raw style={styles.value}>{value}</T> : <T style={[styles.value, { color: c.muted }]}>{empty}</T>}
      </View>
      {!value && <View style={styles.redDot} />}
      <Icon name="chev" size={17} color={c.muted} strokeWidth={2.4} />
    </Pressy>
  );
}

/** Row with a grey icon square; when empty the label itself is the grey hint. */
function IconRow({ icon, label, value, onPress }: { icon: IconName; label: string; value?: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressy onPress={onPress} scale={1} highlight="rgba(120,120,128,0.16)" style={styles.row}>
      <View style={styles.iconBox}><Icon name={icon} size={19} color={c.ink} strokeWidth={2.2} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        {value ? (
          <>
            <T style={[styles.small, { color: c.muted }]}>{label}</T>
            <T raw style={styles.value}>{value}</T>
          </>
        ) : (
          <T style={[styles.value, { color: c.muted }]}>{label}</T>
        )}
      </View>
      {!value && <View style={styles.redDot} />}
      <Icon name="chev" size={17} color={c.muted} strokeWidth={2.4} />
    </Pressy>
  );
}

/** Round progress ring with the percentage in the middle. */
function Ring({ percent, track }: { percent: number; track: string }) {
  const c = useColors();
  const r = 28, len = 2 * Math.PI * r;
  return (
    <View style={{ width: 62, height: 62, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={62} height={62} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={31} cy={31} r={r} stroke="rgba(224,16,31,0.15)" strokeWidth={6} fill={track} />
        <Circle cx={31} cy={31} r={r} stroke={c.brand} strokeWidth={6} fill="none" strokeDasharray={`${(len * percent) / 100} ${len}`} />
      </Svg>
      <Text style={{ color: c.tintText, fontSize: 16, fontWeight: '800' }}>{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { position: 'relative' },
  dots: { position: 'absolute', start: 16, bottom: 16, flexDirection: 'row', gap: 6 },
  dot: { width: 22, height: 4, borderRadius: 2 },
  coverBtn: { position: 'absolute', end: 14, bottom: 14, width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarRow: { alignItems: 'center', marginTop: -56 },
  avatarRing: { borderWidth: 4, borderRadius: 64 },
  camera: { position: 'absolute', start: '50%', marginStart: 28, bottom: 4, width: 36, height: 36, borderRadius: 18, borderWidth: 3, backgroundColor: '#E0101F', alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, gap: 12, paddingTop: 12 },
  complete: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20 },
  h3: { fontSize: 18, fontWeight: '700', marginTop: 8, marginHorizontal: 2 },
  card: { borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 58 },
  small: { fontSize: 12.5, marginBottom: 2 },
  value: { fontSize: 16 },
  greenBar: { width: 26, height: 3, borderRadius: 2, backgroundColor: '#16A34A', marginTop: 5 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0101F' },
  iconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(127,127,140,0.16)', alignItems: 'center', justifyContent: 'center' },
  head: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 8 },
  back: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  preview: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, paddingHorizontal: 16 },
});
