/**
 * Room alerts (prototype "Room alerts" official account, redesigned in v102).
 *
 * A feed of rooms and lives opened by people you follow and your teachers. It stays as a place in Chats,
 * empty until something real happens (NEXT_STEPS §3). Real alerts arrive with rooms (slice 6).
 */
import { ScrollView } from 'react-native';
import { Screen, TopBar } from '../components/Screen';
import { EmptyState } from '../components/EmptyState';

export default function RoomAlertsScreen() {
  return (
    <Screen>
      <TopBar title="Room alerts" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 60 }}>
        <EmptyState icon="mic" title="No room alerts yet" text="When people you follow or your teachers open a room, it shows here." />
      </ScrollView>
    </Screen>
  );
}
