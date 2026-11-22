/**
 * Settings → App language: "Phone default" (shows the phone's language with 📱) + the 8 languages,
 * each written in its own language. The whole app switches immediately; Arabic flips right-to-left
 * (rule 31 Oct 2026: "Changes apply straight away").
 */
import { ScrollView } from 'react-native';
import { useApp } from '../../state/store';
import { LANG_NAME, phoneLang } from '../../i18n';
import { useColors } from '../../theme/colors';
import { Screen, TopBar } from '../../components/Screen';
import { Icon } from '../../components/Icon';
import { T } from '../../components/T';
import { Group, Row } from '../../components/settings/SettingsList';

// Same order as the prototype's language page
const CHOICES = ['English', 'Français', 'Español', '日本語', 'Português', 'Deutsch', 'Italiano', 'العربية'];

export default function AppLanguage() {
  const c = useColors();
  const choice = useApp((s) => s.appLangChoice);
  const tick = <Icon name="check" size={20} color={c.brand} strokeWidth={3} />;
  const pick = (v: string) => useApp.getState().setAppLang(v);

  return (
    <Screen>
      <TopBar title="App language" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, gap: 12 }}>
        <Group>
          <Row raw label={`📱 ${LANG_NAME[phoneLang()]}`} sub="Phone default" onPress={() => pick('Phone default')} right={choice === 'Phone default' ? tick : <></>} />
          {CHOICES.map((l) => (
            <Row key={l} raw label={l} onPress={() => pick(l)} right={choice === l ? tick : <></>} />
          ))}
        </Group>
        <T style={{ fontSize: 12.5, color: c.muted }}>By default TalkAmigo uses your phone’s language. Changes apply straight away.</T>
      </ScrollView>
    </Screen>
  );
}
