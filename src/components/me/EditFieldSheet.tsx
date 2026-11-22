/**
 * The sheet that edits one field of Edit profile (prototype sheet "ed:<field>"):
 *   - text fields (Name, Introduction, Places, Hometown, Job, School): a box + Save
 *   - choice fields (MBTI, zodiac, Gender, Hobbies): chips; Hobbies allows several, then Done
 * What you type stays in the box even if the screen redraws (v55): the text lives in this sheet's own state.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Sheet } from '../Sheet';
import { Button } from '../Button';
import { Pressy } from '../Pressy';
import { T } from '../T';
import { toast } from '../Toast';
import { useProfileExtras, type ProfileExtras } from './profileExtras';

export type EditField = 'name' | 'bio' | 'places' | 'home' | 'job' | 'school' | 'mbti' | 'zodiac' | 'gender' | 'interests';

const LABEL: Record<EditField, string> = {
  name: 'Name', bio: 'Introduction', places: 'Places I want to go', home: 'Hometown', job: 'Job', school: 'School',
  mbti: 'My MBTI', zodiac: 'My zodiac sign', gender: 'Gender', interests: 'Hobbies',
};

const CHOICES: Partial<Record<EditField, string[]>> = {
  mbti: ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'],
  zodiac: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  gender: ['Woman', 'Man', 'Non-binary', 'Prefer not to say'],
  interests: ['Music', 'Travel', 'Food', 'Football', 'Anime', 'Films', 'Books', 'Gaming', 'Fashion', 'Art', 'Tech', 'Fitness', 'Cooking', 'Photography'],
};

/** Current value of a field, from the main profile (name, bio, interests) or the extras. */
export function useFieldValue(field: EditField): string {
  const me = useApp((s) => s.me);
  const extras = useProfileExtras();
  if (field === 'name') return me.name;
  if (field === 'bio') return me.bio;
  if (field === 'interests') return me.interests.join(', ');
  return extras[field as keyof ProfileExtras] as string;
}

function save(field: EditField, value: string) {
  if (field === 'name' || field === 'bio') useApp.getState().updateMe({ [field]: value });
  else useProfileExtras.getState().set({ [field]: value } as Partial<ProfileExtras>);
}

export function EditFieldSheet({ field, onClose }: { field: EditField | null; onClose: () => void }) {
  const c = useColors();
  const t = useT();
  const current = useFieldValue(field ?? 'name');
  const me = useApp((s) => s.me);
  const [text, setText] = useState('');
  useEffect(() => { if (field) setText(field === 'interests' ? '' : current); }, [field]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!field) return null;
  const choices = CHOICES[field];

  const pick = (o: string) => {
    if (field === 'interests') {
      const has = me.interests.includes(o);
      useApp.getState().updateMe({ interests: has ? me.interests.filter((x) => x !== o) : [...me.interests, o] });
    } else {
      save(field, o);
    }
  };
  const isOn = (o: string) => (field === 'interests' ? me.interests.includes(o) : current === o);

  const saveText = () => {
    if (field === 'name' && !text.trim()) { toast('Your name can’t be empty', { icon: 'alert' }); return; }
    save(field, text.trim());
    onClose();
    toast('Saved', { icon: 'check' });
  };

  return (
    <Sheet visible onClose={onClose} title={LABEL[field]}>
      {choices ? (
        <>
          <View style={styles.chips}>
            {choices.map((o) => (
              <Pressy key={o} onPress={() => pick(o)} scale={0.94} style={[styles.chip, isOn(o) ? { backgroundColor: c.ink, borderColor: 'transparent' } : { backgroundColor: c.card, borderColor: c.line }]}>
                <T style={{ fontSize: 14, fontWeight: '700', color: isOn(o) ? c.bg : c.ink }}>{o}</T>
              </Pressy>
            ))}
          </View>
          {field === 'gender' && <T style={{ fontSize: 11.5, lineHeight: 17, color: c.muted, textAlign: 'center' }}>Only used for search filters. You can choose “Prefer not to say”.</T>}
          {field === 'interests' && <Button title="Done" onPress={onClose} />}
        </>
      ) : (
        <>
          <TextInput
            value={text}
            onChangeText={setText}
            maxLength={field === 'bio' ? 200 : field === 'name' ? 30 : 60}
            multiline={field === 'bio'}
            numberOfLines={field === 'bio' ? 4 : 1}
            autoFocus
            style={[styles.input, field === 'bio' && styles.area, { backgroundColor: c.chip, color: c.ink, textAlign: t.lang === 'ar' ? 'right' : 'left' }]}
            accessibilityLabel={t(LABEL[field])}
          />
          <Button title="Save" onPress={saveText} />
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  input: { height: 48, borderRadius: 14, paddingHorizontal: 14, fontSize: 16 },
  area: { height: 110, paddingTop: 12, textAlignVertical: 'top' },
});
