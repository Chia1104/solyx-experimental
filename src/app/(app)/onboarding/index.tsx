import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { View } from 'react-native';

import { useGlobalStore } from '@/modules/app/stores/global';
import { useUserStore } from '@/modules/user/stores/user';

export default function DefiEntrance() {
  const setStartup = useGlobalStore(state => state.setStartup);
  const setHasHDWallet = useUserStore(state => state.setHasHDWallet);
  const switchWalletMode = useUserStore(state => state.switchWalletMode);

  const handleEnterDefi = () => {
    setHasHDWallet(true);
    setStartup(true);
    switchWalletMode('defi');
    router.replace('/');
  };

  return (
    <View className="bg-background flex-1 justify-center gap-4 p-6">
      <Button onPress={handleEnterDefi}>
        <Button.Label>Enter DeFi</Button.Label>
      </Button>
    </View>
  );
}
