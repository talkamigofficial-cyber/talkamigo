/**
 * TalkAmigo Team (prototype official account): news, tips and offers from us.
 *
 * It stays as a place in Chats, empty until the team sends something real (NEXT_STEPS §3).
 * Messages will be written on the admin site (later slice).
 */
import { ScrollView } from 'react-native';
import { Screen, TopBar } from '../components/Screen';
import { EmptyState } from '../components/EmptyState';

export default function TeamScreen() {
  return (
    <Screen>
      <TopBar title="TalkAmigo Team" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 60 }}>
        <EmptyState icon="bell" title="Nothing yet" text="News, tips and offers from TalkAmigo will show up here." />
      </ScrollView>
    </Screen>
  );
}
