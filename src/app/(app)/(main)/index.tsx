import { Button, Switch } from 'heroui-native';
import { View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

import { ThemedText } from '@/components/ui/themed-text';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useQueryMe } from '@/modules/cefi/hooks/use-query-me';
import { useUserStore } from '@/modules/user/stores/user';

export default function DefiMainIndex() {
  const requestLock = useGlobalStore(store => store.requestLock);
  const autoLock = useUserStore(state => state.settings.autoLock);
  const setAutoLock = useUserStore(state => state.setAutoLock);
  const { theme } = useUniwind();
  const { data: userData } = useQueryMe();

  console.log(userData);

  return (
    <View className="bg-background flex-1 p-6">
      <View className="bg-accent rounded-lg p-4">
        <ThemedText>DeFi Main</ThemedText>
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
      <Button onPress={() => Uniwind.setTheme(theme === 'dark' ? 'light' : 'dark')}>
        <Button.Label>Toggle Theme</Button.Label>
      </Button>
    </View>
  );
}
