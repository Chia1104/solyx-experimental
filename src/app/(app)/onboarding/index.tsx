import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useUserStore } from '@/modules/user/stores/user';

export default function DefiEntrance() {
  const setStartup = useGlobalStore(state => state.setStartup);
  const setHasHDWallet = useUserStore(state => state.setHasHDWallet);
  const setLoggedState = useUserStore(state => state.setLoggedState);
  const switchWalletMode = useUserStore(state => state.switchWalletMode);

  const handleEnterDefi = () => {
    setHasHDWallet(true);
    setStartup(true);
    setLoggedState(true);
    switchWalletMode('defi');
    router.replace('/');
  };

  return (
    <View className="bg-background flex-1 justify-center gap-4 p-6">
      <ThemedText className="text-foreground text-3xl font-semibold">
        Welcome to DeFi wallet
      </ThemedText>
      <ThemedText className="text-muted-foreground text-base">
        This entrance represents the pre-DeFi onboarding flow. Wallet creation and import screens
        can be mounted here before opening the main navigator.
      </ThemedText>
      <Button onPress={handleEnterDefi}>
        <Button.Label>Enter DeFi</Button.Label>
      </Button>
    </View>
  );
}
