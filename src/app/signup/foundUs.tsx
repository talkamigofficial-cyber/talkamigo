/**
 * Sign-up step 4 of 9 — "How did you find TalkAmigo?" (v88, prototype SRC_OPTS / 'ob-src').
 * One tap, optional: the button says Skip until something is picked. Tapping the chosen one again
 * un-picks it. Only used for the admin site's sign-up record (country, age group, how they found us);
 * never the name or birthday.
 */
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../../state/store';
import { useT } from '../../i18n';
import { Icon } from '../../components/Icon';
import { SignupFrame } from '../../components/signup/SignupFrame';
import { RedChip } from '../../components/signup/RedPieces';
import { goNext } from '../../components/signup/flow';

const OPTIONS: [string, string][] = [
  ['tiktok', 'TikTok'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['friend', 'A friend'],
  ['appstore', 'App Store / Google Play'], ['google', 'Google search'], ['school', 'School or teacher'], ['other', 'Other'],
];
const BRANDS = new Set(['tiktok', 'instagram', 'youtube']); // brand names are never translated

export default function FoundUsStep() {
  const t = useT();
  const found = useApp((s) => s.me.foundVia);
  const update = useApp((s) => s.updateMe);

  return (
    <SignupFrame step="foundUs" title="How did you find TalkAmigo?" sub="One tap. It helps us reach more people like you." reason="" button={found ? 'Continue' : 'Skip'} onNext={() => goNext('foundUs')}>
      <View style={styles.chips}>
        {OPTIONS.map(([key, label]) => (
          <RedChip key={key} label={label} raw={BRANDS.has(key)} on={found === key} onPress={() => update({ foundVia: found === key ? null : key })} />
        ))}
      </View>
      <View style={styles.privacy}>
        <Icon name="lock" size={13} color="rgba(255,255,255,0.82)" />
        <Text style={styles.privacyText}>{t('Only used to improve TalkAmigo. Never sold. Your name and birthday are never shared.')}</Text>
      </View>
    </SignupFrame>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  privacy: { flexDirection: 'row', gap: 4, alignItems: 'flex-start' },
  privacyText: { flex: 1, fontSize: 12.5, lineHeight: 18, color: 'rgba(255,255,255,0.82)' },
});
