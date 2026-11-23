/**
 * "Log out of TalkAmigo?" — explains that messages live only on this phone and are deleted when you
 * log out, while plan, coins and Diamonds stay with the account (decided 31 Oct 2026, "One phone at a time").
 * The "Keep my chats with Plus backup" button comes back when Plus chat backup exists (slice 9).
 */
import { View } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '../../state/store';
import { useColors } from '../../theme/colors';
import { Sheet } from '../Sheet';
import { T } from '../T';
import { Button } from '../Button';
import { toast } from '../Toast';

export function LogoutSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  const logOut = () => {
    onClose();
    useApp.getState().logOut();
    router.replace('/welcome');
    toast('Logged out. Messages deleted from this phone.', { icon: 'check', top: true });
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Log out of TalkAmigo?">
      <View style={{ gap: 10 }}>
        <View>
          <T style={{ fontSize: 15, fontWeight: '700' }}>Your messages</T>
          <T style={{ fontSize: 14, lineHeight: 21, color: c.muted }}>Messages are stored only on this phone. If you log out, they’re deleted from this phone and can’t be recovered.</T>
        </View>
        <View>
          <T style={{ fontSize: 15, fontWeight: '700' }}>Your plan, coins and Diamonds</T>
          <T style={{ fontSize: 14, lineHeight: 21, color: c.muted }}>They stay with your account. Log in on any phone and they’re still there.</T>
        </View>
      </View>
      <Button title="Log out and delete messages" onPress={logOut} style={{ backgroundImage: 'linear-gradient(#B00C18, #B00C18)' }} />
    </Sheet>
  );
}
