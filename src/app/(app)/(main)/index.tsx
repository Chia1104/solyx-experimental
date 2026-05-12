import { Button, Switch, Text } from 'heroui-native';
import { View } from 'react-native';

import { useGlobalStore } from '@/modules/app/stores/global';
import { useQueryMe } from '@/modules/cefi/hooks/use-query-me';
import { useUserStore } from '@/modules/user/stores/user';

export default function DefiMainIndex() {
  const requestLock = useGlobalStore(store => store.requestLock);
  const autoLock = useUserStore(state => state.settings.autoLock);
  const setAutoLock = useUserStore(state => state.setAutoLock);
  const wallets = useUserStore(state => state.wallet.wallets);
  const { data: userData } = useQueryMe();

  console.log(userData);
  console.log(JSON.stringify(wallets, null, 2));

  return (
    <View className="bg-background flex-1 p-6">
      <View className="bg-accent rounded-lg p-4">
        <Text weight="medium">DeFi Main</Text>
      </View>
      <Button
        className="mt-4"
        onPress={async () => {
          const result = await requestLock({
            isDismissible: false,
            reason: 'Unlock your DeFi wallet to continue.',
            type: 'password',
          });
          console.log(result);
        }}
      >
        <Button.Label>Click me</Button.Label>
      </Button>
      <Switch isSelected={autoLock} onSelectedChange={value => setAutoLock(value)} />
    </View>
  );
}
